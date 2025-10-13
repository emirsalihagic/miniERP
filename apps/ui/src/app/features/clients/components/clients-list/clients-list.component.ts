import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

import { ClientsService } from '../../services/clients.service';
import { 
  Client, 
  ClientQueryParams, 
  ClientStatus, 
  ClientType, 
  PaymentTerms, 
  Currency 
} from '../../../../shared/interfaces/client.interface';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzTagModule,
    NzCardModule,
    NzGridModule,
    NzSpaceModule,
    NzIconModule,
    NzToolTipModule,
    NzModalModule,
    NzMessageModule,
    NzSpinModule,
    NzPaginationModule,
    NzEmptyModule
  ],
  template: `
    <div class="clients-container">
      <nz-card nzTitle="Clients Management" class="main-card">
        <!-- Header with actions -->
        <div class="header-actions">
          <nz-space nzSize="middle">
            <button nz-button nzType="primary" nzSize="large" (click)="createClient()">
              <span nz-icon nzType="plus"></span>
              Create Client
            </button>
            <button nz-button nzSize="large" (click)="refreshClients()">
              <span nz-icon nzType="reload"></span>
              Refresh
            </button>
          </nz-space>
        </div>

        <!-- Filters -->
        <div class="filters-section">
          <nz-card nzTitle="Filters" nzSize="small" class="filters-card">
            <nz-row [nzGutter]="16">
              <nz-col nzSpan="6">
                <label>Search:</label>
                <input 
                  nz-input 
                  placeholder="Search by name, email, client code..." 
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="onSearchChange()"
                  nzSize="large"
                />
              </nz-col>
              <nz-col nzSpan="4">
                <label>Status:</label>
                <nz-select 
                  [(ngModel)]="statusFilter" 
                  (ngModelChange)="onFilterChange()"
                  nzPlaceHolder="All Statuses"
                  nzSize="large"
                  nzAllowClear
                >
                  <nz-option nzValue="ACTIVE" nzLabel="Active"></nz-option>
                  <nz-option nzValue="INACTIVE" nzLabel="Inactive"></nz-option>
                  <nz-option nzValue="PROSPECT" nzLabel="Prospect"></nz-option>
                </nz-select>
              </nz-col>
              <nz-col nzSpan="4">
                <label>City:</label>
                <input 
                  nz-input 
                  placeholder="Filter by city" 
                  [(ngModel)]="cityFilter"
                  (ngModelChange)="onFilterChange()"
                  nzSize="large"
                />
              </nz-col>
              <nz-col nzSpan="4">
                <label>Tags:</label>
                <input 
                  nz-input 
                  placeholder="Filter by tags" 
                  [(ngModel)]="tagsFilter"
                  (ngModelChange)="onFilterChange()"
                  nzSize="large"
                />
              </nz-col>
              <nz-col nzSpan="6">
                <label>Sort by:</label>
                <nz-select 
                  [(ngModel)]="sortField" 
                  (ngModelChange)="onSortChange()"
                  nzSize="large"
                >
                  <nz-option nzValue="name" nzLabel="Name"></nz-option>
                  <nz-option nzValue="email" nzLabel="Email"></nz-option>
                  <nz-option nzValue="status" nzLabel="Status"></nz-option>
                  <nz-option nzValue="createdAt" nzLabel="Created Date"></nz-option>
                </nz-select>
                <button 
                  nz-button 
                  nzType="text" 
                  nzSize="small" 
                  (click)="toggleSortOrder()"
                  class="sort-order-btn"
                >
                  <span nz-icon [nzType]="sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'"></span>
                </button>
              </nz-col>
            </nz-row>
          </nz-card>
        </div>

        <!-- Table -->
        <div class="table-section">
          <nz-spin [nzSpinning]="loading()">
            <nz-table 
              #basicTable 
              [nzData]="clients()" 
              [nzPageSize]="pageSize()"
              [nzShowPagination]="false"
              nzSize="middle"
              class="clients-table"
            >
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>City</th>
                  <th>Tags</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let client of clients()" class="client-row">
                  <td>
                    <div class="client-name">
                      <strong>{{ client.name }}</strong>
                      <div class="client-code" *ngIf="client.clientCode">
                        {{ client.clientCode }}
                      </div>
                    </div>
                  </td>
                  <td>
                    <nz-tag [nzColor]="client.type === 'COMPANY' ? 'blue' : 'green'">
                      {{ client.type }}
                    </nz-tag>
                  </td>
                  <td>{{ client.email }}</td>
                  <td>{{ client.phone || '-' }}</td>
                  <td>
                    <nz-tag [nzColor]="getStatusColor(client.status)">
                      {{ client.status }}
                    </nz-tag>
                  </td>
                  <td>{{ client.billingCity || '-' }}</td>
                  <td>
                    <nz-space nzSize="small">
                      <nz-tag 
                        *ngFor="let tag of client.tags" 
                        nzColor="purple"
                        nzSize="small"
                      >
                        {{ tag }}
                      </nz-tag>
                    </nz-space>
                  </td>
                  <td>
                    <span *ngIf="client.assignedTo">
                      {{ client.assignedTo.firstName }} {{ client.assignedTo.lastName }}
                    </span>
                    <span *ngIf="!client.assignedTo" class="text-muted">-</span>
                  </td>
                  <td>
                    <nz-space nzSize="small">
                      <button 
                        nz-button 
                        nzType="text" 
                        nzSize="small"
                        nz-tooltip="View Details"
                        (click)="viewClient(client.id)"
                      >
                        <span nz-icon nzType="eye"></span>
                      </button>
                      <button 
                        nz-button 
                        nzType="text" 
                        nzSize="small"
                        nz-tooltip="Edit"
                        (click)="editClient(client.id)"
                      >
                        <span nz-icon nzType="edit"></span>
                      </button>
                      <button 
                        nz-button 
                        nzType="text" 
                        nzSize="small"
                        nzDanger
                        nz-tooltip="Delete"
                        (click)="deleteClient(client)"
                      >
                        <span nz-icon nzType="delete"></span>
                      </button>
                    </nz-space>
                  </td>
                </tr>
              </tbody>
            </nz-table>

            <nz-empty *ngIf="!loading() && clients().length === 0" nzNotFoundContent="No clients found"></nz-empty>
          </nz-spin>
        </div>

        <!-- Pagination -->
        <div class="pagination-section" *ngIf="totalClients() > 0">
          <nz-pagination
            [nzPageIndex]="currentPage()"
            [nzTotal]="totalClients()"
            [nzPageSize]="pageSize()"
            [nzShowSizeChanger]="true"
            [nzPageSizeOptions]="[10, 20, 50, 100]"
            (nzPageIndexChange)="onPageChange($event)"
            (nzPageSizeChange)="onPageSizeChange($event)"
            nzShowQuickJumper
          ></nz-pagination>
        </div>
      </nz-card>
    </div>
  `,
  styles: [`
    .clients-container {
      padding: 24px;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .main-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }

    .header-actions {
      margin-bottom: 24px;
    }

    .filters-section {
      margin-bottom: 24px;
    }

    .filters-card {
      background-color: #fafafa;
    }

    .filters-section label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #262626;
    }

    .sort-order-btn {
      margin-left: 8px;
    }

    .table-section {
      margin-bottom: 24px;
    }

    .clients-table {
      background: white;
      border-radius: 6px;
    }

    .client-row:hover {
      background-color: #f5f5f5;
    }

    .client-name {
      display: flex;
      flex-direction: column;
    }

    .client-code {
      font-size: 12px;
      color: #8c8c8c;
      margin-top: 2px;
    }

    .text-muted {
      color: #8c8c8c;
    }

    .pagination-section {
      display: flex;
      justify-content: center;
      margin-top: 24px;
    }

    nz-card {
      margin-bottom: 16px;
    }

    nz-card:last-child {
      margin-bottom: 0;
    }
  `]
})
export class ClientsListComponent implements OnInit {
  // Signals for reactive state
  clients = signal<Client[]>([]);
  loading = signal(false);
  totalClients = signal(0);
  currentPage = signal(1);
  pageSize = signal(20);

