import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { PricingService, Pricing } from '../../services/pricing.service';
import { NavigationService } from '../../../../core/services/navigation.service';

@Component({
  selector: 'app-pricing-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="pricing-detail-container">
      <div class="header">
        <h1>Pricing Rule Details</h1>
        <div class="header-actions">
          <button type="button" (click)="goBack()" class="btn btn-outline">
            ← Back
          </button>
          <button type="button" (click)="editPricing()" class="btn btn-primary">
            Edit
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading pricing rule...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>

      <!-- Pricing Details -->
      <div *ngIf="!loading && pricing" class="pricing-details">
        <div class="detail-card">
          <h2>Product Information</h2>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Product Name</label>
              <span>{{ pricing.product?.name || 'Unknown Product' }}</span>
            </div>
            <div class="detail-item">
              <label>SKU</label>
              <span class="sku">{{ pricing.product?.sku || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <label>Product ID</label>
              <span class="id">{{ pricing.productId }}</span>
            </div>
          </div>
        </div>

        <div class="detail-card">
          <h2>Pricing Scope</h2>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Scope Type</label>
              <span class="scope" [class]="getScopeClass(pricing)">
                {{ getScopeLabel(pricing) }}
              </span>
            </div>
            <div class="detail-item" *ngIf="pricing.client">
              <label>Client</label>
              <span>{{ pricing.client.name }}</span>
            </div>
            <div class="detail-item" *ngIf="pricing.supplier">
              <label>Supplier</label>
              <span>{{ pricing.supplier.name }}</span>
            </div>
          </div>
        </div>

        <div class="detail-card">
          <h2>Pricing Information</h2>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Unit Price (excl. VAT)</label>
              <span class="price">{{ pricing.price | currency:pricing.currency:'symbol':'1.2-2' }}</span>
            </div>
            <div class="detail-item">
              <label>Currency</label>
              <span class="currency">{{ pricing.currency }}</span>
            </div>
            <div class="detail-item">
              <label>Tax Rate</label>
              <span class="tax-rate">{{ pricing.taxRate }}%</span>
            </div>
            <div class="detail-item">
              <label>Discount</label>
              <span class="discount" [class.has-discount]="pricing.discountPercent > 0">
                {{ pricing.discountPercent }}%
              </span>
            </div>
          </div>
        </div>

        <div class="detail-card">
          <h2>Effective Period</h2>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Effective From</label>
              <span>{{ pricing.effectiveFrom | date:'medium' }}</span>
            </div>
            <div class="detail-item" *ngIf="pricing.effectiveTo">
              <label>Effective To</label>
              <span>{{ pricing.effectiveTo | date:'medium' }}</span>
            </div>
            <div class="detail-item" *ngIf="!pricing.effectiveTo">
              <label>Status</label>
              <span class="status active">Currently Active</span>
            </div>
          </div>
        </div>

        <div class="detail-card">
          <h2>Timestamps</h2>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Created At</label>
              <span>{{ pricing.createdAt | date:'medium' }}</span>
            </div>
            <div class="detail-item">
              <label>Updated At</label>
              <span>{{ pricing.updatedAt | date:'medium' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div *ngIf="!loading && pricing" class="actions">
        <button type="button" (click)="editPricing()" class="btn btn-primary">
          Edit Pricing Rule
        </button>
        <button type="button" (click)="deletePricing()" class="btn btn-danger">
          Delete Pricing Rule
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pricing-detail-container {
      padding: 2rem;
      max-width: 1000px;
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

    .pricing-details {
      display: grid;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .detail-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1.5rem;
    }

    .detail-card h2 {
      margin: 0 0 1rem 0;
      color: #555;
      font-size: 1.25rem;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 0.5rem;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-item label {
      font-weight: 500;
      color: #666;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-item span {
      color: #333;
      font-size: 1rem;
    }

    .sku {
      font-family: monospace;
      background: #f8f9fa;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .id {
      font-family: monospace;
      color: #666;
      font-size: 0.875rem;
    }

    .scope {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      display: inline-block;
      width: fit-content;
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

    .price {
      font-weight: 600;
      color: #28a745;
      font-size: 1.25rem;
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

    .status {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      display: inline-block;
      width: fit-content;
    }

    .status.active {
      background: #d4edda;
      color: #155724;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      padding: 2rem;
      border-top: 1px solid #eee;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      text-decoration: none;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
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

    .btn-outline:hover {
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

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .header-actions {
        justify-content: center;
      }

      .detail-grid {
        grid-template-columns: 1fr;
      }

      .actions {
        flex-direction: column;
      }
    }
  `]
})
export class PricingDetailComponent implements OnInit {
  private pricingService = inject(PricingService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private navigationService = inject(NavigationService);

  pricing: Pricing | null = null;
  loading = false;
  errorMessage = '';

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadPricing(params['id']);
      }
    });
  }

  loadPricing(id: string) {
    this.loading = true;
    this.errorMessage = '';

    this.pricingService.getById(id).subscribe({
      next: (pricing: Pricing) => {
        this.pricing = pricing;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading pricing:', error);
        this.errorMessage = 'Failed to load pricing rule';
        this.loading = false;
      }
    });
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

  editPricing() {
    if (this.pricing) {
      this.router.navigate(['/pricing', this.pricing.id, 'edit']);
    }
  }

  deletePricing() {
    if (this.pricing && confirm('Are you sure you want to delete this pricing rule?')) {
      this.loading = true;
      this.pricingService.delete(this.pricing.id).subscribe({
        next: () => {
          this.router.navigate(['/pricing']);
        },
        error: (error: any) => {
          console.error('Error deleting pricing:', error);
          this.errorMessage = 'Failed to delete pricing rule';
          this.loading = false;
        }
      });
    }
  }

  goBack() {
    this.navigationService.navigateToListPage();
  }
}
