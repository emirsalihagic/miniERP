import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import { ClientsService } from '../../services/clients.service';
import { Client, ClientSummary } from '../../../../shared/interfaces/client.interface';
import { FormatCurrencyPipe } from '../../../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzTagModule,
    NzIconModule,
    NzSpaceModule,
    NzGridModule,
    NzTabsModule,
    NzTableModule,
    NzSpinModule,
    NzMessageModule,
    NzEmptyModule,
    NzDescriptionsModule,
    NzDividerModule,
    FormatCurrencyPipe
  ],
  template: `
    <div class="client-detail-container">
      <nz-spin [nzSpinning]="loading()">
        <div *ngIf="client()" class="client-detail">
          <!-- Header -->
          <nz-card class="header-card">
            <div class="client-header">
              <div class="client-info">
                <h1 class="client-name">{{ client()!.name }}</h1>
                <div class="client-meta">
                  <nz-tag [nzColor]="getStatusColor(client()!.status)">
                    {{ client()!.status }}
                  </nz-tag>
                  <nz-tag [nzColor]="client()!.type === 'COMPANY' ? 'blue' : 'green'">
                    {{ client()!.type }}
                  </nz-tag>
                  <span *ngIf="client()!.clientCode" class="client-code">
                    Code: {{ client()!.clientCode }}
                  </span>
                </div>
              </div>
              <div class="client-actions">
                <nz-space nzSize="middle">
                  <button nz-button nzType="primary" (click)="editClient()">
                    <span nz-icon nzType="edit"></span>
                    Edit Client
                  </button>
                  <button nz-button (click)="goBack()">
                    <span nz-icon nzType="arrow-left"></span>
                    Back to List
                  </button>
                </nz-space>
              </div>
            </div>
          </nz-card>

          <!-- Summary Cards -->
          <nz-row [nzGutter]="16" class="summary-row">
            <nz-col nzSpan="6">
              <nz-card nzSize="small" class="summary-card">
                <div class="summary-item">
                  <div class="summary-value">{{ summary()?.invoicesCount || 0 }}</div>
                  <div class="summary-label">Total Invoices</div>
                </div>
              </nz-card>
            </nz-col>
            <nz-col nzSpan="6">
              <nz-card nzSize="small" class="summary-card">
                <div class="summary-item">
                  <div class="summary-value">{{ (summary()?.unpaidTotal || 0) | formatCurrency:client()!.preferredCurrency }}</div>
                  <div class="summary-label">Unpaid Amount</div>
                </div>
              </nz-card>
            </nz-col>
            <nz-col nzSpan="6">
              <nz-card nzSize="small" class="summary-card">
                <div class="summary-item">
                  <div class="summary-value">{{ client()!.creditLimit | formatCurrency:client()!.preferredCurrency }}</div>
                  <div class="summary-label">Credit Limit</div>
                </div>
              </nz-card>
            </nz-col>
            <nz-col nzSpan="6">
              <nz-card nzSize="small" class="summary-card">
                <div class="summary-item">
                  <div class="summary-value">{{ client()!.tags.length }}</div>
                  <div class="summary-label">Tags</div>
                </div>
              </nz-card>
            </nz-col>
          </nz-row>

          <!-- Details Tabs -->
          <nz-card class="details-card">
            <nz-tabset nzSize="large">
              <!-- Overview Tab -->
              <nz-tab nzTitle="Overview">
                <div class="tab-content">
                  <nz-row [nzGutter]="24">
                    <nz-col nzSpan="12">
                      <nz-card nzTitle="Contact Information" nzSize="small">
                        <div class="field-list">
                          <div class="field-item">
                            <span class="field-label">Email:</span>
                            <span class="field-value">{{ client()!.email }}</span>
                          </div>
                          <div class="field-item">
                            <span class="field-label">Phone:</span>
                            <span class="field-value">{{ client()!.phone || 'Not provided' }}</span>
                          </div>
                          <div class="field-item">
                            <span class="field-label">Website:</span>
                            <span class="field-value">
                              <a *ngIf="client()!.website" [href]="client()!.website" target="_blank">
                                {{ client()!.website }}
                              </a>
                              <span *ngIf="!client()!.website">Not provided</span>
                            </span>
                          </div>
                          <div class="field-item">
                            <span class="field-label">Contact Person:</span>
                            <span class="field-value">{{ client()!.contactPerson || 'Not specified' }}</span>
                          </div>
                        </div>
                      </nz-card>
                    </nz-col>
                    <nz-col nzSpan="12">
                      <nz-card nzTitle="Billing Information" nzSize="small">
                        <div class="field-list">
                          <div class="field-item">
                            <span class="field-label">Street:</span>
                            <span class="field-value">{{ client()!.billingStreet || 'Not provided' }}</span>
                          </div>
                          <div class="field-item">
                            <span class="field-label">City:</span>
                            <span class="field-value">{{ client()!.billingCity || 'Not provided' }}</span>
                          </div>
                          <div class="field-item">
                            <span class="field-label">Zip Code:</span>
                            <span class="field-value">{{ client()!.billingZip || 'Not provided' }}</span>
                          </div>
                          <div class="field-item">
                            <span class="field-label">Country:</span>
                            <span class="field-value">{{ client()!.billingCountry || 'Not provided' }}</span>
                          </div>
                          <div class="field-item">
                            <span class="field-label">Tax Number:</span>
                            <span class="field-value">{{ client()!.taxNumber || 'Not provided' }}</span>
                          </div>
                        </div>
                      </nz-card>
                    </nz-col>
                  </nz-row>

                  <nz-divider></nz-divider>

                  <nz-row [nzGutter]="24">
                    <nz-col nzSpan="12">
                      <nz-card nzTitle="Business Information" nzSize="small">
                        <div class="field-list">
                          <div class="field-item">
                            <span class="field-label">Payment Terms:</span>
                            <span class="field-value">{{ client()!.paymentTerms }}</span>
                          </div>
                          <div class="field-item">
                            <span class="field-label">Preferred Currency:</span>
                            <span class="field-value">{{ client()!.preferredCurrency }}</span>
                          </div>
                          <div class="field-item">
                            <span class="field-label">Lead Source:</span>
                            <span class="field-value">{{ client()!.leadSource || 'Not specified' }}</span>
                          </div>
                          <div class="field-item">
                            <span class="field-label">Assigned To:</span>
                            <span class="field-value">
                              <span *ngIf="client()!.assignedTo">
                                {{ client()!.assignedTo?.firstName }} {{ client()!.assignedTo?.lastName }}
                                ({{ client()!.assignedTo?.email }})
                              </span>
                              <span *ngIf="!client()!.assignedTo">Not assigned</span>
                            </span>
                          </div>
                        </div>
                      </nz-card>
                    </nz-col>
                    <nz-col nzSpan="12">
                      <nz-card nzTitle="CRM Information" nzSize="small">
                        <div class="field-list">
                          <div class="field-item">
                            <span class="field-label">Last Contacted:</span>
                            <span class="field-value">{{ formatDate(client()!.lastContactedAt) }}</span>
                          </div>
                          <div class="field-item">
                            <span class="field-label">Next Follow-up:</span>
                            <span class="field-value">{{ formatDate(client()!.nextFollowupAt) }}</span>
                          </div>
                          <div class="field-item">
                            <span class="field-label">Created:</span>
                            <span class="field-value">{{ formatDate(client()!.createdAt) }}</span>
                          </div>
                          <div class="field-item">
                            <span class="field-label">Last Updated:</span>
                            <span class="field-value">{{ formatDate(client()!.updatedAt) }}</span>
                          </div>
                        </div>
                      </nz-card>
                    </nz-col>
                  </nz-row>

                  <nz-divider></nz-divider>

                  <!-- Tags and Notes -->
                  <nz-row [nzGutter]="24">
                    <nz-col nzSpan="12">
                      <nz-card nzTitle="Tags" nzSize="small">
                        <nz-space nzWrap>
                          <nz-tag 
                            *ngFor="let tag of client()!.tags" 
                            nzColor="purple"
                          >
                            {{ tag }}
                          </nz-tag>
                          <span *ngIf="client()!.tags.length === 0" class="text-muted">
                            No tags assigned
                          </span>
                        </nz-space>
                      </nz-card>
                    </nz-col>
                    <nz-col nzSpan="12">
                      <nz-card nzTitle="Notes" nzSize="small">
                        <div class="notes-content">
                          {{ client()!.notes || 'No notes available' }}
                        </div>
                      </nz-card>
                    </nz-col>
                  </nz-row>
                </div>
              </nz-tab>

              <!-- Invoices Tab -->
              <nz-tab nzTitle="Invoices">
                <div class="tab-content">
                  <nz-card nzTitle="Client Invoices" nzSize="small">
                    <div *ngIf="invoices().length > 0; else noInvoices">
                      <nz-table [nzData]="invoices()" nzSize="small">
                        <thead>
                          <tr>
                            <th>Invoice Number</th>
                            <th>Status</th>
                            <th>Amount</th>
                            <th>Issued Date</th>
                            <th>Due Date</th>
                            <th>Remaining</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr *ngFor="let invoice of invoices()">
                            <td>{{ invoice.invoiceNumber }}</td>
                            <td>
                              <nz-tag [nzColor]="getInvoiceStatusColor(invoice.status)">
                                {{ invoice.status }}
                              </nz-tag>
                            </td>
                            <td>{{ invoice.grandTotal | formatCurrency:client()!.preferredCurrency }}</td>
                            <td>{{ formatDate(invoice.issuedAt) }}</td>
                            <td>{{ formatDate(invoice.dueDate) }}</td>
                            <td>{{ invoice.remainingAmount | formatCurrency:client()!.preferredCurrency }}</td>
                          </tr>
                        </tbody>
                      </nz-table>
                    </div>
                    <ng-template #noInvoices>
                      <nz-empty nzNotFoundContent="No invoices found for this client"></nz-empty>
                    </ng-template>
                  </nz-card>
                </div>
              </nz-tab>
            </nz-tabset>
          </nz-card>
        </div>

        <nz-empty *ngIf="!loading() && !client()" nzNotFoundContent="Client not found"></nz-empty>
      </nz-spin>
    </div>
  `,
  styles: [`
    .client-detail-container {
      padding: 24px;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .client-detail {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-card {
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .client-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .client-name {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: #262626;
    }

    .client-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .client-code {
      color: #8c8c8c;
      font-size: 14px;
    }

    .summary-row {
      margin-bottom: 16px;
    }

    .summary-card {
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .summary-item {
      padding: 16px 0;
    }

    .summary-value {
      font-size: 24px;
      font-weight: 600;
      color: #1890ff;
      margin-bottom: 4px;
    }

    .summary-label {
      font-size: 14px;
      color: #8c8c8c;
    }

    .details-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .tab-content {
      padding: 16px 0;
    }

    .text-muted {
      color: #8c8c8c;
    }

    .notes-content {
      min-height: 60px;
      padding: 8px;
      background-color: #fafafa;
      border-radius: 4px;
      white-space: pre-wrap;
    }

    nz-card {
      margin-bottom: 16px;
    }

    nz-card:last-child {
      margin-bottom: 0;
    }

    /* Field list styling */
    .field-list {
      padding: 16px 0;
    }

    .field-item {
      display: flex;
      margin-bottom: 12px;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .field-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .field-label {
      font-weight: 600;
      color: #262626;
      min-width: 140px;
      margin-right: 16px;
      flex-shrink: 0;
    }

    .field-value {
      color: #595959;
      flex: 1;
      word-break: break-word;
    }

    .field-value a {
      color: #1890ff;
      text-decoration: none;
    }

    .field-value a:hover {
      text-decoration: underline;
    }
  `]
})
export class ClientDetailComponent implements OnInit {
  client = signal<Client | null>(null);
  summary = signal<ClientSummary | null>(null);
  invoices = signal<any[]>([]);
  loading = signal(false);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientsService = inject(ClientsService);
  private message = inject(NzMessageService);

