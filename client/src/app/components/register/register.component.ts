import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  
  registerData: RegisterRequest = {
    username: '',
    password: '',
    email: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  emailError = '';
  passwordError = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister(): void {
    this.validateEmail();
    this.validatePassword();
    
    if (!this.registerData.username || !this.registerData.password || !this.registerData.email) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }
    
    if (this.emailError || this.passwordError) {
      this.errorMessage = 'Por favor, corrige los errores antes de continuar';
      return;
    }
  
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
  
    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        
        // Manejar respuesta de texto
        if (typeof response === 'string' && response.includes('exitosamente')) {
          this.successMessage = 'Usuario registrado exitosamente. Redirigiendo al login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.successMessage = response.message || 'Usuario registrado exitosamente';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      },
      error: (error) => {
        console.log('Error completo:', error);
        
        // Manejar diferentes tipos de error
        if (typeof error.error === 'string') {
          this.errorMessage = error.error;
        } else {
          this.errorMessage = 'Error al registrar usuario. Intenta de nuevo.';
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
  validateEmail(): void {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!this.registerData.email) {
      this.emailError = '';
      return;
    }
    
    if (!emailPattern.test(this.registerData.email)) {
      this.emailError = 'Formato de email inválido';
    } else {
      this.emailError = '';
    }
  }
  
  validatePassword(): void {
    if (!this.registerData.password) {
      this.passwordError = '';
      return;
    }
    
    if (this.registerData.password.length < 6) {
      this.passwordError = 'La contraseña debe tener al menos 6 caracteres';
    } else {
      this.passwordError = '';
    }
  }
  
}