import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { OnboardingEvent } from '../../models/onboarding-event.model';
import { OnboardingEventService } from '../../services/onboarding-event.service';
import { CollaboratorService } from '../../services/collaborator.service';
import { PageHeaderComponent } from '../../layout/page-header/page-header.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { EventFormComponent } from '../../components/event-form/event-form.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-onboarding-management',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    ModalComponent,
    EventFormComponent,
    ConfirmDialogComponent
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

  // Propiedades para el modal de confirmación de eliminación
  showDeleteConfirmModal = false;
  private eventIdToDelete: number | null = null;
  deleteMessage = '';

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
    const participantCount = this.getParticipantCount(eventId);
    this.eventIdToDelete = eventId;
    
    // Personalizar el mensaje según si tiene colaboradores o no
    if (participantCount > 0) {
      this.deleteMessage = `¿Estás seguro de que quieres eliminar este evento? 
      
      ADVERTENCIA: Este evento tiene ${participantCount} colaborador(es) asignado(s). 
      Al eliminarlo, estos colaboradores quedarán sin evento técnico asignado.
      
      Esta acción no se puede deshacer.`;
    } else {
      this.deleteMessage = "¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.";
    }
    
    this.showDeleteConfirmModal = true;
  }
  
  closeDeleteModal(): void {
    this.showDeleteConfirmModal = false;
    this.eventIdToDelete = null;
  }

  handleDeleteConfirm(): void {
    if (this.eventIdToDelete === null) return;

    // Primero obtener el evento para conocer su título
    const eventToDelete = this.events.find(e => e.id === this.eventIdToDelete);
    if (!eventToDelete) {
      this.closeDeleteModal();
      return;
    }

    // Verificar si tiene colaboradores asignados
    const participantCount = this.getParticipantCount(this.eventIdToDelete);
    
    if (participantCount > 0) {
      // Primero desasignar todos los colaboradores de este evento
      this.collaboratorService.getCollaborators()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (collaborators) => {
            // Filtrar colaboradores que tienen este evento asignado
            const affectedCollaborators = collaborators.filter(c => 
              c.assignedTechOnboardingEvent === eventToDelete.title
            );

            // Desasignar el evento de todos los colaboradores afectados
            const updatePromises = affectedCollaborators.map(collaborator => 
              this.collaboratorService.updateCollaborator(collaborator.id, {
                ...collaborator,
                assignedTechOnboardingEvent: '' // Usar cadena vacía en lugar de null
              }).toPromise()
            );

            // Esperar a que todas las actualizaciones terminen
            Promise.all(updatePromises)
              .then(() => {
                // Ahora eliminar el evento
                this.deleteEventAfterCleanup();
              })
              .catch((error) => {
                console.error('Error al desasignar colaboradores:', error);
                this.closeDeleteModal();
              });
          },
          error: (error) => {
            console.error('Error al cargar colaboradores:', error);
            this.closeDeleteModal();
          }
        });
    } else {
      // Si no hay colaboradores, eliminar directamente
      this.deleteEventAfterCleanup();
    }
  }

  private deleteEventAfterCleanup(): void {
    if (this.eventIdToDelete === null) return;

    this.eventService.deleteEvent(this.eventIdToDelete)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadEvents();
          this.closeDeleteModal();
          console.log('Evento eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar evento:', error);
          this.closeDeleteModal();
        }
      });
  }

  onFormSuccess(): void {
    this.loadEvents();
    this.closeModal();
  }

  /**
   * Formatea fecha correctamente evitando problemas de zona horaria
   */
  formatDate(dateString: string): string {
    try {
      // Parsear fecha como local para evitar problemas de zona horaria
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return dateString;
    }
  }

  /**
   * Formatea rango de fechas correctamente evitando problemas de zona horaria
   */
  formatDateRange(startDate: string, endDate: string): string {
    try {
      // Parsear fechas como locales para evitar problemas de zona horaria
      const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
      const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
      
      const start = new Date(startYear, startMonth - 1, startDay);
      const end = new Date(endYear, endMonth - 1, endDay);
      
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
      console.error('Error al formatear rango de fechas:', error);
      return `${startDate} - ${endDate}`;
    }
  }

  getParticipantCount(eventId: number | undefined): number {
    return eventId ? (this.participantCounts[eventId] || 0) : 0;
  }
}