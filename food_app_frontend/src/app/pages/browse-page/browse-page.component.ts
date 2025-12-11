import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { FoodCardComponent } from '../../components/food-card/food-card.component';
import { CartService } from '../../services/cart.service';
import { FoodItem } from '../../models/food.models';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-browse-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FoodCardComponent],
  templateUrl: './browse-page.component.html',
  styleUrls: ['./browse-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrowsePageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private data = inject(DataService);
  private cart = inject(CartService);
  private toast = inject(ToastService);

  items: FoodItem[] = [];
  loading = true;
  error = '';
  sub?: any;

  ngOnInit() {
    this.sub = this.route.queryParamMap.subscribe(async (params) => {
      this.loading = true;
      this.error = '';
      const cat = params.get('category') || undefined;
      const q = params.get('q') || undefined;
      try {
        this.items = await this.data.getItems(cat, q);
      } catch {
        this.error = 'Unable to load items.';
        this.items = [];
      } finally {
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe?.();
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
