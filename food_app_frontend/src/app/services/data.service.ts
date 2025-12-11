import { Injectable } from '@angular/core';
import { Category, FoodItem } from '../models/food.models';
import { getApiBase } from '../utils/env.util';

const MOCK_CATEGORIES: Category[] = [
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'sushi', name: 'Sushi', icon: '🍣' },
  { id: 'burgers', name: 'Burgers', icon: '🍔' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' },
  { id: 'drinks', name: 'Drinks', icon: '🥤' },
];

const MOCK_ITEMS: FoodItem[] = [
  { id: '1', name: 'Margherita', description: 'Classic pizza with fresh basil', price: 9.99, imageUrl: '', rating: 4.5, categoryId: 'pizza', featured: true, tags: ['veg'] },
  { id: '2', name: 'Pepperoni', description: 'Spicy and savory pepperoni', price: 11.49, imageUrl: '', rating: 4.6, categoryId: 'pizza', featured: false },
  { id: '3', name: 'California Roll', description: 'Crab, avocado, cucumber', price: 8.99, imageUrl: '', rating: 4.2, categoryId: 'sushi', featured: true },
  { id: '4', name: 'Cheeseburger', description: 'Juicy beef with cheese', price: 10.49, imageUrl: '', rating: 4.4, categoryId: 'burgers', featured: false },
  { id: '5', name: 'Chocolate Cake', description: 'Rich and moist', price: 5.99, imageUrl: '', rating: 4.7, categoryId: 'desserts', featured: true },
  { id: '6', name: 'Iced Tea', description: 'Refreshing and sweet', price: 2.99, imageUrl: '', rating: 4.1, categoryId: 'drinks', featured: false },
];

@Injectable({ providedIn: 'root' })
export class DataService {
  private base = getApiBase();
  private get fetchFn(): ((input: any, init?: any) => Promise<any>) | undefined {
    const g: any = globalThis as any;
    return typeof g.fetch === 'function' ? g.fetch.bind(g) : undefined;
  }

  // PUBLIC_INTERFACE
  async getCategories(): Promise<Category[]> {
    if (!this.base || !this.fetchFn) return MOCK_CATEGORIES;
    try {
      const res = await this.fetchFn(`${this.base}/categories`, { credentials: 'include' } as any);
      if (!res?.ok) throw new Error('Failed categories');
      const data = await res.json();
      if (!Array.isArray(data) || !data.length) return MOCK_CATEGORIES;
      return data as Category[];
    } catch {
      return MOCK_CATEGORIES;
    }
  }

  // PUBLIC_INTERFACE
  async getItems(categoryId?: string, search?: string): Promise<FoodItem[]> {
    if (!this.base || !this.fetchFn) return this.filterMock(MOCK_ITEMS, categoryId, search);
    try {
      const g: any = globalThis as any;
      const hasURLSearchParams = typeof g.URLSearchParams === 'function';
      const QS: any = hasURLSearchParams ? g.URLSearchParams : undefined;
      const qs: any = hasURLSearchParams ? new QS() : { toString: () => '' };
      if (hasURLSearchParams) {
        if (categoryId) qs.set('categoryId', categoryId);
        if (search) qs.set('q', search);
      }
      const url = `${this.base}/items${qs.toString() ? ('?' + qs.toString()) : ''}`;
      const res = await this.fetchFn(url, { credentials: 'include' } as any);
      if (!res?.ok) throw new Error('Failed items');
      const data = await res.json();
      const arr = (Array.isArray(data) ? data as FoodItem[] : []);
      if (!arr.length) return this.filterMock(MOCK_ITEMS, categoryId, search);
      return arr;
    } catch {
      return this.filterMock(MOCK_ITEMS, categoryId, search);
    }
  }

  // PUBLIC_INTERFACE
  async getItemById(id: string): Promise<FoodItem | undefined> {
    if (!this.base || !this.fetchFn) return MOCK_ITEMS.find(i => i.id === id);
    try {
      const res = await this.fetchFn(`${this.base}/items/${id}`, { credentials: 'include' } as any);
      if (!res?.ok) throw new Error('Failed item');
      const data = await res.json();
      return data as FoodItem;
    } catch {
      return MOCK_ITEMS.find(i => i.id === id);
    }
  }

  private filterMock(items: FoodItem[], categoryId?: string, search?: string): FoodItem[] {
    let filtered = [...items];
    if (categoryId) filtered = filtered.filter(i => i.categoryId === categoryId);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(s) ||
        i.description.toLowerCase().includes(s) ||
        i.tags?.some(t => t.toLowerCase().includes(s))
      );
    }
    return filtered;
  }
}
