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

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, PageHeaderComponent],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css']
})
export class CalendarViewComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  events: OnboardingEvent[] = [];
  
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
      this.showEventDetails(clickInfo.event.extendedProps as OnboardingEvent);
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
      start: event.startDate,
      end: event.endDate,
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

  private getContrastTextColor(backgroundColor: string): string {
    const color = backgroundColor.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  private showEventDetails(event: OnboardingEvent): void {
    const details = `
Evento: ${event.title}
${event.description ? `Descripción: ${event.description}` : ''}
Fecha inicio: ${this.formatDate(event.startDate)}
Fecha fin: ${this.formatDate(event.endDate)}
Máximo participantes: ${event.maxParticipants}
Estado: ${event.isActive ? 'Activo' : 'Inactivo'}
    `.trim();
    
    alert(details);
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  refreshEvents(): void {
    this.loadEvents();
  }
}