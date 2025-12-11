import { Injectable, computed, effect, signal } from '@angular/core';
import type { CartItem, FoodItem } from '../models/food.models';

const CART_STORAGE_KEY = 'fe_cart_v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSig = signal<CartItem[]>(this.hydrateFromStorage());

  /**
   * Persist changes to localStorage when items change.
   * Uses SSR-safe checks and try/catch for storage quota or access errors.
   */
  private persistEffect = effect(() => {
    const items = this.itemsSig();
    this.saveToStorage(items);
  });

  // PUBLIC_INTERFACE
  get items() {
    return this.itemsSig.asReadonly();
  }

  // PUBLIC_INTERFACE
  add(item: FoodItem, quantity = 1): void {
    const curr = [...this.itemsSig()];
    const idx = curr.findIndex(ci => ci.item.id === item.id);
    if (idx >= 0) {
      const newQty = curr[idx].quantity + quantity;
      curr[idx] = { ...curr[idx], quantity: newQty };
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
      this.itemsSig().map(ci => (ci.item.id === itemId ? { ...ci, quantity } : ci))
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

  /**
   * Attempt to read cart state from localStorage on client.
   * Returns empty array on SSR or when storage is not available/valid.
   */
  private hydrateFromStorage(): CartItem[] {
    // SSR/Node guard and safe global reference
    const g: any = (typeof globalThis !== 'undefined' ? (globalThis as any) : undefined);
    // Define a minimal storage-like shape to avoid relying on DOM lib types in SSR/lint
    type StorageLike = { getItem(key: string): string | null; setItem(key: string, value: string): void; };
    const ls: StorageLike | undefined = g && g.localStorage ? (g.localStorage as StorageLike) : undefined;
    if (!ls) {
      return [];
    }
    try {
      const raw = ls.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // Basic shape validation to avoid runtime issues
      return parsed.filter(
        (ci: any) => ci && ci.item && typeof ci.item.id === 'string' && typeof ci.quantity === 'number'
      );
    } catch {
      // On parse or access error, start fresh
      return [];
    }
  }

  /**
   * Persist current cart to localStorage if available.
   * Silently ignore errors such as quota exceeded or access denied.
   */
  private saveToStorage(items: CartItem[]): void {
    // SSR/Node guard and safe global reference
    const g: any = (typeof globalThis !== 'undefined' ? (globalThis as any) : undefined);
    type StorageLike = { getItem(key: string): string | null; setItem(key: string, value: string): void; };
    const ls: StorageLike | undefined = g && g.localStorage ? (g.localStorage as StorageLike) : undefined;
    if (!ls) {
      return;
    }
    try {
      ls.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota or storage access errors
    }
  }
}
