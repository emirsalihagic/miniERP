import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProductsService, Product } from '../../services/products.service';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="products-container">
      <div class="header">
        <h2>Products Management</h2>
        <div class="header-actions">
          <button 
            class="btn btn-secondary" 
            routerLink="/products/product-groups"
          >
            Add Product Group
          </button>
          <button 
            class="btn btn-primary" 
            routerLink="/products/new"
          >
            Add Product
          </button>
        </div>
      </div>

      <div class="filters">
        <div class="filter-group">
          <label for="statusFilter">Status:</label>
          <select 
            id="statusFilter"
            [(ngModel)]="filters.status" 
            (ngModelChange)="applyFilters()"
            class="form-control"
          >
            <option value="">All Statuses</option>
            <option value="REGISTRATION">Registration</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="STAND_BY">Stand By</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="brandFilter">Brand:</label>
          <input 
            id="brandFilter"
            type="text" 
            [(ngModel)]="filters.brand" 
            (ngModelChange)="applyFilters()"
            placeholder="Filter by brand"
            class="form-control"
          >
        </div>

        <div class="filter-group">
          <label for="skuFilter">SKU:</label>
          <input 
            id="skuFilter"
            type="text" 
            [(ngModel)]="filters.sku" 
            (ngModelChange)="applyFilters()"
            placeholder="Filter by SKU"
            class="form-control"
          >
        </div>
      </div>

      <div class="table-container">
        <table class="products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Brand</th>
              <th>Unit</th>
              <th>Storage</th>
              <th>Weight</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of products" [class.grouped-product]="product.productGroup">
              <td>
                <div class="product-name">
                  <strong>{{ product.name || product.baseName }}</strong>
                  <div *ngIf="product.productGroup" class="group-info">
                    <small>Group: {{ product.productGroup.name }}</small>
                  </div>
                  <div *ngIf="product.variationKey" class="variation-info">
                    <small>Variation: {{ product.variationKey }}</small>
                  </div>
                </div>
              </td>
              <td>
                <span class="type-tag" [class]="product.productGroup ? 'type-grouped' : 'type-individual'">
                  {{ product.productGroup ? 'Grouped' : 'Individual' }}
                </span>
              </td>
              <td>
                <span class="status-tag" [class]="'status-' + product.status.toLowerCase()">
                  {{ product.status }}
                </span>
              </td>
              <td>{{ product.brand || '-' }}</td>
              <td>{{ product.unit?.name || product.unitString || '-' }}</td>
              <td>{{ product.storageType || '-' }}</td>
              <td>
                <span *ngIf="product.weightPerItem">
                  {{ product.weightPerItem | number:'1.0-2' }} {{ product.unit?.name || product.unitString || '' }}
                </span>
                <span *ngIf="!product.weightPerItem">-</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    class="btn btn-sm btn-primary"
                    routerLink="/products/edit/{{ product.id }}"
                    title="Edit Product"
                  >
                    Edit
                  </button>
                  <button 
                    *ngIf="product.attributeValues && product.attributeValues.length > 0"
                    class="btn btn-sm btn-info"
                    (click)="showAttributes(product)"
                    title="View Attributes"
                  >
                    Attributes
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="products.length === 0" class="no-products">
        <p>No products found. <a routerLink="/products/new">Create your first product</a></p>
      </div>
    </div>
  `,
  styles: [`
    .products-container {
      padding: var(--spacing-lg);
      background: var(--color-bg-base);
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
    }

    .header h2 {
      margin: 0;
      color: var(--color-text-base);
      font-size: 24px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
    }

    .filters {
      display: flex;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
      padding: var(--spacing-lg);
      background: var(--color-bg-container);
      border-radius: var(--radius-base);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-card);
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      min-width: 150px;
    }

    .filter-group label {
      margin-bottom: var(--spacing-xs);
      font-weight: 500;
      color: var(--color-text-base);
    }

    .table-container {
      background: var(--color-bg-container);
      border-radius: var(--radius-base);
      overflow: hidden;
      box-shadow: var(--shadow-card);
      border: 1px solid var(--color-border);
    }

    .products-table {
      width: 100%;
      border-collapse: collapse;
    }

    .products-table th {
      background: var(--color-bg-base);
      padding: var(--spacing-md);
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid var(--color-border);
      color: var(--color-text-base);
    }

    .products-table td {
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
      background: var(--color-bg-container);
      color: var(--color-text-base);
    }

    .products-table tr:hover {
      background: rgba(59, 130, 246, 0.05);
    }

    .grouped-product {
      background: rgba(59, 130, 246, 0.05);
    }

    .product-name {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .product-name strong {
      color: var(--color-text-base);
      font-weight: 600;
    }

    .group-info, .variation-info {
      color: var(--color-text-secondary);
      font-size: 12px;
    }

    .type-tag {
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: bold;
    }

    .type-grouped {
      background: rgba(59, 130, 246, 0.1);
      color: var(--color-primary);
    }

    .type-individual {
      background: rgba(34, 197, 94, 0.1);
      color: var(--color-success);
    }

    .action-buttons {
      display: flex;
      gap: var(--spacing-sm);
    }

    .status-tag {
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: bold;
    }

    .status-registration { 
      background: rgba(245, 158, 11, 0.1); 
      color: var(--color-warning); 
    }
    .status-active { 
      background: rgba(34, 197, 94, 0.1); 
      color: var(--color-success); 
    }
    .status-inactive { 
      background: rgba(248, 113, 113, 0.1); 
      color: var(--color-error); 
    }
    .status-stand_by { 
      background: rgba(59, 130, 246, 0.1); 
      color: var(--color-primary); 
    }

    .product-group {
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--color-border);
    }

    .attributes {
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--color-border);
    }

    .attribute-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-sm);
    }

    .attribute-tag {
      background: var(--color-bg-base);
      color: var(--color-text-secondary);
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      border: 1px solid var(--color-border);
    }

    .no-products {
      text-align: center;
      padding: var(--spacing-2xl);
      color: var(--color-text-secondary);
    }

    .no-products a {
      color: var(--color-primary);
      text-decoration: none;
    }

    .no-products a:hover {
      text-decoration: underline;
    }

    .form-control {
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 14px;
      background: var(--color-bg-container);
      color: var(--color-text-base);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: var(--focus-ring);
    }

  `]
})
export class ProductsListComponent implements OnInit {
  private productsService = inject(ProductsService);
  private router = inject(Router);

  products: Product[] = [];
  filters = {
    status: '',
    brand: '',
    sku: ''
  };

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productsService.getAll(this.filters).subscribe({
      next: (response) => {
        this.products = response.data;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  applyFilters() {
    this.loadProducts();
  }

  showAttributes(product: Product) {
    // In a real app, you might open a modal or navigate to a detail page
    const attributes = product.attributeValues?.map(attr => 
      `${attr.attribute.name}: ${attr.value}`
    ).join(', ') || 'No attributes';
    
    alert(`Product Attributes:\n${attributes}`);
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productsService.delete(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
        }
      });
    }
  }
}
