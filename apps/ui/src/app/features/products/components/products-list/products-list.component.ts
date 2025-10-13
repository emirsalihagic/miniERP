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
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .filters {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      min-width: 150px;
    }

    .filter-group label {
      margin-bottom: 5px;
      font-weight: 500;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .products-table {
      width: 100%;
      border-collapse: collapse;
    }

    .products-table th {
      background: #f8f9fa;
      padding: 15px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #dee2e6;
    }

    .products-table td {
      padding: 15px;
      border-bottom: 1px solid #dee2e6;
    }

    .products-table tr:hover {
      background: #f8f9fa;
    }

    .grouped-product {
      background: #f0f8ff;
    }

    .product-name {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .group-info, .variation-info {
      color: #6c757d;
      font-size: 12px;
    }

    .type-tag {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }

    .type-grouped {
      background: #e3f2fd;
      color: #1976d2;
    }

    .type-individual {
      background: #e8f5e8;
      color: #388e3c;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .status-tag {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }

    .status-registration { background: #fff3cd; color: #856404; }
    .status-active { background: #d4edda; color: #155724; }
    .status-inactive { background: #f8d7da; color: #721c24; }
    .status-stand_by { background: #d1ecf1; color: #0c5460; }

    .product-group {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }

    .attributes {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }

    .attribute-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .attribute-tag {
      background: #e9ecef;
      color: #495057;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    .no-products {
      text-align: center;
      padding: 40px;
      color: #6c757d;
    }

    .form-control {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      text-decoration: none;
      display: inline-block;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-sm {
      padding: 4px 8px;
      font-size: 12px;
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
