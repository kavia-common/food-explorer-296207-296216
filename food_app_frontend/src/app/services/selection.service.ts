import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SelectionService {
  private selected = signal<string | undefined>(undefined);

  // PUBLIC_INTERFACE
  setSelected(id?: string) {
    this.selected.set(id);
  }

  // PUBLIC_INTERFACE
  get selectedId() {
    return this.selected.asReadonly();
  }
}
