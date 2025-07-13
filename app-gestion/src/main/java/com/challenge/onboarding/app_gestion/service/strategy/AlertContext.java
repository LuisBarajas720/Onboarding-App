package com.challenge.onboarding.app_gestion.service.strategy;

import com.challenge.onboarding.app_gestion.model.Collaborator;
import com.challenge.onboarding.app_gestion.model.OnboardingEvent;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class AlertContext {

    private final List<AlertStrategy> alertStrategies;

    public AlertContext(List<AlertStrategy> alertStrategies) {
        this.alertStrategies = alertStrategies;
    }

    /**
     * Ejecuta todas las estrategias de alerta disponibles
     */
    public Map<String, Object> executeAllAlertStrategies(List<Collaborator> collaborators,
                                                         List<OnboardingEvent> activeEvents) {

        LocalDate today = LocalDate.now();
        List<Map<String, Object>> allAlerts = new ArrayList<>();

        System.out.println("=== SISTEMA DE ALERTAS DE ONBOARDING ===");
        System.out.println("Fecha de verificación: " + today);

        // Ejecutar todas las estrategias
        for (AlertStrategy strategy : alertStrategies) {
            List<Map<String, Object>> strategyAlerts = strategy.processAlerts(collaborators, activeEvents, today);
            allAlerts.addAll(strategyAlerts);
        }

        System.out.println("Total de alertas enviadas: " + allAlerts.size());
        System.out.println("=====================================");

        // Respuesta para el frontend
        Map<String, Object> response = new HashMap<>();
        response.put("checkDate", today.toString());
        response.put("totalAlerts", allAlerts.size());
        response.put("alerts", allAlerts);

        return response;
    }
}