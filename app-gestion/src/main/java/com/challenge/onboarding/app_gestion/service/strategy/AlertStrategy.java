package com.challenge.onboarding.app_gestion.service.strategy;

import com.challenge.onboarding.app_gestion.model.Collaborator;
import com.challenge.onboarding.app_gestion.model.OnboardingEvent;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface AlertStrategy {
    /**
     * Procesa alertas para un tipo específico de onboarding
     * @param collaborators Lista de colaboradores
     * @param activeEvents Lista de eventos activos
     * @param checkDate Fecha de verificación
     * @return Lista de alertas enviadas
     */
    List<Map<String, Object>> processAlerts(List<Collaborator> collaborators,
                                            List<OnboardingEvent> activeEvents,
                                            LocalDate checkDate);

    /**
     * Nombre del tipo de alerta
     */
    String getAlertType();
}