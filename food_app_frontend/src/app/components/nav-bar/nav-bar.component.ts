import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, SearchBarComponent],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {
  @Input() cartCount = 0;
  @Output() search = new EventEmitter<string>();

  // PUBLIC_INTERFACE
  onSearch(term: string) {
    this.search.emit(term);
  }
}
