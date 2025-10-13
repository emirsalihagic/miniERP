export interface Client {
  id: string;
  name: string;
  type: ClientType;
  contactPerson?: string;
  email: string;
  phone?: string;
  website?: string;
  taxNumber?: string;
  billingStreet?: string;
  billingCity?: string;
  billingZip?: string;
  billingCountry?: string;
  paymentTerms: PaymentTerms;
  preferredCurrency: Currency;
  creditLimit: number;
  status: ClientStatus;
  leadSource?: string;
  lastContactedAt?: string;
  nextFollowupAt?: string;
  tags: string[];
  clientCode?: string;
  assignedToId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  users?: any[];
  invoices?: any[];
}

export interface ClientSummary {
  invoicesCount: number;
  unpaidTotal: number;
  lastInvoiceAt?: string;
  lastInvoiceId?: string;
  lastInvoiceNumber?: string;
}

export interface ClientQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  q?: string;
  status?: ClientStatus;
  city?: string;
  assignedToId?: string;
  tags?: string;
}

export interface ClientListResponse {
  items: Client[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export enum ClientType {
  INDIVIDUAL = 'INDIVIDUAL',
  COMPANY = 'COMPANY'
}

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PROSPECT = 'PROSPECT'
}

export enum PaymentTerms {
  ON_RECEIPT = 'ON_RECEIPT',
  D7 = 'D7',
  D15 = 'D15',
  D30 = 'D30',
  D45 = 'D45',
  D60 = 'D60'
}

export enum Currency {
  BAM = 'BAM',
  EUR = 'EUR',
  USD = 'USD'
}

export interface CreateClientRequest {
  name: string;
  type?: ClientType;
  contactPerson?: string;
  email: string;
  phone?: string;
  website?: string;
  taxNumber?: string;
  billingStreet?: string;
  billingCity?: string;
  billingZip?: string;
  billingCountry?: string;
  paymentTerms?: PaymentTerms;
  preferredCurrency?: Currency;
  creditLimit?: number;
  status?: ClientStatus;
  leadSource?: string;
  lastContactedAt?: string;
  nextFollowupAt?: string;
  tags?: string[];
  clientCode?: string;
  assignedToId?: string;
  notes?: string;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {}

export interface ClientListResponse {
  data: Client[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ClientQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: ClientType;
  status?: ClientStatus;
  assignedToId?: string;
}
