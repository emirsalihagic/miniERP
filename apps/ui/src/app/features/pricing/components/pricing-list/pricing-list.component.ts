import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PricingService, Pricing, PricingListResponse } from '../../services/pricing.service';
import { NavigationService } from '../../../../core/services/navigation.service';

@Component({
  selector: 'app-pricing-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="pricing-list-container">
      <div class="header">
        <h1>Product Pricing</h1>
        <div class="header-actions">
          <button type="button" (click)="goToCreate()" class="btn btn-primary">
            + Add Pricing Rule
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="filter-group">
          <label for="search">Search:</label>
          <input 
            type="text" 
            id="search" 
            [(ngModel)]="searchTerm" 
            (input)="onSearchChange()"
            placeholder="Search by product name, SKU, client, or supplier..."
            class="form-input">
        </div>
        <div class="filter-group">
          <label for="currency">Currency:</label>
          <select id="currency" [(ngModel)]="selectedCurrency" (change)="loadPricing()" class="form-select">
            <option value="">All Currencies</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="BAM">BAM</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="scope">Scope:</label>
          <select id="scope" [(ngModel)]="selectedScope" (change)="loadPricing()" class="form-select">
            <option value="">All Scopes</option>
            <option value="base">Base Pricing</option>
            <option value="client">Client Overrides</option>
            <option value="supplier">Supplier Overrides</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading pricing rules...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>

      <!-- Pricing Table -->
      <div *ngIf="!loading && pricingRules.length > 0" class="pricing-table-container">
        <table class="pricing-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Unit Price (excl. VAT)</th>
              <th>Currency</th>
              <th>Tax Rate</th>
              <th>Discount</th>
              <th>Scope</th>
              <th>Client/Supplier</th>
              <th>Effective Period</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let pricing of pricingRules" class="pricing-row">
              <td>
                <div class="product-info">
                  <span class="product-name">{{ pricing.product?.name || 'Unknown Product' }}</span>
                </div>
              </td>
              <td>
                <span class="sku">{{ pricing.product?.sku || 'N/A' }}</span>
              </td>
              <td>
                <span class="price">{{ pricing.price | currency:pricing.currency:'symbol':'1.2-2' }}</span>
              </td>
              <td>
                <span class="currency">{{ pricing.currency }}</span>
              </td>
              <td>
                <span class="tax-rate">{{ pricing.taxRate }}%</span>
              </td>
              <td>
                <span class="discount" [class.has-discount]="pricing.discountPercent > 0">
                  {{ pricing.discountPercent }}%
                </span>
              </td>
              <td>
                <span class="scope" [class]="getScopeClass(pricing)">
                  {{ getScopeLabel(pricing) }}
                </span>
              </td>
              <td>
                <span class="entity-name">
                  {{ pricing.client?.name || pricing.supplier?.name || 'Base' }}
                </span>
              </td>
              <td>
                <div class="effective-period">
                  <span class="from">{{ pricing.effectiveFrom | date:'short' }}</span>
                  <span *ngIf="pricing.effectiveTo" class="to">
                    - {{ pricing.effectiveTo | date:'short' }}
                  </span>
                </div>
              </td>
              <td>
                <div class="actions">
                  <button 
                    type="button" 
                    (click)="editPricing(pricing.id)" 
                    class="btn btn-sm btn-outline">
                    Edit
                  </button>
                  <button 
                    type="button" 
                    (click)="deletePricing(pricing.id)" 
                    class="btn btn-sm btn-danger"
                    [disabled]="loading">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && pricingRules.length === 0" class="empty-state">
        <div class="empty-icon">💰</div>
        <h3>No Pricing Rules Found</h3>
        <p>Start by creating your first pricing rule for a product.</p>
        <button type="button" (click)="goToCreate()" class="btn btn-primary">
          Add Pricing Rule
        </button>
      </div>

      <!-- Pagination -->
      <div *ngIf="meta && meta.totalPages > 1" class="pagination">
        <button 
          type="button" 
          (click)="goToPage(currentPage - 1)" 
          [disabled]="currentPage <= 1"
          class="btn btn-outline">
          Previous
        </button>
        <span class="page-info">
          Page {{ currentPage }} of {{ meta.totalPages }} ({{ meta.total }} total)
        </span>
        <button 
          type="button" 
          (click)="goToPage(currentPage + 1)" 
          [disabled]="currentPage >= meta.totalPages"
          class="btn btn-outline">
          Next
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pricing-list-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .filters {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 500;
      color: #555;
      font-size: 0.875rem;
    }

    .form-input,
    .form-select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .form-input:focus,
    .form-select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #666;
    }

    .spinner {
      width: 2rem;
      height: 2rem;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-banner {
      background: #f8d7da;
      color: #721c24;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      border: 1px solid #f5c6cb;
    }

    .pricing-table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .pricing-table {
      width: 100%;
      border-collapse: collapse;
    }

    .pricing-table th {
      background: #f8f9fa;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #555;
      border-bottom: 2px solid #dee2e6;
    }

    .pricing-table td {
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
      vertical-align: top;
    }

    .pricing-row:hover {
      background: #f8f9fa;
    }

    .product-info {
      display: flex;
      flex-direction: column;
    }

    .product-name {
      font-weight: 500;
      color: #333;
    }

    .sku {
      font-family: monospace;
      color: #666;
      font-size: 0.875rem;
    }

    .price {
      font-weight: 600;
      color: #28a745;
    }

    .currency {
      font-weight: 500;
      color: #666;
    }

    .tax-rate {
      color: #666;
    }

    .discount {
      color: #666;
    }

    .discount.has-discount {
      color: #dc3545;
      font-weight: 500;
    }

    .scope {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .scope.base {
      background: #e9ecef;
      color: #495057;
    }

    .scope.client {
      background: #d4edda;
      color: #155724;
    }

    .scope.supplier {
      background: #d1ecf1;
      color: #0c5460;
    }

    .entity-name {
      color: #666;
      font-size: 0.875rem;
    }

    .effective-period {
      display: flex;
      flex-direction: column;
      font-size: 0.875rem;
    }

    .from {
      color: #333;
    }

    .to {
      color: #666;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      text-decoration: none;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-outline {
      background: transparent;
      color: #007bff;
      border: 1px solid #007bff;
    }

    .btn-outline:hover:not(:disabled) {
      background: #007bff;
      color: white;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #c82333;
    }

    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .empty-state p {
      margin: 0 0 2rem 0;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .page-info {
      color: #666;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .filters {
        grid-template-columns: 1fr;
      }
      
      .pricing-table-container {
        overflow-x: auto;
      }
      
      .pricing-table {
        min-width: 800px;
      }
      
      .actions {
        flex-direction: column;
      }
    }
  `]
})
export class PricingListComponent implements OnInit {
  private pricingService = inject(PricingService);
  private router = inject(Router);
  private navigationService = inject(NavigationService);

  pricingRules: Pricing[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';
  selectedCurrency = '';
  selectedScope = '';
  currentPage = 1;
  meta: any = null;

  ngOnInit() {
    this.loadPricing();
  }

  loadPricing() {
    this.loading = true;
    this.errorMessage = '';

    this.pricingService.getAll(this.currentPage, 20).subscribe({
      next: (response: PricingListResponse) => {
        this.pricingRules = this.filterPricing(response.data);
        this.meta = response.meta;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading pricing:', error);
        this.errorMessage = 'Failed to load pricing rules';
        this.loading = false;
      }
    });
  }

  filterPricing(pricing: Pricing[]): Pricing[] {
    let filtered = pricing;

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.product?.name?.toLowerCase().includes(term) ||
        p.product?.sku?.toLowerCase().includes(term) ||
        p.client?.name?.toLowerCase().includes(term) ||
        p.supplier?.name?.toLowerCase().includes(term)
      );
    }

    // Filter by currency
    if (this.selectedCurrency) {
      filtered = filtered.filter(p => p.currency === this.selectedCurrency);
    }

    // Filter by scope
    if (this.selectedScope) {
      filtered = filtered.filter(p => {
        switch (this.selectedScope) {
          case 'base':
            return !p.clientId && !p.supplierId;
          case 'client':
            return !!p.clientId;
          case 'supplier':
            return !!p.supplierId;
          default:
            return true;
        }
      });
    }

    return filtered;
  }

  onSearchChange() {
    // Debounce search
    setTimeout(() => {
      this.loadPricing();
    }, 300);
  }

  getScopeClass(pricing: Pricing): string {
    if (pricing.clientId) return 'client';
    if (pricing.supplierId) return 'supplier';
    return 'base';
  }

  getScopeLabel(pricing: Pricing): string {
    if (pricing.clientId) return 'Client Override';
    if (pricing.supplierId) return 'Supplier Override';
    return 'Base Pricing';
  }

  goToCreate() {
    this.router.navigate(['/pricing/new']);
  }

  editPricing(id: string) {
    this.router.navigate(['/pricing', id, 'edit']);
  }

  deletePricing(id: string) {
    if (confirm('Are you sure you want to delete this pricing rule?')) {
      this.loading = true;
      this.pricingService.delete(id).subscribe({
        next: () => {
          this.loadPricing();
        },
        error: (error: any) => {
          console.error('Error deleting pricing:', error);
          this.errorMessage = 'Failed to delete pricing rule';
          this.loading = false;
        }
      });
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadPricing();
  }
}
