package com.challenge.onboarding.app_gestion.service.strategy;

import com.challenge.onboarding.app_gestion.model.Collaborator;
import com.challenge.onboarding.app_gestion.model.OnboardingEvent;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class TechnicalOnboardingAlertStrategy implements AlertStrategy {

    @Override
    public List<Map<String, Object>> processAlerts(List<Collaborator> collaborators,
                                                   List<OnboardingEvent> activeEvents,
                                                   LocalDate checkDate) {

        List<Map<String, Object>> alertsSent = new ArrayList<>();

        System.out.println("🔧 Procesando alertas de onboarding técnico...");

        for (Collaborator collaborator : collaborators) {
            // Solo colaboradores con evento asignado y onboarding técnico pendiente
            if (collaborator.getAssignedTechOnboardingEvent() != null &&
                    !collaborator.isTechOnboardingStatus()) {

                // Buscar el evento correspondiente
                OnboardingEvent assignedEvent = activeEvents.stream()
                        .filter(event -> event.getTitle().equals(collaborator.getAssignedTechOnboardingEvent()))
                        .findFirst()
                        .orElse(null);

                if (assignedEvent != null) {
                    long daysUntilEvent = ChronoUnit.DAYS.between(checkDate, assignedEvent.getStartDate());

                    // Enviar alerta si el evento es en 7 días o menos
                    if (daysUntilEvent <= 7 && daysUntilEvent >= 0) {

                        // SIMULACIÓN EN CONSOLA
                        System.out.println("📧 ALERTA TÉCNICA ENVIADA:");
                        System.out.println("   Para: " + collaborator.getEmail());
                        System.out.println("   Colaborador: " + collaborator.getFullName());
                        System.out.println("   Evento: " + assignedEvent.getTitle());
                        System.out.println("   Fecha evento: " + assignedEvent.getStartDate());
                        System.out.println("   Días restantes: " + daysUntilEvent);
                        System.out.println("   Mensaje: Su onboarding técnico está próximo");
                        System.out.println("   ---");

                        // Información para el frontend
                        Map<String, Object> alertInfo = new HashMap<>();
                        alertInfo.put("collaboratorName", collaborator.getFullName());
                        alertInfo.put("email", collaborator.getEmail());
                        alertInfo.put("eventTitle", assignedEvent.getTitle());
                        alertInfo.put("eventDate", assignedEvent.getStartDate().toString());
                        alertInfo.put("daysUntil", daysUntilEvent);
                        alertInfo.put("alertType", getAlertType());

                        alertsSent.add(alertInfo);
                    }
                }
            }
        }

        return alertsSent;
    }

    @Override
    public String getAlertType() {
        return "TECHNICAL_ONBOARDING";
    }
}