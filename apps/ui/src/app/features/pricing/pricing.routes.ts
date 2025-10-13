import { Routes } from '@angular/router';
import { PricingListComponent } from './components/pricing-list/pricing-list.component';
import { PricingFormComponent } from './components/pricing-form/pricing-form.component';
import { PricingDetailComponent } from './components/pricing-detail/pricing-detail.component';
import { PricingResolverComponent } from './components/pricing-resolver/pricing-resolver.component';

export const pricingRoutes: Routes = [
  {
    path: '',
    component: PricingListComponent,
    title: 'Product Pricing'
  },
  {
    path: 'new',
    component: PricingFormComponent,
    title: 'Create Pricing Rule'
  },
  {
    path: 'resolver',
    component: PricingResolverComponent,
    title: 'Price Resolver'
  },
  {
    path: ':id',
    component: PricingDetailComponent,
    title: 'Pricing Rule Details'
  },
  {
    path: ':id/edit',
    component: PricingFormComponent,
    title: 'Edit Pricing Rule'
  }
];
