from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
import os
import torch.nn.functional as F
import torch
from transformers import AutoTokenizer, AutoModelForQuestionAnswering
from datetime import datetime
from uuid import uuid4
from flask_cors import CORS

class MongoDb:
    def __init__(self, str_uri, str_db, str_convo_collection, str_flag_collection):
        self.uri = str_uri
        self.db_str = str_db
        self.client = MongoClient(str_uri)
        self.db = self.client[str_db]
        self.convo_collection = self.db[str_convo_collection]
        self.flag_collection = self.db[str_flag_collection]
        
        # Create collections if they don't exist
        if str_convo_collection not in self.db.list_collection_names():
            self.db.create_collection(str_convo_collection)
        if str_flag_collection not in self.db.list_collection_names():
            self.db.create_collection(str_flag_collection)
        
    def get_all_contexts(self):
        contexts = list(self.convo_collection.find({}, {"_id": 0}))
        return contexts

    def add_convo(self, context):
        convo = {
            "convo_id": str(uuid4()),
            "time_created": datetime.utcnow(),
            "context": context,
            "qa": []
        }

        result = self.convo_collection.insert_one(convo)

        return {
            "success": True,
            "inserted_id": str(result.inserted_id),
            "convo_id": convo["convo_id"]
        }
    
    def get_convo(self, id):
        conversation = self.convo_collection.find_one(
            {"convo_id": id},
            {"qa": 1, "_id": 0}
        )
        return conversation
    
    def get_context_by_id(self, id):
        print("id: ", id) 
        context = self.convo_collection.find_one({"convo_id": id}, {"context": 1, "_id": 0})["context"]
        return context
    
    def flag_answer(self, convo_id, qa_id, model_answer, suggested_answer, flag_type):
        self.convo_collection.update_one(
            {
                "convo_id": convo_id,
                "qa.qa_id": qa_id
            },
            {
                "$set": {
                    "qa.$.flagged": True
                }
            }
        )
        flag_info = {
            "convo_id": convo_id,
            "qa_id": qa_id,
            "model_answer": model_answer,
            "suggested_answer": suggested_answer,
            "time_flagged": datetime.utcnow(),
            "flag_type": flag_type
        }
        self.flag_collection.insert_one(flag_info)
        return {
            "success": True,
            "message": "QA flagged successfully"
        }

            
class ContextualQAModel:
    def __init__(self, model_path, mdb):
        self.model_path = model_path
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForQuestionAnswering.from_pretrained(model_path)
        self.mdb = mdb
        
    def predict_answer(self, context, question):
        inputs = self.tokenizer(
            question,
            context,
            truncation=True,
            padding="max_length",
            max_length=384,
            return_tensors="pt"
        )

        with torch.no_grad():
            outputs = self.model(**inputs)

        start_idx = torch.argmax(outputs.start_logits)
        end_idx = torch.argmax(outputs.end_logits) + 1

        input_ids = inputs["input_ids"][0]
        answer = self.tokenizer.decode(input_ids[start_idx:end_idx], skip_special_tokens=True)

        return answer

    def predict_answer_by_id(self, id, question):
        context = self.mdb.get_context_by_id(id)

        print("context: ", context)
        print("question: ", question)

        inputs = self.tokenizer(
            question,
            context,
            truncation=True,
            padding="max_length",
            max_length=384,
            return_tensors="pt"
        )

        with torch.no_grad():
            outputs = self.model(**inputs)

        # Convert logits to probabilities
        start_probs = F.softmax(outputs.start_logits, dim=-1)
        end_probs = F.softmax(outputs.end_logits, dim=-1)

        # Best start/end positions
        start_idx = torch.argmax(start_probs)
        end_idx = torch.argmax(end_probs)

        # Confidence score
        confidence = (start_probs[0][start_idx] * end_probs[0][end_idx]).item()

        # Decode answer
        input_ids = inputs["input_ids"][0]
        answer = self.tokenizer.decode(
            input_ids[start_idx:end_idx+1],
            skip_special_tokens=True
        )

        return answer, confidence
    

app = Flask(__name__)
CORS(app)

mdb = MongoDb("mongodb://localhost:27017", "contextual_qa", "contexts", "flagged")
model = ContextualQAModel("Backend/model", mdb)


# Get All Contexts
@app.route('/contexts', methods=["POST"])
def get_contexts():
    contexts = mdb.get_all_contexts()
    return jsonify(contexts), 200


# Start Conversation
@app.route('/add', methods=["POST"])
def new_convo():
    data = request.get_json()
    context = data["context"]
    response = mdb.add_convo(context)
    if not response:
        return response, 400
    return response, 200


# Retrieve Conversation of a context
@app.route('/convo', methods=["POST"])
def get_conversation():
    data = request.get_json()
    convo_id = data["convo_id"]
    conversation = mdb.get_convo(convo_id)
    return jsonify(conversation), 200


# Send Question about context
@app.route('/question', methods=["POST"])
def send_question():
    data = request.get_json()
    convo_id = data["id"]
    question = data["question"]
    answer, confidence = model.predict_answer_by_id(convo_id, question) 
    qa = {
        "qa_id": str(uuid4()),
        "question": question,
        "time_received": datetime.utcnow(),
        "answer": answer,
        "flagged": False,
        "confidence": confidence
    }
    mdb.convo_collection.update_one(
        {"convo_id": convo_id},
        {
            "$push": {
                "qa": qa
            }
        }
    )
    return jsonify(answer), 200


# Flag Answer as Wrong
@app.route('/flag', methods=["POST"])
def flag_answer():
    data = request.get_json()
    convo_id = data["id"]
    qa_id = data["qa_id"]
    model_answer = data["model_answer"]
    suggested_answer = data["suggested_answer"]
    flag_type = data["flag_type"]
    response = mdb.flag_answer(convo_id, qa_id, model_answer, suggested_answer, flag_type)
    if not response:
        return response, 400
    return response, 200


# Main
if __name__ == '__main__':
    app.run(debug=True, port=5000)