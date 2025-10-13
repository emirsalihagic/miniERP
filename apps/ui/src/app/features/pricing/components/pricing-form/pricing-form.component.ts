import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PricingService, CreatePricingDto, UpdatePricingDto, Pricing } from '../../services/pricing.service';
import { ProductsService, Product } from '../../../products/services/products.service';
import { ClientsService } from '../../../clients/services/clients.service';
import { SuppliersService } from '../../../products/services/suppliers.service';
import { NavigationService } from '../../../../core/services/navigation.service';

@Component({
  selector: 'app-pricing-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="pricing-form-container">
      <div class="header">
        <h1>{{ isEdit ? 'Edit Pricing Rule' : 'Create New Pricing Rule' }}</h1>
        <button type="button" (click)="goBack()" class="btn btn-outline">
          ← Back
        </button>
      </div>

      <form [formGroup]="pricingForm" (ngSubmit)="onSubmit()" class="pricing-form">
        <div class="form-section">
          <h2>Product Selection</h2>
          
          <div class="form-group">
            <label for="productId">Product *</label>
            <select 
              id="productId" 
              formControlName="productId" 
              class="form-select"
              [class.error]="pricingForm.get('productId')?.invalid && pricingForm.get('productId')?.touched">
              <option value="">Select a product</option>
              <option *ngFor="let product of products" [value]="product.id">
                {{ product.name }} ({{ product.sku }})
              </option>
            </select>
            <div *ngIf="pricingForm.get('productId')?.invalid && pricingForm.get('productId')?.touched" class="error-message">
              Product is required
            </div>
          </div>
        </div>

        <div class="form-section">
          <h2>Pricing Scope</h2>
          
          <div class="form-group">
            <label for="scopeType">Scope Type *</label>
            <select 
              id="scopeType" 
              formControlName="scopeType" 
              class="form-select"
              (change)="onScopeTypeChange()">
              <option value="base">Base Pricing (All Clients)</option>
              <option value="client">Client-Specific Override</option>
              <option value="supplier">Supplier-Specific Override</option>
            </select>
          </div>

          <div class="form-group" *ngIf="pricingForm.get('scopeType')?.value === 'client'">
            <label for="clientId">Client *</label>
            <select 
              id="clientId" 
              formControlName="clientId" 
              class="form-select"
              [class.error]="pricingForm.get('clientId')?.invalid && pricingForm.get('clientId')?.touched">
              <option value="">Select a client</option>
              <option *ngFor="let client of clients" [value]="client.id">
                {{ client.name }}
              </option>
            </select>
            <div *ngIf="pricingForm.get('clientId')?.invalid && pricingForm.get('clientId')?.touched" class="error-message">
              Client is required for client-specific pricing
            </div>
          </div>

          <div class="form-group" *ngIf="pricingForm.get('scopeType')?.value === 'supplier'">
            <label for="supplierId">Supplier *</label>
            <select 
              id="supplierId" 
              formControlName="supplierId" 
              class="form-select"
              [class.error]="pricingForm.get('supplierId')?.invalid && pricingForm.get('supplierId')?.touched">
              <option value="">Select a supplier</option>
              <option *ngFor="let supplier of suppliers" [value]="supplier.id">
                {{ supplier.name }}
              </option>
            </select>
            <div *ngIf="pricingForm.get('supplierId')?.invalid && pricingForm.get('supplierId')?.touched" class="error-message">
              Supplier is required for supplier-specific pricing
            </div>
          </div>
        </div>

        <div class="form-section">
          <h2>Pricing Details</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="price">Unit Price (excl. VAT) *</label>
              <input 
                type="number" 
                id="price" 
                formControlName="price" 
                class="form-input"
                min="0"
                step="0.01"
                [class.error]="pricingForm.get('price')?.invalid && pricingForm.get('price')?.touched">
              <div *ngIf="pricingForm.get('price')?.invalid && pricingForm.get('price')?.touched" class="error-message">
                Price must be greater than 0
              </div>
            </div>

            <div class="form-group">
              <label for="currency">Currency *</label>
              <select 
                id="currency" 
                formControlName="currency" 
                class="form-select">
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="BAM">BAM</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="taxRate">Tax Rate (%)</label>
              <input 
                type="number" 
                id="taxRate" 
                formControlName="taxRate" 
                class="form-input"
                min="0"
                max="100"
                step="0.01">
            </div>

            <div class="form-group">
              <label for="discountPercent">Discount (%)</label>
              <input 
                type="number" 
                id="discountPercent" 
                formControlName="discountPercent" 
                class="form-input"
                min="0"
                max="100"
                step="0.01">
            </div>
          </div>
        </div>

        <div class="form-section">
          <h2>Effective Period</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="effectiveFrom">Effective From *</label>
              <input 
                type="datetime-local" 
                id="effectiveFrom" 
                formControlName="effectiveFrom" 
                class="form-input"
                [class.error]="pricingForm.get('effectiveFrom')?.invalid && pricingForm.get('effectiveFrom')?.touched">
              <div *ngIf="pricingForm.get('effectiveFrom')?.invalid && pricingForm.get('effectiveFrom')?.touched" class="error-message">
                Effective from date is required
              </div>
            </div>

            <div class="form-group">
              <label for="effectiveTo">Effective To (Optional)</label>
              <input 
                type="datetime-local" 
                id="effectiveTo" 
                formControlName="effectiveTo" 
                class="form-input">
              <small class="form-help">Leave empty for indefinite pricing</small>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" (click)="goBack()" class="btn btn-outline">
            Cancel
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="pricingForm.invalid || loading">
            <span *ngIf="loading" class="spinner"></span>
            {{ isEdit ? 'Update Pricing Rule' : 'Create Pricing Rule' }}
          </button>
        </div>
      </form>

      <div *ngIf="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .pricing-form-container {
      padding: 2rem;
      max-width: 800px;
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

    .pricing-form {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 2rem;
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .form-section h2 {
      margin: 0 0 1.5rem 0;
      color: #555;
      font-size: 1.25rem;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 0.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
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

    .form-input,
    .form-select {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-input:focus,
    .form-select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    .form-input.error,
    .form-select.error {
      border-color: #dc3545;
    }

    .form-help {
      color: #666;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1rem;
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
      
      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class PricingFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private pricingService = inject(PricingService);
  private productsService = inject(ProductsService);
  private clientsService = inject(ClientsService);
  private suppliersService = inject(SuppliersService);
  private navigationService = inject(NavigationService);

  pricingForm!: FormGroup;
  products: Product[] = [];
  clients: any[] = [];
  suppliers: any[] = [];
  loading = false;
  errorMessage = '';
  isEdit = false;
  pricingId?: string;

  ngOnInit() {
    this.initializeForm();
    this.loadData();
    
    // Check if we're editing an existing pricing rule
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.pricingId = params['id'];
        this.loadPricing();
      }
    });
  }

  initializeForm() {
    this.pricingForm = this.fb.group({
      productId: ['', Validators.required],
      scopeType: ['base', Validators.required],
      clientId: [''],
      supplierId: [''],
      price: [0, [Validators.required, Validators.min(0.01)]],
      currency: ['EUR', Validators.required],
      taxRate: [0, [Validators.min(0), Validators.max(100)]],
      discountPercent: [0, [Validators.min(0), Validators.max(100)]],
      effectiveFrom: ['', Validators.required],
      effectiveTo: ['']
    });

    // Set default effective from to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.pricingForm.patchValue({
      effectiveFrom: now.toISOString().slice(0, 16)
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

    // Load suppliers
    this.suppliersService.getAll().subscribe({
      next: (suppliers: any) => {
        this.suppliers = suppliers;
      },
      error: (error: any) => {
        console.error('Error loading suppliers:', error);
      }
    });
  }

  loadPricing() {
    if (!this.pricingId) return;
    
    this.loading = true;
    this.pricingService.getById(this.pricingId).subscribe({
      next: (pricing: Pricing) => {
        const scopeType = pricing.clientId ? 'client' : pricing.supplierId ? 'supplier' : 'base';
        
        this.pricingForm.patchValue({
          productId: pricing.productId,
          scopeType: scopeType,
          clientId: pricing.clientId || '',
          supplierId: pricing.supplierId || '',
          price: pricing.price,
          currency: pricing.currency,
          taxRate: pricing.taxRate,
          discountPercent: pricing.discountPercent,
          effectiveFrom: pricing.effectiveFrom ? new Date(pricing.effectiveFrom).toISOString().slice(0, 16) : '',
          effectiveTo: pricing.effectiveTo ? new Date(pricing.effectiveTo).toISOString().slice(0, 16) : ''
        });
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading pricing:', error);
        this.errorMessage = 'Failed to load pricing rule';
        this.loading = false;
      }
    });
  }

  onScopeTypeChange() {
    const scopeType = this.pricingForm.get('scopeType')?.value;
    
    // Clear client and supplier selections
    this.pricingForm.patchValue({
      clientId: '',
      supplierId: ''
    });

    // Update validators based on scope type
    if (scopeType === 'client') {
      this.pricingForm.get('clientId')?.setValidators([Validators.required]);
      this.pricingForm.get('supplierId')?.clearValidators();
    } else if (scopeType === 'supplier') {
      this.pricingForm.get('supplierId')?.setValidators([Validators.required]);
      this.pricingForm.get('clientId')?.clearValidators();
    } else {
      this.pricingForm.get('clientId')?.clearValidators();
      this.pricingForm.get('supplierId')?.clearValidators();
    }

    this.pricingForm.get('clientId')?.updateValueAndValidity();
    this.pricingForm.get('supplierId')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.pricingForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formData = this.pricingForm.value;
    
    // Prepare data based on scope type
    const pricingData: CreatePricingDto | UpdatePricingDto = {
      productId: formData.productId,
      price: formData.price,
      currency: formData.currency,
      taxRate: formData.taxRate || 0,
      discountPercent: formData.discountPercent || 0,
      effectiveFrom: formData.effectiveFrom ? new Date(formData.effectiveFrom).toISOString() : undefined,
      effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo).toISOString() : undefined
    };

    // Add client or supplier ID based on scope type
    if (formData.scopeType === 'client' && formData.clientId) {
      (pricingData as CreatePricingDto).clientId = formData.clientId;
    } else if (formData.scopeType === 'supplier' && formData.supplierId) {
      (pricingData as CreatePricingDto).supplierId = formData.supplierId;
    }

    if (this.isEdit && this.pricingId) {
      this.pricingService.update(this.pricingId, pricingData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/pricing']);
        },
        error: (error: any) => {
          console.error('Error updating pricing:', error);
          this.errorMessage = 'Failed to update pricing rule';
          this.loading = false;
        }
      });
    } else {
      this.pricingService.create(pricingData as CreatePricingDto).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/pricing']);
        },
        error: (error: any) => {
          console.error('Error creating pricing:', error);
          this.errorMessage = 'Failed to create pricing rule';
          this.loading = false;
        }
      });
    }
  }

  markFormGroupTouched() {
    Object.keys(this.pricingForm.controls).forEach(key => {
      const control = this.pricingForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack() {
    this.navigationService.navigateToListPage();
  }
}
