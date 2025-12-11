import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Home - Food Explorer',
    loadComponent: () =>
      import('./pages/home-page/home-page.component').then(m => m.HomePageComponent),
  },
  {
    path: 'browse',
    title: 'Browse - Food Explorer',
    loadComponent: () =>
      import('./pages/browse-page/browse-page.component').then(m => m.BrowsePageComponent),
  },
  {
    path: 'item/:id',
    title: 'Item Details - Food Explorer',
    loadComponent: () =>
      import('./pages/item-details-page/item-details-page.component').then(m => m.ItemDetailsPageComponent),
  },
  {
    path: 'cart',
    title: 'Your Cart - Food Explorer',
    loadComponent: () =>
      import('./pages/cart-page/cart-page.component').then(m => m.CartPageComponent),
  },
  {
    path: 'checkout',
    title: 'Checkout - Food Explorer',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/checkout-page/checkout-page.component').then(m => m.CheckoutPageComponent),
  },
  { path: '**', redirectTo: '' },
];
