import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stars" aria-hidden="true">
      <span *ngFor="let s of arr; let i = index" [class.filled]="i < rounded">★</span>
    </div>
    <span class="sr-only">{{ rating }} out of 5</span>
  `,
  styles: [`
    .stars { color: #F59E0B; letter-spacing: 1px; font-size: 14px; }
    .stars span { opacity: .35; }
    .stars span.filled { opacity: 1; }
    .sr-only { position: absolute; left: -9999px; }
  `]
})
export class RatingStarsComponent {
  @Input() rating = 0;
  arr = Array.from({ length: 5 });
  get rounded() { return Math.round(Math.max(0, Math.min(5, this.rating))); }
}
