// components/flag-modal/flag-modal.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService, FlagTarget } from '../../services/app-state.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-flag-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="overlay" (click)="onOverlayClick($event)" *ngIf="target">
      <div class="modal" role="dialog">
        <div class="modal-header-flag">
          <div class="flag-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
              <line x1="4" y1="22" x2="4" y2="15"/>
            </svg>
          </div>
          <div>
            <h2>Signaler cette réponse</h2>
            <p class="subtitle">Aidez à améliorer le modèle en fournissant la réponse correcte</p>
          </div>
        </div>

        <!-- Original QA summary -->
        <div class="qa-preview">
          <div class="qa-row">
            <span class="qa-role">Q</span>
            <span>{{ target.qa.question }}</span>
          </div>
          <div class="qa-row ai">
            <span class="qa-role ai-role">DQ</span>
            <span>{{ target.qa.answer }}</span>
          </div>
        </div>

        <div class="field">
          <label>Type d'erreur</label>
          <select [(ngModel)]="flagType">
            <option value="wrong_answer">Réponse incorrecte</option>
            <option value="out_of_context">Hors contexte</option>
            <option value="partial_answer">Réponse partielle</option>
            <option value="other">Autre</option>
          </select>
        </div>

        <div class="field">
          <label>Réponse suggérée</label>
          <textarea
            [(ngModel)]="suggestedAnswer"
            placeholder="Quelle devrait être la réponse correcte ?"
            rows="3"
          ></textarea>
        </div>

        <div class="btn-row">
          <button class="btn btn-ghost" (click)="close()">Annuler</button>
          <button class="btn btn-danger" (click)="submit()" [disabled]="loading">
            <span class="spinner" *ngIf="loading"></span>
            {{ loading ? 'Envoi…' : 'Soumettre le signalement' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-header-flag {
      display: flex; align-items: flex-start; gap: 14px;
      margin-bottom: 20px;
    }
    .flag-icon {
      width: 38px; height: 38px; flex-shrink: 0;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: #f87171;
    }

    .qa-preview {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 12px;
      display: flex; flex-direction: column; gap: 8px;
      margin-bottom: 20px;
      font-size: 13px;
    }
    .qa-row { display: flex; align-items: flex-start; gap: 10px; color: var(--text-secondary); }
    .qa-row.ai { color: var(--text-primary); }

    .qa-role {
      width: 22px; height: 22px; flex-shrink: 0;
      background: var(--bg-elevated); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; color: var(--text-muted);
    }
    .ai-role {
      background: linear-gradient(135deg, var(--amber-core), #c96d1a);
      color: #fff; font-size: 9px;
    }

    .spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(248,113,113,0.3);
      border-top-color: #f87171;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class FlagModalComponent implements OnInit {
  target: FlagTarget | null = null;
  flagType: 'wrong_answer' | 'out_of_context' | 'partial_answer' | 'other' = 'wrong_answer';
  suggestedAnswer = '';
  loading = false;

  constructor(private state: AppStateService, private api: ApiService) {}

  ngOnInit() {
    this.state.flagTarget$.subscribe(t => this.target = t);
  }

  close() { this.state.closeFlagModal(); }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.close();
  }

  submit() {
    if (!this.target || this.loading) return;
    this.loading = true;

    this.api.flagAnswer({
      id: this.target.convoId,
      qa_id: this.target.qa.qa_id,
      model_answer: this.target.qa.answer,
      suggested_answer: this.suggestedAnswer,
      flag_type: this.flagType
    }).subscribe({
      next: () => {
        this.state.markFlagged(this.target!.qa.qa_id);
        this.loading = false;
        this.close();
      },
      error: () => { this.loading = false; }
    });
  }
}
