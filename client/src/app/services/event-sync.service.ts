// event-sync.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OnboardingEvent } from '../models/onboarding-event.model';

@Injectable({
  providedIn: 'root'
})
export class EventSyncService {
  private eventsSubject = new BehaviorSubject<OnboardingEvent[]>([]);
  
  // Observable para que los componentes se suscriban a cambios
  public events$ = this.eventsSubject.asObservable();

  constructor() {}

  // Actualizar la lista de eventos y notificar a todos los componentes suscritos
  updateEvents(events: OnboardingEvent[]): void {
    this.eventsSubject.next(events);
  }

  // Obtener los eventos actuales
  getCurrentEvents(): OnboardingEvent[] {
    return this.eventsSubject.value;
  }

  // Agregar un evento nuevo
  addEvent(event: OnboardingEvent): void {
    const currentEvents = this.getCurrentEvents();
    const updatedEvents = [...currentEvents, event];
    this.updateEvents(updatedEvents);
  }

  // Actualizar un evento existente
  updateEvent(updatedEvent: OnboardingEvent): void {
    const currentEvents = this.getCurrentEvents();
    const eventIndex = currentEvents.findIndex(e => e.id === updatedEvent.id);
    
    if (eventIndex !== -1) {
      const updatedEvents = [...currentEvents];
      updatedEvents[eventIndex] = updatedEvent;
      this.updateEvents(updatedEvents);
    }
  }

  // Eliminar un evento
  removeEvent(eventId: number): void {
    const currentEvents = this.getCurrentEvents();
    const updatedEvents = currentEvents.filter(e => e.id !== eventId);
    this.updateEvents(updatedEvents);
  }
}