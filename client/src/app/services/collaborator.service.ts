import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Collaborator } from '../models/collaborator.model'; // <-- Importamos nuestro modelo

@Injectable({
  providedIn: 'root'
})
export class CollaboratorService {

  private apiUrl = 'http://localhost:8080/api/v1/collaborators'; // La URL de nuestra API

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los colaboradores del backend.
   * Retorna un Observable, que es el mecanismo de Angular para manejar operaciones asíncronas.
   */
  getCollaborators(): Observable<Collaborator[]> {
    return this.http.get<Collaborator[]>(this.apiUrl);
  }
  /**
   * Envía un nuevo colaborador al backend para ser creado.
   * @param collaborator El objeto colaborador a crear.
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

  
}