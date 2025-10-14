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
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1>Clients Management</h1>
            <p>Manage your client relationships and track their information</p>
          </div>
          <div class="header-actions">
            <button nz-button nzType="primary" nzSize="large" (click)="createClient()" class="action-btn">
              <span nz-icon nzType="plus"></span>
              Create Client
            </button>
            <button nz-button nzSize="large" (click)="refreshClients()" class="action-btn">
              <span nz-icon nzType="reload"></span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Filters Card -->
      <div class="filters-card">
        <div class="card-header">
          <h3>
            <span nz-icon nzType="filter"></span>
            Filters & Search
          </h3>
        </div>
        <div class="card-content">
          <div class="filters-grid">
            <div class="filter-group">
              <label class="filter-label">Search</label>
              <input 
                nz-input 
                placeholder="Search by name, email, client code..." 
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange()"
                nzSize="large"
                class="filter-input"
              />
            </div>
            
            <div class="filter-group">
              <label class="filter-label">Status</label>
              <nz-select 
                [(ngModel)]="statusFilter" 
                (ngModelChange)="onFilterChange()"
                nzPlaceHolder="All Statuses"
                nzSize="large"
                nzAllowClear
                class="filter-select"
              >
                <nz-option nzValue="ACTIVE" nzLabel="Active"></nz-option>
                <nz-option nzValue="INACTIVE" nzLabel="Inactive"></nz-option>
                <nz-option nzValue="PROSPECT" nzLabel="Prospect"></nz-option>
              </nz-select>
            </div>
            
            <div class="filter-group">
              <label class="filter-label">City</label>
              <input 
                nz-input 
                placeholder="Filter by city" 
                [(ngModel)]="cityFilter"
                (ngModelChange)="onFilterChange()"
                nzSize="large"
                class="filter-input"
              />
            </div>
            
            <div class="filter-group">
              <label class="filter-label">Tags</label>
              <input 
                nz-input 
                placeholder="Filter by tags" 
                [(ngModel)]="tagsFilter"
                (ngModelChange)="onFilterChange()"
                nzSize="large"
                class="filter-input"
              />
            </div>
            
            <div class="filter-group">
              <label class="filter-label">Sort by</label>
              <div class="sort-controls">
                <nz-select 
                  [(ngModel)]="sortField" 
                  (ngModelChange)="onSortChange()"
                  nzSize="large"
                  class="filter-select"
                >
                  <nz-option nzValue="name" nzLabel="Name"></nz-option>
                  <nz-option nzValue="email" nzLabel="Email"></nz-option>
                  <nz-option nzValue="status" nzLabel="Status"></nz-option>
                  <nz-option nzValue="createdAt" nzLabel="Created Date"></nz-option>
                </nz-select>
                <button 
                  nz-button 
                  nzType="text" 
                  nzSize="large" 
                  (click)="toggleSortOrder()"
                  class="sort-order-btn"
                  [attr.aria-label]="'Sort ' + (sortOrder === 'asc' ? 'descending' : 'ascending')"
                >
                  <span nz-icon [nzType]="sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Summary -->
      <div class="results-summary" *ngIf="totalClients() > 0">
        <div class="summary-info">
          <span class="results-count">{{ totalClients() }} client{{ totalClients() !== 1 ? 's' : '' }} found</span>
          <span class="page-info" *ngIf="totalClients() > pageSize()">
            Showing {{ (currentPage() - 1) * pageSize() + 1 }} - {{ Math.min(currentPage() * pageSize(), totalClients()) }} of {{ totalClients() }}
          </span>
        </div>
      </div>

      <!-- Table Card -->
      <div class="table-card">
        <div class="card-content">
          <nz-spin [nzSpinning]="loading()">
            <div class="table-container">
              <table class="clients-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Tags</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let client of clients()" class="client-row">
                    <td>
                      <div class="client-info">
                        <div class="client-name">
                          <strong>{{ client.name }}</strong>
                          <div class="client-code" *ngIf="client.clientCode">
                            {{ client.clientCode }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <nz-tag [nzColor]="client.type === 'COMPANY' ? 'blue' : 'green'" class="type-tag">
                        {{ client.type }}
                      </nz-tag>
                    </td>
                    <td>
                      <div class="contact-info">
                        <div class="email">{{ client.email }}</div>
                        <div class="phone" *ngIf="client.phone">{{ client.phone }}</div>
                      </div>
                    </td>
                    <td>
                      <nz-tag [nzColor]="getStatusColor(client.status)" class="status-tag">
                        {{ client.status }}
                      </nz-tag>
                    </td>
                    <td>
                      <div class="location-info">
                        <div class="city">{{ client.billingCity || '-' }}</div>
                        <div class="country" *ngIf="client.billingCountry">{{ client.billingCountry }}</div>
                      </div>
                    </td>
                    <td>
                      <div class="tags-container" *ngIf="client.tags && client.tags.length > 0">
                        <nz-tag 
                          *ngFor="let tag of client.tags.slice(0, 2)" 
                          nzColor="purple"
                          nzSize="small"
                          class="tag"
                        >
                          {{ tag }}
                        </nz-tag>
                        <nz-tag 
                          *ngIf="client.tags.length > 2" 
                          nzColor="default"
                          nzSize="small"
                          class="tag"
                        >
                          +{{ client.tags.length - 2 }}
                        </nz-tag>
                      </div>
                      <span *ngIf="!client.tags || client.tags.length === 0" class="no-tags">-</span>
                    </td>
                    <td>
                      <div class="assigned-info">
                        <span *ngIf="client.assignedTo" class="assigned-user">
                          {{ client.assignedTo.firstName }} {{ client.assignedTo.lastName }}
                        </span>
                        <span *ngIf="!client.assignedTo" class="not-assigned">-</span>
                      </div>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button 
                          nz-button 
                          nzType="text" 
                          nzSize="small"
                          nz-tooltip="View Details"
                          (click)="viewClient(client.id)"
                          class="action-btn"
                        >
                          <span nz-icon nzType="eye"></span>
                        </button>
                        <button 
                          nz-button 
                          nzType="text" 
                          nzSize="small"
                          nz-tooltip="Edit Client"
                          (click)="editClient(client.id)"
                          class="action-btn"
                        >
                          <span nz-icon nzType="edit"></span>
                        </button>
                        <button 
                          nz-button 
                          nzType="text" 
                          nzSize="small"
                          nzDanger
                          nz-tooltip="Delete Client"
                          (click)="deleteClient(client)"
                          class="action-btn"
                        >
                          <span nz-icon nzType="delete"></span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="empty-state" *ngIf="!loading() && clients().length === 0">
              <nz-empty nzNotFoundContent="No clients found">
                <div class="empty-actions">
                  <button nz-button nzType="primary" (click)="createClient()">
                    <span nz-icon nzType="plus"></span>
                    Create Your First Client
                  </button>
                </div>
              </nz-empty>
            </div>
          </nz-spin>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination-section" *ngIf="totalClients() > pageSize()">
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
    </div>
  `,
  styles: [`
    .clients-container {
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
          
          .action-btn {
            height: 48px;
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            border-radius: var(--radius-base);
            transition: all var(--transition-base);
            
            &:hover {
              transform: translateY(-1px);
            }
          }
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

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-md);
      
      .filter-group {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
        
        .filter-label {
          font-weight: 500;
          color: var(--color-text-base);
          font-size: 0.875rem;
        }
        
        .filter-input,
        .filter-select {
          border-radius: var(--radius-base);
        }
        
        .sort-controls {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          
          .sort-order-btn {
            color: var(--color-text-base);
            transition: all var(--transition-base);
            
            &:hover {
              color: var(--color-primary);
              background: rgba(37, 99, 235, 0.1);
            }
          }
        }
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
        
        .page-info {
          font-size: 0.875rem;
          color: var(--color-text-base);
          opacity: 0.7;
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
      
      .clients-table {
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
          .client-row {
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
              
              .client-info {
                .client-name {
                  strong {
                    color: var(--color-text-base);
                    font-weight: 600;
                  }
                  
                  .client-code {
                    font-size: 0.75rem;
                    color: var(--color-text-base);
                    opacity: 0.6;
                    margin-top: var(--spacing-xs);
                  }
                }
              }
              
              .contact-info {
                .email {
                  color: var(--color-text-base);
                  font-weight: 500;
                }
                
                .phone {
                  font-size: 0.875rem;
                  color: var(--color-text-base);
                  opacity: 0.7;
                  margin-top: var(--spacing-xs);
                }
              }
              
              .location-info {
                .city {
                  color: var(--color-text-base);
                  font-weight: 500;
                }
                
                .country {
                  font-size: 0.875rem;
                  color: var(--color-text-base);
                  opacity: 0.7;
                  margin-top: var(--spacing-xs);
                }
              }
              
              .tags-container {
                display: flex;
                flex-wrap: wrap;
                gap: var(--spacing-xs);
                
                .tag {
                  border-radius: var(--radius-base);
                }
              }
              
              .no-tags {
                color: var(--color-text-base);
                opacity: 0.5;
                font-style: italic;
              }
              
              .assigned-info {
                .assigned-user {
                  color: var(--color-text-base);
                  font-weight: 500;
                }
                
                .not-assigned {
                  color: var(--color-text-base);
                  opacity: 0.5;
                  font-style: italic;
                }
              }
              
              .action-buttons {
                display: flex;
                gap: var(--spacing-xs);
                
                .action-btn {
                  color: var(--color-text-base);
                  transition: all var(--transition-base);
                  
                  &:hover {
                    color: var(--color-primary);
                    background: rgba(37, 99, 235, 0.1);
                  }
                  
                  &.ant-btn-dangerous:hover {
                    color: var(--color-error);
                    background: rgba(220, 38, 38, 0.1);
                  }
                }
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

    .pagination-section {
      display: flex;
      justify-content: center;
      margin-top: var(--spacing-lg);
    }

    // Responsive adjustments
    @media (max-width: 1280px) {
      .clients-container {
        padding: var(--spacing-md);
      }
      
      .filters-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
      
      .filters-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .clients-container {
        padding: var(--spacing-sm);
      }
      
      .page-header .header-content .header-info h1 {
        font-size: 1.75rem;
      }
      
      .table-container .clients-table {
        font-size: 0.875rem;
        
        thead th,
        tbody td {
          padding: var(--spacing-sm);
        }
      }
      
      .results-summary .summary-info {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-xs);
      }
    }

    @media (max-width: 420px) {
      .clients-container {
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

  // Math property for template
  Math = Math;

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
