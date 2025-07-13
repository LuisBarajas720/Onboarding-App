package com.challenge.onboarding.app_gestion.service;

import com.challenge.onboarding.app_gestion.model.Collaborator;
import com.challenge.onboarding.app_gestion.model.OnboardingEvent;
import com.challenge.onboarding.app_gestion.repository.CollaboratorRepository;
import com.challenge.onboarding.app_gestion.repository.OnboardingEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CollaboratorService {

    @Autowired
    private CollaboratorRepository collaboratorRepository;

    @Autowired
    private OnboardingEventRepository eventRepository;

    public List<Collaborator> getAllCollaborators() {
        return collaboratorRepository.findAll();
    }

    public Collaborator createCollaborator(Collaborator collaborator) {
        // Buscar y asignar el ID del evento si se proporciona un título
        setEventIdFromTitle(collaborator);
        return collaboratorRepository.save(collaborator);
    }

    public Collaborator updateCollaborator(Long id, Collaborator collaboratorDetails) {
        Collaborator collaborator = collaboratorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Colaborador no encontrado con id: " + id));

        // Actualizamos los campos con los nuevos valores
        collaborator.setFullName(collaboratorDetails.getFullName());
        collaborator.setEmail(collaboratorDetails.getEmail());
        collaborator.setStartDate(collaboratorDetails.getStartDate());
        collaborator.setWelcomeOnboardingStatus(collaboratorDetails.isWelcomeOnboardingStatus());
        collaborator.setTechOnboardingStatus(collaboratorDetails.isTechOnboardingStatus());
        collaborator.setAssignedTechOnboardingEvent(collaboratorDetails.getAssignedTechOnboardingEvent());

        // Buscar y asignar el ID del evento si se proporciona un título
        setEventIdFromTitle(collaborator);

        return collaboratorRepository.save(collaborator);
    }

    public void deleteCollaborator(Long id) {
        Collaborator collaborator = collaboratorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Colaborador no encontrado con id: " + id));
        collaboratorRepository.delete(collaborator);
    }

    public Collaborator updateOnboardingStatus(Long id, String onboardingType, boolean status) {
        Collaborator collaborator = collaboratorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Colaborador no encontrado con id: " + id));

        if ("welcome".equalsIgnoreCase(onboardingType)) {
            collaborator.setWelcomeOnboardingStatus(status);
        } else if ("tech".equalsIgnoreCase(onboardingType)) {
            collaborator.setTechOnboardingStatus(status);
        } else {
            throw new IllegalArgumentException("Tipo de onboarding no válido: " + onboardingType);
        }

        return collaboratorRepository.save(collaborator);
    }

    // ===========================
    // SISTEMA DE ALERTAS SIMPLE
    // ===========================

    /**
     * Verifica y envía alertas para eventos próximos (7 días o menos)
     * Simula el envío de correos y retorna la información para mostrar en frontend
     */
    public Map<String, Object> checkAndSendAlerts() {
        LocalDate today = LocalDate.now();
        List<Collaborator> collaborators = collaboratorRepository.findAll();
        List<OnboardingEvent> activeEvents = eventRepository.findByIsActiveTrue();

        List<Map<String, Object>> alertsSent = new ArrayList<>();

        System.out.println("=== SISTEMA DE ALERTAS DE ONBOARDING ===");
        System.out.println("Fecha de verificación: " + today);

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
                    long daysUntilEvent = ChronoUnit.DAYS.between(today, assignedEvent.getStartDate());

                    // Enviar alerta si el evento es en 7 días o menos
                    if (daysUntilEvent <= 7 && daysUntilEvent >= 0) {

                        // SIMULACIÓN EN CONSOLA
                        System.out.println("📧 ALERTA ENVIADA:");
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

                        alertsSent.add(alertInfo);
                    }
                }
            }
        }

        System.out.println("Total de alertas enviadas: " + alertsSent.size());
        System.out.println("=====================================");

        // Respuesta para el frontend
        Map<String, Object> response = new HashMap<>();
        response.put("checkDate", today.toString());
        response.put("totalAlerts", alertsSent.size());
        response.put("alerts", alertsSent);

        return response;
    }

    // MÉTODO EXISTENTE: Conecta el título del evento con su ID
    private void setEventIdFromTitle(Collaborator collaborator) {
        if (collaborator.getAssignedTechOnboardingEvent() != null &&
                !collaborator.getAssignedTechOnboardingEvent().trim().isEmpty()) {

            // Buscar el evento por título
            List<OnboardingEvent> events = eventRepository.findByTitleContainingIgnoreCase(
                    collaborator.getAssignedTechOnboardingEvent()
            );

            if (!events.isEmpty()) {
                // Si encuentra el evento, asignar su ID
                collaborator.setAssignedEventId(events.get(0).getId());
            }
        } else {
            // Si no hay evento asignado, limpiar el ID
            collaborator.setAssignedEventId(null);
        }
    }
}