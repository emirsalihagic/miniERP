import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-simple-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>miniERP</h1>
          <p>Sign in to your account</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <!-- Email Field -->
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="Enter your email"
              autocomplete="email"
              class="form-input"
            />
            <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.dirty" class="error">
              Please enter a valid email address
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-input">
              <input
                [type]="passwordVisible ? 'text' : 'password'"
                id="password"
                formControlName="password"
                placeholder="Enter your password"
                autocomplete="current-password"
                class="form-input"
              />
              <button
                type="button"
                (click)="togglePasswordVisibility()"
                class="password-toggle"
              >
                {{ passwordVisible ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.dirty" class="error">
              Password must be at least 6 characters
            </div>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="remember" />
              <span>Remember me</span>
            </label>
            <a routerLink="/auth/forgot-password" class="forgot-link">
              Forgot password?
            </a>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="!loginForm.valid || isLoading"
            class="submit-btn"
          >
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>

          <!-- Register Link -->
          <div class="register-link">
            Don't have an account?
            <a routerLink="/auth/register">Sign up</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 420px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .login-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 8px;
    }

    .login-header p {
      color: #8c8c8c;
      font-size: 14px;
      margin: 0;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #262626;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      font-size: 16px;
      transition: border-color 0.3s;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
    }

    .password-input {
      position: relative;
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
    }

    .error {
      color: #ff4d4f;
      font-size: 12px;
      margin-top: 4px;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .forgot-link {
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
    }

    .forgot-link:hover {
      color: #764ba2;
    }

    .submit-btn {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.3s;
    }

    .submit-btn:hover:not(:disabled) {
      background: #764ba2;
    }

    .submit-btn:disabled {
      background: #d9d9d9;
      cursor: not-allowed;
    }

    .register-link {
      text-align: center;
      margin-top: 16px;
      color: #8c8c8c;
    }

    .register-link a {
      color: #667eea;
      font-weight: 500;
      text-decoration: none;
      margin-left: 4px;
    }

    .register-link a:hover {
      color: #764ba2;
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
      remember: [true]
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
