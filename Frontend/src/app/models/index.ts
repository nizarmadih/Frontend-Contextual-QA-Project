// models/index.ts

export interface Conversation {
  convo_id: string;
  time_created: string;
  context: string;
  qa: QAPair[];
}

export interface QAPair {
  qa_id: string;
  question: string;
  time_received: string;
  answer: string;
  flagged: boolean;
  confidence: number;
}

export interface FlagPayload {
  id: string;
  qa_id: string;
  model_answer: string;
  suggested_answer: string;
  flag_type: 'wrong_answer' | 'out_of_context' | 'partial_answer' | 'other';
}

export interface AddConvoResponse {
  success: boolean;
  inserted_id: string;
  convo_id: string;
}
