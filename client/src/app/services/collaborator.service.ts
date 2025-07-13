import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Collaborator } from '../models/collaborator.model';
import { environment } from '../../environments/environment';

// Interfaces para el sistema de alertas
export interface AlertStatistics {
  totalCollaborators: number;
  collaboratorsWithEvents: number;
  pendingAlerts: number;
  completedTechOnboarding: number;
  lastCheck: string;
}

export interface AlertResponse {
  message: string;
  totalAlerts: number;
  checkDate: string;
  alertsSent: AlertInfo[];
}

export interface AlertInfo {
  collaboratorName: string;
  email: string;
  eventTitle: string;
  eventDate: string;
  daysUntil: string;
}

@Injectable({
  providedIn: 'root'
})
export class CollaboratorService {
  private apiUrl = `${environment.apiUrl}api/v1/collaborators`;
  constructor(private http: HttpClient) { }

  // ===========================
  // MÉTODOS EXISTENTES
  // ===========================

  /**
   * Obtiene todos los colaboradores del backend.
   */
  getCollaborators(): Observable<Collaborator[]> {
    return this.http.get<Collaborator[]>(this.apiUrl);
  }

  /**
   * Envía un nuevo colaborador al backend para ser creado.
   */
  createCollaborator(collaborator: Omit<Collaborator, 'id'>): Observable<Collaborator> {
    return this.http.post<Collaborator>(this.apiUrl, collaborator);
  }

  /**
   * Actualiza un colaborador existente en el backend.
   */
  updateCollaborator(id: number, collaborator: Collaborator): Observable<Collaborator> {
    return this.http.put<Collaborator>(`${this.apiUrl}/${id}`, collaborator);
  }

  /**
   * Elimina un colaborador del backend.
   */
  deleteCollaborator(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualiza el estado de un tipo de onboarding específico para un colaborador.
   */
  updateOnboardingStatus(id: number, onboardingType: string, status: boolean): Observable<any> {
    const body = { onboardingType, status };
    return this.http.patch(`${this.apiUrl}/${id}/status`, body);
  }

  // ===========================
  // MÉTODOS DEL SISTEMA DE ALERTAS
  // ===========================

  /**
   * Obtiene colaboradores que tienen eventos próximos (en 7 días o menos)
   */
  getCollaboratorsForAlerts(): Observable<Collaborator[]> {
    return this.http.get<Collaborator[]>(`${this.apiUrl}/alerts`);
  }

  /**
   * Envía alertas por correo (simulado) y retorna estadísticas
   */
  sendAlerts(): Observable<AlertResponse> {
    return this.http.post<AlertResponse>(`${this.apiUrl}/send-alerts`, {});
  }

  /**
   * Obtiene estadísticas del sistema de alertas
   */
  getAlertStatistics(): Observable<AlertStatistics> {
    return this.http.get<AlertStatistics>(`${this.apiUrl}/alert-statistics`);
  }
  checkEmailExists(email: string, excludeId?: number): Observable<boolean> {
    const params = excludeId ? `?excludeId=${excludeId}` : '';
    return this.http.get<boolean>(`${this.apiUrl}/check-email/${email}${params}`);
  }
}