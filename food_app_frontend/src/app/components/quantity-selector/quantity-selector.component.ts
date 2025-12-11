import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quantity-selector',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="qty">
      <button type="button" (click)="dec()" aria-label="Decrease quantity">−</button>
      <div aria-live="polite" class="val">{{ value }}</div>
      <button type="button" (click)="inc()" aria-label="Increase quantity">+</button>
    </div>
  `,
  styles: [`
    .qty { display: inline-grid; grid-template-columns: auto 28px auto; align-items: center; gap: 6px; }
    .qty button {
      width: 28px; height: 28px; border-radius: 8px; border: 1px solid rgba(17,24,39,0.12);
      background: white; cursor: pointer; transition: background .15s ease, transform .15s ease;
    }
    .qty button:hover { background: #f3f4f6; transform: translateY(-1px); }
    .val { min-width: 28px; text-align: center; }
  `]
})
export class QuantitySelectorComponent {
  @Input() value = 1;
  @Output() valueChange = new EventEmitter<number>();
  inc() { this.valueChange.emit(this.value + 1); }
  dec() { this.valueChange.emit(Math.max(1, this.value - 1)); }
}
