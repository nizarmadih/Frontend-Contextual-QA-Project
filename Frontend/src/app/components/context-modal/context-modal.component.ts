// components/context-modal/context-modal.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
import { ApiService } from '../../services/api.service';
import { Conversation } from '../../models';

@Component({
  selector: 'app-context-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="overlay" (click)="onOverlayClick($event)">
      <div class="modal" role="dialog">
        <div class="modal-header">
          <div class="modal-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div>
            <h2>Nouveau Contexte</h2>
            <p class="subtitle">Collez votre texte en Darija pour commencer une session de Q&R</p>
          </div>
        </div>

        <div class="field">
          <label>Texte du contexte <span class="req">*</span></label>
          <textarea
            [(ngModel)]="context"
            placeholder="كتب الصحافي أن المغرب شهد تطورات اقتصادية مهمة في السنة الماضية..."
            rows="8"
            [class.error]="showError && !context.trim()"
          ></textarea>
          <div class="char-count" [class.near]="context.length > 1600">
            {{ context.length }} / 2000 caractères
          </div>
          <span class="error-msg" *ngIf="showError && !context.trim()">Le contexte est requis</span>
        </div>

        <div class="modal-tip">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Le contexte sera analysé par MarBERT ou DarijaBERT pour l'extraction des réponses.
        </div>

        <div class="btn-row">
          <button class="btn btn-ghost" (click)="close()">Annuler</button>
          <button class="btn btn-primary" (click)="submit()" [disabled]="loading">
            <svg *ngIf="!loading" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span class="spinner" *ngIf="loading"></span>
            {{ loading ? 'Création…' : 'Créer la session' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-header {
      display: flex; align-items: flex-start; gap: 14px;
      margin-bottom: 24px;
    }
    .modal-icon {
      width: 40px; height: 40px; flex-shrink: 0;
      background: var(--amber-subtle);
      border: 1px solid rgba(232,135,42,0.2);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: var(--amber-bright);
    }
    .req { color: var(--amber-core); }

    .char-count {
      font-size: 11px; color: var(--text-muted);
      text-align: right; margin-top: 4px;
    }
    .char-count.near { color: #f87171; }

    .error-msg { font-size: 12px; color: #f87171; margin-top: 4px; }
    .field textarea.error { border-color: rgba(239,68,68,0.5); }

    .modal-tip {
      display: flex; align-items: center; gap: 7px;
      background: var(--amber-subtle);
      border: 1px solid rgba(232,135,42,0.15);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      font-size: 12px; color: var(--text-secondary);
      margin-bottom: 20px;
    }
    .modal-tip svg { color: var(--amber-core); flex-shrink: 0; }

    .spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ContextModalComponent {
  context = '';
  loading = false;
  showError = false;

  constructor(private state: AppStateService, private api: ApiService) {}

  close() { this.state.closeContextModal(); }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.close();
  }

  submit() {
    this.showError = true;
    if (!this.context.trim() || this.loading) return;

    this.loading = true;
    this.api.addConversation(this.context.trim()).subscribe({
      next: (res) => {
        const newConvo: Conversation = {
          convo_id: res.convo_id,
          time_created: new Date().toISOString(),
          context: this.context.trim(),
          qa: []
        };
        this.state.addConversation(newConvo);
        this.state.setActiveConvo(res.convo_id, newConvo);
        this.loading = false;
        this.close();
      },
      error: () => { this.loading = false; }
    });
  }
}
