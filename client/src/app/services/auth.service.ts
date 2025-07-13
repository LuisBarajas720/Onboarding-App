import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  message: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface RegisterResponse {
    message: string;
    username?: string;
  }
  
export interface ErrorResponse {
error: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  
  // BehaviorSubject para saber si el usuario está logueado
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  
  // BehaviorSubject para el nombre del usuario
  private currentUserSubject = new BehaviorSubject<string>(this.getCurrentUsername());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Login
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          // Guardar token y username en localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', response.username);
          
          // Actualizar los subjects
          this.isLoggedInSubject.next(true);
          this.currentUserSubject.next(response.username);
        })
      );
  }

  // Registro
  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data, { 
      responseType: 'text' as 'json' 
    });
  }

  // Logout
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next('');
  }

  // Verificar si tiene token
  hasToken(): boolean {
    const token = localStorage.getItem('token');
    return token !== null && token !== '';
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Obtener username actual
  getCurrentUsername(): string {
    return localStorage.getItem('username') || '';
  }

  // Verificar si está logueado
  isAuthenticated(): boolean {
    return this.hasToken();
  }
  

}