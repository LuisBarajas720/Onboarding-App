package com.challenge.onboarding.app_gestion.controller;

import com.challenge.onboarding.app_gestion.dto.LoginRequest;
import com.challenge.onboarding.app_gestion.dto.LoginResponse;
import com.challenge.onboarding.app_gestion.dto.RegisterRequest;
import com.challenge.onboarding.app_gestion.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200") // CORS para Angular
public class AuthController {

    @Autowired
    private AuthService authService;

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        LoginResponse response = authService.login(loginRequest);

        if (response != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body("Credenciales incorrectas");
        }
    }

    // Registro endpoint
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {

        String result = authService.register(registerRequest);

        if (result.equals("Usuario registrado exitosamente")) {
            // Crear respuesta exitosa
            Map<String, String> response = new HashMap<>();
            response.put("message", result);
            response.put("username", registerRequest.getUsername());
            return ResponseEntity.ok(response);
        } else {
            // Crear respuesta de error
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", result);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Validar token endpoint
    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {

        // Remover "Bearer " del token
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        boolean isValid = authService.validateToken(token);

        if (isValid) {
            String username = authService.getUsernameFromToken(token);
            return ResponseEntity.ok("Token válido para: " + username);
        } else {
            return ResponseEntity.badRequest().body("Token inválido");
        }
    }
}