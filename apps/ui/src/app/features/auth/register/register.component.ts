import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzMessageModule,
    NzIconModule,
    NzCardModule,
    NzSelectModule
  ],
  template: `
    <div class="register-container">
      <nz-card class="register-card" [nzBordered]="true">
        <div class="register-header">
          <h1>miniERP</h1>
          <p>Create your account</p>
        </div>

        <form nz-form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          <!-- First Name Field -->
          <nz-form-item>
            <nz-form-label [nzRequired]="true">First Name</nz-form-label>
            <nz-form-control nzErrorTip="Please enter your first name">
              <nz-input-group nzPrefixIcon="user">
                <input
                  type="text"
                  nz-input
                  formControlName="firstName"
                  placeholder="Enter your first name"
                  autocomplete="given-name"
                />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <!-- Last Name Field -->
          <nz-form-item>
            <nz-form-label [nzRequired]="true">Last Name</nz-form-label>
            <nz-form-control nzErrorTip="Please enter your last name">
              <nz-input-group nzPrefixIcon="user">
                <input
                  type="text"
                  nz-input
                  formControlName="lastName"
                  placeholder="Enter your last name"
                  autocomplete="family-name"
                />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <!-- Email Field -->
          <nz-form-item>
            <nz-form-label [nzRequired]="true">Email</nz-form-label>
            <nz-form-control nzErrorTip="Please enter a valid email address">
              <nz-input-group nzPrefixIcon="mail">
                <input
                  type="email"
                  nz-input
                  formControlName="email"
                  placeholder="Enter your email"
                  autocomplete="email"
                />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <!-- Role Field -->
          <nz-form-item>
            <nz-form-label [nzRequired]="true">Role</nz-form-label>
            <nz-form-control nzErrorTip="Please select a role">
              <nz-select
                nzPlaceHolder="Select your role"
                formControlName="role"
                nzAllowClear
              >
                <nz-option nzValue="CLIENT" nzLabel="Client"></nz-option>
                <nz-option nzValue="SUPPLIER" nzLabel="Supplier"></nz-option>
                <nz-option nzValue="EMPLOYEE" nzLabel="Employee"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>

          <!-- Password Field -->
          <nz-form-item>
            <nz-form-label [nzRequired]="true">Password</nz-form-label>
            <nz-form-control nzErrorTip="Password must be at least 6 characters">
              <nz-input-group [nzSuffix]="suffixTemplate" nzPrefixIcon="lock">
                <input
                  [type]="passwordVisible ? 'text' : 'password'"
                  nz-input
                  formControlName="password"
                  placeholder="Enter your password"
                  autocomplete="new-password"
                />
              </nz-input-group>
              <ng-template #suffixTemplate>
                <span
                  nz-icon
                  [nzType]="passwordVisible ? 'eye-invisible' : 'eye'"
                  (click)="togglePasswordVisibility()"
                  class="password-toggle"
                ></span>
              </ng-template>
            </nz-form-control>
          </nz-form-item>

          <!-- Confirm Password Field -->
          <nz-form-item>
            <nz-form-label [nzRequired]="true">Confirm Password</nz-form-label>
            <nz-form-control nzErrorTip="Passwords do not match">
              <nz-input-group nzPrefixIcon="lock">
                <input
                  type="password"
                  nz-input
                  formControlName="confirmPassword"
                  placeholder="Confirm your password"
                  autocomplete="new-password"
                />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <!-- Submit Button -->
          <nz-form-item>
            <nz-form-control>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="!registerForm.valid || isLoading"
              >
                <span *ngIf="isLoading" class="spinner"></span>
                Create Account
              </button>
            </nz-form-control>
          </nz-form-item>

          <!-- Login Link -->
          <div class="login-link">
            Already have an account?
            <a routerLink="/auth/login">Sign in</a>
          </div>
        </form>
      </nz-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      width: 100%;
      max-width: 450px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    .register-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .register-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 8px;
    }

    .register-header p {
      color: #8c8c8c;
      font-size: 14px;
      margin: 0;
    }

    .register-form {
      width: 100%;
    }

    .password-toggle {
      cursor: pointer;
      color: #8c8c8c;
    }

    .password-toggle:hover {
      color: #667eea;
    }

    .login-link {
      text-align: center;
      margin-top: 16px;
      color: #8c8c8c;
    }

    .login-link a {
      color: #667eea;
      font-weight: 500;
      text-decoration: none;
      margin-left: 4px;
    }

    .login-link a:hover {
      color: #764ba2;
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  passwordVisible = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private message: NzMessageService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Component initialization
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { name, email, password } = this.registerForm.value;

      this.authService.register(name, email, password).subscribe({
        next: () => {
          this.message.success('Account created successfully!');
          this.router.navigate(['/dashboard']);
        },
        error: (error: { error: { message: any; }; }) => {
          this.isLoading = false;
          this.message.error(error.error?.message || 'Registration failed. Please try again.');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      Object.values(this.registerForm.controls).forEach(control => {
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
