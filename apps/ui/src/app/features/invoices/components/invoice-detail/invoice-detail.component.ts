import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InvoicesService, Invoice, AddInvoiceItemDto } from '../../services/invoices.service';
import { ProductsService, Product } from '../../../products/services/products.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../../shared/interfaces/user.interface';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="invoice-detail-container" *ngIf="invoice; else loading">
      <div class="header">
        <div class="header-left">
          <button type="button" (click)="goBack()" class="btn btn-outline">
            ← Back to Invoices
          </button>
          <h1>{{ invoice.invoiceNumber }}</h1>
        </div>
        <div class="header-right">
          <span class="status-badge" [ngClass]="'status-' + invoice.status.toLowerCase()">
            {{ invoice.status }}
          </span>
          <button 
            *ngIf="canIssue" 
            (click)="issueInvoice()"
            class="btn btn-success"
            [disabled]="isLoading">
            Issue Invoice
          </button>
          <button 
            *ngIf="canMarkAsPaid" 
            (click)="markAsPaid()"
            class="btn btn-success"
            [disabled]="isLoading">
            Mark as Paid
          </button>
        </div>
      </div>

      <div class="invoice-content">
        <div class="invoice-info">
          <div class="info-section">
            <h2>Invoice Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <label>Client:</label>
                <span>{{ invoice.client?.name || 'Unknown Client' }}</span>
              </div>
              <div class="info-item">
                <label>Due Date:</label>
                <span>{{ invoice.dueDate | date:'mediumDate' }}</span>
              </div>
              <div class="info-item">
                <label>Created:</label>
                <span>{{ invoice.createdAt | date:'medium' }}</span>
              </div>
              <div class="info-item" *ngIf="invoice.issuedAt">
                <label>Issued:</label>
                <span>{{ invoice.issuedAt | date:'medium' }}</span>
              </div>
            </div>
            <div class="info-item" *ngIf="invoice.notes">
              <label>Notes:</label>
              <p class="notes">{{ invoice.notes }}</p>
            </div>
          </div>
        </div>

        <div class="invoice-items">
          <div class="items-header">
            <h2>Invoice Items</h2>
            <button 
              *ngIf="canEdit && invoice.status === 'DRAFT'" 
              (click)="showAddItemForm = !showAddItemForm"
              class="btn btn-primary btn-sm">
              + Add Item
            </button>
          </div>

          <!-- Add Item Form -->
          <div *ngIf="showAddItemForm && canEdit && invoice.status === 'DRAFT'" class="add-item-form">
            <form [formGroup]="addItemForm" (ngSubmit)="addItem()">
              <div class="form-row">
                <div class="form-group">
                  <label for="productId">Product *</label>
                  <select 
                    id="productId" 
                    formControlName="productId" 
                    class="form-select">
                    <option value="">Select a product</option>
                    <option *ngFor="let product of products" [value]="product.id">
                      {{ product.name }} ({{ product.sku }})
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="quantity">Quantity *</label>
                  <div class="quantity-input-group">
                    <input 
                      type="number" 
                      id="quantity" 
                      formControlName="quantity" 
                      class="form-input"
                      min="1"
                      step="1">
                    <span class="unit-display" *ngIf="getSelectedProductUnit()">
                      {{ getSelectedProductUnit() }}
                    </span>
                  </div>
                </div>
                <div class="form-group">
                  <label for="itemDiscount">Item Discount (%)</label>
                  <input 
                    type="number" 
                    id="itemDiscount" 
                    formControlName="discountPercent" 
                    class="form-input"
                    min="0"
                    max="100"
                    step="0.01">
                </div>
              </div>
              <div class="form-actions">
                <button type="button" (click)="cancelAddItem()" class="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary btn-sm"
                  [disabled]="addItemForm.invalid || isLoading">
                  {{ isLoading ? 'Adding...' : 'Add Item' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Items Table -->
          <div class="items-table" *ngIf="invoice.items.length > 0; else noItems">
            <table class="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Unit Price</th>
                  <th>Discount</th>
                  <th>Tax</th>
                  <th>Total</th>
                  <th *ngIf="canEdit && invoice.status === 'DRAFT'">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of invoice.items">
                  <td>{{ item.productName }}</td>
                  <td>{{ item.sku }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ getItemUnit(item) }}</td>
                  <td>{{ item.unitPrice | currency:'EUR':'symbol':'1.2-2' }}</td>
                  <td>{{ item.discountPercent }}%</td>
                  <td>{{ item.taxRate }}%</td>
                  <td class="amount">{{ item.lineTotal | currency:'EUR':'symbol':'1.2-2' }}</td>
                  <td *ngIf="canEdit && invoice.status === 'DRAFT'" class="actions">
                    <button 
                      (click)="removeItem(item.id!)"
                      class="btn btn-sm btn-danger"
                      [disabled]="loading">
                      Remove
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <ng-template #noItems>
            <div class="empty-items">
              <p>No items added to this invoice yet.</p>
              <button 
                *ngIf="canEdit && invoice.status === 'DRAFT'" 
                (click)="showAddItemForm = true"
                class="btn btn-primary">
                Add First Item
              </button>
            </div>
          </ng-template>
        </div>

        <!-- Invoice Discount Controls -->
        <div class="invoice-discount-section" *ngIf="canEdit && invoice.status === 'DRAFT' && invoice.items.length > 0">
          <div class="discount-header">
            <h3>Invoice Discount</h3>
            <button 
              type="button" 
              (click)="showDiscountFormToggle()"
              class="btn btn-outline btn-sm">
              {{ showDiscountForm ? 'Cancel' : 'Edit Discount' }}
            </button>
          </div>
          
          <div class="current-discount" *ngIf="!showDiscountForm">
            <span>Current discount: {{ invoice.discountPercent || 0 }}%</span>
            <span class="discount-amount">-{{ (invoice.subtotal * (invoice.discountPercent || 0) / 100) | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>

          <form *ngIf="showDiscountForm" [formGroup]="discountForm" (ngSubmit)="updateDiscount()">
            <div class="form-group">
              <label for="invoiceDiscount">Invoice Discount (%)</label>
              <input 
                type="number" 
                id="invoiceDiscount" 
                formControlName="discountPercent" 
                class="form-input"
                min="0"
                max="100"
                step="0.01">
            </div>
            <div class="form-actions">
              <button type="button" (click)="cancelDiscountUpdate()" class="btn btn-outline btn-sm">
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary btn-sm"
                [disabled]="discountForm.invalid || isLoading">
                {{ isLoading ? 'Updating...' : 'Update Discount' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Read-only Invoice Discount Display for non-EMPLOYEE users -->
        <div class="invoice-discount-section" *ngIf="!canEdit && invoice.items.length > 0">
          <div class="discount-header">
            <h3>Invoice Discount</h3>
          </div>
          <div class="current-discount">
            <span>Current discount: {{ invoice.discountPercent || 0 }}%</span>
            <span class="discount-amount">-{{ (invoice.subtotal * (invoice.discountPercent || 0) / 100) | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>
        </div>

        <!-- Invoice Totals -->
        <div class="invoice-totals" *ngIf="invoice.items.length > 0">
          <div class="totals-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>{{ invoice.subtotal | currency:'EUR':'symbol':'1.2-2' }}</span>
            </div>
            <div class="total-row">
              <span>Discount:</span>
              <span>-{{ invoice.discountTotal | currency:'EUR':'symbol':'1.2-2' }}</span>
            </div>
            <div class="total-row">
              <span>Tax:</span>
              <span>{{ invoice.taxTotal | currency:'EUR':'symbol':'1.2-2' }}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total:</span>
              <span>{{ invoice.grandTotal | currency:'EUR':'symbol':'1.2-2' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>
    </div>

    <ng-template #loading>
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading invoice...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .invoice-detail-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-draft {
      background: #fff3cd;
      color: #856404;
    }

    .status-issued {
      background: #d1ecf1;
      color: #0c5460;
    }

    .status-paid {
      background: #d4edda;
      color: #155724;
    }

    .status-cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .invoice-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .invoice-info {
      padding: 2rem;
      border-bottom: 1px solid #eee;
    }

    .info-section h2 {
      margin: 0 0 1.5rem 0;
      color: #555;
      font-size: 1.25rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
    }

    .info-item label {
      font-weight: 500;
      color: #666;
      margin-bottom: 0.25rem;
    }

    .info-item span {
      color: #333;
    }

    .notes {
      margin: 0;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
      color: #555;
    }

    .invoice-items {
      padding: 2rem;
    }

    .items-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .items-header h2 {
      margin: 0;
      color: #555;
      font-size: 1.25rem;
    }

    .add-item-form {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
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
    }

    .form-input:focus,
    .form-select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    .quantity-input-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .quantity-input-group .form-input {
      flex: 1;
    }

        .unit-display {
          background: #f0f0f0;
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          color: #666;
          border: 1px solid #ddd;
          min-width: 60px;
          text-align: center;
          white-space: nowrap;
        }

        .invoice-discount-section {
          margin: 1.5rem 0;
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #f9f9f9;
        }

        .discount-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .discount-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: #333;
        }

        .current-discount {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: white;
          border-radius: 4px;
          border: 1px solid #ddd;
        }

        .discount-amount {
          font-weight: 600;
          color: #e74c3c;
        }

    .form-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .items-table {
      overflow-x: auto;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    .table th,
    .table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    .table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #555;
    }

    .amount {
      font-weight: 600;
      color: #28a745;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .empty-items {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .invoice-totals {
      padding: 2rem;
      background: #f8f9fa;
      border-top: 1px solid #eee;
    }

    .totals-section {
      max-width: 400px;
      margin-left: auto;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #dee2e6;
    }

    .total-row:last-child {
      border-bottom: none;
    }

    .grand-total {
      font-weight: 600;
      font-size: 1.125rem;
      color: #333;
      border-top: 2px solid #dee2e6;
      margin-top: 0.5rem;
      padding-top: 1rem;
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

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #1e7e34;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #c82333;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading {
      text-align: center;
      padding: 4rem 2rem;
    }

    .spinner {
      width: 2rem;
      height: 2rem;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
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
      
      .header {
        flex-direction: column;
        align-items: stretch;
      }
      
      .header-left,
      .header-right {
        justify-content: center;
      }
    }
  `]
})
export class InvoiceDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private invoicesService = inject(InvoicesService);
  private productsService = inject(ProductsService);
  private navigationService = inject(NavigationService);
  private authService = inject(AuthService);

  invoice: Invoice | null = null;
  products: any[] = [];
  loading = false;
  errorMessage = '';
  showAddItemForm = false;
  showDiscountForm = false;

  addItemForm!: FormGroup;
  discountForm!: FormGroup;

  // Getter to ensure loading is always a boolean
  get isLoading(): boolean {
    return Boolean(this.loading);
  }

  // Getter to check if user can edit invoices
  get canEdit(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === UserRole.EMPLOYEE;
  }

  // Getter to check if user can issue invoices
  get canIssue(): boolean {
    return this.canEdit && this.canIssueInvoice();
  }

  // Getter to check if user can mark invoices as paid
  get canMarkAsPaid(): boolean {
    return this.canEdit && this.invoice?.status === 'ISSUED';
  }

  ngOnInit() {
    this.initializeAddItemForm();
    this.initializeDiscountForm();
    this.loadProducts();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadInvoice(params['id']);
      }
    });
  }

  initializeAddItemForm() {
    this.addItemForm = this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      discountPercent: [0, [Validators.min(0), Validators.max(100)]]
    });
  }

  initializeDiscountForm() {
    this.discountForm = this.fb.group({
      discountPercent: [0, [Validators.min(0), Validators.max(100)]]
    });
  }

  loadInvoice(id: string) {
    this.loading = true;
    this.invoicesService.getById(id).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading invoice:', error);
        this.errorMessage = 'Failed to load invoice';
        this.loading = false;
      }
    });
  }

  loadProducts() {
    // Filter for active and sellable products only
    const filters = {
      status: 'ACTIVE' // Assuming 'ACTIVE' is the status for active products
    };
    
    this.productsService.getAll(filters).subscribe({
      next: (response: { data: Product[]; meta: any }) => {
        // Additional client-side filtering for forbidSale
        this.products = response.data.filter(product => !product.forbidSale);
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
      }
    });
  }

  addItem() {
    if (this.addItemForm.invalid || !this.invoice) return;

    this.loading = true;
    const formData = this.addItemForm.value;
    const itemData: AddInvoiceItemDto = {
      productId: formData.productId,
      quantity: formData.quantity,
      discountPercent: formData.discountPercent || 0
    };

    this.invoicesService.addItem(this.invoice.id, itemData).subscribe({
      next: () => {
        this.cancelAddItem();
        this.loadInvoice(this.invoice!.id); // Reload invoice to get updated items
        // Don't set loading = false here, let loadInvoice handle it
      },
      error: (error) => {
        console.error('Error adding item:', error);
        this.errorMessage = 'Failed to add item';
        this.loading = false;
      }
    });
  }

  removeItem(itemId: string) {
    if (!confirm('Are you sure you want to remove this item?')) return;
    
    // Note: The API doesn't have a remove item endpoint yet
    // This would need to be implemented in the backend
    console.log('Remove item:', itemId);
  }

  issueInvoice() {
    if (!this.invoice) return;
    
    this.loading = true;
    this.invoicesService.issue(this.invoice.id).subscribe({
      next: () => {
        this.loadInvoice(this.invoice!.id); // Reload to get updated status
        // Don't set loading = false here, let loadInvoice handle it
      },
      error: (error) => {
        console.error('Error issuing invoice:', error);
        this.errorMessage = 'Failed to issue invoice';
        this.loading = false;
      }
    });
  }

  markAsPaid() {
    if (!this.invoice) return;
    
    this.loading = true;
    this.invoicesService.markAsPaid(this.invoice.id).subscribe({
      next: () => {
        this.loadInvoice(this.invoice!.id); // Reload to get updated status
        // Don't set loading = false here, let loadInvoice handle it
      },
      error: (error) => {
        console.error('Error marking invoice as paid:', error);
        this.errorMessage = 'Failed to mark invoice as paid';
        this.loading = false;
      }
    });
  }

  canIssueInvoice(): boolean {
    if (!this.invoice) return false;
    
    // Check if invoice has items
    if (!this.invoice.items || this.invoice.items.length === 0) {
      return false;
    }
    
    // Check if invoice is in DRAFT status
    if (this.invoice.status !== 'DRAFT') {
      return false;
    }
    
    return true;
  }

  cancelAddItem() {
    this.showAddItemForm = false;
    this.addItemForm.reset();
    this.addItemForm.patchValue({
      quantity: 1,
      discountPercent: 0
    });
  }

  showDiscountFormToggle() {
    this.showDiscountForm = !this.showDiscountForm;
    if (this.showDiscountForm && this.invoice) {
      this.discountForm.patchValue({
        discountPercent: this.invoice.discountPercent || 0
      });
    }
  }

  updateDiscount() {
    if (this.discountForm.invalid || !this.invoice) return;

    this.loading = true;
    const discountData = {
      discountPercent: this.discountForm.value.discountPercent || 0
    };

    this.invoicesService.updateDiscount(this.invoice.id, discountData).subscribe({
      next: () => {
        this.loadInvoice(this.invoice!.id); // Reload invoice to get updated totals
        this.showDiscountForm = false;
        // Don't set loading = false here, let loadInvoice handle it
      },
      error: (error) => {
        console.error('Error updating discount:', error);
        this.errorMessage = 'Failed to update discount';
        this.loading = false;
      }
    });
  }

  cancelDiscountUpdate() {
    this.showDiscountForm = false;
    this.discountForm.reset();
    this.discountForm.patchValue({
      discountPercent: 0
    });
  }

  getSelectedProductUnit(): string | null {
    const selectedProductId = this.addItemForm.get('productId')?.value;
    if (!selectedProductId) return null;
    
    const product = this.products.find(p => p.id === selectedProductId);
    return product?.unit?.name || product?.unitString || null;
  }

  getItemUnit(item: any): string {
    // Try to find the product in our loaded products to get unit info
    const product = this.products.find(p => p.id === item.productId);
    if (product) {
      return product.unit?.name || product.unitString || 'pcs';
    }
    
    // Fallback to a default unit if product not found
    return 'pcs';
  }

  goBack() {
    this.navigationService.navigateToListPage();
  }
}
