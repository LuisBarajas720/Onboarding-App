package com.challenge.onboarding.app_gestion.dto;

import lombok.Data;

// Para enviar respuesta de login exitoso
@Data
public class LoginResponse {
    private String token;
    private String username;
    private String message;

    public LoginResponse(String token, String username, String message) {
        this.token = token;
        this.username = username;
        this.message = message;
    }
}
