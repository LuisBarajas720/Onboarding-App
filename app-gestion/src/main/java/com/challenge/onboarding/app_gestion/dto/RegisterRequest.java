package com.challenge.onboarding.app_gestion.dto;

import lombok.Data;

// Para registro de usuario
@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
}
