import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { InvoicesService, Invoice } from '../../services/invoices.service';
import { ClientsService } from '../../../clients/services/clients.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../../shared/interfaces/user.interface';

@Component({
  selector: 'app-invoices-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NzTableModule, NzButtonModule, NzIconModule, NzSelectModule, NzTagModule, NzSpinModule, NzEmptyModule, NzAlertModule],
  template: `
    <div class="invoices-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1>Invoices Management</h1>
            <p>Track and manage your invoices, quotes, and payments</p>
          </div>
          <div class="header-actions">
            <button 
              *ngIf="canCreateInvoice" 
              class="btn btn-primary"
              routerLink="/invoices/new"
            >
              <span nz-icon nzType="plus"></span>
              Create Invoice
            </button>
          </div>
        </div>
      </div>

      <!-- Filters Card -->
      <div class="filters-card" *ngIf="clients.length > 0">
        <div class="card-header">
          <h3>
            <span nz-icon nzType="filter"></span>
            Filters
          </h3>
        </div>
        <div class="card-content">
          <div class="filter-group">
            <label class="filter-label">Filter by Client</label>
            <nz-select
              [(ngModel)]="selectedClientId"
              (ngModelChange)="filterByClient()"
              nzPlaceHolder="All Clients"
              nzAllowClear
              nzSize="large"
              class="filter-select"
            >
              <nz-option
                *ngFor="let client of clients"
                [nzValue]="client.id"
                [nzLabel]="client.name">
              </nz-option>
            </nz-select>
          </div>
        </div>
      </div>

      <!-- Results Summary -->
      <div class="results-summary" *ngIf="invoices.length > 0">
        <div class="summary-info">
          <span class="results-count">{{ invoices.length }} invoice{{ invoices.length !== 1 ? 's' : '' }} found</span>
          <div class="status-summary">
            <span class="status-item quote" *ngIf="getStatusCount('QUOTE') > 0">
              {{ getStatusCount('QUOTE') }} Quote{{ getStatusCount('QUOTE') !== 1 ? 's' : '' }}
            </span>
            <span class="status-item issued" *ngIf="getStatusCount('ISSUED') > 0">
              {{ getStatusCount('ISSUED') }} Issued
            </span>
            <span class="status-item paid" *ngIf="getStatusCount('PAID') > 0">
              {{ getStatusCount('PAID') }} Paid
            </span>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="table-card">
        <div class="card-content">
          <nz-spin [nzSpinning]="loading">
            <div class="table-container">
              <table class="invoices-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Client</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let invoice of invoices" class="invoice-row">
                    <td>
                      <div class="invoice-info">
                        <a [routerLink]="['/invoices', invoice.id]" class="invoice-link">
                          {{ invoice.invoiceNumber }}
                        </a>
                        <div class="invoice-meta" *ngIf="invoice.notes">
                          {{ invoice.notes }}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="client-info">
                        <div class="client-name">{{ invoice.client?.name || 'Unknown Client' }}</div>
                        <div class="client-email" *ngIf="invoice.client?.email">{{ invoice.client?.email }}</div>
                      </div>
                    </td>
                    <td>
                      <nz-tag [nzColor]="getStatusColor(invoice.status)" class="status-tag">
                        {{ invoice.status }}
                      </nz-tag>
                    </td>
                    <td>
                      <div class="amount-info">
                        <div class="amount">{{ invoice.grandTotal | currency:'EUR':'symbol':'1.2-2' }}</div>
                      </div>
                    </td>
                    <td>
                      <div class="date-info">
                        <div class="due-date">{{ invoice.dueDate | date:'MMM dd, yyyy' }}</div>
                        <div class="days-until" [ngClass]="getDaysUntilClass(invoice.dueDate || '')">
                          {{ getDaysUntil(invoice.dueDate || '') }}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="created-info">
                        {{ invoice.createdAt | date:'MMM dd, yyyy' }}
                      </div>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button 
                          class="btn btn-sm btn-secondary"
                          nz-tooltip="View Details"
                          [routerLink]="['/invoices', invoice.id]"
                        >
                          <span nz-icon nzType="eye"></span>
                        </button>
                        <button 
                          *ngIf="canManageInvoices && invoice.status === 'QUOTE'" 
                          class="btn btn-sm btn-danger"
                          nz-tooltip="Issue Invoice"
                          (click)="issueInvoice(invoice.id)"
                        >
                          <span nz-icon nzType="check-circle"></span>
                        </button>
                        <button 
                          *ngIf="canManageInvoices && invoice.status === 'ISSUED'" 
                          class="btn btn-sm btn-success"
                          nz-tooltip="Mark as Paid"
                          (click)="markAsPaid(invoice.id)"
                        >
                          <span nz-icon nzType="dollar"></span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="empty-state" *ngIf="!loading && invoices.length === 0">
              <nz-empty nzNotFoundContent="No invoices found">
                <div class="empty-actions">
                  <button 
                    *ngIf="canCreateInvoice" 
                    class="btn btn-primary"
                    routerLink="/invoices/new"
                  >
                    <span nz-icon nzType="plus"></span>
                    Create Your First Invoice
                  </button>
                </div>
              </nz-empty>
            </div>
          </nz-spin>
        </div>
      </div>

      <!-- Error Alert -->
      <nz-alert
        *ngIf="errorMessage"
        nzType="error"
        [nzMessage]="errorMessage"
        nzShowIcon
        nzCloseable
        (nzOnClose)="errorMessage = ''"
        class="error-alert">
      </nz-alert>
    </div>
  `,
  styles: [`
    .invoices-container {
      padding: var(--spacing-lg);
      min-height: 100vh;
      background: var(--color-bg-base);
    }

    .page-header {
      margin-bottom: var(--spacing-xl);
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--spacing-lg);
        
        .header-info {
          flex: 1;
          
          h1 {
            margin: 0 0 var(--spacing-sm) 0;
            font-size: 2rem;
            font-weight: 600;
            color: var(--color-text-base);
            line-height: 1.2;
          }
          
          p {
            margin: 0;
            color: var(--color-text-base);
            opacity: 0.7;
            font-size: 1rem;
            line-height: 1.5;
          }
        }
        
        .header-actions {
          display: flex;
          gap: var(--spacing-sm);
          flex-shrink: 0;
        }
      }
    }

    .filters-card {
      background: var(--color-bg-container);
      border-radius: var(--radius-base);
      box-shadow: var(--shadow-card);
      border: 1px solid var(--color-border);
      margin-bottom: var(--spacing-lg);
      
      .card-header {
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--color-border);
        background: var(--color-bg-base);
        
        h3 {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text-base);
          
          span {
            color: var(--color-primary);
          }
        }
      }
      
      .card-content {
        padding: var(--spacing-lg);
      }
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      
      .filter-label {
        font-weight: 500;
        color: var(--color-text-base);
        font-size: 0.875rem;
      }
      
      .filter-select {
        border-radius: var(--radius-base);
        max-width: 300px;
      }
    }

    .results-summary {
      margin-bottom: var(--spacing-md);
      
      .summary-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--color-bg-container);
        border-radius: var(--radius-base);
        border: 1px solid var(--color-border);
        
        .results-count {
          font-weight: 500;
          color: var(--color-text-base);
        }
        
        .status-summary {
          display: flex;
          gap: var(--spacing-md);
          
          .status-item {
            font-size: 0.875rem;
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: var(--radius-base);
            
            &.quote {
              background: rgba(245, 158, 11, 0.1);
              color: var(--color-warning);
            }
            
            &.issued {
              background: rgba(37, 99, 235, 0.1);
              color: var(--color-primary);
            }
            
            &.paid {
              background: rgba(22, 163, 74, 0.1);
              color: var(--color-success);
            }
          }
        }
      }
    }

    .table-card {
      background: var(--color-bg-container);
      border-radius: var(--radius-base);
      box-shadow: var(--shadow-card);
      border: 1px solid var(--color-border);
      margin-bottom: var(--spacing-lg);
      
      .card-content {
        padding: 0;
      }
    }

    .table-container {
      overflow-x: auto;
      
      .invoices-table {
        width: 100%;
        border-collapse: collapse;
        
        thead {
          background: var(--color-bg-base);
          
          th {
            padding: var(--spacing-md);
            text-align: left;
            font-weight: 600;
            color: var(--color-text-base);
            border-bottom: 1px solid var(--color-border);
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        }
        
        tbody {
          .invoice-row {
            transition: all var(--transition-base);
            border-bottom: 1px solid var(--color-border);
            
            &:hover {
              background: rgba(37, 99, 235, 0.05);
            }
            
            &:last-child {
              border-bottom: none;
            }
            
            td {
              padding: var(--spacing-md);
              vertical-align: top;
              
              .invoice-info {
                .invoice-link {
                  color: var(--color-primary);
                  text-decoration: none;
                  font-weight: 600;
                  font-size: 1rem;
                  
                  &:hover {
                    text-decoration: underline;
                  }
                }
                
                .invoice-meta {
                  font-size: 0.875rem;
                  color: var(--color-text-base);
                  opacity: 0.7;
                  margin-top: var(--spacing-xs);
                }
              }
              
              .client-info {
                .client-name {
                  color: var(--color-text-base);
                  font-weight: 500;
                }
                
                .client-email {
                  font-size: 0.875rem;
                  color: var(--color-text-base);
                  opacity: 0.7;
                  margin-top: var(--spacing-xs);
                }
              }
              
              .amount-info {
                .amount {
                  font-weight: 600;
                  color: var(--color-success);
                  font-size: 1rem;
                }
                
                .currency {
                  font-size: 0.75rem;
                  color: var(--color-text-base);
                  opacity: 0.6;
                  margin-top: var(--spacing-xs);
                }
              }
              
              .date-info {
                .due-date {
                  color: var(--color-text-base);
                  font-weight: 500;
                }
                
                .days-until {
                  font-size: 0.75rem;
                  margin-top: var(--spacing-xs);
                  
                  &.overdue {
                    color: var(--color-error);
                    font-weight: 500;
                  }
                  
                  &.due-soon {
                    color: var(--color-warning);
                    font-weight: 500;
                  }
                  
                  &.normal {
                    color: var(--color-text-base);
                    opacity: 0.6;
                  }
                }
              }
              
              .created-info {
                color: var(--color-text-base);
                opacity: 0.7;
              }
              
              .action-buttons {
                display: flex;
                gap: var(--spacing-xs);
              }
            }
          }
        }
      }
    }

    .empty-state {
      padding: var(--spacing-2xl);
      text-align: center;
      
      .empty-actions {
        margin-top: var(--spacing-lg);
      }
    }

    .error-alert {
      margin-top: var(--spacing-lg);
    }

    // Responsive adjustments
    @media (max-width: 1280px) {
      .invoices-container {
        padding: var(--spacing-md);
      }
    }

    @media (max-width: 1024px) {
      .page-header .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md);
        
        .header-actions {
          justify-content: flex-start;
        }
      }
      
      .results-summary .summary-info {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
        
        .status-summary {
          flex-wrap: wrap;
        }
      }
    }

    @media (max-width: 768px) {
      .invoices-container {
        padding: var(--spacing-sm);
      }
      
      .page-header .header-content .header-info h1 {
        font-size: 1.75rem;
      }
      
      .table-container .invoices-table {
        font-size: 0.875rem;
        
        thead th,
        tbody td {
          padding: var(--spacing-sm);
        }
      }
    }

    @media (max-width: 420px) {
      .invoices-container {
        padding: var(--spacing-xs);
      }
      
      .page-header .header-content .header-info h1 {
        font-size: 1.5rem;
      }
      
      .header-actions {
        flex-direction: column;
        
        .action-btn {
          width: 100%;
          justify-content: center;
        }
      }
    }
  `]
})
export class InvoicesListComponent implements OnInit {
  private invoicesService = inject(InvoicesService);
  private clientsService = inject(ClientsService);
  private authService = inject(AuthService);

