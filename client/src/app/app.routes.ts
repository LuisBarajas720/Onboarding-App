import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CalendarViewComponent } from './pages/calendar-view/calendar-view.component';
import { OnboardingManagementComponent} from './pages/onboarding-management/onboarding-management.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
  // Ruta de login (con guard para redirigir si ya está logueado)
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [LoginGuard] }, 
  // Si el usuario va a la raíz, redirigir al dashboard
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Rutas protegidas con AuthGuard
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'calendar', component: CalendarViewComponent, canActivate: [AuthGuard] },
  { path: 'onboarding-management', component: OnboardingManagementComponent, canActivate: [AuthGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] }
];