import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

/**
 * PUBLIC_INTERFACE
 * ToastContainerComponent subscribes to ToastService signals and renders transient toasts.
 * - Positioned fixed bottom-right, stacked.
 * - Accessible: aria-live="polite" for non-blocking announcements.
 */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-wrap" role="region" aria-label="Notifications" aria-live="polite">
      <div
        class="toast"
        *ngFor="let t of toasts(); trackBy: trackById"
        [class.success]="t.type === 'success'"
        [class.error]="t.type === 'error'"
        [class.info]="t.type === 'info'"
      >
        <div class="icon" aria-hidden="true">
          <span *ngIf="t.type === 'success'">✔️</span>
          <span *ngIf="t.type === 'error'">⚠️</span>
          <span *ngIf="t.type === 'info'">ℹ️</span>
        </div>
        <div class="msg">{{ t.message }}</div>
        <button type="button" class="close" (click)="dismiss(t.id)" aria-label="Dismiss notification">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-wrap {
      position: fixed;
      right: 12px;
      bottom: 12px;
      display: grid;
      gap: 8px;
      z-index: 9999;
      pointer-events: none;
    }
    .toast {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 10px;
      min-width: 260px;
      max-width: 380px;
      background: #ffffff;
      border: 1px solid rgba(17,24,39,0.12);
      border-left-width: 4px;
      border-radius: 12px;
      padding: 10px 12px;
      box-shadow: 0 10px 24px rgba(0,0,0,.12);
      color: #111827;
      pointer-events: auto;
      opacity: 1;
      transform: translateY(0);
      transition: opacity .2s ease, transform .2s ease;
    }
    .toast.success { border-left-color: #10b981; }
    .toast.error { border-left-color: #EF4444; }
    .toast.info { border-left-color: #2563EB; }
    .icon { width: 20px; text-align: center; }
    .msg { line-height: 1.3; }
    .close {
      border: none;
      background: transparent;
      font-size: 18px;
      cursor: pointer;
      color: #6b7280;
    }
    .close:hover { color: #111827; }
    @media (max-width: 480px) {
      .toast-wrap { left: 8px; right: 8px; }
      .toast { max-width: unset; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  private svc = inject(ToastService);
  toasts = this.svc.toasts;

  // PUBLIC_INTERFACE
  dismiss(id: string) {
    this.svc.dismiss(id);
  }

  // PUBLIC_INTERFACE
  trackById(_i: number, t: Toast) {
    return t.id;
  }
}
