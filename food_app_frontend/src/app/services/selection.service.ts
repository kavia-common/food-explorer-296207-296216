import { Injectable, effect, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

/**
 * PUBLIC_INTERFACE
 * SelectionService keeps current selected category and search query in sync with the URL (query params).
 * - Reads initial values from ActivatedRoute.snapshot.queryParamMap in a lazy/SSR-safe way.
 * - Writes changes back to the URL using the Router with queryParamsHandling: 'merge'
 *   to preserve unrelated params.
 * - Only updates URL on the client (SSR-safe globalThis checks).
 */
@Injectable({ providedIn: 'root' })
export class SelectionService {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signals for selected category and search query
  private selected = signal<string | undefined>(undefined);
  private search = signal<string | undefined>(undefined);

  constructor() {
    // Initialize from URL snapshot (works on both CSR and SSR)
    const qp = this.route.snapshot?.queryParamMap;
    const initialCat = qp?.get('category') || undefined;
    const initialQ = qp?.get('q') || undefined;
    if (initialCat) this.selected.set(initialCat);
    if (initialQ) this.search.set(initialQ);

    // Reflect changes back to URL on client only
    effect(() => {
      const cat = this.selected();
      const q = this.search();

      // SSR guard to avoid manipulating Router during server render navigation
      const g: any = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined;
      const hasWindow = !!(g && g.window && g.document);

      if (!hasWindow) return;

      const queryParams: any = {};
      // Only set keys if truthy; if undefined/empty, we remove them by setting to null with merge handling
      if (cat) queryParams.category = cat;
      else queryParams.category = null;

      if (q && q.trim().length > 0) queryParams.q = q.trim();
      else queryParams.q = null;

      // Use merge to preserve other params; use replaceUrl to avoid polluting history on reactive updates
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      }).catch(() => {
        // ignore navigation errors (e.g., cancelled)
      });
    });
  }

  // PUBLIC_INTERFACE
  setSelected(id?: string) {
    this.selected.set(id);
  }

  // PUBLIC_INTERFACE
  get selectedId() {
    return this.selected.asReadonly();
  }

  // PUBLIC_INTERFACE
  setSearch(term?: string) {
    const t = term?.trim();
    this.search.set(t && t.length ? t : undefined);
  }

  // PUBLIC_INTERFACE
  get searchTerm() {
    return this.search.asReadonly();
  }
}
