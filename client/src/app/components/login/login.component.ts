import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  
  // Datos del formulario
  credentials: LoginRequest = {
    username: '',
    password: ''
  };

  // Estados del componente
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Manejar el login
  onLogin(): void {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.router.navigate(['/dashboard']); // Redirigir al dashboard
      },
      error: (error) => {
        console.error('Error de login:', error);
        this.errorMessage = 'Credenciales incorrectas. Intenta de nuevo.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Toggle para mostrar/ocultar contraseña
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Limpiar mensaje de error cuando el usuario escriba
  clearError(): void {
    this.errorMessage = '';
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
  
}