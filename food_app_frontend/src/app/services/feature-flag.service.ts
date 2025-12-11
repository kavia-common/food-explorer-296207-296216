import { Injectable, signal } from '@angular/core';
import { getEnv, parseFlags } from '../utils/env.util';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private flags = signal<Record<string, boolean>>(parseFlags(getEnv('NG_APP_FEATURE_FLAGS', '')));
  private experimentsEnabled = (getEnv('NG_APP_EXPERIMENTS_ENABLED', 'false') === 'true');

  // PUBLIC_INTERFACE
  isEnabled(flag: string): boolean {
    return !!this.flags()[flag];
  }

  // PUBLIC_INTERFACE
  isExperimentEnabled(flag: string): boolean {
    if (!this.experimentsEnabled) return false;
    return this.isEnabled(flag);
  }

  // PUBLIC_INTERFACE
  getAll(): Record<string, boolean> {
    return this.flags();
  }
}
