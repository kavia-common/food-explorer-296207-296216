import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartSidebarComponent } from '../../components/cart-sidebar/cart-sidebar.component';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, CartSidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 class="h">Your Cart</h2>
    <app-cart-sidebar></app-cart-sidebar>
  `,
  styles: [`
    .h { margin: 0 0 10px; font-size: 18px; }
  `]
})
export class CartPageComponent {}
