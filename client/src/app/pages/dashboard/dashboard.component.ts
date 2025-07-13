import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgClass} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, combineLatest } from 'rxjs';

import { Collaborator } from '../../models/collaborator.model';
import { OnboardingEvent } from '../../models/onboarding-event.model';
import { CollaboratorFormComponent } from '../../components/collaborator-form/collaborator-form.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../layout/page-header/page-header.component';

// Importar el Facade
import { 
  DashboardFacadeService, 
  DashboardData, 
  FilterOptions, 
  SortOptions, 
  Statistics 
} from '../../services/facade/dashboard-facade.service';

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
  // PROPIEDADES SIMPLIFICADAS CON FACADE
  // ===========================
  private readonly destroy$ = new Subject<void>();
  
  // Datos del dashboard
  public dashboardData: DashboardData | null = null;
  public collaborators: Collaborator[] = [];
  public statistics: Statistics = { total: 0, welcomeCompleted: 0, techCompleted: 0, pending: 0 };
  
  // Estado de UI
  public collaboratorToEdit: Collaborator | null = null;
  public isModalOpen = false;
  public showDeleteConfirmModal = false;
  private collaboratorIdToDelete: number | null = null;
  
  // Filtros y ordenamiento (ahora manejados por el facade)
  public currentFilters: FilterOptions = {
    welcomeFilter: 'all',
    techFilter: 'all',
    searchTerm: ''
  };
  
  public currentSort: SortOptions = {
    sortKey: 'fullName',
    sortDirection: 'asc'
  };

  // ===========================
  // CONSTRUCTOR SIMPLIFICADO
  // ===========================
  constructor(private dashboardFacade: DashboardFacadeService) {}

  ngOnInit(): void {
    this.initializeDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===========================
  // INICIALIZACIÓN SIMPLIFICADA
  // ===========================
  
  /**
   * Inicializa el dashboard usando el facade
   */
  private initializeDashboard(): void {
    // Combinar datos del dashboard con filtros y ordenamiento
    combineLatest([
      this.dashboardFacade.loadDashboardData(),
      this.dashboardFacade.filters$,
      this.dashboardFacade.sort$
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ([dashboardData, filters, sort]) => {
        this.dashboardData = dashboardData;
        this.currentFilters = filters;
        this.currentSort = sort;
        this.updateDisplayData();
      },
      error: (error) => {
        console.error('Error al cargar datos del dashboard:', error);
      }
    });
  }

  /**
   * Recarga los datos del dashboard
   */
  public loadCollaborators(): void {
    this.dashboardFacade.loadDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.updateDisplayData();
        },
        error: (error) => {
          console.error('Error al recargar colaboradores:', error);
        }
      });
  }

  /**
   * Actualiza los datos mostrados aplicando filtros y ordenamiento
   */
  private updateDisplayData(): void {
    if (!this.dashboardData) return;
    
    // Usar el facade para filtrar y ordenar
    this.collaborators = this.dashboardFacade.getFilteredAndSortedCollaborators(
      this.dashboardData.collaborators,
      this.currentFilters,
      this.currentSort
    );
    
    // Calcular estadísticas
    this.statistics = this.dashboardFacade.calculateStatistics(this.dashboardData.collaborators);
  }

  // ===========================
  // MÉTODOS DE FILTRADO Y ORDENAMIENTO SIMPLIFICADOS
  // ===========================
  
  public applySortersAndFilters(): void {
    this.updateDisplayData();
  }

  public setSort(key: SortKey): void {
    const newDirection: SortDirection = 
      this.currentSort.sortKey === key && this.currentSort.sortDirection === 'asc' 
        ? 'desc' 
        : 'asc';
    
    this.dashboardFacade.updateSort({ sortKey: key, sortDirection: newDirection });
  }

  public toggleSortDirection(): void {
    const newDirection: SortDirection = this.currentSort.sortDirection === 'asc' ? 'desc' : 'asc';
    this.dashboardFacade.updateSort({ sortDirection: newDirection });
  }
  
  public clearFilters(): void {
    this.dashboardFacade.clearFilters();
  }

  public hasActiveFilters(): boolean {
    return this.dashboardFacade.hasActiveFilters(this.currentFilters);
  }

  // Getters y setters para mantener compatibilidad con el template
  public get welcomeFilter(): FilterStatus { return this.currentFilters.welcomeFilter; }
  public set welcomeFilter(value: FilterStatus) {
    this.dashboardFacade.updateFilters({ welcomeFilter: value });
  }

  public get techFilter(): FilterStatus { return this.currentFilters.techFilter; }
  public set techFilter(value: FilterStatus) {
    this.dashboardFacade.updateFilters({ techFilter: value });
  }

  public get searchTerm(): string { return this.currentFilters.searchTerm; }
  public set searchTerm(value: string) {
    this.dashboardFacade.updateFilters({ searchTerm: value });
  }

  public get sortKey(): SortKey { return this.currentSort.sortKey; }
  public get sortDirection(): SortDirection { return this.currentSort.sortDirection; }

  // ===========================
  // MÉTODOS DE EVENTOS SIMPLIFICADOS
  // ===========================
  
  public getEventColor(eventTitle: string | null): string {
    if (!this.dashboardData) return '#6b7280';
    return this.dashboardFacade.getEventColor(eventTitle, this.dashboardData.eventColors);
  }

  public getEventInfo(eventTitle: string | null): OnboardingEvent | null {
    if (!this.dashboardData) return null;
    return this.dashboardFacade.getEventInfo(eventTitle, this.dashboardData.events);
  }

  public isEventActive(eventTitle: string | null): boolean {
    const event = this.getEventInfo(eventTitle);
    return event ? event.isActive : false;
  }

  public refreshEventColors(): void {
    this.loadCollaborators(); // Simplificado: solo recarga todo
  }

  // ===========================
  // MÉTODOS DE ESTADÍSTICAS
  // ===========================
  
  public getStatistics(): Statistics {
    return this.statistics;
  }

  // ===========================
  // MÉTODOS DE GESTIÓN DE MODALES (SIN CAMBIOS)
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
  // MÉTODOS DE ACCIONES SIMPLIFICADOS
  // ===========================
  
  public onEdit(collaborator: Collaborator): void {
    this.collaboratorToEdit = { ...collaborator };
    this.isModalOpen = true;
  }

  public onDelete(id: number): void {
    this.collaboratorIdToDelete = id;
    this.showDeleteConfirmModal = true;
  }

  public handleDeleteConfirm(): void {
    if (this.collaboratorIdToDelete === null) return;

    this.dashboardFacade.deleteCollaborator(this.collaboratorIdToDelete)
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

    this.dashboardFacade.updateOnboardingStatus(collaborator.id, type, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Actualizar el estado local inmediatamente
          if (type === 'welcome') {
            collaborator.welcomeOnboardingStatus = newStatus;
          } else {
            collaborator.techOnboardingStatus = newStatus;
          }
          this.updateDisplayData();
        },
        error: (error) => {
          console.error('Error al actualizar el estado:', error);
          this.loadCollaborators();
        }
      });
  }

  // ===========================
  // MÉTODOS UTILITARIOS (SIN CAMBIOS)
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