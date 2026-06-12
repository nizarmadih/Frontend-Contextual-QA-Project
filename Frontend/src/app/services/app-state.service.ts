// services/app-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Conversation, QAPair } from '../models';

export interface FlagTarget {
  convoId: string;
  qa: QAPair;
}

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private _activeConvoId = new BehaviorSubject<string | null>(null);
  private _activeConvo   = new BehaviorSubject<Conversation | null>(null);
  private _conversations = new BehaviorSubject<Conversation[]>([]);
  private _showContextModal = new BehaviorSubject<boolean>(false);
  private _flagTarget    = new BehaviorSubject<FlagTarget | null>(null);
  private _loading       = new BehaviorSubject<boolean>(false);

  activeConvoId$    = this._activeConvoId.asObservable();
  activeConvo$      = this._activeConvo.asObservable();
  conversations$    = this._conversations.asObservable();
  showContextModal$ = this._showContextModal.asObservable();
  flagTarget$       = this._flagTarget.asObservable();
  loading$          = this._loading.asObservable();

  setActiveConvo(id: string | null, convo: Conversation | null = null) {
    this._activeConvoId.next(id);
    this._activeConvo.next(convo);
  }

  setConversations(convos: Conversation[]) {
    this._conversations.next(convos);
  }

  addConversation(convo: Conversation) {
    const current = this._conversations.getValue();
    this._conversations.next([convo, ...current]);
  }

  updateActiveConvoQA(qa: QAPair[]) {
    const convo = this._activeConvo.getValue();
    if (convo) {
      const updated = { ...convo, qa };
      this._activeConvo.next(updated);
    }
  }

  appendQA(qa: QAPair) {
    const convo = this._activeConvo.getValue();
    if (convo) {
      const updated = { ...convo, qa: [...convo.qa, qa] };
      this._activeConvo.next(updated);
    }
  }

  markFlagged(qa_id: string) {
    const convo = this._activeConvo.getValue();
    if (convo) {
      const qa = convo.qa.map(q => q.qa_id === qa_id ? { ...q, flagged: true } : q);
      this._activeConvo.next({ ...convo, qa });
    }
  }

  openContextModal()  { this._showContextModal.next(true); }
  closeContextModal() { this._showContextModal.next(false); }

  openFlagModal(target: FlagTarget)  { this._flagTarget.next(target); }
  closeFlagModal()                    { this._flagTarget.next(null); }

  setLoading(v: boolean) { this._loading.next(v); }

  get activeConvoValue() { return this._activeConvo.getValue(); }
}
