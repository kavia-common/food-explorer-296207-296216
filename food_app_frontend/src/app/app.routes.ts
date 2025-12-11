import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { BrowsePageComponent } from './pages/browse-page/browse-page.component';
import { ItemDetailsPageComponent } from './pages/item-details-page/item-details-page.component';
import { CartPageComponent } from './pages/cart-page/cart-page.component';
import { CheckoutPageComponent } from './pages/checkout-page/checkout-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent, title: 'Home - Food Explorer' },
  { path: 'browse', component: BrowsePageComponent, title: 'Browse - Food Explorer' },
  { path: 'item/:id', component: ItemDetailsPageComponent, title: 'Item Details - Food Explorer' },
  { path: 'cart', component: CartPageComponent, title: 'Your Cart - Food Explorer' },
  { path: 'checkout', component: CheckoutPageComponent, title: 'Checkout - Food Explorer' },
  { path: '**', redirectTo: '' }
];
