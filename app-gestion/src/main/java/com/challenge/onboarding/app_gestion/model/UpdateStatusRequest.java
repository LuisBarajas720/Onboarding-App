package com.challenge.onboarding.app_gestion.model;

import lombok.Data;

@Data
public class UpdateStatusRequest {
    private String onboardingType;
    private boolean status;
}