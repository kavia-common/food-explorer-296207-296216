import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, RouterModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarComponent {
  @Input() cartCount = 0;
  @Output() search = new EventEmitter<string>();

  private auth = inject(AuthService);

  // Computed auth state for template usage
  isAuthed = this.auth.isAuthenticated;
  userLabel = computed(() => {
    const token = this.auth.getToken();
    if (!token) return 'Guest';
    // token format: mock-token.<b64user>.<ts>
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const g: any = globalThis as any;
        const b64decode: ((s: string) => string) | undefined =
          typeof g.atob === 'function'
            ? g.atob.bind(g)
            : (typeof (g as any).Buffer !== 'undefined'
                ? ((s: string) => (g as any).Buffer.from(s, 'base64').toString('utf-8'))
                : undefined);
        if (b64decode) return b64decode(parts[1]);
      }
    } catch {}
    return 'User';
  });

  // PUBLIC_INTERFACE
  onSearch(term: string) {
    this.search.emit(term);
  }

  // PUBLIC_INTERFACE
  login() {
    // For demo: no username prompt; use 'demo'
    this.auth.login('demo', 'password');
  }

  // PUBLIC_INTERFACE
  logout() {
    this.auth.logout();
  }
}
