package com.challenge.onboarding.app_gestion.controller;

import com.challenge.onboarding.app_gestion.model.OnboardingEvent;
import com.challenge.onboarding.app_gestion.service.OnboardingEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/onboarding-events")
@CrossOrigin(origins = "*")
public class OnboardingEventController {

    @Autowired
    private OnboardingEventService eventService;

    // GET /api/onboarding-events - Obtener todos los eventos
    @GetMapping
    public ResponseEntity<List<OnboardingEvent>> getAllEvents() {
        try {
            List<OnboardingEvent> events = eventService.getAllEvents();
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET /api/onboarding-events/active - Obtener solo eventos activos
    @GetMapping("/active")
    public ResponseEntity<List<OnboardingEvent>> getActiveEvents() {
        try {
            List<OnboardingEvent> events = eventService.getActiveEvents();
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET /api/onboarding-events/{id} - Obtener evento por ID
    @GetMapping("/{id}")
    public ResponseEntity<OnboardingEvent> getEventById(@PathVariable Long id) {
        try {
            Optional<OnboardingEvent> event = eventService.getEventById(id);
            return event.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // POST /api/onboarding-events - Crear nuevo evento
    @PostMapping
    public ResponseEntity<OnboardingEvent> createEvent(@RequestBody OnboardingEvent event) {
        try {
            OnboardingEvent createdEvent = eventService.createEvent(event);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // PUT /api/onboarding-events/{id} - Actualizar evento
    @PutMapping("/{id}")
    public ResponseEntity<OnboardingEvent> updateEvent(@PathVariable Long id,
                                                       @RequestBody OnboardingEvent eventDetails) {
        try {
            OnboardingEvent updatedEvent = eventService.updateEvent(id, eventDetails);
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // DELETE /api/onboarding-events/{id} - Eliminar evento
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET /api/onboarding-events/search?title=... - Buscar por título
    @GetMapping("/search")
    public ResponseEntity<List<OnboardingEvent>> searchEvents(@RequestParam String title) {
        try {
            List<OnboardingEvent> events = eventService.searchEventsByTitle(title);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET /api/onboarding-events/date-range?start=...&end=... - Filtrar por fechas
    @GetMapping("/date-range")
    public ResponseEntity<List<OnboardingEvent>> getEventsByDateRange(
            @RequestParam LocalDate start,
            @RequestParam LocalDate end) {
        try {
            List<OnboardingEvent> events = eventService.getEventsByDateRange(start, end);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET /api/onboarding-events/{id}/participants-count - Contar participantes
    @GetMapping("/{id}/participants-count")
    public ResponseEntity<Long> getParticipantCount(@PathVariable Long id) {
        try {
            Long count = eventService.getParticipantCount(id);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}