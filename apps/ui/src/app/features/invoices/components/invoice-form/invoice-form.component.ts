import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InvoicesService, CreateInvoiceDto, Invoice } from '../../services/invoices.service';
import { ClientsService } from '../../../clients/services/clients.service';
import { NavigationService } from '../../../../core/services/navigation.service';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="invoice-form-container">
      <div class="header">
        <h1>{{ isEdit ? 'Edit Invoice' : 'Create New Invoice' }}</h1>
        <button type="button" (click)="goBack()" class="btn btn-outline">
          ← Back
        </button>
      </div>

      <form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()" class="invoice-form">
        <div class="form-section">
          <h2>Invoice Details</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="clientId">Client *</label>
              <select 
                id="clientId" 
                formControlName="clientId" 
                class="form-select"
                [class.error]="invoiceForm.get('clientId')?.invalid && invoiceForm.get('clientId')?.touched">
                <option value="">Select a client</option>
                <option *ngFor="let client of clients" [value]="client.id">
                  {{ client.name }}
                </option>
              </select>
              <div class="debug-info" style="font-size: 12px; color: #666; margin-top: 5px;">
                Debug: {{ clients.length }} clients loaded
              </div>
              <div *ngIf="invoiceForm.get('clientId')?.invalid && invoiceForm.get('clientId')?.touched" class="error-message">
                Client is required
              </div>
            </div>

            <div class="form-group">
              <label for="dueDate">Due Date</label>
              <input 
                type="date" 
                id="dueDate" 
                formControlName="dueDate" 
                class="form-input"
                [class.error]="invoiceForm.get('dueDate')?.invalid && invoiceForm.get('dueDate')?.touched">
            </div>
          </div>

          <div class="form-group">
            <label for="notes">Notes</label>
            <textarea 
              id="notes" 
              formControlName="notes" 
              class="form-textarea"
              rows="3"
              placeholder="Additional notes or comments..."></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" (click)="goBack()" class="btn btn-outline">
            Cancel
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="invoiceForm.invalid || loading">
            <span *ngIf="loading" class="spinner"></span>
            {{ isEdit ? 'Update Invoice' : 'Create Invoice' }}
          </button>
        </div>
      </form>

      <div *ngIf="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .invoice-form-container {
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

    .invoice-form {
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
    .form-select,
    .form-textarea {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    .form-input.error,
    .form-select.error {
      border-color: #dc3545;
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
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
export class InvoiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private invoicesService = inject(InvoicesService);
  private clientsService = inject(ClientsService);
  private navigationService = inject(NavigationService);

  invoiceForm!: FormGroup;
  clients: any[] = [];
  loading = false;
  errorMessage = '';
  isEdit = false;
  invoiceId?: string;

  ngOnInit() {
    this.initializeForm();
    this.loadClients();
    
    // Check if we're editing an existing invoice
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.invoiceId = params['id'];
        this.loadInvoice();
      }
    });
  }

  initializeForm() {
    this.invoiceForm = this.fb.group({
      clientId: ['', Validators.required],
      dueDate: [''],
      notes: ['']
    });
  }

  loadClients() {
    console.log('Loading clients...');
    this.clientsService.getClients().subscribe({
      next: (response: any) => {
        console.log('Clients response:', response);
        this.clients = response.items || response.data || response;
        console.log('Clients loaded:', this.clients);
        console.log('Clients count:', this.clients.length);
      },
      error: (error: any) => {
        console.error('Error loading clients:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        this.errorMessage = `Failed to load clients: ${error.message || 'Unknown error'}`;
      }
    });
  }

  loadInvoice() {
    if (!this.invoiceId) return;
    
    this.loading = true;
    this.invoicesService.getById(this.invoiceId).subscribe({
      next: (invoice) => {
        this.invoiceForm.patchValue({
          clientId: invoice.clientId,
          dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
          notes: invoice.notes || ''
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading invoice:', error);
        this.errorMessage = 'Failed to load invoice';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.invoiceForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formData = this.invoiceForm.value;
    const invoiceData: CreateInvoiceDto = {
      clientId: formData.clientId,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      notes: formData.notes || undefined
    };

    if (this.isEdit && this.invoiceId) {
      // For now, we'll just redirect to the invoice detail page
      // In a real app, you'd implement an update method
      this.router.navigate(['/invoices', this.invoiceId]);
    } else {
      this.invoicesService.create(invoiceData).subscribe({
        next: (invoice) => {
          this.loading = false;
          this.router.navigate(['/invoices', invoice.id]);
        },
        error: (error) => {
          console.error('Error creating invoice:', error);
          this.errorMessage = 'Failed to create invoice';
          this.loading = false;
        }
      });
    }
  }

  markFormGroupTouched() {
    Object.keys(this.invoiceForm.controls).forEach(key => {
      const control = this.invoiceForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack() {
    this.navigationService.navigateToListPage();
  }
}
