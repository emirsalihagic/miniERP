import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface ClientsResponse {
  items: Client[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

@Component({
  selector: 'app-client-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzSelectModule,
    NzCardModule,
    NzButtonModule,
    NzSpinModule
  ],
  template: `
    <nz-card nzTitle="Select Client" nzSize="small" *ngIf="showSelector">
      <div class="client-selector">
        <nz-select
          [(ngModel)]="selectedClientId"
          (ngModelChange)="onClientChange($event)"
          placeholder="Choose a client to shop for..."
          nzAllowClear
          [nzLoading]="loading"
          [nzNotFoundContent]="loading ? 'Loading clients...' : 'No clients available'"
          style="width: 100%;">
          <nz-option
            *ngFor="let client of clients"
            [nzValue]="client.id"
            [nzLabel]="client.name">
            {{ client.name }} ({{ client.email }})
          </nz-option>
        </nz-select>
        <div class="client-info" *ngIf="selectedClient">
          <p><strong>Selected Client:</strong> {{ selectedClient.name }}</p>
          <p><strong>Email:</strong> {{ selectedClient.email }}</p>
          <p *ngIf="selectedClient.phone"><strong>Phone:</strong> {{ selectedClient.phone }}</p>
        </div>
      </div>
    </nz-card>
  `,
  styles: [`
    .client-selector {
      margin-bottom: 16px;
    }
    
    .client-info {
      margin-top: 16px;
      padding: 12px;
      background: #f6f8fa;
      border-radius: 6px;
      border: 1px solid #d0d7de;
    }
    
    .client-info p {
      margin: 4px 0;
      font-size: 14px;
    }
  `]
})
export class ClientSelectorComponent implements OnInit {
  @Input() showSelector = false;
  @Output() clientSelected = new EventEmitter<string | null>();
  
  clients: Client[] = [];
  selectedClientId: string | null = null;
  selectedClient: Client | null = null;
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.showSelector) {
      this.loadClients();
    }
  }

  loadClients(): void {
    this.loading = true;
    this.http.get<ClientsResponse>(`${environment.apiUrl}/clients`).subscribe({
      next: (response) => {
        this.clients = response.items;
        this.loading = false;
        console.log('✅ [ClientSelector] Loaded clients:', this.clients.length);
      },
      error: (error) => {
        console.error('❌ [ClientSelector] Error loading clients:', error);
        this.loading = false;
      }
    });
  }

  onClientChange(clientId: string | null): void {
    this.selectedClient = clientId ? this.clients.find(c => c.id === clientId) || null : null;
    this.clientSelected.emit(clientId);
  }
}
