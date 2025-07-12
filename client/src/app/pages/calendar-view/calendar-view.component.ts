import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import esLocale from '@fullcalendar/core/locales/es';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css']
})
export class CalendarViewComponent {
  
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, multiMonthPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,multiMonthYear'
    },
    locale: esLocale,
    events: '/onboardings.json',
    fixedWeekCount: false,

    // --- INICIO DE NUEVAS OPCIONES ---

    // 1. Soluciona los múltiples scrollbars.
    // El calendario tendrá una altura máxima y su propio scroll interno.
    height: '80vh', 

    // 2. Elimina la fila de "todo el día" en vistas de semana y día.
    allDaySlot: false,

    // 3. Configura el formato de hora a 12h (AM/PM).
    // @ts-ignore
    hour12: true,
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short'
    },
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short'
    },

    // --- FIN DE NUEVAS OPCIONES ---

    eventDataTransform: (eventInfo: EventInput) => {
      const endDate = new Date(eventInfo.end as string);
      endDate.setDate(endDate.getDate() + 1);
      return { ...eventInfo, end: endDate, backgroundColor: eventInfo.color, borderColor: eventInfo.color };
    },

    eventContent: (eventInfo) => {
      return { html: `<span class="fc-event-title-custom">${eventInfo.event.title}</span>` };
    }
  };

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  constructor() {}
}