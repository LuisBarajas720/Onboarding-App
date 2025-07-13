import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgClass} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { Collaborator } from '../../models/collaborator.model';
import { OnboardingEvent } from '../../models/onboarding-event.model';
import { CollaboratorService } from '../../services/collaborator.service';
import { OnboardingEventService } from '../../services/onboarding-event.service';
import { CollaboratorFormComponent } from '../../components/collaborator-form/collaborator-form.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../layout/page-header/page-header.component';

// Interfaces para mejor tipado
interface Statistics {
  total: number;
  welcomeCompleted: number;
  techCompleted: number;
  pending: number;
}

type SortKey = keyof Collaborator;
type SortDirection = 'asc' | 'desc';
type FilterStatus = 'all' | 'completed' | 'pending';
type OnboardingType = 'welcome' | 'tech';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CollaboratorFormComponent, 
    ModalComponent, 
    NgClass, 
    ConfirmDialogComponent,
    PageHeaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // ===========================
  // PROPIEDADES DE DATOS
  // ===========================
  private readonly destroy$ = new Subject<void>();
  private masterCollaborators: Collaborator[] = [];
  public collaborators: Collaborator[] = [];
  private eventColors: { [key: string]: string } = {};
  private onboardingEvents: OnboardingEvent[] = [];

  // ===========================
  // PROPIEDADES DE UI
  // ===========================
  public collaboratorToEdit: Collaborator | null = null;
  public isModalOpen = false;
  public showDeleteConfirmModal = false;
  private collaboratorIdToDelete: number | null = null;

  // ===========================
  // PROPIEDADES DE FILTROS Y ORDENAMIENTO
  // ===========================
  public welcomeFilter: FilterStatus = 'all';
  public techFilter: FilterStatus = 'all';
  public searchTerm = '';
  public sortKey: SortKey = 'fullName';
  public sortDirection: SortDirection = 'asc';

  // ===========================
  // CONSTRUCTOR E INICIALIZACIÓN
  // ===========================
  constructor(
    private collaboratorService: CollaboratorService,
    private onboardingEventService: OnboardingEventService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===========================
  // MÉTODOS DE CARGA DE DATOS
  // ===========================

  /**
   * Carga colaboradores y eventos simultáneamente
   */
  private loadInitialData(): void {
    forkJoin({
      collaborators: this.collaboratorService.getCollaborators(),
      events: this.onboardingEventService.getEvents()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ collaborators, events }) => {
        this.masterCollaborators = collaborators;
        this.onboardingEvents = events;
        this.buildEventColorsMap();
        this.applySortersAndFilters();
      },
      error: (error) => {
        console.error('Error al cargar datos iniciales:', error);
        // Cargar solo colaboradores si falla la carga de eventos
        this.loadCollaboratorsOnly();
      }
    });
  }

  /**
   * Carga solo colaboradores (fallback)
   */
  public loadCollaborators(): void {
    this.collaboratorService.getCollaborators()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.masterCollaborators = data;
          this.applySortersAndFilters();
        },
        error: (error) => {
          console.error('Error al cargar colaboradores:', error);
        }
      });
  }

  /**
   * Carga solo colaboradores sin eventos
   */
  private loadCollaboratorsOnly(): void {
    this.collaboratorService.getCollaborators()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.masterCollaborators = data;
          this.applySortersAndFilters();
        },
        error: (error) => {
          console.error('Error al cargar colaboradores:', error);
        }
      });
  }

  /**
   * Construye el mapa de colores desde los eventos reales
   */
  private buildEventColorsMap(): void {
    this.eventColors = {};
    this.onboardingEvents.forEach(event => {
      if (event.title && event.color) {
        this.eventColors[event.title] = event.color;
      }
    });
  }

  /**
   * Recarga los datos de eventos para sincronizar colores
   */
  public refreshEventColors(): void {
    this.onboardingEventService.getEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          this.onboardingEvents = events;
          this.buildEventColorsMap();
          // No necesitamos aplicar filtros, solo actualizar colores
        },
        error: (error) => {
          console.error('Error al actualizar colores de eventos:', error);
        }
      });
  }

  // ===========================
  // MÉTODOS DE FILTRADO Y ORDENAMIENTO
  // ===========================
  public applySortersAndFilters(): void {
    let processedList = [...this.masterCollaborators];

    // Aplicar filtros
    processedList = this.applyFilters(processedList);
    
    // Aplicar ordenamiento
    processedList = this.applySorting(processedList);

    this.collaborators = processedList;
  }

  private applyFilters(list: Collaborator[]): Collaborator[] {
    return list.filter(collaborator => {
      // Filtro de búsqueda
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const matchesSearch = 
          collaborator.fullName.toLowerCase().includes(searchLower) ||
          collaborator.email.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filtro de onboarding de bienvenida
      if (this.welcomeFilter !== 'all') {
        const isCompleted = this.welcomeFilter === 'completed';
        if (collaborator.welcomeOnboardingStatus !== isCompleted) return false;
      }

      // Filtro de onboarding técnico
      if (this.techFilter !== 'all') {
        const isCompleted = this.techFilter === 'completed';
        if (collaborator.techOnboardingStatus !== isCompleted) return false;
      }

      return true;
    });
  }

  private applySorting(list: Collaborator[]): Collaborator[] {
    return list.sort((a, b) => {
      let valueA = a[this.sortKey] ?? '';
      let valueB = b[this.sortKey] ?? '';

      // Conversión a string para comparación uniforme
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      // Comparación
      let comparison = 0;
      if (valueA > valueB) {
        comparison = 1;
      } else if (valueA < valueB) {
        comparison = -1;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  public setSort(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
    this.applySortersAndFilters();
  }

  public toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applySortersAndFilters();
  }

  public clearFilters(): void {
    this.welcomeFilter = 'all';
    this.techFilter = 'all';
    this.searchTerm = '';
    this.applySortersAndFilters();
  }

  public hasActiveFilters(): boolean {
    return this.welcomeFilter !== 'all' || 
           this.techFilter !== 'all' || 
           this.searchTerm.trim() !== '';
  }

  // ===========================
  // MÉTODOS DE COLORES DE EVENTOS
  // ===========================

  /**
   * Obtiene el color del evento desde el mapa construido con datos reales
   */
  public getEventColor(eventTitle: string | null): string | null {
    if (!eventTitle) return null;
    return this.eventColors[eventTitle] || '#6b7280'; // Color gris por defecto
  }

  /**
   * Obtiene información completa del evento
   */
  public getEventInfo(eventTitle: string | null): OnboardingEvent | null {
    if (!eventTitle) return null;
    return this.onboardingEvents.find(event => event.title === eventTitle) || null;
  }

  /**
   * Verifica si un evento existe y está activo
   */
  public isEventActive(eventTitle: string | null): boolean {
    if (!eventTitle) return false;
    const event = this.getEventInfo(eventTitle);
    return event ? event.isActive : false;
  }

  // ===========================
  // MÉTODOS DE ESTADÍSTICAS
  // ===========================
  public getStatistics(): Statistics {
    const total = this.masterCollaborators.length;
    const welcomeCompleted = this.masterCollaborators.filter(c => c.welcomeOnboardingStatus).length;
    const techCompleted = this.masterCollaborators.filter(c => c.techOnboardingStatus).length;
    const pending = this.masterCollaborators.filter(c => 
      !c.welcomeOnboardingStatus || !c.techOnboardingStatus
    ).length;

    return {
      total,
      welcomeCompleted,
      techCompleted,
      pending
    };
  }

  // ===========================
  // MÉTODOS DE GESTIÓN DE MODALES
  // ===========================
  public openAddModal(): void {
    this.collaboratorToEdit = null;
    this.isModalOpen = true;
  }

  public closeModal(): void {
    this.isModalOpen = false;
    this.collaboratorToEdit = null;
  }

  public closeDeleteModal(): void {
    this.showDeleteConfirmModal = false;
    this.collaboratorIdToDelete = null;
  }

  // ===========================
  // MÉTODOS DE ACCIONES DE TABLA
  // ===========================
  public onEdit(collaborator: Collaborator): void {
    this.collaboratorToEdit = { ...collaborator }; // Clonar para evitar mutaciones
    this.isModalOpen = true;
  }

  public onDelete(id: number): void {
    this.collaboratorIdToDelete = id;
    this.showDeleteConfirmModal = true;
  }

  public handleDeleteConfirm(): void {
    if (this.collaboratorIdToDelete === null) return;

    this.collaboratorService.deleteCollaborator(this.collaboratorIdToDelete)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadCollaborators();
          this.closeDeleteModal();
        },
        error: (error) => {
          console.error('Error al eliminar colaborador:', error);
          this.closeDeleteModal();
        }
      });
  }

  public onFormSubmitSuccess(): void {
    this.loadCollaborators();
    this.closeModal();
  }

  public onStatusChange(collaborator: Collaborator, type: OnboardingType): void {
    const currentStatus = type === 'welcome' 
      ? collaborator.welcomeOnboardingStatus 
      : collaborator.techOnboardingStatus;
    
    const newStatus = !currentStatus;

    this.collaboratorService.updateOnboardingStatus(collaborator.id, type, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Actualizar el estado local inmediatamente para mejor UX
          if (type === 'welcome') {
            collaborator.welcomeOnboardingStatus = newStatus;
          } else {
            collaborator.techOnboardingStatus = newStatus;
          }
          this.applySortersAndFilters();
        },
        error: (error) => {
          console.error('Error al actualizar el estado:', error);
          // Recargar datos en caso de error para mantener consistencia
          this.loadCollaborators();
        }
      });
  }

  // ===========================
  // MÉTODOS UTILITARIOS
  // ===========================
  public trackByCollaboratorId(index: number, collaborator: Collaborator): number {
    return collaborator.id;
  }

  public getInitials(fullName: string): string {
    if (!fullName || fullName.trim() === '') return '??';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  public formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
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
}