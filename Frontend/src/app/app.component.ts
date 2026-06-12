// app.component.ts
import { Component } from '@angular/core';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ChatComponent } from './components/chat/chat.component';
import { ContextModalComponent } from './components/context-modal/context-modal.component';
import { FlagModalComponent } from './components/flag-modal/flag-modal.component';
import { AppStateService } from './services/app-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SidebarComponent, DashboardComponent, ChatComponent, ContextModalComponent, FlagModalComponent],
  template: `
    <div class="shell">
      <app-sidebar />
      <main class="main-area">
        <app-chat     *ngIf="state.activeConvoId$ | async" />
        <app-dashboard *ngIf="!(state.activeConvoId$ | async)" />
      </main>
    </div>
    <app-context-modal *ngIf="state.showContextModal$ | async" />
    <app-flag-modal    *ngIf="state.flagTarget$ | async" />
  `,
  styles: [`
    .shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    .main-area {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
  `]
})
export class AppComponent {
  constructor(public state: AppStateService) {}
}
