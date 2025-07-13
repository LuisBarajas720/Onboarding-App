import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Obtener token del servicio
  const token = authService.getToken();

  // Si hay token y la request no es de login/register, agregar Authorization header
  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
    console.log('🔑 Agregando token a request:', req.url);
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  // Si no hay token o es login/register, enviar request normal
  console.log('📤 Request sin token:', req.url);
  return next(req);
};