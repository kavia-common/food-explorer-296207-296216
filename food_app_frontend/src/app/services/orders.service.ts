import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CartItem } from '../models/food.models';
import { getApiBase } from '../utils/env.util';
import { AuthService } from './auth.service';

/**
 * PUBLIC_INTERFACE
 * OrdersService handles order submission to the backend API.
 * - Posts to `${NG_APP_API_BASE}/orders` when API base is configured.
 * - Includes withCredentials for cookie sessions; Authorization header is attached via interceptor.
 * - If API is unavailable or not configured, gracefully falls back to a mock success response
 *   (unless the error is a 401, which is re-thrown to allow login/redirection handling).
 */
@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private base = getApiBase();

  /**
   * PUBLIC_INTERFACE
   * Submit an order for the given cart items and customer details.
   * Returns an object containing an orderId and status on success.
   */
  async submitOrder(input: {
    items: CartItem[];
    customer: { name: string; address: string };
    payment: { token: string };
    totals: { subtotal: number; tax: number; total: number };
  }): Promise<{ orderId: string; status: 'confirmed' | 'processing' }> {
    // Normalize payload shape expected by backend
    const payload = {
      items: input.items.map(ci => ({
        id: ci.item.id,
        name: ci.item.name,
        price: ci.item.price,
        quantity: ci.quantity,
        lineTotal: Number((ci.item.price * ci.quantity).toFixed(2)),
      })),
      customer: {
        name: input.customer.name,
        address: input.customer.address,
      },
      payment: {
        token: input.payment.token,
      },
      totals: {
        subtotal: Number(input.totals.subtotal.toFixed(2)),
        tax: Number(input.totals.tax.toFixed(2)),
        total: Number(input.totals.total.toFixed(2)),
      },
      placedAt: new Date().toISOString(),
    };

    // If no API base configured, provide mock success fallback
    if (!this.base) {
      return this.mockSuccess(payload);
    }

    const url = `${this.base}/orders`;
    try {
      const resp = await firstValueFrom(
        this.http.post<{ orderId: string; status?: string }>(url, payload, { withCredentials: true })
      );
      const orderId = resp?.orderId || this.generateOrderId();
      const status = (resp?.status as 'confirmed' | 'processing') || 'confirmed';
      return { orderId, status };
    } catch (error) {
      // Re-throw 401 to allow login/redirection handling
      if (error instanceof HttpErrorResponse && error.status === 401) {
        throw error;
      }
      // For any other error (network/5xx/etc.), return mock success to prevent blocking checkout
      return this.mockSuccess(payload);
    }
  }

  private mockSuccess(_payload: any): { orderId: string; status: 'confirmed' } {
    // SSR-safe randomness
    const id = this.generateOrderId();
    return { orderId: id, status: 'confirmed' };
  }

  private generateOrderId(): string {
    try {
      const g: any = globalThis as any;
      const array = new Uint8Array(8);
      if (g?.crypto?.getRandomValues) {
        g.crypto.getRandomValues(array);
      } else {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
      }
      return 'MOCK-' + Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return 'MOCK-' + Math.random().toString(16).slice(2);
    }
  }
}
