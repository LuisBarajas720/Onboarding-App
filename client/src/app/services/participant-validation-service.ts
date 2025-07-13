import { Injectable } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { CollaboratorService } from './collaborator.service';
import { OnboardingEventService } from './onboarding-event.service';
import { Collaborator } from '../models/collaborator.model';
import { OnboardingEvent } from '../models/onboarding-event.model';

export interface ParticipantValidationResult {
  isValid: boolean;
  message: string;
  currentParticipants: number;
  maxParticipants: number;
  availableSpots: number;
}

export interface EventParticipantInfo {
  eventTitle: string;
  currentParticipants: number;
  maxParticipants: number;
  availableSpots: number;
  isAtCapacity: boolean;
  collaborators: Collaborator[];
}

@Injectable({
  providedIn: 'root'
})
export class ParticipantValidationService {

  constructor(
    private collaboratorService: CollaboratorService,
    private eventService: OnboardingEventService
  ) {}

  /**
   * Valida si se puede asignar un colaborador a un evento específico
   */
  validateEventAssignment(eventTitle: string, excludeCollaboratorId?: number): Observable<ParticipantValidationResult> {
    return combineLatest([
      this.collaboratorService.getCollaborators(),
      this.eventService.getEvents()
    ]).pipe(
      map(([collaborators, events]) => {
        // Encontrar el evento
        const event = events.find(e => e.title === eventTitle);
        if (!event) {
          return {
            isValid: false,
            message: 'Evento no encontrado',
            currentParticipants: 0,
            maxParticipants: 0,
            availableSpots: 0
          };
        }

        // Contar participantes actuales (excluyendo el colaborador actual si es edición)
        const currentParticipants = collaborators.filter(c => 
          c.assignedTechOnboardingEvent === eventTitle && 
          c.id !== excludeCollaboratorId
        ).length;

        const availableSpots = event.maxParticipants - currentParticipants;
        const isValid = availableSpots > 0;

        let message = '';
        if (!isValid) {
          message = `El evento "${eventTitle}" ha alcanzado su capacidad máxima de ${event.maxParticipants} participantes`;
        } else if (availableSpots === 1) {
          message = `Último lugar disponible en "${eventTitle}"`;
        } else {
          message = `${availableSpots} lugares disponibles en "${eventTitle}"`;
        }

        return {
          isValid,
          message,
          currentParticipants,
          maxParticipants: event.maxParticipants,
          availableSpots
        };
      })
    );
  }

  /**
   * Obtiene información de participantes para todos los eventos
   */
  getAllEventsParticipantInfo(): Observable<EventParticipantInfo[]> {
    return combineLatest([
      this.collaboratorService.getCollaborators(),
      this.eventService.getEvents()
    ]).pipe(
      map(([collaborators, events]) => {
        return events.map(event => {
          const eventCollaborators = collaborators.filter(c => 
            c.assignedTechOnboardingEvent === event.title
          );
          
          const currentParticipants = eventCollaborators.length;
          const availableSpots = event.maxParticipants - currentParticipants;
          
          return {
            eventTitle: event.title,
            currentParticipants,
            maxParticipants: event.maxParticipants,
            availableSpots,
            isAtCapacity: availableSpots <= 0,
            collaborators: eventCollaborators
          };
        });
      })
    );
  }

  /**
   * Obtiene información de participantes para un evento específico
   */
  getEventParticipantInfo(eventTitle: string): Observable<EventParticipantInfo | null> {
    return this.getAllEventsParticipantInfo().pipe(
      map(eventsInfo => eventsInfo.find(info => info.eventTitle === eventTitle) || null)
    );
  }

  /**
   * Valida si un evento puede aceptar más participantes
   */
  canAcceptMoreParticipants(eventTitle: string): Observable<boolean> {
    return this.validateEventAssignment(eventTitle).pipe(
      map(result => result.isValid)
    );
  }

  /**
   * Obtiene eventos disponibles (que no estén llenos)
   */
  getAvailableEvents(): Observable<OnboardingEvent[]> {
    return combineLatest([
      this.collaboratorService.getCollaborators(),
      this.eventService.getActiveEvents()
    ]).pipe(
      map(([collaborators, events]) => {
        return events.filter(event => {
          const currentParticipants = collaborators.filter(c => 
            c.assignedTechOnboardingEvent === event.title
          ).length;
          
          return currentParticipants < event.maxParticipants;
        });
      })
    );
  }
}