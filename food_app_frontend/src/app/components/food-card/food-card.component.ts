import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodItem } from '../../models/food.models';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-food-card',
  standalone: true,
  imports: [CommonModule, RatingStarsComponent, RouterModule],
  templateUrl: './food-card.component.html',
  styleUrls: ['./food-card.component.css']
})
export class FoodCardComponent {
  @Input() item!: FoodItem;
  @Output() add = new EventEmitter<FoodItem>();

  // PUBLIC_INTERFACE
  onAdd() {
    if (this.item) this.add.emit(this.item);
  }
}
