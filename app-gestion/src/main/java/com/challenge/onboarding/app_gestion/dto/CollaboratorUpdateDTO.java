package com.challenge.onboarding.app_gestion.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CollaboratorUpdateDTO {
    private String fullName;
    private String email;
    private LocalDate startDate;
    private boolean welcomeOnboardingStatus;
    private boolean techOnboardingStatus;
    private String assignedTechOnboardingEvent;
}