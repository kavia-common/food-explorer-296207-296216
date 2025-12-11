import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { QuantitySelectorComponent } from '../quantity-selector/quantity-selector.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, QuantitySelectorComponent, RouterModule],
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartSidebarComponent {
  private cart = inject(CartService);
  itemsSig = this.cart.items;
  total = computed(() => this.cart.totalAmount());
  qty = computed(() => this.cart.totalQuantity());

  // PUBLIC_INTERFACE
  update(id: string, value: number) {
    this.cart.update(id, value);
  }

  // PUBLIC_INTERFACE
  remove(id: string) {
    this.cart.remove(id);
  }

  // PUBLIC_INTERFACE
  trackByCartItem(_index: number, ci: { item: { id: string }; quantity: number }) {
    return ci.item.id;
  }
}
