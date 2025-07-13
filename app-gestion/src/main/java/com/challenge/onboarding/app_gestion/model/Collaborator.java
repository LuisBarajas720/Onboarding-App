package com.challenge.onboarding.app_gestion.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "collaborators")
public class Collaborator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "welcome_onboarding_status")
    private boolean welcomeOnboardingStatus;

    @Column(name = "tech_onboarding_status")
    private boolean techOnboardingStatus;

    @Column(name = "assigned_tech_onboarding_event")
    private String assignedTechOnboardingEvent;

    @Column(name = "assigned_event_id")
    private Long assignedEventId;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_event_id", insertable = false, updatable = false)
    private OnboardingEvent assignedEvent;
}