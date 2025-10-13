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
      <div class="header">
        <h1>Invoices</h1>
        <button 
          *ngIf="canCreateInvoice" 
          nz-button 
          nzType="primary" 
          routerLink="/invoices/new">
          <span nz-icon nzType="plus"></span>
          New Invoice
        </button>
      </div>

      <div class="filters" *ngIf="clients.length > 0">
        <nz-select
          [(ngModel)]="selectedClientId"
          (ngModelChange)="filterByClient()"
          nzPlaceHolder="All Clients"
          nzAllowClear
          style="width: 200px;">
          <nz-option
            *ngFor="let client of clients"
            [nzValue]="client.id"
            [nzLabel]="client.name">
          </nz-option>
        </nz-select>
      </div>

      <nz-spin [nzSpinning]="loading">
        <nz-table
          #basicTable
          [nzData]="invoices"
          [nzLoading]="loading"
          [nzPageSize]="10"
          [nzShowPagination]="true"
          [nzShowSizeChanger]="true"
          [nzShowQuickJumper]="true">
          
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Client</th>
              <th>Status</th>
              <th>Total</th>
              <th>Due Date</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          
          <tbody>
            <tr *ngFor="let invoice of invoices">
              <td>
                <a [routerLink]="['/invoices', invoice.id]" class="invoice-link">
                  {{ invoice.invoiceNumber }}
                </a>
              </td>
              <td>{{ invoice.client?.name || 'Unknown Client' }}</td>
              <td>
                <nz-tag [nzColor]="getStatusColor(invoice.status)">
                  {{ invoice.status }}
                </nz-tag>
              </td>
              <td class="amount">{{ invoice.grandTotal | currency:'EUR':'symbol':'1.2-2' }}</td>
              <td>{{ invoice.dueDate | date:'short' }}</td>
              <td>{{ invoice.createdAt | date:'short' }}</td>
              <td>
                <button nz-button nzType="link" [routerLink]="['/invoices', invoice.id]">
                  View
                </button>
                <button 
                  *ngIf="canManageInvoices && invoice.status === 'QUOTE'" 
                  nz-button 
                  nzType="link" 
                  nzDanger
                  (click)="issueInvoice(invoice.id)"
                  [nzLoading]="loading">
                  Issue
                </button>
                <button 
                  *ngIf="canManageInvoices && invoice.status === 'ISSUED'" 
                  nz-button 
                  nzType="link" 
                  nzDanger
                  (click)="markAsPaid(invoice.id)"
                  [nzLoading]="loading">
                  Mark as Paid
                </button>
              </td>
            </tr>
          </tbody>
        </nz-table>

        <nz-empty *ngIf="!loading && invoices.length === 0" nzNotFoundContent="No invoices found">
          <button 
            *ngIf="canCreateInvoice" 
            nz-button 
            nzType="primary" 
            routerLink="/invoices/new">
            Create Invoice
          </button>
        </nz-empty>
      </nz-spin>

      <nz-alert
        *ngIf="errorMessage"
        nzType="error"
        [nzMessage]="errorMessage"
        nzShowIcon
        nzCloseable
        (nzOnClose)="errorMessage = ''">
      </nz-alert>
    </div>
  `,
  styles: [`
    .invoices-container {
      padding: 24px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    .filters {
      margin-bottom: 16px;
    }

    .invoice-link {
      color: #1890ff;
      text-decoration: none;
      font-weight: 500;
    }

    .invoice-link:hover {
      text-decoration: underline;
    }

    .amount {
      font-weight: 600;
      color: #52c41a;
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
}
