package com.challenge.onboarding.app_gestion.util;

import com.challenge.onboarding.app_gestion.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class SecurityHelper {

    private final AuthService authService;

    public SecurityHelper(AuthService authService) {
        this.authService = authService;
    }

    // Verificar si el request es válido
    public boolean isValidRequest(HttpServletRequest request) {
        return authService.validateTokenFromRequest(request);
    }

    // Obtener respuesta de error estándar
    public ResponseEntity<?> unauthorizedResponse() {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Token inválido o ausente");
        error.put("message", "Debes estar autenticado para acceder a este recurso");
        return ResponseEntity.status(401).body(error);
    }

    // Obtener username del request
    public String getUsernameFromRequest(HttpServletRequest request) {
        return authService.getUsernameFromRequest(request);
    }
}