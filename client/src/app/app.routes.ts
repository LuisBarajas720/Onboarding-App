import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CalendarViewComponent } from './pages/calendar-view/calendar-view.component';

export const routes: Routes = [
  // Si el usuario va a la raíz, lo redirigimos al dashboard
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Ruta para la página del dashboard
  { path: 'dashboard', component: DashboardComponent },

  // Ruta para la página del calendario
  { path: 'calendar', component: CalendarViewComponent }
];