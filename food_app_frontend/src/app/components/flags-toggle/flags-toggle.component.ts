import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureFlagService } from '../../services/feature-flag.service';
import { getEnv, parseFlags } from '../../utils/env.util';

/**
 * A small floating dev-only widget to view and toggle feature flags at runtime.
 * Visible only when NG_APP_NODE_ENV !== 'production'.
 *
 * Behavior:
 * - Reads default flags from FeatureFlagService (from env).
 * - Overlays user overrides stored in localStorage (SSR-safe).
 * - Toggling a flag writes override to localStorage and updates the view immediately.
 * - Provides "Reset" to clear overrides.
 *
 * Storage key is namespaced to avoid collisions.
 */
const FLAGS_OVERRIDE_STORAGE_KEY = 'fe_flags_overrides_v1';

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

// PUBLIC_INTERFACE
@Component({
  selector: 'app-flags-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="isDev()">
      <div class="flags-toggle" role="region" aria-label="Feature Flags Toggle">
        <button type="button" class="pill" (click)="open.set(!open())" [attr.aria-expanded]="open()">
          ⚑ Flags
        </button>

        <div class="panel" *ngIf="open()">
          <div class="hdr">
            <div class="title">Feature Flags</div>
            <button type="button" class="reset" (click)="reset()">Reset</button>
          </div>
          <div class="sub">Env: {{ nodeEnv }}</div>

          <ul class="list" role="list">
            <li class="item" *ngFor="let key of flagKeys(); trackBy: trackByKey">
              <label class="row">
                <input
                  type="checkbox"
                  [checked]="effective()[key]"
                  (change)="toggle(key, $any($event.target).checked)"
                />
                <span class="name">{{ key }}</span>
                <span class="val">{{ effective()[key] ? 'on' : 'off' }}</span>
                <span class="badge" *ngIf="isOverridden(key)">overridden</span>
              </label>
            </li>
          </ul>

          <div class="hint">Overrides are stored in localStorage for this browser only.</div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    .flags-toggle {
      position: fixed;
      right: 10px;
      bottom: 10px;
      z-index: 9999;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji','Segoe UI Emoji';
    }
    .pill {
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid rgba(17,24,39,0.12);
      background: #ffffff;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,.08);
    }
    .panel {
      margin-top: 8px;
      width: 260px;
      background: #ffffff;
      border: 1px solid rgba(17,24,39,0.12);
      border-radius: 12px;
      box-shadow: 0 10px 24px rgba(0,0,0,.12);
      padding: 10px;
    }
    .hdr {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .title { font-weight: 700; }
    .reset {
      border: none;
      background: transparent;
      color: #EF4444;
      cursor: pointer;
    }
    .sub {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 6px;
      max-height: 220px;
      overflow: auto;
    }
    .item { }
    .row {
      display: grid;
      grid-template-columns: auto 1fr auto auto;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 8px;
      border: 1px solid rgba(17,24,39,0.06);
      background: #f9fafb;
    }
    .row:hover { background: #ffffff; }
    .name { font-weight: 600; }
    .val {
      font-size: 12px;
      color: #6b7280;
      justify-self: end;
    }
    .badge {
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 999px;
      background: #2563EB;
      color: white;
      justify-self: end;
    }
    .hint {
      margin-top: 8px;
      font-size: 12px;
      color: #6b7280;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlagsToggleComponent {
  private svc = inject(FeatureFlagService);

  // Toggle panel visibility
  open = signal(false);

  // Snapshot from service (env-based)
  private baseFlags = signal<Record<string, boolean>>(this.svc.getAll());

  // Local overrides
  private overrides = signal<Record<string, boolean>>(this.readOverrides());

  // Effective flags = overrides take precedence over base
  effective = computed(() => {
    const base = this.baseFlags();
    const over = this.overrides();
    const keys = new Set([...Object.keys(base), ...Object.keys(over)]);
    const out: Record<string, boolean> = {};
    keys.forEach(k => {
      out[k] = (k in over) ? over[k] : !!base[k];
    });
    return out;
  });

  nodeEnv = getEnv('NG_APP_NODE_ENV', '');

  // Sync overrides to localStorage whenever they change
  private persist = effect(() => {
    const data = this.overrides();
    this.saveOverrides(data);
  });

  // PUBLIC_INTERFACE
  isDev(): boolean {
    // Show only when not production; treat missing as dev
    return this.nodeEnv !== 'production';
  }

  // PUBLIC_INTERFACE
  flagKeys(): string[] {
    const keys = Object.keys(this.effective());
    keys.sort();
    return keys;
  }

  // PUBLIC_INTERFACE
  toggle(key: string, value: boolean) {
    const next = { ...this.overrides() };
    next[key] = value;
    this.overrides.set(next);
  }

  // PUBLIC_INTERFACE
  reset() {
    this.overrides.set({});
  }

  // PUBLIC_INTERFACE
  isOverridden(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.overrides(), key);
  }

  // PUBLIC_INTERFACE
  trackByKey(_index: number, key: string) {
    return key;
  }

  private readOverrides(): Record<string, boolean> {
    const g: any = (typeof globalThis !== 'undefined' ? (globalThis as any) : undefined);
    const ls: StorageLike | undefined = g && g.localStorage ? (g.localStorage as StorageLike) : undefined;
    if (!ls) return {};
    try {
      const raw = ls.getItem(FLAGS_OVERRIDE_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const out: Record<string, boolean> = {};
        Object.entries(parsed as Record<string, any>).forEach(([k, v]) => (out[k] = !!v));
        return out;
      }
    } catch {
      // ignore parse errors
    }
    return {};
  }

  private saveOverrides(data: Record<string, boolean>) {
    const g: any = (typeof globalThis !== 'undefined' ? (globalThis as any) : undefined);
    const ls: StorageLike | undefined = g && g.localStorage ? (g.localStorage as StorageLike) : undefined;
    if (!ls) return;
    try {
      const json = JSON.stringify(data || {});
      ls.setItem(FLAGS_OVERRIDE_STORAGE_KEY, json);
    } catch {
      // ignore quota or access errors
    }
  }
}
