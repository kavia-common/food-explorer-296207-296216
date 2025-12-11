import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Food Explorer';
  private cart = inject(CartService);
  private flags = inject(FeatureFlagService);

  cartCount = computed(() => this.cart.totalQuantity());
  showDealsBanner = this.flags.isExperimentEnabled('live_deals');
}
