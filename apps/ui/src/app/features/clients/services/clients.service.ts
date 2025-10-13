import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  Client, 
  ClientListResponse, 
  ClientQueryParams, 
  CreateClientRequest, 
  UpdateClientRequest
} from '../../../shared/interfaces/client.interface';
import { ClientSummary } from '../../../shared/interfaces/client.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private readonly apiUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  getClients(params?: ClientQueryParams): Observable<ClientListResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof ClientQueryParams];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ClientListResponse>(this.apiUrl, { params: httpParams });
  }

  getClientById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  createClient(client: CreateClientRequest): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  updateClient(id: string, client: UpdateClientRequest): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrl}/${id}`, client);
  }

  deleteClient(id: string): Observable<Client> {
    return this.http.delete<Client>(`${this.apiUrl}/${id}`);
  }

  getClientSummary(id: string): Observable<ClientSummary> {
    return this.http.get<ClientSummary>(`${this.apiUrl}/${id}/summary`);
  }

  getClientInvoices(id: string, page?: number, limit?: number): Observable<any> {
    let httpParams = new HttpParams();
    if (page) httpParams = httpParams.set('page', page.toString());
    if (limit) httpParams = httpParams.set('limit', limit.toString());
    
    return this.http.get<any>(`${this.apiUrl}/${id}/invoices`, { params: httpParams });
  }
}
