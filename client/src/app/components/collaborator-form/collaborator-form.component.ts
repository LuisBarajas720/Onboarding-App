import { Component, EventEmitter, OnInit, Output, Input, OnChanges, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CollaboratorService } from '../../services/collaborator.service';
import { OnboardingEventService } from '../../services/onboarding-event.service';
import { ParticipantValidationService, ParticipantValidationResult } from '../../services/participant-validation-service';
import { CommonModule } from '@angular/common';
import { Collaborator } from '../../models/collaborator.model';
import { OnboardingEvent } from '../../models/onboarding-event.model';
import { Subject, takeUntil, switchMap, of } from 'rxjs';

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
  availableEvents: OnboardingEvent[] = [];
  isSubmitting = false;
  eventValidationMessage = '';
  eventValidationStatus: 'valid' | 'warning' | 'error' | '' = '';

  @Input() collaboratorToEdit: Collaborator | null = null;
  @Output() collaboratorAdded = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();
  @Output() collaboratorUpdated = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private collaboratorService: CollaboratorService,
    private eventService: OnboardingEventService,
    private participantValidationService: ParticipantValidationService
  ) {
    this.collaboratorForm = this.fb.group({
      fullName: [
        '', 
        [
          Validators.required,
          Validators.minLength(2),
          this.nameValidator
        ]
      ],
      email: [
        '', 
        [
          Validators.required, 
          Validators.email,
          this.emailFormatValidator
        ]
      ],
      startDate: [
        '', 
        [
          Validators.required,
          this.futureDateValidator
        ]
      ],
      assignedTechOnboardingEvent: ['']
    });
  }

  ngOnInit(): void {
    this.loadAvailableEvents();
    this.setupEventValidation();
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

  // =================== VALIDADORES PERSONALIZADOS ===================

  /**
   * Validador para nombres: solo letras, espacios y acentos
   */
  nameValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const namePattern = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/;
    const isValid = namePattern.test(control.value.trim());
    
    return isValid ? null : { pattern: true };
  }

  /**
   * Validador mejorado para email
   */
  emailFormatValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailPattern.test(control.value);
    
    return isValid ? null : { email: true };
  }

  /**
   * Validador para fechas futuras (máximo 1 año en el futuro)
   */
  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);
    
    // Permitir fechas pasadas, pero restringir fechas muy futuras
    if (selectedDate > oneYearFromNow) {
      return { futureDate: true };
    }
    
    return null;
  }

  // =================== GETTERS PARA EL TEMPLATE ===================

  get fullName() { return this.collaboratorForm.get('fullName'); }
  get email() { return this.collaboratorForm.get('email'); }
  get startDate() { return this.collaboratorForm.get('startDate'); }
  get assignedTechOnboardingEvent() { return this.collaboratorForm.get('assignedTechOnboardingEvent'); }

  // =================== MÉTODOS AUXILIARES ===================

  private loadAvailableEvents(): void {
    // Cargar todos los eventos activos para el dropdown
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

  /**
   * Configura la validación de participantes en tiempo real
   */
  private setupEventValidation(): void {
    this.assignedTechOnboardingEvent?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        switchMap(eventTitle => {
          if (!eventTitle) {
            this.eventValidationMessage = '';
            this.eventValidationStatus = '';
            return of(null);
          }
          
          // Validar capacidad del evento
          const excludeId = this.collaboratorToEdit?.id;
          return this.participantValidationService.validateEventAssignment(eventTitle, excludeId);
        })
      )
      .subscribe({
        next: (result: ParticipantValidationResult | null) => {
          if (result) {
            this.eventValidationMessage = result.message;
            
            if (!result.isValid) {
              this.eventValidationStatus = 'error';
              this.assignedTechOnboardingEvent?.setErrors({ capacityExceeded: true });
            } else if (result.availableSpots === 1) {
              this.eventValidationStatus = 'warning';
              this.assignedTechOnboardingEvent?.setErrors(null);
            } else {
              this.eventValidationStatus = 'valid';
              this.assignedTechOnboardingEvent?.setErrors(null);
            }
          }
        },
        error: (error) => {
          console.error('Error en validación de participantes:', error);
        }
      });

    // Cargar información de disponibilidad para actualizar dropdown
    this.participantValidationService.getAvailableEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (availableEvents) => {
          this.availableEvents = availableEvents;
        },
        error: (error) => {
          console.error('Error al cargar eventos disponibles:', error);
        }
      });
  }

  /**
   * Valida duplicados de email (llamada al backend)
   */
  private async validateEmailExists(email: string): Promise<boolean> {
    try {
      if (!email || this.email?.errors?.['email']) {
        return false; // No validar si el email no es válido
      }

      // Si estamos editando, excluir el ID actual de la validación
      const excludeId = this.collaboratorToEdit?.id;
      const exists = await this.collaboratorService.checkEmailExists(email, excludeId).toPromise();
      return exists || false;
    } catch (error) {
      console.error('Error validando email:', error);
      // Si el endpoint no existe aún, simplemente no validar
      return false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.collaboratorForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      this.collaboratorForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    try {
      const formValue = { ...this.collaboratorForm.value };
      
      // Validar email duplicado antes de enviar
      const emailExists = await this.validateEmailExists(formValue.email);
      if (emailExists) {
        this.email?.setErrors({ emailExists: true });
        this.email?.markAsTouched();
        this.isSubmitting = false;
        return;
      }
      
      // Limpiar espacios en blanco del nombre
      formValue.fullName = formValue.fullName.trim();
      
      // Si se selecciona vacío, convertir a null
      if (formValue.assignedTechOnboardingEvent === '') {
        formValue.assignedTechOnboardingEvent = null;
      }

      if (this.collaboratorToEdit) {
        // Modo Edición
        this.collaboratorService
          .updateCollaborator(this.collaboratorToEdit.id, formValue)
          .subscribe({
            next: () => {
              this.collaboratorUpdated.emit();
              this.isSubmitting = false;
            },
            error: (error) => {
              console.error('Error al actualizar colaborador:', error);
              // Verificar si el error es por email duplicado
              if (error.status === 409 || error.message?.includes('email')) {
                this.email?.setErrors({ emailExists: true });
                this.email?.markAsTouched();
              }
              this.isSubmitting = false;
            }
          });
      } else {
        // Modo Creación
        this.collaboratorService.createCollaborator(formValue).subscribe({
          next: () => {
            this.collaboratorAdded.emit();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error al crear colaborador:', error);
            // Verificar si el error es por email duplicado
            if (error.status === 409 || error.message?.includes('email')) {
              this.email?.setErrors({ emailExists: true });
              this.email?.markAsTouched();
            }
            this.isSubmitting = false;
          }
        });
      }
    } catch (error) {
      console.error('Error en onSubmit:', error);
      this.isSubmitting = false;
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

  /**
   * Verifica si un evento está disponible (no lleno)
   */
  isEventAvailable(eventTitle: string): boolean {
    return this.availableEvents.some(event => event.title === eventTitle);
  }
}