  ngOnInit() {
    const clientId = this.route.snapshot.paramMap.get('id');
    if (clientId) {
      this.loadClient(clientId);
      this.loadClientSummary(clientId);
      this.loadClientInvoices(clientId);
    }
  }

  loadClient(clientId: string) {
    this.loading.set(true);
    this.clientsService.getClientById(clientId).subscribe({
      next: (client) => {
        this.client.set(client);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading client:', error);
        this.message.error('Failed to load client');
        this.loading.set(false);
      }
    });
  }

  loadClientSummary(clientId: string) {
    this.clientsService.getClientSummary(clientId).subscribe({
      next: (summary) => {
        this.summary.set(summary);
      },
      error: (error) => {
        console.error('Error loading client summary:', error);
      }
    });
  }

  loadClientInvoices(clientId: string) {
    this.clientsService.getClientInvoices(clientId).subscribe({
      next: (response) => {
        this.invoices.set(response.data || []);
      },
      error: (error) => {
        console.error('Error loading client invoices:', error);
      }
    });
  }

  editClient() {
    this.router.navigate(['/clients', this.client()!.id, 'edit']);
  }

  goBack() {
    this.router.navigate(['/clients']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'INACTIVE':
        return 'red';
      case 'PROSPECT':
        return 'orange';
      default:
        return 'default';
    }
  }

  getInvoiceStatusColor(status: string): string {
    switch (status) {
      case 'PAID':
        return 'green';
      case 'ISSUED':
      case 'SENT':
        return 'blue';
      case 'DRAFT':
        return 'orange';
      case 'VOID':
        return 'red';
      default:
        return 'default';
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  }
}
