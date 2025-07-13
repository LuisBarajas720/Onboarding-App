package com.challenge.onboarding.app_gestion.service;

import com.challenge.onboarding.app_gestion.dto.CollaboratorCreateDTO;
import com.challenge.onboarding.app_gestion.dto.CollaboratorResponseDTO;
import com.challenge.onboarding.app_gestion.dto.CollaboratorUpdateDTO;
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
import java.util.stream.Collectors;
import com.challenge.onboarding.app_gestion.service.strategy.AlertContext;
@Service
public class CollaboratorService {

    @Autowired
    private CollaboratorRepository collaboratorRepository;

    @Autowired
    private OnboardingEventRepository eventRepository;

    @Autowired
    private AlertContext alertContext;

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
     * Verifica y envía alertas usando el patrón Strategy
     * Ahora delegamos la lógica a estrategias específicas
     */
    public Map<String, Object> checkAndSendAlerts() {
        List<Collaborator> collaborators = collaboratorRepository.findAll();
        List<OnboardingEvent> activeEvents = eventRepository.findByIsActiveTrue();

        // Usar el contexto de estrategias para procesar todas las alertas
        return alertContext.executeAllAlertStrategies(collaborators, activeEvents);
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
    public boolean emailExists(String email, Long excludeId) {
        if (excludeId != null) {
            // Para edición: verificar si existe pero excluir el ID actual
            return collaboratorRepository.existsByEmailAndIdNot(email, excludeId);
        } else {
            // Para creación: verificar si existe
            return collaboratorRepository.existsByEmail(email);
        }
    }
    /**
     * Convierte Collaborator entity a CollaboratorResponseDTO
     */
    public CollaboratorResponseDTO toResponseDTO(Collaborator collaborator) {
        CollaboratorResponseDTO dto = new CollaboratorResponseDTO();
        dto.setId(collaborator.getId());
        dto.setFullName(collaborator.getFullName());
        dto.setEmail(collaborator.getEmail());
        dto.setStartDate(collaborator.getStartDate());
        dto.setWelcomeOnboardingStatus(collaborator.isWelcomeOnboardingStatus());
        dto.setTechOnboardingStatus(collaborator.isTechOnboardingStatus());
        dto.setAssignedTechOnboardingEvent(collaborator.getAssignedTechOnboardingEvent());
        return dto;
    }

    /**
     * Convierte lista de Collaborator entities a lista de DTOs
     */
    public List<CollaboratorResponseDTO> toResponseDTOList(List<Collaborator> collaborators) {
        return collaborators.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convierte CollaboratorCreateDTO a Collaborator entity
     */
    public Collaborator fromCreateDTO(CollaboratorCreateDTO dto) {
        Collaborator collaborator = new Collaborator();
        collaborator.setFullName(dto.getFullName());
        collaborator.setEmail(dto.getEmail());
        collaborator.setStartDate(dto.getStartDate());
        collaborator.setAssignedTechOnboardingEvent(dto.getAssignedTechOnboardingEvent());
        // Los status se inicializan como false por defecto
        collaborator.setWelcomeOnboardingStatus(false);
        collaborator.setTechOnboardingStatus(false);
        return collaborator;
    }

    /**
     * Actualiza Collaborator entity desde CollaboratorUpdateDTO
     */
    public void updateFromDTO(Collaborator collaborator, CollaboratorUpdateDTO dto) {
        collaborator.setFullName(dto.getFullName());
        collaborator.setEmail(dto.getEmail());
        collaborator.setStartDate(dto.getStartDate());
        collaborator.setWelcomeOnboardingStatus(dto.isWelcomeOnboardingStatus());
        collaborator.setTechOnboardingStatus(dto.isTechOnboardingStatus());
        collaborator.setAssignedTechOnboardingEvent(dto.getAssignedTechOnboardingEvent());
    }
    /**
     * Obtiene un colaborador por ID (para uso interno)
    */
    public Collaborator getCollaboratorById(Long id) {
        return collaboratorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Colaborador no encontrado con id: " + id));
    }

    /**
     * Actualiza la entidad colaborador (renombrado para evitar conflictos)
     */
    public Collaborator updateCollaboratorEntity(Long id, Collaborator collaborator) {
        // Buscar y asignar el ID del evento si se proporciona un título
        setEventIdFromTitle(collaborator);
        return collaboratorRepository.save(collaborator);
    }
}