  // Filter and search state
  searchQuery = '';
  statusFilter: ClientStatus | null = null;
  cityFilter = '';
  tagsFilter = '';
  sortField = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  private clientsService = inject(ClientsService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.loading.set(true);
    
    const params: ClientQueryParams = {
      page: this.currentPage(),
      limit: this.pageSize(),
      sort: this.sortField,
      order: this.sortOrder,
      q: this.searchQuery || undefined,
      status: this.statusFilter || undefined,
      city: this.cityFilter || undefined,
      tags: this.tagsFilter || undefined
    };

    this.clientsService.getClients(params).subscribe({
      next: (response: any) => {
        this.clients.set(response.items);
        this.totalClients.set(response.total);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading clients:', error);
        this.message.error('Failed to load clients');
        this.loading.set(false);
      }
    });
  }

  onSearchChange() {
    this.currentPage.set(1);
    this.loadClients();
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadClients();
  }

  onSortChange() {
    this.loadClients();
  }

  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.loadClients();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadClients();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadClients();
  }

  refreshClients() {
    this.loadClients();
  }

  createClient() {
    this.router.navigate(['/clients/new']);
  }

  viewClient(id: string) {
    this.router.navigate(['/clients', id]);
  }

  editClient(id: string) {
    this.router.navigate(['/clients', id, 'edit']);
  }

  deleteClient(client: Client) {
    this.message.warning(`Delete functionality for ${client.name} will be implemented`);
  }

  getStatusColor(status: ClientStatus): string {
    switch (status) {
      case ClientStatus.ACTIVE:
        return 'green';
      case ClientStatus.INACTIVE:
        return 'red';
      case ClientStatus.PROSPECT:
        return 'orange';
      default:
        return 'default';
    }
  }
}
