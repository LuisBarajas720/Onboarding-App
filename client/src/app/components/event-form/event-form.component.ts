import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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

  @Input() eventToEdit: OnboardingEvent | null = null;
  @Output() eventAdded = new EventEmitter<void>();
  @Output() eventUpdated = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private eventService: OnboardingEventService
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      color: ['#3b82f6', Validators.required],
      maxParticipants: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
      isActive: [true]
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
        startDate: this.eventToEdit.startDate,
        endDate: this.eventToEdit.endDate,
        color: this.eventToEdit.color,
        maxParticipants: this.eventToEdit.maxParticipants,
        isActive: this.eventToEdit.isActive
      });
    } else {
      this.eventForm.reset();
      this.setDefaultValues();
    }
  }

  private setDefaultValues(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.eventForm.patchValue({
      startDate: this.formatDateForInput(today),
      endDate: this.formatDateForInput(tomorrow),
      color: '#3b82f6',
      maxParticipants: 10,
      isActive: true
    });
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    const formValue = this.eventForm.value;

    if (this.eventToEdit) {
      this.eventService.updateEvent(this.eventToEdit.id!, formValue).subscribe({
        next: () => {
          this.eventUpdated.emit();
        },
        error: (error) => {
          console.error('Error al actualizar evento:', error);
        }
      });
    } else {
      this.eventService.createEvent(formValue).subscribe({
        next: () => {
          this.eventAdded.emit();
        },
        error: (error) => {
          console.error('Error al crear evento:', error);
        }
      });
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

  // Validación simplificada para fechas (sin hora)
  validateDates(): boolean {
    const startDate = this.eventForm.get('startDate')?.value;
    const endDate = this.eventForm.get('endDate')?.value;

    if (!startDate || !endDate) {
      return true;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    return start <= end;
  }
}