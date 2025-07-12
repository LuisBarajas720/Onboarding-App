import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Collaborator } from '../../models/collaborator.model';
import { CollaboratorService } from '../../services/collaborator.service';
import { CollaboratorFormComponent } from '../../components/collaborator-form/collaborator-form.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component'; // Se importa el nuevo componente

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CollaboratorFormComponent, ModalComponent, NgClass, ConfirmDialogComponent], // Se añade a los imports
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  masterCollaborators: Collaborator[] = [];
  collaborators: Collaborator[] = [];
  collaboratorToEdit: Collaborator | null = null;
  isModalOpen = false;
  welcomeFilter: string = 'all';
  techFilter: string = 'all';

  // Nuevas variables para el modal de confirmación
  showDeleteConfirmModal = false;
  collaboratorIdToDelete: number | null = null;

  constructor(private collaboratorService: CollaboratorService) {}

  ngOnInit(): void {
    this.loadCollaborators();
  }

  // Lógica de Modals
  openAddModal(): void {
    this.collaboratorToEdit = null;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.collaboratorToEdit = null;
  }

  closeDeleteModal(): void {
    this.showDeleteConfirmModal = false;
    this.collaboratorIdToDelete = null;
  }
  
  // Lógica de Acciones de la Tabla
  onEdit(collaborator: Collaborator): void {
    this.collaboratorToEdit = collaborator;
    this.isModalOpen = true;
  }

  onDelete(id: number): void {
    // Ya no usa confirm(), ahora abre el modal
    this.collaboratorIdToDelete = id;
    this.showDeleteConfirmModal = true;
  }
  
  handleDeleteConfirm(): void {
    if (this.collaboratorIdToDelete !== null) {
      this.collaboratorService.deleteCollaborator(this.collaboratorIdToDelete).subscribe(() => {
        this.loadCollaborators();
        this.closeDeleteModal();
      });
    }
  }

  onFormSubmitSuccess(): void {
    this.loadCollaborators();
    this.closeModal();
  }

  onStatusChange(collaborator: Collaborator, type: 'welcome' | 'tech'): void {
    const currentStatus = type === 'welcome' ? collaborator.welcomeOnboardingStatus : collaborator.techOnboardingStatus;
    const newStatus = !currentStatus;

    this.collaboratorService.updateOnboardingStatus(collaborator.id, type, newStatus).subscribe({
      next: () => {
        if (type === 'welcome') {
          collaborator.welcomeOnboardingStatus = newStatus;
        } else {
          collaborator.techOnboardingStatus = newStatus;
        }
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error al actualizar el estado:', err);
        this.loadCollaborators();
      }
    });
  }

  // Lógica de Filtros y Carga
  loadCollaborators(): void {
    this.collaboratorService.getCollaborators().subscribe(data => {
      this.masterCollaborators = data;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let filteredList = [...this.masterCollaborators];

    if (this.welcomeFilter !== 'all') {
      const isCompleted = this.welcomeFilter === 'completed';
      filteredList = filteredList.filter(c => c.welcomeOnboardingStatus === isCompleted);
    }

    if (this.techFilter !== 'all') {
      const isCompleted = this.techFilter === 'completed';
      filteredList = filteredList.filter(c => c.techOnboardingStatus === isCompleted);
    }

    this.collaborators = filteredList;
  }

  clearFilters(): void {
    this.welcomeFilter = 'all';
    this.techFilter = 'all';
    this.applyFilters();
  }
}