// components/dashboard/dashboard.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <!-- Ambient glow -->
      <div class="glow-orb"></div>

      <div class="dashboard-inner">
        <!-- Header -->
        <div class="welcome-block">
          <div class="brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="welcome-title">Bienvenue✦</h1>
          <p class="welcome-desc">
            Système de question-réponse contextuel pour le dialecte arabe marocain.
            Importez un contexte en Darija et interrogez-le avec précision.
          </p>
          <button class="btn btn-primary start-btn" (click)="state.openContextModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nouveau Contexte
          </button>
        </div>

        <!-- Cards -->
        <div class="cards-label">Comment ça marche</div>
        <div class="cards-grid">
          <div class="card" *ngFor="let card of cards; let i = index" [style.animation-delay]="(i * 0.08) + 's'">
            <div class="card-step">0{{ i + 1 }}</div>
            <div class="card-icon" [innerHTML]="card.icon"></div>
            <h3>{{ card.title }}</h3>
            <p>{{ card.desc }}</p>
          </div>
        </div>

        <!-- Stats strip -->
        <div class="stats-strip">
          <div class="stat" *ngFor="let s of stats">
            <span class="stat-val">{{ s.val }}</span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      position: relative;
      background: var(--bg-base);
    }

    .glow-orb {
      position: absolute;
      top: -120px; right: -80px;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(232,135,42,0.12) 0%, transparent 70%);
      pointer-events: none;
    }

    .dashboard-inner {
      max-width: 780px;
      width: 100%;
      margin: 0 auto;
      padding: 72px 32px 48px;
      position: relative;
    }

    .welcome-block {
      text-align: center;
      margin-bottom: 56px;
    }

    .brand-icon {
      width: 56px; height: 56px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, var(--amber-core), #c96d1a);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      color: #fff;
      box-shadow: var(--shadow-glow);
    }

    .welcome-title {
      font-size: 34px;
      font-weight: 700;
      letter-spacing: -0.8px;
      background: linear-gradient(135deg, var(--text-primary), var(--amber-bright));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }

    .welcome-sub {
      font-size: 22px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 14px;
    }

    .welcome-desc {
      font-size: 15px;
      color: var(--text-secondary);
      line-height: 1.7;
      max-width: 480px;
      margin: 0 auto 28px;
    }

    .start-btn {
      font-size: 14px;
      padding: 12px 28px;
      border-radius: var(--radius-md);
      font-weight: 600;
    }

    .cards-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      margin-bottom: 16px;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 40px;
    }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 22px 20px;
      transition: var(--transition);
      animation: slideUp 0.4s ease both;
      position: relative;
      overflow: hidden;
    }
    .card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--amber-subtle), transparent);
      opacity: 0;
      transition: var(--transition);
    }
    .card:hover { border-color: rgba(232,135,42,0.3); transform: translateY(-2px); }
    .card:hover::before { opacity: 1; }

    .card-step {
      font-size: 10px; font-weight: 700;
      color: var(--amber-core);
      letter-spacing: 1px;
      margin-bottom: 12px;
    }

    .card-icon {
      color: var(--amber-core);
      margin-bottom: 12px;
    }

    .card h3 {
      font-size: 14px; font-weight: 600;
      margin-bottom: 6px;
    }
    .card p {
      font-size: 12.5px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .stats-strip {
      display: flex;
      gap: 0;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .stat {
      flex: 1;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      border-right: 1px solid var(--border);
    }
    .stat:last-child { border-right: none; }
    .stat-val {
      font-family: var(--font-display);
      font-size: 24px; font-weight: 700;
      color: var(--amber-bright);
    }
    .stat-label { font-size: 12px; color: var(--text-muted); }
  `]
})
export class DashboardComponent {
  constructor(public state: AppStateService) {}

  cards = [
    {
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
      title: 'Importez un Contexte',
      desc: 'Collez votre article ou texte en Darija. Le modèle l\'analyse et l\'indexe.'
    },
    {
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
      title: 'Posez vos Questions',
      desc: 'Interrogez le contexte en arabe ou en Darija. L\'IA extrait la réponse exacte.'
    },
    {
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
      title: 'Évaluez & Corrigez',
      desc: 'Signalez les réponses incorrectes pour améliorer les annotations du dataset.'
    }
  ];

  stats = [
    { val: '23K+', label: 'Paires QA annotées' },
    { val: '2',    label: 'Modèles fine-tunés' },
    { val: 'Goud.ma', label: 'Source journalistique' },
    { val: 'Darija', label: 'Dialecte cible' },
  ];
}
