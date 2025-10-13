import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Unit {
  id: string;
  code: string;
  name: string;
  group: 'WEIGHT' | 'VOLUME' | 'LENGTH' | 'COUNT';
  isBase: boolean;
  toBaseFactor: number;
  createdAt: string;
  updatedAt: string;
}

export interface UnitConversionRequest {
  from: string;
  to: string;
  qty: number;
}

export interface UnitConversionResponse {
  from: string;
  to: string;
  qty: number;
  result: number;
}

export interface CreateUnitDto {
  code: string;
  name: string;
  group: 'WEIGHT' | 'VOLUME' | 'LENGTH' | 'COUNT';
  isBase?: boolean;
  toBaseFactor: number;
}

@Injectable({
  providedIn: 'root',
})
export class UnitsService {
  private apiUrl = `${environment.apiUrl}/units`;

  constructor(private http: HttpClient) {}

  /**
   * Get all units
   */
  getAll(): Observable<Unit[]> {
    return this.http.get<Unit[]>(this.apiUrl);
  }

  /**
   * Get a single unit by ID
   */
  getById(id: string): Observable<Unit> {
    return this.http.get<Unit>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new unit
   */
  create(unit: CreateUnitDto): Observable<Unit> {
    return this.http.post<Unit>(this.apiUrl, unit);
  }

  /**
   * Update an existing unit
   */
  update(id: string, unit: Partial<CreateUnitDto>): Observable<Unit> {
    return this.http.put<Unit>(`${this.apiUrl}/${id}`, unit);
  }

  /**
   * Delete a unit
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Convert quantity between units
   */
  convert(request: UnitConversionRequest): Observable<UnitConversionResponse> {
    const params = new HttpParams()
      .set('from', request.from)
      .set('to', request.to)
      .set('qty', request.qty.toString());
    
    return this.http.get<UnitConversionResponse>(`${this.apiUrl}/convert`, { params });
  }

  /**
   * Get units by group
   */
  getUnitsByGroup(group: string): Observable<Unit[]> {
    const params = new HttpParams().set('group', group);
    return this.http.get<Unit[]>(this.apiUrl, { params });
  }

  /**
   * Get base units only
   */
  getBaseUnits(): Observable<Unit[]> {
    const params = new HttpParams().set('isBase', 'true');
    return this.http.get<Unit[]>(this.apiUrl, { params });
  }
}
