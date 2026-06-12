// components/chat/chat.component.ts
import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
import { ApiService } from '../../services/api.service';
import { QAPair } from '../../models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-wrap">
      <!-- Top bar -->
      <header class="chat-header">
        <div class="header-left">
          <button class="back-btn" (click)="goBack()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div class="context-preview" *ngIf="state.activeConvo$ | async as convo">
            <span class="ctx-label">Contexte</span>
            <span class="ctx-text">{{ truncate(convo.context, 60) }}</span>
          </div>
        </div>
        <div class="header-right" *ngIf="state.activeConvo$ | async as convo">
          <span class="badge">{{ convo.qa?.length ?? 0 }} Q</span>
          <span class="badge" style="margin-left:6px">MarBERT</span>
        </div>
      </header>

      <!-- Messages -->
      <div class="messages" #messagesEl>
        <ng-container *ngIf="state.activeConvo$ | async as convo">
          <!-- Context bubble -->
          <div class="context-bubble">
            <div class="ctx-bubble-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Contexte analysé
            </div>
            <p>{{ convo.context }}</p>
          </div>

          <!-- Empty state -->
          <div class="empty-chat" *ngIf="convo.qa?.length === 0 && !thinking">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            <p>Posez votre première question sur ce contexte</p>
          </div>

          <!-- QA pairs -->
          <div class="qa-pair" *ngFor="let qa of convo.qa">
            <!-- Question -->
            <div class="msg user-msg">
              <div class="msg-avatar user-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="msg-bubble user-bubble">{{ qa.question }}</div>
            </div>

            <!-- Answer -->
            <div class="msg ai-msg">
              <div class="msg-avatar ai-avatar">DQ</div>
              <div class="answer-block">
                <div class="msg-bubble ai-bubble" [class.flagged]="qa.flagged">
                  <span *ngIf="qa.flagged" class="flagged-tag">⚑ Signalé</span>
                  {{ qa.answer || '—' }}
                </div>
                <div class="answer-meta">
                  <div class="confidence-bar-wrap" title="Confiance: {{ (qa.confidence * 100).toFixed(1) }}%">
                    <div class="confidence-fill" [style.width.%]="qa.confidence * 100"></div>
                  </div>
                  <span class="conf-label">{{ (qa.confidence * 100).toFixed(0) }}% confiance</span>
                  <button
                    *ngIf="!qa.flagged"
                    class="flag-btn"
                    (click)="openFlag(qa)"
                    title="Signaler cette réponse">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                      <line x1="4" y1="22" x2="4" y2="15"/>
                    </svg>
                    Signaler
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Thinking indicator -->
          <div class="msg ai-msg" *ngIf="thinking">
            <div class="msg-avatar ai-avatar">DQ</div>
            <div class="thinking-bubble">
              <span></span><span></span><span></span>
            </div>
          </div>
        </ng-container>
      </div>

      <!-- Input bar -->
      <div class="input-bar">
        <div class="input-wrap">
          <textarea
            #inputEl
            [(ngModel)]="question"
            (keydown.enter)="onEnter($any($event))"
            placeholder="Posez votre question en Darija ou en arabe…"
            rows="1"
            [disabled]="thinking"
          ></textarea>
          <button
            class="send-btn"
            [disabled]="!question.trim() || thinking"
            (click)="send()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p class="input-hint">Entrée pour envoyer · Maj+Entrée pour saut de ligne</p>
      </div>
    </div>
  `,
  styles: [`
    .chat-wrap {
      flex: 1; display: flex; flex-direction: column;
      height: 100vh; overflow: hidden;
      background: var(--bg-base);
    }

    /* ── Header ── */
    .chat-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 24px;
      border-bottom: 1px solid var(--border);
      background: var(--bg-surface);
      flex-shrink: 0;
    }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .header-right { display: flex; align-items: center; }

    .back-btn {
      width: 32px; height: 32px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-secondary);
      transition: var(--transition);
    }
    .back-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

    .context-preview { display: flex; flex-direction: column; }
    .ctx-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-muted); }
    .ctx-text { font-size: 13px; font-weight: 500; color: var(--text-primary); max-width: 400px; }

    /* ── Messages ── */
    .messages {
      flex: 1; overflow-y: auto;
      padding: 32px 24px;
      display: flex; flex-direction: column; gap: 24px;
    }

    .context-bubble {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-left: 3px solid var(--amber-core);
      border-radius: var(--radius-md);
      padding: 14px 16px;
      font-size: 13.5px;
      color: var(--text-secondary);
      line-height: 1.7;
      max-width: 720px;
    }
    .ctx-bubble-label {
      display: flex; align-items: center; gap: 5px;
      font-size: 11px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.6px;
      color: var(--amber-core); margin-bottom: 8px;
    }

    .empty-chat {
      display: flex; flex-direction: column; align-items: center;
      gap: 12px; padding: 48px;
      color: var(--text-muted); font-size: 14px;
    }

    .qa-pair { display: flex; flex-direction: column; gap: 10px; }

    .msg { display: flex; align-items: flex-start; gap: 10px; }
    .user-msg { flex-direction: row-reverse; }

    .msg-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700;
      flex-shrink: 0;
    }
    .user-avatar {
      background: var(--bg-elevated);
      border: 1px solid var(--border-strong);
      color: var(--text-secondary);
    }
    .ai-avatar {
      background: linear-gradient(135deg, var(--amber-core), #c96d1a);
      color: #fff; font-size: 10px;
    }

    .msg-bubble {
      max-width: 640px; padding: 12px 16px;
      border-radius: var(--radius-md); font-size: 14px; line-height: 1.65;
    }
    .user-bubble {
      background: var(--bg-elevated);
      border: 1px solid var(--border-strong);
      color: var(--text-primary);
      border-radius: var(--radius-md) var(--radius-md) 4px var(--radius-md);
    }
    .ai-bubble {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      color: var(--text-primary);
      border-radius: var(--radius-md) var(--radius-md) var(--radius-md) 4px;
    }
    .ai-bubble.flagged {
      border-color: rgba(239,68,68,0.3);
      background: rgba(239,68,68,0.05);
    }
    .flagged-tag {
      display: block; font-size: 11px; color: #f87171;
      margin-bottom: 4px;
    }

    .answer-block { display: flex; flex-direction: column; gap: 6px; }

    .answer-meta {
      display: flex; align-items: center; gap: 10px;
      padding-left: 4px;
    }
    .confidence-bar-wrap {
      width: 80px; height: 4px;
      background: var(--bg-elevated); border-radius: 2px; overflow: hidden;
    }
    .confidence-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--amber-core), var(--amber-bright));
      border-radius: 2px;
      transition: width 0.6s ease;
    }
    .conf-label { font-size: 11px; color: var(--text-muted); }

    .flag-btn {
      display: flex; align-items: center; gap: 5px;
      font-size: 11px; color: var(--text-muted);
      padding: 3px 8px; border-radius: 4px;
      border: 1px solid transparent;
      transition: var(--transition);
      margin-left: auto;
    }
    .flag-btn:hover {
      color: #f87171;
      border-color: rgba(239,68,68,0.3);
      background: rgba(239,68,68,0.07);
    }

    /* Thinking dots */
    .thinking-bubble {
      display: flex; gap: 5px; padding: 14px 18px;
      background: var(--bg-surface); border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    .thinking-bubble span {
      width: 7px; height: 7px; background: var(--amber-core);
      border-radius: 50%; animation: pulse 1.4s ease infinite;
    }
    .thinking-bubble span:nth-child(2) { animation-delay: 0.2s; }
    .thinking-bubble span:nth-child(3) { animation-delay: 0.4s; }

    /* ── Input bar ── */
    .input-bar {
      padding: 16px 24px 20px;
      background: var(--bg-surface);
      border-top: 1px solid var(--border);
      flex-shrink: 0;
    }
    .input-wrap {
      display: flex; align-items: flex-end; gap: 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      transition: var(--transition);
    }
    .input-wrap:focus-within {
      border-color: var(--amber-core);
      box-shadow: 0 0 0 3px var(--amber-subtle);
    }

    .input-wrap textarea {
      flex: 1; background: none; border: none; outline: none;
      color: var(--text-primary); font-size: 14px; line-height: 1.5;
      resize: none; max-height: 120px; overflow-y: auto;
    }
    .input-wrap textarea::placeholder { color: var(--text-muted); }
    .input-wrap textarea:disabled { opacity: 0.5; }

    .send-btn {
      width: 36px; height: 36px; border-radius: 8px;
      background: linear-gradient(135deg, var(--amber-core), #c96d1a);
      color: #fff; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: var(--transition);
    }
    .send-btn:disabled { opacity: 0.4; cursor: not-allowed; filter: none; }
    .send-btn:not(:disabled):hover { filter: brightness(1.1); transform: scale(1.05); }

    .input-hint { font-size: 11px; color: var(--text-muted); margin-top: 8px; padding-left: 2px; }
  `]
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('messagesEl') messagesEl!: ElementRef;
  @ViewChild('inputEl')    inputEl!: ElementRef;

  question = '';
  thinking = false;
  private shouldScroll = false;

  constructor(public state: AppStateService, private api: ApiService) {}

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollBottom();
      this.shouldScroll = false;
    }
  }

  onEnter(e: KeyboardEvent) {
    if (!e.shiftKey) { e.preventDefault(); this.send(); }
  }

  send() {
    const q = this.question.trim();
    if (!q || this.thinking) return;
    const convoId = this.state.activeConvoValue?.convo_id;
    if (!convoId) return;

    this.question = '';
    this.thinking = true;
    this.shouldScroll = true;

    this.api.sendQuestion(convoId, q).subscribe({
      next: (answer: any) => {
        const qa: QAPair = {
          qa_id: crypto.randomUUID(),
          question: q,
          time_received: new Date().toISOString(),
          answer: typeof answer === 'string' ? answer : answer,
          flagged: false,
          confidence: 0.85
        };
        this.state.appendQA(qa);
        this.thinking = false;
        this.shouldScroll = true;
      },
      error: () => { this.thinking = false; }
    });
  }

  openFlag(qa: QAPair) {
    const convoId = this.state.activeConvoValue?.convo_id!;
    this.state.openFlagModal({ convoId, qa });
  }

  goBack() { this.state.setActiveConvo(null, null); }

  truncate(s: string, n: number) {
    return s?.length > n ? s.slice(0, n) + '…' : s;
  }

  private scrollBottom() {
    const el = this.messagesEl?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
