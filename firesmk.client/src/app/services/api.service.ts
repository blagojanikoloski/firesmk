import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://localhost:7273'

  constructor(private http: HttpClient) { }

  getCurrentWeather(latitude: number, longitude: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/map/weather?latitude=${latitude}&longitude=${longitude}`);
  }

  getNumberOfFiresToday(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/home/numberOfFiresToday`);
  }

  getFiresForDate(date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/map/firesForDate?date=${date}`);
  }
}
