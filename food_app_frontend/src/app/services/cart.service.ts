import { Injectable, computed, signal } from '@angular/core';
import type { CartItem, FoodItem } from '../models/food.models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSig = signal<CartItem[]>([]);

  // PUBLIC_INTERFACE
  get items() {
    return this.itemsSig.asReadonly();
  }

  // PUBLIC_INTERFACE
  add(item: FoodItem, quantity = 1): void {
    const curr = [...this.itemsSig()];
    const idx = curr.findIndex(ci => ci.item.id === item.id);
    if (idx >= 0) {
      curr[idx] = { ...curr[idx], quantity: curr[idx].quantity + quantity };
    } else {
      curr.push({ item, quantity });
    }
    this.itemsSig.set(curr);
  }

  // PUBLIC_INTERFACE
  remove(itemId: string): void {
    this.itemsSig.set(this.itemsSig().filter(ci => ci.item.id !== itemId));
  }

  // PUBLIC_INTERFACE
  update(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.remove(itemId);
      return;
    }
    this.itemsSig.set(
      this.itemsSig().map(ci => ci.item.id === itemId ? { ...ci, quantity } : ci)
    );
  }

  // PUBLIC_INTERFACE
  clear(): void {
    this.itemsSig.set([]);
  }

  // PUBLIC_INTERFACE
  totalAmount(): number {
    return this.itemsSig().reduce((acc, ci) => acc + ci.item.price * ci.quantity, 0);
  }

  // PUBLIC_INTERFACE
  totalQuantity(): number {
    return this.itemsSig().reduce((acc, ci) => acc + ci.quantity, 0);
  }

  // Derived signals if needed by components
  totalAmountSig = computed(() => this.totalAmount());
  totalQuantitySig = computed(() => this.totalQuantity());
}
