import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { AuthService, User } from '../../core/services/auth.service';
import { ProductsService } from '../products/services/products.service';
import { ClientsService } from '../clients/services/clients.service';
import { SuppliersService } from '../products/services/suppliers.service';
import { InvoicesService } from '../invoices/services/invoices.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzIconModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzButtonModule,
    NzSpinModule
  ],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.less']
})
export class EmployeeDashboardComponent implements OnInit {
  currentUser: User | null = null;
  stats = {
    products: 0,
    clients: 0,
    suppliers: 0,
    invoices: 0
  };
  loading = true;
  loadingActivity = true;
  loadingStatus = true;
  
  recentActivity: any[] = [];
  systemStatus: any[] = [];

  constructor(
    private authService: AuthService,
    private productsService: ProductsService,
    private clientsService: ClientsService,
    private suppliersService: SuppliersService,
    private invoicesService: InvoicesService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadStats();
    this.loadRecentActivity();
    this.loadSystemStatus();
  }

  loadStats(): void {
    this.loading = true;
    
    // Load products count
    this.productsService.getAll().subscribe({
      next: (response) => {
        this.stats.products = response.data.length;
        this.checkLoadingComplete();
      },
      error: () => {
        this.stats.products = 0;
        this.checkLoadingComplete();
      }
    });

    // Load clients count - get only active clients
    this.clientsService.getClients().subscribe({
      next: (response) => {
        // Filter for active clients only - note: API returns 'items' not 'data'
        this.stats.clients = response.items.filter(client => client.status === 'ACTIVE').length;
        this.checkLoadingComplete();
      },
      error: () => {
        this.stats.clients = 0;
        this.checkLoadingComplete();
      }
    });

    // Load suppliers count
    this.suppliersService.getAll().subscribe({
      next: (suppliers) => {
        this.stats.suppliers = suppliers.length;
        this.checkLoadingComplete();
      },
      error: () => {
        this.stats.suppliers = 0;
        this.checkLoadingComplete();
      }
    });

    // Load invoices count
    this.invoicesService.getAll().subscribe({
      next: (invoices) => {
        this.stats.invoices = invoices.length;
        this.checkLoadingComplete();
      },
      error: () => {
        this.stats.invoices = 0;
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    // Simple loading check - in a real app you'd want more sophisticated loading state
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  loadRecentActivity(): void {
    this.loadingActivity = true;
    this.http.get<any[]>(`${environment.apiUrl}/dashboard/recent-activity`).subscribe({
      next: (activities) => {
        this.recentActivity = activities;
        this.loadingActivity = false;
      },
      error: () => {
        this.recentActivity = [];
        this.loadingActivity = false;
      }
    });
  }

  loadSystemStatus(): void {
    this.loadingStatus = true;
    this.http.get<any[]>(`${environment.apiUrl}/dashboard/system-status`).subscribe({
      next: (statuses) => {
        this.systemStatus = statuses;
        this.loadingStatus = false;
      },
      error: () => {
        this.systemStatus = [];
        this.loadingStatus = false;
      }
    });
  }
}
