package com.challenge.onboarding.app_gestion.dto;

import lombok.Data;

// Para recibir datos de login
@Data
public class LoginRequest {
    private String username;
    private String password;
}

