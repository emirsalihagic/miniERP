export interface ERPUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isEmailVerified: boolean;
  clientId?: string;
  supplierId?: string;
  createdAt: string;
  updatedAt?: string;
}

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  CLIENT_USER = 'CLIENT_USER',
  SUPPLIER_USER = 'SUPPLIER_USER',
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  clientId?: string;
  supplierId?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  password?: string;
  isEmailVerified?: boolean;
  clientId?: string;
  supplierId?: string;
}

export interface UsersResponse {
  data: ERPUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
