import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { SelectionService } from '../../services/selection.service';
import { Router } from '@angular/router';
import { Category } from '../../models/food.models';

@Component({
  selector: 'app-category-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-sidebar.component.html',
  styleUrls: ['./category-sidebar.component.css']
})
export class CategorySidebarComponent implements OnInit {
  private data = inject(DataService);
  private selection = inject(SelectionService);
  private router = inject(Router);

  categories: Category[] = [];
  loading = true;
  error = '';

  selectedId?: string;

  async ngOnInit() {
    try {
      this.categories = await this.data.getCategories();
    } catch (e) {
      this.error = 'Unable to load categories.';
    } finally {
      this.loading = false;
    }
  }

  // PUBLIC_INTERFACE
  select(id?: string) {
    this.selectedId = id;
    this.selection.setSelected(id);
    const queryParams: any = {};
    if (id) queryParams.category = id;
    this.router.navigate(['/browse'], { queryParams });
  }
}
