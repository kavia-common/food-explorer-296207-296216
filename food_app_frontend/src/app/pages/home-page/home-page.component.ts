import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { FoodCardComponent } from '../../components/food-card/food-card.component';
import { CartService } from '../../services/cart.service';
import { FeatureFlagService } from '../../services/feature-flag.service';
import { FoodItem } from '../../models/food.models';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FoodCardComponent],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent implements OnInit {
  private data = inject(DataService);
  private cart = inject(CartService);
  private flags = inject(FeatureFlagService);
  private toast = inject(ToastService);

  featured: FoodItem[] = [];
  recommended: FoodItem[] = [];
  loading = true;
  error = '';

  async ngOnInit() {
    try {
      const items = await this.data.getItems();
      this.featured = items.filter(i => i.featured);
      if (this.flags.isEnabled('recommended')) {
        this.recommended = items.slice(0, 4);
      }
    } catch {
      this.error = 'Unable to load items.';
    } finally {
      this.loading = false;
    }
  }

  // PUBLIC_INTERFACE
  addToCart(item: FoodItem) {
    this.cart.add(item, 1);
    this.toast.success(`Added "${item.name}" to cart.`);
  }

  // PUBLIC_INTERFACE
  trackByItem(_index: number, i: FoodItem) {
    return i.id;
  }
}
