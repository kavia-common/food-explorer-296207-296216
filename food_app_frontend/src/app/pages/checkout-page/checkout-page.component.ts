import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent {
  private cart = inject(CartService);
  name = '';
  address = '';
  payment = '';

  // PUBLIC_INTERFACE
  submit(form: NgForm) {
    if (form.invalid) return;
    // In a real app, call API here
    const total = this.cart.totalAmount().toFixed(2);
    const g: any = globalThis as any;
    if (g && typeof g.alert === 'function') {
      g.alert(`Order placed! Total: $${total}`);
    }
    this.cart.clear();
  }
}
