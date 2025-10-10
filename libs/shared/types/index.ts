// Shared TypeScript types between backend and frontend

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  CLIENT_USER = 'CLIENT_USER',
  SUPPLIER_USER = 'SUPPLIER_USER',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  SENT = 'SENT',
  PAID = 'PAID',
  VOID = 'VOID',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isEmailVerified: boolean;
  clientId?: string;
  supplierId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  unit: string;
  supplierId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pricing {
  id: string;
  productId: string;
  clientId?: string;
  supplierId?: string;
  price: number;
  currency: string;
  taxRate: number;
  discountPercent: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  status: InvoiceStatus;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  currency: string;
  issuedAt?: Date;
  sentAt?: Date;
  paidAt?: Date;
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountPercent: number;
  lineSubtotal: number;
  lineTax: number;
  lineDiscount: number;
  lineTotal: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

