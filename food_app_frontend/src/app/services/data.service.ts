import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Category, FoodItem } from '../models/food.models';
import { getApiBase } from '../utils/env.util';

/**
 * DataService
 * Migrated to Angular HttpClient for data fetching with SSR-safe fallbacks.
 * - Uses HttpClient for GET requests to /categories, /items, and /items/:id.
 * - Keeps mock fallback data when API base is not configured or on request failure.
 * - Relies on auth and error interceptors for Authorization header and retries.
 * - Sets withCredentials on requests to allow cookie-based sessions when needed.
 */
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
  private http = inject(HttpClient);

  /**
   * PUBLIC_INTERFACE
   * Fetch categories from backend if API base is configured, else return mock categories.
   * Uses withCredentials to allow cookie-based sessions. Auth header is attached via interceptor.
   */
  async getCategories(): Promise<Category[]> {
    if (!this.base) {
      return MOCK_CATEGORIES;
    }
    try {
      const url = `${this.base}/categories`;
      const data = await firstValueFrom(
        this.http.get<Category[]>(url, { withCredentials: true })
      );
      if (!Array.isArray(data) || data.length === 0) {
        return MOCK_CATEGORIES;
      }
      return data;
    } catch {
      return MOCK_CATEGORIES;
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Fetch items with optional category and search filters.
   * Falls back to filtering mock data on failure or when API base is missing.
   */
  async getItems(categoryId?: string, search?: string): Promise<FoodItem[]> {
    if (!this.base) {
      return this.filterMock(MOCK_ITEMS, categoryId, search);
    }
    try {
      let params = new HttpParams();
      if (categoryId) params = params.set('categoryId', categoryId);
      if (search) params = params.set('q', search);

      const url = `${this.base}/items`;
      const arr = await firstValueFrom(
        this.http.get<FoodItem[]>(url, { params, withCredentials: true })
      );
      if (!Array.isArray(arr) || arr.length === 0) {
        return this.filterMock(MOCK_ITEMS, categoryId, search);
      }
      return arr;
    } catch {
      return this.filterMock(MOCK_ITEMS, categoryId, search);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Fetch a single item by id. Returns mock item if request fails or API base not configured.
   */
  async getItemById(id: string): Promise<FoodItem | undefined> {
    if (!this.base) {
      return MOCK_ITEMS.find(i => i.id === id);
    }
    try {
      const url = `${this.base}/items/${encodeURIComponent(id)}`;
      const item = await firstValueFrom(
        this.http.get<FoodItem>(url, { withCredentials: true })
      );
      return item;
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
