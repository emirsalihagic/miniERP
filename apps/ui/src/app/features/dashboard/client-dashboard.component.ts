import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AuthService, User } from '../../core/services/auth.service';
import { InvoicesService, Invoice } from '../invoices/services/invoices.service';
import { ClientsService } from '../clients/services/clients.service';
import { ClientSummary, Client } from '../../shared/interfaces/client.interface';
import { CartService } from '../shop/services/cart.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

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
    NzBadgeModule,
    NzTagModule,
    CurrencyFormatPipe
  ],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.less']
})
export class ClientDashboardComponent implements OnInit {
  currentUser: User | null = null;
  clientInfo: Client | null = null;
  clientSummary: ClientSummary | null = null;
  recentInvoices: Invoice[] = [];
  accountInfo: any[] = [];
  stats = {
    totalInvoices: 0,
    outstandingOrders: 0,
    amountDue: 0,
    totalPaid: 0
  };
  cartItemCount = 0;
  loading = true;
  loadingInvoices = true;
  loadingAccount = true;

  constructor(
    private authService: AuthService,
    private invoicesService: InvoicesService,
    private clientsService: ClientsService,
    private cartService: CartService
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
    const totalRequests = 5; // Load client info, summary, recent invoices, all invoices, cart

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
        this.populateAccountInfo(); // Populate account info after client is loaded
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading client info:', error);
        // Still populate account info with default values even if client load fails
        this.populateAccountInfo();
        checkComplete();
      }
    });

    // Load client summary statistics (unpaid amount, invoice count, etc.)
    this.clientsService.getClientSummary(clientId).subscribe({
      next: (summary) => {
        this.clientSummary = summary;
        this.stats.totalInvoices = summary.invoicesCount;
        // Note: summary.unpaidTotal only includes ISSUED/SENT invoices
        // We'll calculate unpaid amount from all invoices below
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading client summary:', error);
        checkComplete();
      }
    });

    // Load recent invoices for this client (for display)
    this.clientsService.getClientInvoices(clientId, 1, 5).subscribe({
      next: (response) => {
        this.recentInvoices = response.data || [];
        this.loadingInvoices = false;
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading recent invoices:', error);
        this.recentInvoices = [];
        this.loadingInvoices = false;
        checkComplete();
      }
    });

    // Load ALL invoices for this client (for accurate statistics)
    this.clientsService.getClientInvoices(clientId, 1, 1000).subscribe({
      next: (response) => {
        const allInvoices = response.data || [];
        
        // Calculate outstanding orders (invoices with status QUOTE, ISSUED, or SENT)
        this.stats.outstandingOrders = allInvoices.filter(
          (invoice: any) => invoice.status === 'QUOTE' || invoice.status === 'ISSUED' || invoice.status === 'SENT'
        ).length;
        
        // Calculate amount due (invoices that are not PAID)
        const unpaidAmount = allInvoices
          .filter((invoice: any) => invoice.status !== 'PAID')
          .reduce((sum: number, invoice: any) => sum + parseFloat(invoice.grandTotal || '0'), 0);
        this.stats.amountDue = unpaidAmount.toString();
        
        // Calculate total paid (sum of paid invoices)
        const totalPaid = allInvoices
          .filter((invoice: any) => invoice.status === 'PAID')
          .reduce((sum: number, invoice: any) => sum + parseFloat(invoice.grandTotal || '0'), 0);
        this.stats.totalPaid = totalPaid.toString();
        
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading all invoices:', error);
        checkComplete();
      }
    });

    // Load cart items count
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cartItemCount = cart.items?.length || 0;
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.cartItemCount = 0;
        checkComplete();
      }
    });
  }

  populateAccountInfo(): void {
    this.loadingAccount = true;
    
    if (this.clientInfo) {
      this.accountInfo = [
        {
          label: 'Account Status',
          value: 'ACTIVE',
          status: 'active'
        },
        {
          label: 'Credit Limit',
          value: this.clientInfo.creditLimit ? `€${this.clientInfo.creditLimit.toFixed(2)}` : '€50,000.00',
          status: 'active'
        },
        {
          label: 'Payment Terms',
          value: this.clientInfo.paymentTerms || 'D30',
          status: 'active'
        },
        {
          label: 'Currency',
          value: this.clientInfo.preferredCurrency || 'BAM',
          status: 'active'
        }
      ];
    } else {
      this.accountInfo = [];
    }
    
    this.loadingAccount = false;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'QUOTE':
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