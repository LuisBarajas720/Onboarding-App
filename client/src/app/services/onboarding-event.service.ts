import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OnboardingEvent } from '../models/onboarding-event.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OnboardingEventService {
  private apiUrl = `${environment.apiUrl}api/v1/onboarding-events`;
  constructor(private http: HttpClient) {}

  getEvents(): Observable<OnboardingEvent[]> {
    return this.http.get<OnboardingEvent[]>(this.apiUrl);
  }

  getEvent(id: number): Observable<OnboardingEvent> {
    return this.http.get<OnboardingEvent>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: OnboardingEvent): Observable<OnboardingEvent> {
    return this.http.post<OnboardingEvent>(this.apiUrl, event);
  }

  updateEvent(id: number, event: OnboardingEvent): Observable<OnboardingEvent> {
    return this.http.put<OnboardingEvent>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getActiveEvents(): Observable<OnboardingEvent[]> {
    return this.http.get<OnboardingEvent[]>(`${this.apiUrl}/active`);
  }
}