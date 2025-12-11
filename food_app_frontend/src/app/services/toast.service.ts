import { Injectable, Signal, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  timeoutMs?: number;
}

/**
 * PUBLIC_INTERFACE
 * ToastService provides a minimal signal-based pub/sub for toast notifications.
 * - SSR safe: uses only signals and setTimeout guarded by globalThis checks.
 * - No external UI library usage.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSig = signal<Toast[]>([]);

  // PUBLIC_INTERFACE
  get toasts(): Signal<Toast[]> {
    return this.toastsSig.asReadonly();
  }

  // PUBLIC_INTERFACE
  show(message: string, type: ToastType = 'info', timeoutMs = 3000): string {
    const id = this.generateId();
    const toast: Toast = { id, message, type, timeoutMs };
    this.toastsSig.update(list => [...list, toast]);
    // Auto-dismiss using SSR-safe setTimeout
    const g: any = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined;
    const setTO: ((handler: (...args: any[]) => void, timeout?: number) => any) | undefined =
      g && typeof g.setTimeout === 'function' ? g.setTimeout.bind(g) : undefined;
    if (setTO && timeoutMs && timeoutMs > 0) {
      setTO(() => this.dismiss(id), timeoutMs);
    }
    return id;
  }

  // PUBLIC_INTERFACE
  success(message: string, timeoutMs = 3000) {
    return this.show(message, 'success', timeoutMs);
  }

  // PUBLIC_INTERFACE
  error(message: string, timeoutMs = 4000) {
    return this.show(message, 'error', timeoutMs);
  }

  // PUBLIC_INTERFACE
  info(message: string, timeoutMs = 3000) {
    return this.show(message, 'info', timeoutMs);
  }

  // PUBLIC_INTERFACE
  dismiss(id: string) {
    this.toastsSig.update(list => list.filter(t => t.id !== id));
  }

  private generateId(): string {
    try {
      const g: any = globalThis as any;
      const buf = new Uint8Array(8);
      if (g?.crypto?.getRandomValues) g.crypto.getRandomValues(buf);
      else for (let i = 0; i < buf.length; i++) buf[i] = Math.floor(Math.random() * 256);
      return 't-' + Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return 't-' + Math.random().toString(16).slice(2);
    }
  }
}
