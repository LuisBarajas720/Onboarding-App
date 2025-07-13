import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AlertInfo {
  collaboratorName: string;
  email: string;
  eventTitle: string;
  eventDate: string;
  daysUntil: number;
}

export interface AlertResponse {
  checkDate: string;
  totalAlerts: number;
  alerts: AlertInfo[];
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private apiUrl = `${environment.apiUrl}api/v1/collaborators`;

  constructor(private http: HttpClient) {}

  /**
   * Verifica y envía alertas de onboarding técnico
   */
  checkAndSendAlerts(): Observable<AlertResponse> {
    return this.http.post<AlertResponse>(`${this.apiUrl}/check-alerts`, {});
  }
}