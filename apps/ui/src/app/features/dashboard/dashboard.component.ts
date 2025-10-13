import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  template: `
    <div class="dashboard-router">
      <div class="loading-container" *ngIf="loading">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  loading = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser) {
      this.routeToRoleDashboard();
    } else {
      // Subscribe to user changes if not immediately available
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.routeToRoleDashboard();
        } else {
          // If no user after subscription, redirect to login
          this.router.navigate(['/auth/login']);
        }
      });
    }
  }

  private routeToRoleDashboard(): void {
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Route based on user role
    switch (this.currentUser.role) {
      case 'EMPLOYEE':
        this.router.navigate(['/dashboard/employee']);
        break;
      case 'CLIENT_USER':
        this.router.navigate(['/dashboard/client']);
        break;
      case 'SUPPLIER_USER':
        this.router.navigate(['/dashboard/supplier']);
        break;
      default:
        // Fallback to employee dashboard for unknown roles
        this.router.navigate(['/dashboard/employee']);
        break;
    }
    
    // Hide loading after routing
    this.loading = false;
  }
}

