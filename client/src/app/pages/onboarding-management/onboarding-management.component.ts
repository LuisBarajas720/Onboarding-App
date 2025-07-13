import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { OnboardingEvent } from '../../models/onboarding-event.model';
import { OnboardingEventService } from '../../services/onboarding-event.service';
import { CollaboratorService } from '../../services/collaborator.service';
import { PageHeaderComponent } from '../../layout/page-header/page-header.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { EventFormComponent } from '../../components/event-form/event-form.component';

@Component({
  selector: 'app-onboarding-management',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    ModalComponent,
    EventFormComponent
  ],
  templateUrl: './onboarding-management.component.html',
  styleUrls: ['./onboarding-management.component.css']
})
export class OnboardingManagementComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  events: OnboardingEvent[] = [];
  eventToEdit: OnboardingEvent | null = null;
  isModalOpen = false;
  participantCounts: { [eventId: number]: number } = {};

  constructor(
    private eventService: OnboardingEventService,
    private collaboratorService: CollaboratorService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEvents(): void {
    this.eventService.getEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          this.events = events;
          this.loadParticipantCounts();
        },
        error: (error) => {
          console.error('Error al cargar eventos:', error);
        }
      });
  }

  loadParticipantCounts(): void {
    // Cargar colaboradores y contar cuántos están asignados a cada evento
    this.collaboratorService.getCollaborators()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (collaborators) => {
          // Resetear contadores
          this.participantCounts = {};
          
          // Contar colaboradores por evento
          this.events.forEach(event => {
            if (event.id) {
              const count = collaborators.filter(collaborator => 
                collaborator.assignedTechOnboardingEvent === event.title
              ).length;
              this.participantCounts[event.id] = count;
            }
          });
        },
        error: (error) => {
          console.error('Error al cargar colaboradores:', error);
          // En caso de error, usar valores por defecto
          this.events.forEach(event => {
            if (event.id) {
              this.participantCounts[event.id] = 0;
            }
          });
        }
      });
  }

  openAddModal(): void {
    this.eventToEdit = null;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.eventToEdit = null;
  }

  onEdit(event: OnboardingEvent): void {
    this.eventToEdit = { ...event };
    this.isModalOpen = true;
  }

  onDelete(eventId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      this.eventService.deleteEvent(eventId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadEvents();
          },
          error: (error) => {
            console.error('Error al eliminar evento:', error);
          }
        });
    }
  }

  onFormSuccess(): void {
    this.loadEvents();
    this.closeModal();
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  formatDateRange(startDate: string, endDate: string): string {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const startFormatted = start.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit'
      });
      
      const endFormatted = end.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // Si es el mismo día, mostrar solo una fecha
      if (startDate === endDate) {
        return end.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      
      return `${startFormatted} - ${endFormatted}`;
    } catch (error) {
      return `${startDate} - ${endDate}`;
    }
  }

  getParticipantCount(eventId: number | undefined): number {
    return eventId ? (this.participantCounts[eventId] || 0) : 0;
  }
}