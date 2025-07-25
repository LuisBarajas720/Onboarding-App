import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      // Si ya está logueado, redirigir al dashboard
      this.router.navigate(['/dashboard']);
      return false;
    } else {
      // Si no está logueado, puede acceder al login
      return true;
    }
  }
}