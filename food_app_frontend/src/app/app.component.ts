import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { CategorySidebarComponent } from './components/category-sidebar/category-sidebar.component';
import { CartSidebarComponent } from './components/cart-sidebar/cart-sidebar.component';
import { CommonModule } from '@angular/common';
import { CartService } from './services/cart.service';
import { FeatureFlagService } from './services/feature-flag.service';
import { FlagsToggleComponent } from './components/flags-toggle/flags-toggle.component';
import { getEnv } from './utils/env.util';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { SelectionService } from './services/selection.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavBarComponent, CategorySidebarComponent, CartSidebarComponent, FlagsToggleComponent, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'Food Explorer';
  private cart = inject(CartService);
  private flags = inject(FeatureFlagService);
  private router = inject(Router);
  private selection = inject(SelectionService);

  cartCount = computed(() => this.cart.totalQuantity());
  showDealsBanner = this.flags.isExperimentEnabled('live_deals');

  // Expose a public flag for template to avoid calling functions in the template
  devMode = getEnv('NG_APP_NODE_ENV', '') !== 'production';

  // PUBLIC_INTERFACE
  onSearch(term: string) {
    // Update SelectionService, which will sync "q" to URL
    this.selection.setSearch(term);

    // Ensure we are on /browse; query param changes are handled by service effect
    this.router.navigate(['/browse']).then(() => {
      // Move focus to main content for better screen-reader flow (SSR-safe)
      const g: any = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined;
      const doc: any = g && g.document ? g.document : undefined;
      const el = doc?.getElementById?.('main-content') as (HTMLElement | null);
      if (el && typeof el.focus === 'function') {
        el.focus();
      }
    });
  }
}
