import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { NoAuthGuard } from './core/guards/no-auth.guard';
import { PendingChangesGuard } from './core/guards/pending-changes.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [NoAuthGuard],
    data: { hideSidebar: true },
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard/employee',
    loadComponent: () => import('./features/dashboard/employee-dashboard.component').then(m => m.EmployeeDashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard/client',
    loadComponent: () => import('./features/dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard/supplier',
    loadComponent: () => import('./features/dashboard/supplier-dashboard.component').then(m => m.SupplierDashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/users/users-list/users-list.component').then(m => m.UsersListComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent),
        canDeactivate: [PendingChangesGuard]
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent),
        canDeactivate: [PendingChangesGuard]
      }
    ]
  },
  {
    path: 'clients',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/clients/components/clients-list/clients-list.component').then(m => m.ClientsListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/clients/components/client-form/client-form.component').then(m => m.ClientFormComponent),
        canDeactivate: [PendingChangesGuard]
      },
      {
        path: ':id',
        loadComponent: () => import('./features/clients/components/client-detail/client-detail.component').then(m => m.ClientDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/clients/components/client-form/client-form.component').then(m => m.ClientFormComponent),
        canDeactivate: [PendingChangesGuard]
      }
    ]
  },
  {
    path: 'invoices',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/invoices/components/invoices-list/invoices-list.component').then(m => m.InvoicesListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/invoices/components/invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent),
        canDeactivate: [PendingChangesGuard]
      },
      {
        path: ':id',
        loadComponent: () => import('./features/invoices/components/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/invoices/components/invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent),
        canDeactivate: [PendingChangesGuard]
      }
    ]
  },
  {
    path: 'pricing',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/pricing/components/pricing-list/pricing-list.component').then(m => m.PricingListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/pricing/components/pricing-form/pricing-form.component').then(m => m.PricingFormComponent),
        canDeactivate: [PendingChangesGuard]
      },
      {
        path: 'resolver',
        loadComponent: () => import('./features/pricing/components/pricing-resolver/pricing-resolver.component').then(m => m.PricingResolverComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/pricing/components/pricing-detail/pricing-detail.component').then(m => m.PricingDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/pricing/components/pricing-form/pricing-form.component').then(m => m.PricingFormComponent),
        canDeactivate: [PendingChangesGuard]
      }
    ]
  },
  {
    path: 'products',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/products/components/products-list/products-list.component').then(m => m.ProductsListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/products/components/product-form/product-form.component').then(m => m.ProductFormComponent),
        canDeactivate: [PendingChangesGuard]
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./features/products/components/product-form/product-form.component').then(m => m.ProductFormComponent),
        canDeactivate: [PendingChangesGuard]
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/products/components/categories/categories.component').then(m => m.CategoriesComponent)
      },
      {
        path: 'attributes',
        loadComponent: () => import('./features/products/components/attributes/attributes.component').then(m => m.AttributesComponent)
      },
      {
        path: 'product-groups',
        loadComponent: () => import('./features/products/components/product-groups/product-groups.component').then(m => m.ProductGroupsComponent)
      },
    ]
  },
  {
    path: 'suppliers',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
      }
    ]
  },
  {
    path: 'shop',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/shop/shop.routes').then(m => m.shopRoutes)
  },
  {
    path: 'orders',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/orders/components/orders-management-list/orders-management-list.component').then(m => m.OrdersManagementListComponent)
      },
      {
        path: 'pending',
        loadComponent: () => import('./features/orders/components/orders-management-list/orders-management-list.component').then(m => m.OrdersManagementListComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/orders/components/order-management-detail/order-management-detail.component').then(m => m.OrderManagementDetailComponent)
      }
    ]
  },
  {
    path: 'permission-test',
    loadComponent: () => import('./features/permission-test/permission-test.component').then(m => m.PermissionTestComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'not-found',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: '**',
    redirectTo: 'not-found'
  }
];
