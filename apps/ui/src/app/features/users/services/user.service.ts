import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ERPUser, CreateUserRequest, UpdateUserRequest, UsersResponse } from '../../../shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(page: number = 1, limit: number = 10): Observable<UsersResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<UsersResponse>(this.apiUrl, { params });
  }

  getUserById(id: string): Observable<ERPUser> {
    return this.http.get<ERPUser>(`${this.apiUrl}/${id}`);
  }

  createUser(user: CreateUserRequest): Observable<ERPUser> {
    return this.http.post<ERPUser>(this.apiUrl, user);
  }

  updateUser(id: string, user: UpdateUserRequest): Observable<ERPUser> {
    return this.http.put<ERPUser>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
