import { Routes } from '@angular/router';

export const ordersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/orders-list/orders-list.component').then(m => m.OrdersListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
  }
];
