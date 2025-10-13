import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AuthService, User } from '../../core/services/auth.service';
import { ProductsService } from '../products/services/products.service';
import { SuppliersService } from '../products/services/suppliers.service';

@Component({
  selector: 'app-supplier-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzIconModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzButtonModule
  ],
  templateUrl: './supplier-dashboard.component.html',
  styleUrls: ['./supplier-dashboard.component.less']
})
export class SupplierDashboardComponent implements OnInit {
  currentUser: User | null = null;
  stats = {
    myProducts: 0,
    activeOrders: 0,
    totalRevenue: 0,
    pendingDeliveries: 0
  };
  loading = true;

  constructor(
    private authService: AuthService,
    private productsService: ProductsService,
    private suppliersService: SuppliersService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    
    // Load products count (supplier's products)
    this.productsService.getAll().subscribe({
      next: (response) => {
        // In a real app, you'd filter by supplier
        this.stats.myProducts = response.data.length;
        this.checkLoadingComplete();
      },
      error: () => {
        this.stats.myProducts = 0;
        this.checkLoadingComplete();
      }
    });

    // Mock data for supplier-specific stats
    this.stats.activeOrders = 8;
    this.stats.totalRevenue = 45680;
    this.stats.pendingDeliveries = 5;
    this.checkLoadingComplete();
  }

  private checkLoadingComplete(): void {
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
}
