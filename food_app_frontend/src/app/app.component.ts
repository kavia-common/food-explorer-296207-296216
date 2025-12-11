import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { CategorySidebarComponent } from './components/category-sidebar/category-sidebar.component';
import { CartSidebarComponent } from './components/cart-sidebar/cart-sidebar.component';
import { CommonModule } from '@angular/common';
import { CartService } from './services/cart.service';
import { FeatureFlagService } from './services/feature-flag.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavBarComponent, CategorySidebarComponent, CartSidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'Food Explorer';
  private cart = inject(CartService);
  private flags = inject(FeatureFlagService);
  private router = inject(Router);

  cartCount = computed(() => this.cart.totalQuantity());
  showDealsBanner = this.flags.isExperimentEnabled('live_deals');

  // PUBLIC_INTERFACE
  onSearch(term: string) {
    const queryParams: any = {};
    if (term && term.trim().length > 0) {
      queryParams.q = term.trim();
    }
    // Navigate to /browse; when term is empty, do not include q so it resets results
    this.router.navigate(['/browse'], { queryParams }).then(() => {
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
