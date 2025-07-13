package com.challenge.onboarding.app_gestion.service;

import com.challenge.onboarding.app_gestion.model.OnboardingEvent;
import com.challenge.onboarding.app_gestion.repository.OnboardingEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class OnboardingEventService {

    @Autowired
    private OnboardingEventRepository eventRepository;

    // Obtener todos los eventos
    public List<OnboardingEvent> getAllEvents() {
        return eventRepository.findAll();
    }

    // Obtener solo eventos activos
    public List<OnboardingEvent> getActiveEvents() {
        return eventRepository.findActiveEventsOrderedByDate();
    }

    // Obtener evento por ID
    public Optional<OnboardingEvent> getEventById(Long id) {
        return eventRepository.findById(id);
    }

    // Crear nuevo evento
    public OnboardingEvent createEvent(OnboardingEvent event) {
        validateEvent(event);
        return eventRepository.save(event);
    }

    // Actualizar evento existente
    public OnboardingEvent updateEvent(Long id, OnboardingEvent eventDetails) {
        Optional<OnboardingEvent> optionalEvent = eventRepository.findById(id);

        if (optionalEvent.isPresent()) {
            OnboardingEvent event = optionalEvent.get();

            event.setTitle(eventDetails.getTitle());
            event.setDescription(eventDetails.getDescription());
            event.setStartDate(eventDetails.getStartDate());
            event.setEndDate(eventDetails.getEndDate());
            event.setColor(eventDetails.getColor());
            event.setMaxParticipants(eventDetails.getMaxParticipants());
            event.setIsActive(eventDetails.getIsActive());

            validateEvent(event);
            return eventRepository.save(event);
        } else {
            throw new RuntimeException("Evento no encontrado con ID: " + id);
        }
    }

    // Eliminar evento
    public void deleteEvent(Long id) {
        if (eventRepository.existsById(id)) {
            eventRepository.deleteById(id);
        } else {
            throw new RuntimeException("Evento no encontrado con ID: " + id);
        }
    }

    // Buscar eventos por título
    public List<OnboardingEvent> searchEventsByTitle(String title) {
        return eventRepository.findByTitleContainingIgnoreCase(title);
    }

    // Obtener eventos por rango de fechas
    public List<OnboardingEvent> getEventsByDateRange(LocalDate startDate, LocalDate endDate) {
        return eventRepository.findEventsByDateRange(startDate, endDate);
    }

    // Contar participantes de un evento
    public Long getParticipantCount(Long eventId) {
        return eventRepository.countParticipantsByEventId(eventId);
    }

    // Validar datos del evento
    private void validateEvent(OnboardingEvent event) {
        if (event.getTitle() == null || event.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("El título del evento es obligatorio");
        }

        if (event.getStartDate() == null || event.getEndDate() == null) {
            throw new IllegalArgumentException("Las fechas de inicio y fin son obligatorias");
        }


        if (event.getStartDate().isAfter(event.getEndDate())) {
            throw new IllegalArgumentException("La fecha de inicio no puede ser posterior a la fecha de fin");
        }

        if (event.getMaxParticipants() == null || event.getMaxParticipants() < 1) {
            throw new IllegalArgumentException("El número máximo de participantes debe ser mayor a 0");
        }

        if (event.getColor() == null || !event.getColor().matches("^#[0-9A-Fa-f]{6}$")) {
            throw new IllegalArgumentException("El color debe ser un código hexadecimal válido");
        }
    }
}