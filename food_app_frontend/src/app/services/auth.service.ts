import { Injectable, computed, effect, signal } from '@angular/core';

/**
 * Simple AuthService that stores a mock token in localStorage (client-side only)
 * and exposes signal-based auth state. LocalStorage access is SSR-safe using
 * globalThis checks and try/catch.
 */
const AUTH_TOKEN_STORAGE_KEY = 'fe_auth_token_v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Keep the raw token in a signal
  private tokenSig = signal<string | null>(this.hydrateTokenFromStorage());

  /**
   * Persist token changes to localStorage when token changes.
   * Uses SSR-safe checks and try/catch for storage access errors.
   */
  private persistEffect = effect(() => {
    const token = this.tokenSig();
    this.saveTokenToStorage(token);
  });

  // PUBLIC_INTERFACE
  get token() {
    return this.tokenSig.asReadonly();
  }

  // PUBLIC_INTERFACE
  get isAuthenticated() {
    return computed(() => !!this.tokenSig());
  }

  // PUBLIC_INTERFACE
  login(username?: string, password?: string): void {
    // In a real app, call backend and receive a token here.
    // For now, store a mock token that encodes the username.
    const mockUser = (username && username.trim()) || 'demo';
    const g: any = globalThis as any;
    const b64encode: ((s: string) => string) | undefined =
      typeof g.btoa === 'function'
        ? g.btoa.bind(g)
        : (typeof (g as any).Buffer !== 'undefined'
            ? ((s: string) => (g as any).Buffer.from(s, 'utf-8').toString('base64'))
            : undefined);
    const encoded = b64encode ? b64encode(mockUser) : mockUser;
    const mockToken = `mock-token.${encoded}.${Date.now()}`;
    this.tokenSig.set(mockToken);
  }

  // PUBLIC_INTERFACE
  logout(): void {
    this.tokenSig.set(null);
  }

  // PUBLIC_INTERFACE
  getToken(): string | null {
    return this.tokenSig();
  }

  private hydrateTokenFromStorage(): string | null {
    const g: any = (typeof globalThis !== 'undefined' ? (globalThis as any) : undefined);
    type StorageLike = { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void; };
    const ls: StorageLike | undefined = g && g.localStorage ? (g.localStorage as StorageLike) : undefined;
    if (!ls) {
      return null;
    }
    try {
      return ls.getItem(AUTH_TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private saveTokenToStorage(token: string | null): void {
    const g: any = (typeof globalThis !== 'undefined' ? (globalThis as any) : undefined);
    type StorageLike = { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void; };
    const ls: StorageLike | undefined = g && g.localStorage ? (g.localStorage as StorageLike) : undefined;
    if (!ls) {
      return;
    }
    try {
      if (token) {
        ls.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      } else {
        ls.removeItem(AUTH_TOKEN_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }
}
