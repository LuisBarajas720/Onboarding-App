import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import localeEs from '@angular/common/locales/es';
import { CalendarEvent, CalendarModule, CalendarView } from 'angular-calendar';
import { addMonths, subMonths } from 'date-fns';

registerLocaleData(localeEs);

interface OnboardingEvent {
  title: string;
  color: string;
  start: string;
  end: string;
}

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    CalendarModule
  ],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css']
})
export class CalendarViewComponent implements OnInit {

  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  locale: string = 'es';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchOnboardingEvents();
  }

  fetchOnboardingEvents(): void {
    this.http.get<OnboardingEvent[]>('/onboardings.json').subscribe(data => {
      this.events = data.map(event => ({
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        color: { primary: event.color, secondary: event.color + '33' },
        allDay: true
      }));
    });
  }

  // Métodos de navegación que volvemos a añadir
  previousMonth(): void {
    this.viewDate = subMonths(this.viewDate, 1);
  }

  today(): void {
    this.viewDate = new Date();
  }

  nextMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
  }
}
