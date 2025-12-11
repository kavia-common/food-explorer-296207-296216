import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutPageComponent {
  private cart = inject(CartService);
  private orders = inject(OrdersService);
  private router = inject(Router);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  name = '';
  address = '';
  payment = '';

  loading = false;
  error = '';
  successMessage = '';

  // PUBLIC_INTERFACE
  async submit(form: NgForm) {
    if (form.invalid || this.loading) return;

    this.error = '';
    this.successMessage = '';
    this.loading = true;

    const items = this.cart.items();
    if (!items.length) {
      this.loading = false;
      this.error = 'Your cart is empty.';
      return;
    }

    try {
      const subtotal = this.cart.totalAmount();
      const tax = Number((subtotal * 0.08).toFixed(2));
      const total = Number((subtotal + tax).toFixed(2));

      const resp = await this.orders.submitOrder({
        items,
        customer: { name: this.name.trim(), address: this.address.trim() },
        payment: { token: this.payment.trim() },
        totals: { subtotal, tax, total }
      });

      const g: any = globalThis as any;
      const msg = `Order placed! #${resp.orderId} - ${resp.status}. Total: $${total.toFixed(2)}`;
      // Prefer in-page success message and also alert for simple UX on browsers
      this.successMessage = msg;
      this.toast.success('Your order has been placed successfully.');
      if (g && typeof g.alert === 'function') {
        g.alert(msg);
      }
      this.cart.clear();
      // Optionally navigate back to browse or home after short delay to show success
      // Keeping user on page with message as per requirement.
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        // Not authorized: redirect to browse (guard pattern), and prompt login via AuthService
        // For this demo, trigger a simple login() with demo credentials.
        this.auth.logout(); // ensure clean state
        // Navigate to browse; preserve intent if desired
        this.router.navigate(['/browse'], { queryParams: { redirectTo: '/checkout' } });
        // Prompt login (mock)
        this.auth.login('demo', 'password');
        this.error = 'Please login to place your order.';
        this.toast.error('You must be logged in to place an order.');
      } else if (err instanceof HttpErrorResponse) {
        const message = (err.error && (err.error.message || err.error.error)) || 'Failed to place order. Please try again.';
        this.error = message;
        this.toast.error(message);
      } else {
        this.error = 'Failed to place order. Please try again.';
        this.toast.error('Failed to place order. Please try again.');
      }
    } finally {
      this.loading = false;
    }
  }
}
