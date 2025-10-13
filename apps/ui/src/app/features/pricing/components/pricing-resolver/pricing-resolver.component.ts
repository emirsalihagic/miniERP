import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PricingService, ResolvePricingDto, ResolvedPrice } from '../../services/pricing.service';
import { ProductsService, Product } from '../../../products/services/products.service';
import { ClientsService } from '../../../clients/services/clients.service';

@Component({
  selector: 'app-pricing-resolver',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="pricing-resolver-container">
      <div class="header">
        <h1>Price Resolver</h1>
        <p>Test how pricing rules are resolved for specific products and clients</p>
      </div>

      <div class="resolver-form">
        <form [formGroup]="resolverForm" (ngSubmit)="resolvePrice()">
          <div class="form-row">
            <div class="form-group">
              <label for="productId">Product *</label>
              <select 
                id="productId" 
                formControlName="productId" 
                class="form-select"
                [class.error]="resolverForm.get('productId')?.invalid && resolverForm.get('productId')?.touched">
                <option value="">Select a product</option>
                <option *ngFor="let product of products" [value]="product.id">
                  {{ product.name }} ({{ product.sku }})
                </option>
              </select>
              <div *ngIf="resolverForm.get('productId')?.invalid && resolverForm.get('productId')?.touched" class="error-message">
                Product is required
              </div>
            </div>

            <div class="form-group">
              <label for="clientId">Client (Optional)</label>
              <select 
                id="clientId" 
                formControlName="clientId" 
                class="form-select">
                <option value="">No specific client (base pricing)</option>
                <option *ngFor="let client of clients" [value]="client.id">
                  {{ client.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="resolverForm.invalid || loading">
              <span *ngIf="loading" class="spinner"></span>
              {{ loading ? 'Resolving...' : 'Resolve Price' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Results -->
      <div *ngIf="resolvedPrice" class="results">
        <h2>Resolved Price</h2>
        <div class="result-card">
          <div class="result-grid">
            <div class="result-item">
              <label>Price</label>
              <span class="price">{{ resolvedPrice.price | currency:resolvedPrice.currency:'symbol':'1.2-2' }}</span>
            </div>
            <div class="result-item">
              <label>Currency</label>
              <span class="currency">{{ resolvedPrice.currency }}</span>
            </div>
            <div class="result-item">
              <label>Tax Rate</label>
              <span class="tax-rate">{{ resolvedPrice.taxRate }}%</span>
            </div>
            <div class="result-item">
              <label>Discount</label>
              <span class="discount" [class.has-discount]="resolvedPrice.discountPercent > 0">
                {{ resolvedPrice.discountPercent }}%
              </span>
            </div>
            <div class="result-item">
              <label>Source</label>
              <span class="source" [class]="getSourceClass(resolvedPrice.source)">
                {{ getSourceLabel(resolvedPrice.source) }}
              </span>
            </div>
            <div class="result-item">
              <label>Effective From</label>
              <span>{{ resolvedPrice.effectiveFrom | date:'medium' }}</span>
            </div>
            <div class="result-item" *ngIf="resolvedPrice.effectiveTo">
              <label>Effective To</label>
              <span>{{ resolvedPrice.effectiveTo | date:'medium' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .pricing-resolver-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .header p {
      margin: 0;
      color: #666;
    }

    .resolver-form {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #555;
    }

    .form-select {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    .form-select.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      justify-content: center;
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

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .results {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 2rem;
    }

    .results h2 {
      margin: 0 0 1.5rem 0;
      color: #333;
      text-align: center;
    }

    .result-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
    }

    .result-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .result-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .result-item label {
      font-weight: 500;
      color: #666;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .result-item span {
      color: #333;
      font-size: 1rem;
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

    .source {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      display: inline-block;
      width: fit-content;
    }

    .source.base {
      background: #e9ecef;
      color: #495057;
    }

    .source.client-override {
      background: #d4edda;
      color: #155724;
    }

    .source.supplier-override {
      background: #d1ecf1;
      color: #0c5460;
    }

    .error-banner {
      background: #f8d7da;
      color: #721c24;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
      border: 1px solid #f5c6cb;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .result-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PricingResolverComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pricingService = inject(PricingService);
  private productsService = inject(ProductsService);
  private clientsService = inject(ClientsService);

  resolverForm!: FormGroup;
  products: Product[] = [];
  clients: any[] = [];
  resolvedPrice: ResolvedPrice | null = null;
  loading = false;
  errorMessage = '';

  ngOnInit() {
    this.initializeForm();
    this.loadData();
  }

  initializeForm() {
    this.resolverForm = this.fb.group({
      productId: ['', Validators.required],
      clientId: ['']
    });
  }

  loadData() {
    // Load products
    this.productsService.getAll().subscribe({
      next: (response: any) => {
        this.products = response.data || response;
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
      }
    });

    // Load clients
    this.clientsService.getClients().subscribe({
      next: (response: any) => {
        this.clients = response.items || response.data || response;
      },
      error: (error: any) => {
        console.error('Error loading clients:', error);
      }
    });
  }

  resolvePrice() {
    if (this.resolverForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.resolvedPrice = null;

    const formData = this.resolverForm.value;
    const request: ResolvePricingDto = {
      productId: formData.productId,
      clientId: formData.clientId || undefined
    };

    this.pricingService.resolvePricing(request).subscribe({
      next: (resolvedPrice: ResolvedPrice) => {
        this.resolvedPrice = resolvedPrice;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error resolving price:', error);
        this.errorMessage = 'Failed to resolve price';
        this.loading = false;
      }
    });
  }

  getSourceClass(source: string): string {
    switch (source) {
      case 'BASE':
        return 'base';
      case 'CLIENT_OVERRIDE':
        return 'client-override';
      case 'SUPPLIER_OVERRIDE':
        return 'supplier-override';
      default:
        return 'base';
    }
  }

  getSourceLabel(source: string): string {
    switch (source) {
      case 'BASE':
        return 'Base Pricing';
      case 'CLIENT_OVERRIDE':
        return 'Client Override';
      case 'SUPPLIER_OVERRIDE':
        return 'Supplier Override';
      default:
        return 'Base Pricing';
    }
  }
}
