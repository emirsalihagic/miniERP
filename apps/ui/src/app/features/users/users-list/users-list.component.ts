import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UserService } from '../services/user.service';
import { ERPUser, UserRole } from '../../../shared/interfaces/user.interface';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzTagModule,
    NzSpaceModule,
    NzGridModule,
    NzModalModule,
    NzMessageModule
  ],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.less'],
  providers: [DatePipe]
})
export class UsersListComponent implements OnInit {
  users: ERPUser[] = [];
  loading = false;
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  searchValue = '';

  userRole = UserRole;

  constructor(
    private userService: UserService,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.users = response.data;
        this.total = response.meta.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.message.error('Failed to load users');
        this.loading = false;
      }
    });
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.loadUsers();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.loadUsers();
  }

  createUser(): void {
    this.router.navigate(['/users/create']);
  }

  editUser(user: ERPUser): void {
    this.router.navigate(['/users/edit', user.id]);
  }

  deleteUser(user: ERPUser): void {
    this.modal.confirm({
      nzTitle: 'Delete User',
      nzContent: `Are you sure you want to delete user "${user.firstName} ${user.lastName}"?`,
      nzOkText: 'Delete',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.message.success('User deleted successfully');
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.message.error('Failed to delete user');
          }
        });
      }
    });
  }

  getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.EMPLOYEE:
        return 'Employee';
      case UserRole.CLIENT_USER:
        return 'Client User';
      case UserRole.SUPPLIER_USER:
        return 'Supplier User';
      default:
        return role;
    }
  }

  getRoleColor(role: UserRole): string {
    switch (role) {
      case UserRole.EMPLOYEE:
        return 'blue';
      case UserRole.CLIENT_USER:
        return 'green';
      case UserRole.SUPPLIER_USER:
        return 'orange';
      default:
        return 'default';
    }
  }
}
