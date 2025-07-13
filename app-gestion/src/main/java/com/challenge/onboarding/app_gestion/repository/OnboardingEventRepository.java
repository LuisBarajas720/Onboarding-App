package com.challenge.onboarding.app_gestion.repository;

import com.challenge.onboarding.app_gestion.model.OnboardingEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OnboardingEventRepository extends JpaRepository<OnboardingEvent, Long> {

    // Encontrar eventos activos
    List<OnboardingEvent> findByIsActiveTrue();

    // Encontrar eventos por rango de fechas
    @Query("SELECT e FROM OnboardingEvent e WHERE e.startDate >= ?1 AND e.endDate <= ?2")
    List<OnboardingEvent> findEventsByDateRange(LocalDate startDate, LocalDate endDate);

    // Encontrar eventos que contengan un texto en el título
    List<OnboardingEvent> findByTitleContainingIgnoreCase(String title);

    // Encontrar eventos activos ordenados por fecha
    @Query("SELECT e FROM OnboardingEvent e WHERE e.isActive = true ORDER BY e.startDate ASC")
    List<OnboardingEvent> findActiveEventsOrderedByDate();

    // Contar participantes por evento (para cuando agregues la relación)
    @Query("SELECT COUNT(c) FROM Collaborator c WHERE c.assignedEventId = ?1")
    Long countParticipantsByEventId(Long eventId);
}