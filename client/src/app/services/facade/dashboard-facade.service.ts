import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, BehaviorSubject, combineLatest } from 'rxjs';
import { Collaborator } from '../../models/collaborator.model';
import { OnboardingEvent } from '../../models/onboarding-event.model';
import { CollaboratorService } from '../collaborator.service';
import { OnboardingEventService } from '../onboarding-event.service';

// Interfaces para el Facade
export interface DashboardData {
  collaborators: Collaborator[];
  events: OnboardingEvent[];
  eventColors: { [key: string]: string };
}

export interface FilterOptions {
  welcomeFilter: 'all' | 'completed' | 'pending';
  techFilter: 'all' | 'completed' | 'pending';
  searchTerm: string;
}

export interface SortOptions {
  sortKey: keyof Collaborator;
  sortDirection: 'asc' | 'desc';
}

export interface Statistics {
  total: number;
  welcomeCompleted: number;
  techCompleted: number;
  pending: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardFacadeService {
  
  // Estado interno del facade
  private filterSubject = new BehaviorSubject<FilterOptions>({
    welcomeFilter: 'all',
    techFilter: 'all',
    searchTerm: ''
  });

  private sortSubject = new BehaviorSubject<SortOptions>({
    sortKey: 'fullName',
    sortDirection: 'asc'
  });

  // Observables públicos
  public filters$ = this.filterSubject.asObservable();
  public sort$ = this.sortSubject.asObservable();

  constructor(
    private collaboratorService: CollaboratorService,
    private onboardingEventService: OnboardingEventService
  ) {}

  // ===========================
  // MÉTODO PRINCIPAL DEL FACADE
  // ===========================

  /**
   * Carga todos los datos necesarios para el dashboard de forma optimizada
   */
  loadDashboardData(): Observable<DashboardData> {
    return forkJoin({
      collaborators: this.collaboratorService.getCollaborators(),
      events: this.onboardingEventService.getEvents()
    }).pipe(
      map(({ collaborators, events }) => ({
        collaborators,
        events,
        eventColors: this.buildEventColorsMap(events)
      }))
    );
  }

  /**
   * Obtiene colaboradores filtrados y ordenados
   */
  getFilteredAndSortedCollaborators(
    collaborators: Collaborator[],
    filters: FilterOptions,
    sort: SortOptions
  ): Collaborator[] {
    let result = [...collaborators];
    
    // Aplicar filtros
    result = this.applyFilters(result, filters);
    
    // Aplicar ordenamiento
    result = this.applySorting(result, sort);
    
    return result;
  }

  /**
   * Actualiza el estado de onboarding y devuelve el colaborador actualizado
   */
  updateOnboardingStatus(
    collaboratorId: number,
    onboardingType: 'welcome' | 'tech',
    newStatus: boolean
  ): Observable<any> {
    return this.collaboratorService.updateOnboardingStatus(
      collaboratorId,
      onboardingType,
      newStatus
    );
  }

  /**
   * Elimina colaborador
   */
  deleteCollaborator(id: number): Observable<void> {
    return this.collaboratorService.deleteCollaborator(id);
  }

  /**
   * Calcula estadísticas del dashboard
   */
  calculateStatistics(collaborators: Collaborator[]): Statistics {
    const total = collaborators.length;
    const welcomeCompleted = collaborators.filter(c => c.welcomeOnboardingStatus).length;
    const techCompleted = collaborators.filter(c => c.techOnboardingStatus).length;
    const pending = collaborators.filter(c => 
      !c.welcomeOnboardingStatus || !c.techOnboardingStatus
    ).length;

    return {
      total,
      welcomeCompleted,
      techCompleted,
      pending
    };
  }

  /**
   * Obtiene información de un evento específico
   */
  getEventInfo(eventTitle: string | null, events: OnboardingEvent[]): OnboardingEvent | null {
    if (!eventTitle) return null;
    return events.find(event => event.title === eventTitle) || null;
  }

  /**
   * Obtiene el color de un evento
   */
  getEventColor(eventTitle: string | null, eventColors: { [key: string]: string }): string {
    if (!eventTitle) return '#6b7280';
    return eventColors[eventTitle] || '#6b7280';
  }

  // ===========================
  // MÉTODOS DE GESTIÓN DE ESTADO
  // ===========================

  /**
   * Actualiza los filtros
   */
  updateFilters(filters: Partial<FilterOptions>): void {
    const currentFilters = this.filterSubject.value;
    this.filterSubject.next({ ...currentFilters, ...filters });
  }

  /**
   * Actualiza el ordenamiento
   */
  updateSort(sort: Partial<SortOptions>): void {
    const currentSort = this.sortSubject.value;
    this.sortSubject.next({ ...currentSort, ...sort });
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.filterSubject.next({
      welcomeFilter: 'all',
      techFilter: 'all',
      searchTerm: ''
    });
  }

  /**
   * Verifica si hay filtros activos
   */
  hasActiveFilters(filters: FilterOptions): boolean {
    return filters.welcomeFilter !== 'all' || 
           filters.techFilter !== 'all' || 
           filters.searchTerm.trim() !== '';
  }

  // ===========================
  // MÉTODOS PRIVADOS
  // ===========================

  private buildEventColorsMap(events: OnboardingEvent[]): { [key: string]: string } {
    const eventColors: { [key: string]: string } = {};
    events.forEach(event => {
      if (event.title && event.color) {
        eventColors[event.title] = event.color;
      }
    });
    return eventColors;
  }

  private applyFilters(collaborators: Collaborator[], filters: FilterOptions): Collaborator[] {
    return collaborators.filter(collaborator => {
      // Filtro de búsqueda
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          collaborator.fullName.toLowerCase().includes(searchLower) ||
          collaborator.email.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filtro de onboarding de bienvenida
      if (filters.welcomeFilter !== 'all') {
        const isCompleted = filters.welcomeFilter === 'completed';
        if (collaborator.welcomeOnboardingStatus !== isCompleted) return false;
      }

      // Filtro de onboarding técnico
      if (filters.techFilter !== 'all') {
        const isCompleted = filters.techFilter === 'completed';
        if (collaborator.techOnboardingStatus !== isCompleted) return false;
      }

      return true;
    });
  }

  private applySorting(collaborators: Collaborator[], sort: SortOptions): Collaborator[] {
    return collaborators.sort((a, b) => {
      let valueA = a[sort.sortKey] ?? '';
      let valueB = b[sort.sortKey] ?? '';

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

      return sort.sortDirection === 'asc' ? comparison : -comparison;
    });
  }
}