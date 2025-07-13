import { Component, EventEmitter, OnInit, Output, Input, OnChanges, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CollaboratorService } from '../../services/collaborator.service';
import { OnboardingEventService } from '../../services/onboarding-event.service';
import { CommonModule } from '@angular/common';
import { Collaborator } from '../../models/collaborator.model';
import { OnboardingEvent } from '../../models/onboarding-event.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-collaborator-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './collaborator-form.component.html',
  styleUrl: './collaborator-form.component.css'
})
export class CollaboratorFormComponent implements OnInit, OnChanges, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  collaboratorForm: FormGroup;
  onboardingEvents: OnboardingEvent[] = [];

  @Input() collaboratorToEdit: Collaborator | null = null;
  @Output() collaboratorAdded = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();
  @Output() collaboratorUpdated = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private collaboratorService: CollaboratorService,
    private eventService: OnboardingEventService
  ) {
    this.collaboratorForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      startDate: ['', Validators.required],
      assignedTechOnboardingEvent: ['']
    });
  }

  ngOnInit(): void {
    this.loadAvailableEvents();
  }

  ngOnChanges(): void {
    if (this.collaboratorToEdit) {
      this.collaboratorForm.patchValue(this.collaboratorToEdit);
    } else {
      this.collaboratorForm.reset({ assignedTechOnboardingEvent: '' });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAvailableEvents(): void {
    this.eventService.getActiveEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          this.onboardingEvents = events;
        },
        error: (error) => {
          console.error('Error al cargar eventos:', error);
        }
      });
  }

  onSubmit(): void {
    if (this.collaboratorForm.invalid) {
      return;
    }

    const formValue = { ...this.collaboratorForm.value };
    
    // Si se selecciona vacío, convertir a null
    if (formValue.assignedTechOnboardingEvent === '') {
      formValue.assignedTechOnboardingEvent = null;
    }

    if (this.collaboratorToEdit) {
      // Modo Edición
      this.collaboratorService
        .updateCollaborator(this.collaboratorToEdit.id, formValue)
        .subscribe({
          next: () => this.collaboratorUpdated.emit(),
          error: (error) => {
            console.error('Error al actualizar colaborador:', error);
          }
        });
    } else {
      // Modo Creación
      this.collaboratorService.createCollaborator(formValue).subscribe({
        next: () => this.collaboratorAdded.emit(),
        error: (error) => {
          console.error('Error al crear colaborador:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.collaboratorForm.reset({ assignedTechOnboardingEvent: '' });
    this.modalClosed.emit();
  }

  // Método helper para mostrar información del evento
  getEventDisplayText(event: OnboardingEvent): string {
    const startDate = new Date(event.startDate).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return `${event.title} (${startDate})`;
  }
}