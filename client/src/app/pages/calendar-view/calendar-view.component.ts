import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import localeEs from '@angular/common/locales/es';
import { CalendarEvent, CalendarModule, CalendarView } from 'angular-calendar';
import { addMonths, subMonths } from 'date-fns';
import { Subject } from 'rxjs';

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
  refresh: Subject<any> = new Subject();
  locale: string = 'es';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchOnboardingEvents();
  }

  fetchOnboardingEvents(): void {
    this.http.get<OnboardingEvent[]>('/onboardings.json').subscribe(data => {
      this.events = data.map(event => {
        const startDate = new Date(event.start.replace(/-/g, '/'));
        const endDate = new Date(event.end.replace(/-/g, '/'));

        return {
          title: event.title,
          start: startDate,
          end: endDate,
          color: { primary: event.color, secondary: event.color + '33' },
          allDay: true
        };
      });

      this.refresh.next(null); // 🔁 Forzar redibujo
    });
  }

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
