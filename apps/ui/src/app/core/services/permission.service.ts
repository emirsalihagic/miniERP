import { Injectable } from '@angular/core';
import { UserRole } from '../../shared/interfaces/user.interface';

export interface MenuPermission {
  invoices: boolean;
  products: boolean;
  clients: boolean;
  suppliers: boolean;
  users: boolean;
  pricing: boolean;
  shop: boolean;
  orders: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  /**
   * Define permissions for each role
   * EMPLOYEE: Full access to all modules
   * CLIENT_USER: Limited access - can view invoices, products, and their own client info
   * SUPPLIER_USER: Limited access - can view products, suppliers, and their own supplier info
   */
  private rolePermissions: Record<string, MenuPermission> = {
    [UserRole.EMPLOYEE]: {
      invoices: true,
      products: true,
      clients: true,
      suppliers: true,
      users: true,
      pricing: true,
      shop: true,   // Enable shop access for employees
      orders: true  // Employees manage orders
    },
    [UserRole.CLIENT_USER]: {
      invoices: true,  // Can view invoices related to their client
      products: true,  // Can view products for ordering
      clients: false, // Cannot manage clients
      suppliers: false, // Cannot manage suppliers
      users: false,   // Cannot manage users
      pricing: false,  // Cannot manage pricing
      shop: true,     // Can access shop
      orders: true    // Can view their orders
    },
    [UserRole.SUPPLIER_USER]: {
      invoices: false, // Cannot view invoices
      products: true,  // Can manage products they supply
      clients: false, // Cannot manage clients
      suppliers: true, // Can view supplier info (their own)
      users: false,   // Cannot manage users
      pricing: false,  // Cannot manage pricing
      shop: false,    // Suppliers don't shop
      orders: false   // Suppliers don't manage orders
    }
  };

  /**
   * Get menu permissions for a specific role
   */
  getMenuPermissions(role: string): MenuPermission {
    console.log('🔐 [PermissionService] Getting permissions for role:', role);
    const permissions = this.rolePermissions[role] || {
      invoices: false,
      products: false,
      clients: false,
      suppliers: false,
      users: false,
      pricing: false,
      shop: false,
      orders: false
    };
    console.log('🔐 [PermissionService] Permissions for', role, ':', permissions);
    return permissions;
  }

  /**
   * Check if a role has permission for a specific menu item
   */
  hasPermission(role: string, menuItem: keyof MenuPermission): boolean {
    const permissions = this.getMenuPermissions(role);
    return permissions[menuItem];
  }

  /**
   * Get all available menu items for a role
   */
  getAvailableMenuItems(role: string): string[] {
    const permissions = this.getMenuPermissions(role);
    return Object.keys(permissions).filter(item => permissions[item as keyof MenuPermission]);
  }

  /**
   * Check if a user can access a specific route
   */
  canAccessRoute(role: string, route: string): boolean {
    const permissions = this.getMenuPermissions(role);
    
    // Map routes to permission keys
    if (route.startsWith('/invoices')) {
      return permissions.invoices;
    } else if (route.startsWith('/products')) {
      return permissions.products;
    } else if (route.startsWith('/clients')) {
      return permissions.clients;
    } else if (route.startsWith('/suppliers')) {
      return permissions.suppliers;
    } else if (route.startsWith('/users')) {
      return permissions.users;
    } else if (route.startsWith('/pricing')) {
      return permissions.pricing;
    } else if (route.startsWith('/shop')) {
      return permissions.shop;
    } else if (route.startsWith('/orders')) {
      return permissions.orders;
    } else if (route.startsWith('/dashboard')) {
      return true; // Dashboard is accessible to all authenticated users
    } else if (route.startsWith('/auth')) {
      return true; // Auth routes are accessible to all
    }
    
    return false; // Default to no access for unknown routes
  }
}
