import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
  selector: 'app-simple-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzIconModule,
    NzButtonModule,
    NzInputModule,
    NzFormModule,
    NzCardModule,
    NzCheckboxModule,
    NzTypographyModule,
    NzSpaceModule,
    NzDividerModule
  ],
  template: `
    <div class="login-container">
      <div class="login-background">
        <div class="login-content">
          <nz-card class="login-card" [nzBordered]="false">
            <div class="login-header">
              <div class="logo-section">
                <span nz-icon nzType="appstore" class="logo-icon"></span>
                <h1 nz-typography nzTitle>miniERP</h1>
              </div>
              <p nz-typography nzType="secondary">Sign in to your account</p>
            </div>

            <nz-form [formGroup]="loginForm" (ngSubmit)="onSubmit()" nzLayout="vertical" class="login-form">
              <!-- Email Field -->
              <nz-form-item>
                <nz-form-label nzRequired>Email</nz-form-label>
                <nz-form-control nzErrorTip="Please enter a valid email address">
                  <input 
                    nz-input 
                    formControlName="email" 
                    placeholder="Enter your email"
                    autocomplete="email"
                    [nzSize]="'large'"
                  />
                </nz-form-control>
              </nz-form-item>

              <!-- Password Field -->
              <nz-form-item>
                <nz-form-label nzRequired>Password</nz-form-label>
                <nz-form-control nzErrorTip="Password must be at least 6 characters">
                  <nz-input-group [nzSuffix]="passwordToggle">
                    <input 
                      nz-input 
                      [type]="passwordVisible ? 'text' : 'password'"
                      formControlName="password" 
                      placeholder="Enter your password"
                      autocomplete="current-password"
                      [nzSize]="'large'"
                    />
                    <ng-template #passwordToggle>
                      <span 
                        nz-icon 
                        [nzType]="passwordVisible ? 'eye' : 'eye-invisible'"
                        (click)="togglePasswordVisibility()"
                        class="password-toggle-icon"
                      ></span>
                    </ng-template>
                  </nz-input-group>
                </nz-form-control>
              </nz-form-item>

              <!-- Remember Me & Forgot Password -->
              <nz-form-item>
                <div class="form-options">
                  <label nz-checkbox formControlName="remember">
                    Remember me
                  </label>
                  <a routerLink="/auth/forgot-password" class="forgot-link">
                    Forgot password?
                  </a>
                </div>
              </nz-form-item>

              <!-- Submit Button -->
              <nz-form-item>
                <button 
                  nz-button 
                  nzType="primary" 
                  nzSize="large" 
                  nzBlock
                  [nzLoading]="isLoading"
                  [disabled]="!loginForm.valid"
                  type="submit"
                >
                  {{ isLoading ? 'Signing in...' : 'Sign In' }}
                </button>
              </nz-form-item>
            </nz-form>

            <nz-divider nzText="Welcome to miniERP"></nz-divider>
            
            <div class="login-footer">
              <p nz-typography nzType="secondary" nzAlign="center">
                Trust Blue Theme • Modern ERP Solution
              </p>
            </div>
          </nz-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--trust-blue-gradient, linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%));
      padding: 20px;
    }

    .login-background {
      width: 100%;
      max-width: 400px;
      position: relative;
    }

    .login-content {
      position: relative;
      z-index: 1;
    }

    .login-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
      padding: 24px 24px 0;
    }

    .logo-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .logo-icon {
      font-size: 32px;
      color: var(--trust-blue-primary, #3b82f6);
    }

    .login-form {
      padding: 0 24px 24px;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .password-toggle-icon {
      cursor: pointer;
      color: var(--trust-blue-text-secondary, #6b7280);
      transition: color 0.3s ease;
    }

    .password-toggle-icon:hover {
      color: var(--trust-blue-primary, #3b82f6);
    }

    .forgot-link {
      color: var(--trust-blue-primary, #3b82f6);
      text-decoration: none;
      font-size: 14px;
      transition: color 0.3s ease;
    }

    .forgot-link:hover {
      color: var(--trust-blue-primary-dark, #1e40af);
      text-decoration: underline;
    }

    .login-footer {
      padding: 16px 24px 24px;
      text-align: center;
    }

    /* Trust Blue Theme Variables */
    :host {
      --trust-blue-primary: #3b82f6;
      --trust-blue-primary-dark: #1e40af;
      --trust-blue-primary-light: #60a5fa;
      --trust-blue-secondary: #1e3a8a;
      --trust-blue-accent: #06b6d4;
      --trust-blue-text-primary: #1f2937;
      --trust-blue-text-secondary: #6b7280;
      --trust-blue-background: #f8fafc;
      --trust-blue-surface: #ffffff;
      --trust-blue-border: #e5e7eb;
      --trust-blue-gradient: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%);
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
      .login-card {
        background: rgba(30, 41, 59, 0.95);
        border: 1px solid rgba(71, 85, 105, 0.3);
      }
      
      :host {
        --trust-blue-text-primary: #f1f5f9;
        --trust-blue-text-secondary: #94a3b8;
        --trust-blue-background: #0f172a;
        --trust-blue-surface: #1e293b;
        --trust-blue-border: #334155;
      }
    }

    /* Responsive design */
    @media (max-width: 480px) {
      .login-container {
        padding: 16px;
      }
      
      .login-card {
        border-radius: 12px;
      }
      
      .login-header {
        padding: 20px 20px 0;
        margin-bottom: 24px;
      }
      
      .login-form {
        padding: 0 20px 20px;
      }
      
      .login-footer {
        padding: 12px 20px 20px;
      }
    }

    /* Animation for smooth appearance */
    .login-card {
      animation: slideUp 0.6s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class SimpleLoginComponent {
  loginForm: FormGroup;
  passwordVisible = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password, remember } = this.loginForm.value;

      this.http.post(`${environment.apiUrl}/auth/login`, { email, password }).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          console.log('Login successful:', response);
          // Store tokens
          if (remember) {
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
          } else {
            sessionStorage.setItem('access_token', response.access_token);
            sessionStorage.setItem('user', JSON.stringify(response.user));
          }
          this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Login failed:', error);
          alert(error.error?.message || 'Login failed. Please check your credentials.');
        }
      });
    } else {
      Object.values(this.loginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}
