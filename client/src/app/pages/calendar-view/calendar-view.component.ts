import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import esLocale from '@fullcalendar/core/locales/es';
import { Subject, takeUntil, map } from 'rxjs';

import { PageHeaderComponent } from '../../layout/page-header/page-header.component';
import { OnboardingEventService } from '../../services/onboarding-event.service';
import { OnboardingEvent } from '../../models/onboarding-event.model';
import { EventDetailModalComponent } from '../../components/event-detail-modal/event-detail-modal.component';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [
    CommonModule, 
    FullCalendarModule, 
    PageHeaderComponent,
    EventDetailModalComponent
  ],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css']
})
export class CalendarViewComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  events: OnboardingEvent[] = [];
  selectedEvent: OnboardingEvent | null = null;
  showEventModal = false;
  
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, multiMonthPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,multiMonthYear'
    },
    locale: esLocale,
    events: [],
    fixedWeekCount: false,
    height: '80vh',
    
    // Personalización de eventos
    eventContent: (eventInfo) => {
      const event = eventInfo.event;
      const extendedProps = event.extendedProps;
      
      return {
        html: `
          <div class="fc-event-main-frame">
            <div class="fc-event-title-container">
              <div class="fc-event-title fc-sticky">${event.title}</div>
            </div>
            ${extendedProps['description'] ? `<div class="fc-event-description">${extendedProps['description']}</div>` : ''}
          </div>
        `
      };
    },

    // Evento cuando se hace clic en un evento
    eventClick: (clickInfo) => {
      const eventData = clickInfo.event.extendedProps as OnboardingEvent;
      this.showEventDetails(eventData);
    }
  };

  constructor(private eventService: OnboardingEventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEvents(): void {
    this.eventService.getActiveEvents()
      .pipe(
        takeUntil(this.destroy$),
        map(events => events.filter(event => event.isActive))
      )
      .subscribe({
        next: (events) => {
          console.log('Eventos activos cargados:', events);
          this.events = events;
          this.updateCalendarEvents();
        },
        error: (error) => {
          console.error('Error al cargar eventos:', error);
        }
      });
  }

  private updateCalendarEvents(): void {
    const calendarEvents: EventInput[] = this.events.map(event => ({
      id: event.id?.toString(),
      title: event.title,
      start: this.formatDateForCalendar(event.startDate),
      end: this.formatDateForCalendar(event.endDate, true), // true para fecha de fin
      allDay: true,
      backgroundColor: event.color,
      borderColor: event.color,
      textColor: this.getContrastTextColor(event.color),
      extendedProps: {
        ...event,
        description: event.description || '',
        maxParticipants: event.maxParticipants
      }
    }));

    if (this.calendarComponent) {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.removeAllEvents();
      calendarApi.addEventSource(calendarEvents);
    } else {
      this.calendarOptions = {
        ...this.calendarOptions,
        events: calendarEvents
      };
    }
  }

  /**
   * Formatea fecha para FullCalendar evitando problemas de zona horaria
   */
  private formatDateForCalendar(dateString: string, isEndDate = false): string {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      
      if (isEndDate) {
        // Para fecha de fin, agregar un día para que FullCalendar muestre correctamente
        const date = new Date(year, month - 1, day + 1);
        return date.toISOString().split('T')[0];
      } else {
        // Para fecha de inicio, usar tal como está
        const date = new Date(year, month - 1, day);
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.error('Error al formatear fecha para calendario:', error);
      return dateString;
    }
  }

  private getContrastTextColor(backgroundColor: string): string {
    const color = backgroundColor.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  private showEventDetails(event: OnboardingEvent): void {
    this.selectedEvent = event;
    this.showEventModal = true;
  }

  onCloseEventModal(): void {
    this.showEventModal = false;
    this.selectedEvent = null;
  }

  onEditEvent(event: OnboardingEvent): void {
    // Cerrar el modal
    this.onCloseEventModal();
    
    // Aquí puedes implementar la lógica para editar el evento
    // Por ejemplo, navegar a una página de edición o abrir un modal de edición
    console.log('Editando evento:', event);
    
    // Ejemplo: Emitir evento para que el componente padre abra el modal de edición
    // this.editEvent.emit(event);
  }

  refreshEvents(): void {
    this.loadEvents();
  }
}