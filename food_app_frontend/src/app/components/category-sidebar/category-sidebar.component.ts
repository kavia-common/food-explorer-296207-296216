import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
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
  styleUrls: ['./category-sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  // PUBLIC_INTERFACE
  onKeydown(event: any, id?: string) {
    const key = event?.key as string | undefined;
    if (key === 'Enter' || key === ' ') {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      this.select(id);
    }
  }

  // PUBLIC_INTERFACE
  trackByCategory(_index: number, c: Category) {
    return c.id;
  }
}
