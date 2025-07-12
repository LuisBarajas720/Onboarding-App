import { Component, EventEmitter, OnInit, Output, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CollaboratorService } from '../../services/collaborator.service';
import { CommonModule } from '@angular/common';
import { Collaborator } from '../../models/collaborator.model';
import { HttpClient } from '@angular/common/http';

// Interfaz para tipar los datos de los eventos del JSON
interface OnboardingEvent {
  title: string;
  start: string;
  end: string;
}

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
export class CollaboratorFormComponent implements OnInit, OnChanges {
  collaboratorForm: FormGroup;
  onboardingEvents: OnboardingEvent[] = []; // Array para guardar los eventos

  @Input() collaboratorToEdit: Collaborator | null = null;
  @Output() collaboratorAdded = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();
  @Output() collaboratorUpdated = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private collaboratorService: CollaboratorService,
    private http: HttpClient // Inyectamos HttpClient
  ) {
    this.collaboratorForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      startDate: ['', Validators.required],
      // Renombramos el campo y lo inicializamos para el desplegable
      assignedTechOnboardingEvent: ['']
    });
  }

  ngOnInit(): void {
    // Al iniciar, cargamos los eventos desde el archivo JSON
    this.http.get<OnboardingEvent[]>('/onboardings.json').subscribe(data => {
      this.onboardingEvents = data;
    });
  }

  ngOnChanges(): void {
    // Cuando cambia el colaborador a editar, actualizamos el formulario
    if (this.collaboratorToEdit) {
      this.collaboratorForm.patchValue(this.collaboratorToEdit);
    } else {
      // Si no hay colaborador para editar (modo creación), reseteamos el formulario
      this.collaboratorForm.reset({ assignedTechOnboardingEvent: '' });
    }
  }

  onSubmit(): void {
    if (this.collaboratorForm.invalid) {
      return;
    }

    const formValue = { ...this.collaboratorForm.value };
    // Si se selecciona "Ninguno", el valor es ''. Lo convertimos a null para la base de datos.
    if (formValue.assignedTechOnboardingEvent === '') {
      formValue.assignedTechOnboardingEvent = null;
    }

    if (this.collaboratorToEdit) {
      // Modo Edición
      this.collaboratorService
        .updateCollaborator(this.collaboratorToEdit.id, formValue)
        .subscribe({
          next: () => this.collaboratorUpdated.emit(),
        });
    } else {
      // Modo Creación
      this.collaboratorService.createCollaborator(formValue).subscribe({
        next: () => this.collaboratorAdded.emit(),
      });
    }
  }

  onCancel(): void {
    // Resetear el formulario
    this.collaboratorForm.reset({ assignedTechOnboardingEvent: '' });
    
    // Emitir un evento para cerrar el modal (necesitas agregarlo también)
    this.modalClosed.emit();
  }
}