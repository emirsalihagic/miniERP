import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserService } from '../services/user.service';
import { ERPUser, UserRole, CreateUserRequest, UpdateUserRequest } from '../../../shared/interfaces/user.interface';
import { CanComponentDeactivate } from '../../../core/guards/pending-changes.guard';
import { NavigationService } from '../../../core/services/navigation.service';
import { ClientsService } from '../../clients/services/clients.service';
import { SuppliersService } from '../../products/services/suppliers.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzCheckboxModule,
    NzGridModule,
    NzMessageModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.less']
})
export class UserFormComponent implements OnInit, CanComponentDeactivate {
  form!: FormGroup;
  loading = false;
  isEditMode = false;
  userId?: string;
  user?: ERPUser;

  // Data for dropdowns
  clients: any[] = [];
  suppliers: any[] = [];

  userRole = UserRole;
  roleOptions = [
    { label: 'Employee', value: UserRole.EMPLOYEE },
    { label: 'Client User', value: UserRole.CLIENT_USER },
    { label: 'Supplier User', value: UserRole.SUPPLIER_USER }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
    private navigationService: NavigationService,
    private clientsService: ClientsService,
    private suppliersService: SuppliersService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      this.isEditMode = !!this.userId;
      
      // Update password validation based on edit mode
      this.updatePasswordValidation();
      
      if (this.isEditMode) {
        this.loadUser();
      }
    });
    
    // Load clients and suppliers for dropdowns
    this.loadClients();
    this.loadSuppliers();
  }

  updatePasswordValidation(): void {
    const passwordControl = this.form.get('password');
    if (passwordControl) {
      if (this.isEditMode) {
        // In edit mode, password is optional
        passwordControl.clearValidators();
        passwordControl.setValidators([Validators.minLength(6)]);
      } else {
        // In create mode, password is required
        passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
      }
      passwordControl.updateValueAndValidity();
    }
  }

  createForm(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]], // Remove required validator initially
      role: [UserRole.EMPLOYEE, [Validators.required]],
      clientId: [''],
      supplierId: [''],
      isEmailVerified: [false]
    });

    // Watch for role changes to show/hide client/supplier fields
    this.form.get('role')?.valueChanges.subscribe(role => {
      this.onRoleChange(role);
    });
  }

  loadUser(): void {
    if (!this.userId) return;

    this.loading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          clientId: user.clientId || '',
          supplierId: user.supplierId || '',
          isEmailVerified: user.isEmailVerified
        });
        
        // Mark form as pristine after loading data to prevent false "unsaved changes" warnings
        this.form.markAsPristine();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.message.error('Failed to load user');
        this.loading = false;
      }
    });
  }

  onRoleChange(role: UserRole): void {
    const clientControl = this.form.get('clientId');
    const supplierControl = this.form.get('supplierId');

    // Clear both fields when role changes
    clientControl?.setValue('');
    supplierControl?.setValue('');

    // Set validators based on role
    if (role === UserRole.CLIENT_USER) {
      clientControl?.setValidators([Validators.required]);
      supplierControl?.clearValidators();
    } else if (role === UserRole.SUPPLIER_USER) {
      supplierControl?.setValidators([Validators.required]);
      clientControl?.clearValidators();
    } else {
      clientControl?.clearValidators();
      supplierControl?.clearValidators();
    }

    clientControl?.updateValueAndValidity();
    supplierControl?.updateValueAndValidity();
  }

  loadClients(): void {
    this.clientsService.getClients().subscribe({
      next: (response: any) => {
        this.clients = response.items || response.data || response;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
      }
    });
  }

  loadSuppliers(): void {
    this.suppliersService.getAll().subscribe({
      next: (suppliers: any) => {
        this.suppliers = suppliers;
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      const formValue = this.form.value;

      if (this.isEditMode && this.userId) {
        const updateData: UpdateUserRequest = {
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          isEmailVerified: formValue.isEmailVerified,
          clientId: formValue.clientId || null,
          supplierId: formValue.supplierId || null
        };

        // Include password only if it's provided and not empty
        if (formValue.password && formValue.password.trim() !== '') {
          updateData.password = formValue.password;
        }

        this.userService.updateUser(this.userId, updateData).subscribe({
          next: () => {
            this.message.success('User updated successfully');
            // Mark form as pristine after successful update
            this.form.markAsPristine();
            this.navigationService.navigateToListPage();
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.message.error('Failed to update user');
            this.loading = false;
          }
        });
      } else {
        const createData: CreateUserRequest = {
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          password: formValue.password,
          role: formValue.role,
          clientId: formValue.clientId || null,
          supplierId: formValue.supplierId || null
        };

        this.userService.createUser(createData).subscribe({
          next: () => {
            this.message.success('User created successfully');
            // Mark form as pristine after successful creation
            this.form.markAsPristine();
            this.navigationService.navigateToListPage();
          },
          error: (error) => {
            console.error('Error creating user:', error);
            this.message.error('Failed to create user');
            this.loading = false;
          }
        });
      }
    } else {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  onCancel(): void {
    console.log('UserFormComponent: onCancel called');
    // Use navigation service for consistent behavior
    this.navigationService.navigateToListPage();
  }

  getTitle(): string {
    return this.isEditMode ? 'Edit User' : 'Create User';
  }

  canDeactivate(): boolean {
    // Only block if form is dirty AND we're not in the middle of a successful operation
    // This prevents blocking when form is marked dirty due to initialization or validation updates
    const hasUnsavedChanges = this.form.dirty && !this.loading;
    
    console.log('UserFormComponent: canDeactivate called', {
      formDirty: this.form.dirty,
      loading: this.loading,
      hasUnsavedChanges: hasUnsavedChanges
    });
    
    return !hasUnsavedChanges;
  }
}
