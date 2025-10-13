import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AuthService, User } from '../../core/services/auth.service';
import { ProductsService } from '../products/services/products.service';
import { InvoicesService, Invoice } from '../invoices/services/invoices.service';
import { ClientsService } from '../clients/services/clients.service';
import { ClientSummary } from '../../shared/interfaces/client.interface';
import { Client } from '../../shared/interfaces/client.interface';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzIconModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzButtonModule,
    NzTableModule,
    NzTagModule
  ],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.less']
})
export class ClientDashboardComponent implements OnInit {
  currentUser: User | null = null;
  clientInfo: Client | null = null;
  clientSummary: ClientSummary | null = null;
  recentInvoices: Invoice[] = [];
  stats = {
    availableProducts: 0,
    myInvoices: 0,
    pendingOrders: 0,
    totalSpent: 0,
    unpaidTotal: 0
  };
  loading = true;

  constructor(
    private authService: AuthService,
    private productsService: ProductsService,
    private invoicesService: InvoicesService,
    private clientsService: ClientsService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    
    if (!this.currentUser?.clientId) {
      console.error('No client ID found for user');
      this.loading = false;
      return;
    }

    const clientId = this.currentUser.clientId;
    let completedRequests = 0;
    const totalRequests = 4;

    const checkComplete = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.loading = false;
      }
    };

    // Load client information
    this.clientsService.getClientById(clientId).subscribe({
      next: (client) => {
        this.clientInfo = client;
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading client info:', error);
        checkComplete();
      }
    });

    // Load client summary statistics
    this.clientsService.getClientSummary(clientId).subscribe({
      next: (summary) => {
        this.clientSummary = summary;
        this.stats.myInvoices = summary.invoicesCount;
        this.stats.unpaidTotal = summary.unpaidTotal;
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading client summary:', error);
        checkComplete();
      }
    });

    // Load available products count
    this.productsService.getAll().subscribe({
      next: (response) => {
        this.stats.availableProducts = response.data.length;
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.stats.availableProducts = 0;
        checkComplete();
      }
    });

    // Load recent invoices
    this.clientsService.getClientInvoices(clientId, 1, 5).subscribe({
      next: (response) => {
        this.recentInvoices = response.data || [];
        // Calculate pending orders (invoices with status ISSUED or SENT)
        this.stats.pendingOrders = this.recentInvoices.filter(
          invoice => invoice.status === 'ISSUED' || invoice.status === 'SENT'
        ).length;
        
        // Calculate total spent (sum of paid invoices)
        this.stats.totalSpent = this.recentInvoices
          .filter(invoice => invoice.status === 'PAID')
          .reduce((sum, invoice) => sum + invoice.grandTotal, 0);
        
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading recent invoices:', error);
        this.recentInvoices = [];
        checkComplete();
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'DRAFT':
        return 'default';
      case 'ISSUED':
        return 'blue';
      case 'SENT':
        return 'orange';
      case 'PAID':
        return 'green';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  }
}