  invoices: Invoice[] = [];
  clients: any[] = [];
  selectedClientId = '';
  loading = false;
  errorMessage = '';

  // Permission getters
  get canCreateInvoice(): boolean {
    return this.authService.getCurrentUser()?.role === UserRole.EMPLOYEE;
  }

  get canManageInvoices(): boolean {
    return this.authService.getCurrentUser()?.role === UserRole.EMPLOYEE;
  }

  ngOnInit() {
    this.loadInvoices();
    this.loadClients();
  }

  loadInvoices() {
    this.loading = true;
    this.invoicesService.getAll(this.selectedClientId || undefined).subscribe({
      next: (invoices) => {
        this.invoices = invoices;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.loading = false;
      }
    });
  }

  loadClients() {
    this.clientsService.getClients().subscribe({
      next: (response: any) => {
        this.clients = response.data || response;
      },
      error: (error: any) => {
        console.error('Error loading clients:', error);
      }
    });
  }

  filterByClient() {
    this.loadInvoices();
  }

  issueInvoice(invoiceId: string) {
    this.loading = true;
    this.invoicesService.issue(invoiceId).subscribe({
      next: () => {
        this.loadInvoices(); // Reload to get updated status
        this.loading = false;
      },
      error: (error) => {
        console.error('Error issuing invoice:', error);
        this.loading = false;
      }
    });
  }

  markAsPaid(invoiceId: string) {
    this.loading = true;
    this.invoicesService.markAsPaid(invoiceId).subscribe({
      next: () => {
        this.loadInvoices(); // Reload to get updated status
        this.loading = false;
      },
      error: (error) => {
        console.error('Error marking invoice as paid:', error);
        this.loading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'QUOTE':
        return 'orange';
      case 'ISSUED':
        return 'blue';
      case 'PAID':
        return 'green';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  }

  getStatusCount(status: string): number {
    return this.invoices.filter(invoice => invoice.status === status).length;
  }

  getDaysUntil(dueDate: string): string {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return `${diffDays} days`;
    }
  }

  getDaysUntilClass(dueDate: string): string {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'overdue';
    } else if (diffDays <= 7) {
      return 'due-soon';
    } else {
      return 'normal';
    }
  }
}
