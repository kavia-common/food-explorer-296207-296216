import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';
import { CartService } from '../../services/cart.service';
import { RatingStarsComponent } from '../../components/rating-stars/rating-stars.component';
import { QuantitySelectorComponent } from '../../components/quantity-selector/quantity-selector.component';
import { FoodItem } from '../../models/food.models';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-item-details-page',
  standalone: true,
  imports: [CommonModule, RatingStarsComponent, QuantitySelectorComponent],
  templateUrl: './item-details-page.component.html',
  styleUrls: ['./item-details-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemDetailsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private data = inject(DataService);
  private cart = inject(CartService);
  private toast = inject(ToastService);

  item?: FoodItem;
  loading = true;
  error = '';
  quantity = 1;

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    try {
      this.item = await this.data.getItemById(id);
      if (!this.item) {
        this.error = 'Item not found.';
      }
    } catch {
      this.error = 'Unable to load item.';
    } finally {
      this.loading = false;
    }
  }

  // PUBLIC_INTERFACE
  addToCart() {
    if (this.item) {
      this.cart.add(this.item, this.quantity);
      const qty = this.quantity || 1;
      this.toast.success(`Added ${qty} × "${this.item.name}" to cart.`);
    }
  }
}
