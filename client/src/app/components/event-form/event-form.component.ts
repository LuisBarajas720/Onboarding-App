import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { OnboardingEvent } from '../../models/onboarding-event.model';
import { OnboardingEventService } from '../../services/onboarding-event.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit, OnChanges {
  eventForm: FormGroup;
  isSubmitting = false;

  @Input() eventToEdit: OnboardingEvent | null = null;
  @Output() eventAdded = new EventEmitter<void>();
  @Output() eventUpdated = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private eventService: OnboardingEventService
  ) {
    this.eventForm = this.fb.group({
      title: [
        '', 
        [
          Validators.required, 
          Validators.minLength(3)
        ]
      ],
      description: [''],
      startDate: ['', Validators.required],
      endDate: [
        '', 
        [
          Validators.required,
          this.durationValidator.bind(this)
        ]
      ],
      color: ['#3b82f6', Validators.required],
      maxParticipants: [
        10, 
        [
          Validators.required, 
          Validators.min(1), 
          Validators.max(100)
        ]
      ],
      isActive: [true]
    });

    // Revalidar fecha fin cuando cambia fecha inicio
    this.eventForm.get('startDate')?.valueChanges.subscribe(() => {
      this.eventForm.get('endDate')?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    if (!this.eventToEdit) {
      this.setDefaultValues();
    }
  }

  ngOnChanges(): void {
    if (this.eventToEdit) {
      this.eventForm.patchValue({
        title: this.eventToEdit.title,
        description: this.eventToEdit.description || '',
        startDate: this.eventToEdit.startDate, // Ya viene en formato YYYY-MM-DD correcto
        endDate: this.eventToEdit.endDate,     // Ya viene en formato YYYY-MM-DD correcto
        color: this.eventToEdit.color,
        maxParticipants: this.eventToEdit.maxParticipants,
        isActive: this.eventToEdit.isActive
      });
    } else {
      this.eventForm.reset();
      this.setDefaultValues();
    }
  }

  // =================== VALIDADORES PERSONALIZADOS ===================

  /**
   * Validador que verifica que el evento dure entre 5 y 7 días
   */
  durationValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const startDate = this.eventForm?.get('startDate')?.value;
    if (!startDate) return null;

    const start = new Date(startDate);
    const end = new Date(control.value);

    // Normalizar fechas
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 porque incluye ambos días

    return (diffDays >= 5 && diffDays <= 7) ? null : { invalidDuration: true };
  }

  // =================== GETTERS PARA EL TEMPLATE ===================

  get title() { return this.eventForm.get('title'); }
  get description() { return this.eventForm.get('description'); }
  get startDate() { return this.eventForm.get('startDate'); }
  get endDate() { return this.eventForm.get('endDate'); }
  get color() { return this.eventForm.get('color'); }
  get maxParticipants() { return this.eventForm.get('maxParticipants'); }

  // =================== MÉTODOS AUXILIARES ===================

  /**
   * Calcula y retorna la duración del evento en días
   */
  getEventDuration(): number {
    const startDate = this.startDate?.value;
    const endDate = this.endDate?.value;

    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  private setDefaultValues(): void {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 6); // 7 días de duración por defecto

    this.eventForm.patchValue({
      startDate: this.formatDateForInput(today),
      endDate: this.formatDateForInput(endDate),
      color: '#3b82f6',
      maxParticipants: 10,
      isActive: true
    });
  }

  /**
   * Formatea fecha para input date (soluciona problema de zona horaria)
   */
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Convierte string de fecha a Date sin problemas de zona horaria
   */
  private parseInputDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  async onSubmit(): Promise<void> {
    if (this.eventForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isSubmitting = true;

    try {
      const formValue = { ...this.eventForm.value };

      // Convertir fechas correctamente para evitar problemas de zona horaria
      formValue.startDate = this.parseInputDate(formValue.startDate).toISOString().split('T')[0];
      formValue.endDate = this.parseInputDate(formValue.endDate).toISOString().split('T')[0];

      if (this.eventToEdit) {
        this.eventService.updateEvent(this.eventToEdit.id!, formValue).subscribe({
          next: () => {
            this.eventUpdated.emit();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error al actualizar evento:', error);
            this.isSubmitting = false;
          }
        });
      } else {
        this.eventService.createEvent(formValue).subscribe({
          next: () => {
            this.eventAdded.emit();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error al crear evento:', error);
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
    this.eventForm.reset();
    this.modalClosed.emit();
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.eventForm.controls).forEach(key => {
      this.eventForm.get(key)?.markAsTouched();
    });
  }
}