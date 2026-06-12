// components/sidebar/sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AppStateService } from '../../services/app-state.service';
import { Conversation } from '../../models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="sidebar">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="logo-text">DarijaQA</span>
      </div>

      <!-- New Context button -->
      <button class="btn-new" (click)="openModal()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nouveau Contexte
      </button>

      <!-- Conversations list -->
      <div class="section-label">Conversations</div>
      <nav class="convo-list" *ngIf="(state.conversations$ | async) as convos">
        <div *ngIf="loading" class="skeleton-list">
          <div class="skeleton" *ngFor="let i of [1,2,3,4]"></div>
        </div>

        <button
          *ngFor="let c of convos"
          class="convo-item"
          [class.active]="(state.activeConvoId$ | async) === c.convo_id"
          (click)="selectConvo(c)">
          <div class="convo-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <div class="convo-meta">
            <span class="convo-title">{{ truncate(c.context, 34) }}</span>
            <span class="convo-sub">{{ c.qa?.length || 0 }} questions · {{ ago(c.time_created) }}</span>
          </div>
          <span *ngIf="hasUnflagged(c)" class="dot-active"></span>
        </button>

        <div *ngIf="!loading && convos.length === 0" class="empty-list">
          <p>Aucune conversation</p>
          <p class="muted">Créez un contexte pour commencer</p>
        </div>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <div class="model-tag">
          <span class="badge">MarBERT</span>
          <span class="badge" style="margin-left:6px"></span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 264px;
      min-width: 264px;
      height: 100vh;
      background: var(--bg-surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: 16px 12px;
      overflow: hidden;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 8px 16px;
    }
    .logo-icon {
      width: 34px; height: 34px;
      background: linear-gradient(135deg, var(--amber-core), #c96d1a);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: #fff;
      flex-shrink: 0;
    }
    .logo-text {
      font-family: var(--font-display);
      font-size: 16px; font-weight: 600;
      letter-spacing: -0.3px;
    }

    .btn-new {
      display: flex; align-items: center; gap: 8px;
      width: 100%; padding: 9px 12px;
      background: var(--amber-subtle);
      border: 1px solid rgba(232,135,42,0.2);
      border-radius: var(--radius-sm);
      color: var(--amber-bright);
      font-size: 13px; font-weight: 500;
      transition: var(--transition);
      margin-bottom: 16px;
    }
    .btn-new:hover {
      background: var(--amber-glow);
      border-color: rgba(232,135,42,0.4);
    }

    .section-label {
      font-size: 10px; font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--text-muted);
      padding: 0 8px 8px;
    }

    .convo-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .convo-item {
      display: flex; align-items: flex-start; gap: 10px;
      width: 100%; padding: 9px 8px;
      border-radius: var(--radius-sm);
      text-align: left;
      transition: var(--transition);
      position: relative;
    }
    .convo-item:hover { background: var(--bg-hover); }
    .convo-item.active {
      background: var(--amber-subtle);
      border: 1px solid rgba(232,135,42,0.15);
    }

    .convo-icon {
      width: 24px; height: 24px;
      background: var(--bg-elevated);
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted);
      flex-shrink: 0;
      margin-top: 1px;
    }
    .convo-item.active .convo-icon {
      background: var(--amber-glow);
      color: var(--amber-bright);
    }

    .convo-meta { flex: 1; min-width: 0; }
    .convo-title {
      display: block;
      font-size: 12.5px; font-weight: 500;
      color: var(--text-primary);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .convo-sub {
      display: block;
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .dot-active {
      width: 6px; height: 6px;
      background: var(--amber-core);
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;
      animation: pulse 2s infinite;
    }

    .skeleton-list { display: flex; flex-direction: column; gap: 6px; }
    .skeleton {
      height: 48px;
      background: linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-hover) 50%, var(--bg-elevated) 75%);
      background-size: 200% 100%;
      border-radius: var(--radius-sm);
      animation: shimmer 1.4s infinite;
    }

    .empty-list { text-align: center; padding: 24px 8px; }
    .empty-list p { font-size: 13px; color: var(--text-secondary); }

    .sidebar-footer {
      padding: 12px 8px 4px;
      border-top: 1px solid var(--border);
      margin-top: auto;
    }
  `]
})
export class SidebarComponent implements OnInit {
  loading = true;

  constructor(public state: AppStateService, private api: ApiService) {}

  ngOnInit() {
    this.api.getContexts().subscribe({
      next: (convos) => { this.state.setConversations(convos); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openModal() { this.state.openContextModal(); }

  selectConvo(c: Conversation) {
    this.api.getConversation(c.convo_id).subscribe({
      next: (res) => {
        const full: Conversation = { ...c, qa: res.qa || [] };
        this.state.setActiveConvo(c.convo_id, full);
      }
    });
  }

  truncate(s: string, n: number) {
    return s?.length > n ? s.slice(0, n) + '…' : s;
  }

  ago(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)   return 'à l\'instant';
    if (mins < 60)  return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs}h`;
    return `${Math.floor(hrs / 24)}j`;
  }

  hasUnflagged(c: Conversation) {
    return c.qa?.some(q => !q.flagged);
  }
}
