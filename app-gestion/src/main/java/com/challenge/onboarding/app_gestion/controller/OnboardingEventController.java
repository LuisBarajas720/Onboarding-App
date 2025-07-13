package com.challenge.onboarding.app_gestion.controller;

import com.challenge.onboarding.app_gestion.model.OnboardingEvent;
import com.challenge.onboarding.app_gestion.service.OnboardingEventService;
import com.challenge.onboarding.app_gestion.util.SecurityHelper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/onboarding-events")
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Onboarding Events", description = "Gestión de eventos de onboarding para colaboradores")
@SecurityRequirement(name = "bearerAuth")
public class OnboardingEventController {

    @Autowired
    private OnboardingEventService eventService;

    @Autowired
    private SecurityHelper securityHelper;

    @Operation(
            summary = "Obtener todos los eventos de onboarding",
            description = "Recupera la lista completa de eventos de onboarding registrados en el sistema"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de eventos obtenida exitosamente",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = OnboardingEvent.class, type = "array")
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Error interno del servidor"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "No autorizado - Token inválido o faltante"
            )
    })
    @GetMapping
    public ResponseEntity<?> getAllEvents(HttpServletRequest request) {
        if (!securityHelper.isValidRequest(request)) {
            return securityHelper.unauthorizedResponse();
        }

        try {
            List<OnboardingEvent> events = eventService.getAllEvents();
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(
            summary = "Obtener eventos activos",
            description = "Recupera únicamente los eventos de onboarding que se encuentran activos"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de eventos activos obtenida exitosamente",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = OnboardingEvent.class, type = "array")
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Error interno del servidor"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "No autorizado - Token inválido o faltante"
            )
    })
    @GetMapping("/active")
    public ResponseEntity<?> getActiveEvents(HttpServletRequest request) {
        if (!securityHelper.isValidRequest(request)) {
            return securityHelper.unauthorizedResponse();
        }

        try {
            List<OnboardingEvent> events = eventService.getActiveEvents();
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(
            summary = "Obtener evento por ID",
            description = "Recupera un evento específico de onboarding mediante su identificador único"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Evento encontrado exitosamente",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = OnboardingEvent.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Evento no encontrado"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Error interno del servidor"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "No autorizado - Token inválido o faltante"
            )
    })
    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(
            @Parameter(description = "ID del evento de onboarding", required = true, example = "1")
            @PathVariable Long id, HttpServletRequest request) {
        if (!securityHelper.isValidRequest(request)) {
            return securityHelper.unauthorizedResponse();
        }

        try {
            Optional<OnboardingEvent> event = eventService.getEventById(id);
            return event.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(
            summary = "Crear nuevo evento de onboarding",
            description = "Registra un nuevo evento de onboarding en el sistema"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Evento creado exitosamente",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = OnboardingEvent.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Datos de entrada inválidos"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Error interno del servidor"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "No autorizado - Token inválido o faltante"
            )
    })
    @PostMapping
    public ResponseEntity<?> createEvent(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Datos del evento de onboarding a crear",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = OnboardingEvent.class),
                            examples = @ExampleObject(
                                    value = """
                    {
                        "title": "Sesión de Bienvenida",
                        "description": "Introducción a la empresa y cultura organizacional",
                        "eventDate": "2024-02-15",
                        "startTime": "09:00",
                        "endTime": "11:00",
                        "location": "Auditorio Principal",
                        "maxParticipants": 25,
                        "active": true
                    }
                    """
                            )
                    )
            )
            @RequestBody OnboardingEvent event, HttpServletRequest request) {
        if (!securityHelper.isValidRequest(request)) {
            return securityHelper.unauthorizedResponse();
        }

        try {
            OnboardingEvent createdEvent = eventService.createEvent(event);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(
            summary = "Actualizar evento de onboarding",
            description = "Actualiza la información completa de un evento de onboarding existente"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Evento actualizado exitosamente",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = OnboardingEvent.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Evento no encontrado"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Error interno del servidor"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "No autorizado - Token inválido o faltante"
            )
    })
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(
            @Parameter(description = "ID del evento a actualizar", required = true, example = "1")
            @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Datos actualizados del evento",
                    required = true,
                    content = @Content(schema = @Schema(implementation = OnboardingEvent.class))
            )
            @RequestBody OnboardingEvent eventDetails,
            HttpServletRequest request) {
        if (!securityHelper.isValidRequest(request)) {
            return securityHelper.unauthorizedResponse();
        }

        try {
            OnboardingEvent updatedEvent = eventService.updateEvent(id, eventDetails);
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(
            summary = "Eliminar evento de onboarding",
            description = "Elimina un evento de onboarding del sistema de forma permanente"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Evento eliminado exitosamente"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Evento no encontrado"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Error interno del servidor"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "No autorizado - Token inválido o faltante"
            )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(
            @Parameter(description = "ID del evento a eliminar", required = true, example = "1")
            @PathVariable Long id, HttpServletRequest request) {
        if (!securityHelper.isValidRequest(request)) {
            return securityHelper.unauthorizedResponse();
        }

        try {
            eventService.deleteEvent(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(
            summary = "Buscar eventos por título",
            description = "Busca eventos de onboarding que contengan el texto especificado en su título"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Búsqueda completada exitosamente",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = OnboardingEvent.class, type = "array")
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Error interno del servidor"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "No autorizado - Token inválido o faltante"
            )
    })
    @GetMapping("/search")
    public ResponseEntity<?> searchEvents(
            @Parameter(description = "Texto a buscar en el título del evento", required = true, example = "Bienvenida")
            @RequestParam String title, HttpServletRequest request) {
        if (!securityHelper.isValidRequest(request)) {
            return securityHelper.unauthorizedResponse();
        }

        try {
            List<OnboardingEvent> events = eventService.searchEventsByTitle(title);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(
            summary = "Filtrar eventos por rango de fechas",
            description = "Obtiene eventos de onboarding que se encuentren dentro del rango de fechas especificado"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Filtrado completado exitosamente",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = OnboardingEvent.class, type = "array")
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Error interno del servidor"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "No autorizado - Token inválido o faltante"
            )
    })
    @GetMapping("/date-range")
    public ResponseEntity<?> getEventsByDateRange(
            @Parameter(description = "Fecha de inicio del rango", required = true, example = "2024-01-01")
            @RequestParam LocalDate start,
            @Parameter(description = "Fecha de fin del rango", required = true, example = "2024-12-31")
            @RequestParam LocalDate end,
            HttpServletRequest request) {
        if (!securityHelper.isValidRequest(request)) {
            return securityHelper.unauthorizedResponse();
        }

        try {
            List<OnboardingEvent> events = eventService.getEventsByDateRange(start, end);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(
            summary = "Contar participantes de un evento",
            description = "Obtiene el número total de participantes registrados en un evento específico"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Conteo completado exitosamente",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(type = "integer", format = "int64"),
                            examples = @ExampleObject(value = "15")
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Error interno del servidor"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "No autorizado - Token inválido o faltante"
            )
    })
    @GetMapping("/{id}/participants-count")
    public ResponseEntity<?> getParticipantCount(
            @Parameter(description = "ID del evento para contar participantes", required = true, example = "1")
            @PathVariable Long id, HttpServletRequest request) {
        if (!securityHelper.isValidRequest(request)) {
            return securityHelper.unauthorizedResponse();
        }

        try {
            Long count = eventService.getParticipantCount(id);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}