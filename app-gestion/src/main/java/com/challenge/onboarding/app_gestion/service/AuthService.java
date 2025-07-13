package com.challenge.onboarding.app_gestion.service;

import com.challenge.onboarding.app_gestion.dto.LoginRequest;
import com.challenge.onboarding.app_gestion.dto.LoginResponse;
import com.challenge.onboarding.app_gestion.dto.RegisterRequest;
import com.challenge.onboarding.app_gestion.model.User;
import com.challenge.onboarding.app_gestion.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Base64;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    // Login simple - verifica username y password
    public LoginResponse login(LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Verificar password (simple, en producción usarías BCrypt)
            if (user.getPassword().equals(loginRequest.getPassword()) && user.isActive()) {

                // Crear token simple
                String token = createSimpleToken(user.getUsername());

                return new LoginResponse(token, user.getUsername(), "Login exitoso");
            }
        }

        return null; // Login fallido
    }

    // Registro de usuario
    public String register(RegisterRequest registerRequest) {

        // Verificar si ya existe
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return "El username ya existe";
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return "El email ya existe";
        }

        // Crear nuevo usuario
        User newUser = new User();
        newUser.setUsername(registerRequest.getUsername());
        newUser.setPassword(registerRequest.getPassword()); // En producción: encriptar
        newUser.setEmail(registerRequest.getEmail());
        newUser.setActive(true);

        userRepository.save(newUser);
        return "Usuario registrado exitosamente";
    }

    // Crear token simple (JWT básico)
    private String createSimpleToken(String username) {
        // Token muy básico: username:timestamp codificado en base64
        String tokenData = username + ":" + System.currentTimeMillis();
        return Base64.getEncoder().encodeToString(tokenData.getBytes());
    }

    // Validar token
    public boolean validateToken(String token) {
        try {
            String decoded = new String(Base64.getDecoder().decode(token));
            String[] parts = decoded.split(":");

            // Verificar que tenga 2 partes y que el usuario exista
            if (parts.length == 2) {
                return userRepository.existsByUsername(parts[0]);
            }
        } catch (Exception e) {
            return false;
        }
        return false;
    }

    // Obtener username del token
    public String getUsernameFromToken(String token) {
        try {
            String decoded = new String(Base64.getDecoder().decode(token));
            return decoded.split(":")[0];
        } catch (Exception e) {
            return null;
        }
    }

    // Método para validar token desde request HTTP
    public boolean validateTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }
        String token = authHeader.substring(7);
        return validateToken(token);
    }

    // Obtener username desde request HTTP
    public String getUsernameFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        return getUsernameFromToken(token);
    }
}