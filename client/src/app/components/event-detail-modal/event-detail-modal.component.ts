import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardingEvent } from '../../models/onboarding-event.model';

@Component({
  selector: 'app-event-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-detail-modal.component.html',
  styleUrls: ['./event-detail-modal.component.css']
})
export class EventDetailModalComponent {
  @Input() event!: OnboardingEvent;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<OnboardingEvent>();

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    this.edit.emit(this.event);
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
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return dateString;
    }
  }

  /**
   * Calcula la duración del evento en días
   */
  getEventDuration(): number {
    try {
      const [startYear, startMonth, startDay] = this.event.startDate.split('-').map(Number);
      const [endYear, endMonth, endDay] = this.event.endDate.split('-').map(Number);
      
      const startDate = new Date(startYear, startMonth - 1, startDay);
      const endDate = new Date(endYear, endMonth - 1, endDay);
      
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 porque incluye ambos días
      
      return diffDays;
    } catch (error) {
      console.error('Error al calcular duración:', error);
      return 1;
    }
  }
}