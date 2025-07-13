package com.challenge.onboarding.app_gestion.controller;

import com.challenge.onboarding.app_gestion.model.Collaborator;
import com.challenge.onboarding.app_gestion.model.UpdateStatusRequest;
import com.challenge.onboarding.app_gestion.service.CollaboratorService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/collaborators")
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Collaborators", description = "Gestión de colaboradores y su proceso de onboarding")
@SecurityRequirement(name = "bearerAuth")
public class CollaboratorController {

    @Autowired
    private CollaboratorService collaboratorService;

    @Autowired
    private SecurityHelper securityHelper;

    @Operation(
            summary = "Obtener todos los colaboradores",
            description = "Recupera la lista completa de colaboradores registrados en el sistema"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de colaboradores obtenida exitosamente",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = Collaborator.class, type = "array")
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Error al obtener colaboradores",
                    content = @Content(examples = @ExampleObject(value = "\"Error al obtener colaboradores\""))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "No autorizado - Token inválido o faltante"
            )
    })
    @GetMapping
    public ResponseEntity<?> getAllCollaborators(HttpServletRequest request) {
        if (!securityHelper.isValidRequest(request)) {
            return securityHelper.unauthorizedResponse();
        }

        try {
            List<Collaborator> collaborators = collaboratorService.getAllCollaborators();
            return ResponseEntity.ok(collaborators);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener colaboradores");
        }
    }

    @Operation(
            summary = "Crear nuevo colaborador",
            description = "Registra un nuevo colaborador en el sistema con su información básica"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Colaborador creado exitosamente",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = Collaborator.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Error al crear colaborador",
                    content = @Content(examples = @ExampleObject(value = "\"Error al crear colaborador\""))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "No autorizado - Token inválido o faltante"
            )
    })
    @PostMapping
    public ResponseEntity<?> createCollaborator(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Datos del colaborador a crear",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = Collaborator.class),
                            examples = @ExampleObject(
                                    value = """
                    {
                        "name": "Juan Pérez",
                        "email": "juan.perez@empresa.com",
                        "position": "Desarrollador Senior",
                        "department": "Tecnología",
                        "startDate": "2024-01-15"
                    }
                    """
                            )
                    )
            )
            @RequestBody Collaborator collaborator, HttpServletRequest request) {
        if (!securityHelper.isValidRequest(request)) {
            return securityHelper.unauthorizedResponse();
        }

        try {
            Collaborator savedCollaborator = collaboratorService.createCollaborator(collaborator);
            return ResponseEntity.ok(savedCollaborator);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear colaborador");
        }
    }

    @Operation(
            summary = "Actualizar colaborador",
            description = "Actualiza la información completa de un colaborador existente"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Colaborador actualizado exitosamente",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = Collaborator.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Error al actualizar colaborador",
                    content = @Content(examples = @ExampleObject(value = "\"Error al actualizar colaborador\""))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "No autorizado - Token inválido o faltante"
            )
    })
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCollaborator(
            @Parameter(description = "ID del colaborador a actualizar", required = true, example = "1")
            @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Datos actualizados del colaborador",
                    required = true,
                    content = @Content(schema = @Schema(implementation = Collaborator.class))
            )
            @RequestBody Collaborator collaboratorDetails, HttpServletRequest request) {
        if (!securityHelper.isValidRequest(request)) {
            return securityHelper.unauthorizedResponse();
        }

        try {
            Collaborator updatedCollaborator = collaboratorService.updateCollaborator(id, collaboratorDetails);
            return ResponseEntity.ok(updatedCollaborator);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar colaborador");
        }
    }

    @Operation(
            summary = "Eliminar colaborador",
            description = "Elimina un colaborador del sistema de forma permanente"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Colaborador eliminado exitosamente",
                    content = @Content(examples = @ExampleObject(value = "\"Colaborador eliminado exitosamente\""))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Error al eliminar colaborador",
                    content = @Content(examples = @ExampleObject(value = "\"Error al eliminar colaborador\""))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "No autorizado - Token inválido o faltante"
            )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCollaborator(
            @Parameter(description = "ID del colaborador a eliminar", required = true, example = "1")
            @PathVariable Long id, HttpServletRequest request) {
        if (!securityHelper.isValidRequest(request)) {
            return securityHelper.unauthorizedResponse();
        }

        try {
            collaboratorService.deleteCollaborator(id);
            return ResponseEntity.ok("Colaborador eliminado exitosamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar colaborador");
        }
    }

    @Operation(
            summary = "Actualizar estado de onboarding",
            description = "Actualiza el estado de un proceso específico de onboarding para un colaborador"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Estado de onboarding actualizado exitosamente",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = Collaborator.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Error al actualizar estado",
                    content = @Content(examples = @ExampleObject(value = "\"Error al actualizar estado\""))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "No autorizado - Token inválido o faltante"
            )
    })
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOnboardingStatus(
            @Parameter(description = "ID del colaborador", required = true, example = "1")
            @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Datos del estado de onboarding a actualizar",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = UpdateStatusRequest.class),
                            examples = @ExampleObject(
                                    value = """
                    {
                        "onboardingType": "TECHNICAL",
                        "status": true
                    }
                    """
                            )
                    )
            )
            @RequestBody UpdateStatusRequest request, HttpServletRequest httpRequest) {
        if (!securityHelper.isValidRequest(httpRequest)) {
            return securityHelper.unauthorizedResponse();
        }

        try {
            Collaborator updatedCollaborator = collaboratorService.updateOnboardingStatus(id, request.getOnboardingType(), request.isStatus());
            return ResponseEntity.ok(updatedCollaborator);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar estado");
        }
    }

    @Operation(
            summary = "Verificar y enviar alertas de onboarding",
            description = "Ejecuta la verificación automática de alertas para procesos de onboarding técnico pendientes"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Verificación de alertas completada exitosamente",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = """
                    {
                        "alertasSent": 3,
                        "collaboratorsProcessed": 15,
                        "message": "Alertas procesadas exitosamente"
                    }
                    """
                            )
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
    @PostMapping("/check-alerts")
    public ResponseEntity<?> checkAndSendAlerts(HttpServletRequest request) {
        if (!securityHelper.isValidRequest(request)) {
            return securityHelper.unauthorizedResponse();
        }

        try {
            System.out.println("🔔 Iniciando verificación de alertas...");
            Map<String, Object> result = collaboratorService.checkAndSendAlerts();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("❌ Error al verificar alertas: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(
            summary = "Verificar existencia de email",
            description = "Verifica si un email ya existe en el sistema, con opción de excluir un ID específico"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Verificación completada",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(type = "boolean"),
                            examples = @ExampleObject(value = "true")
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Error al verificar email",
                    content = @Content(examples = @ExampleObject(value = "\"Error al verificar email\""))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "No autorizado - Token inválido o faltante"
            )
    })
    @GetMapping("/check-email/{email}")
    public ResponseEntity<?> checkEmailExists(
            @Parameter(description = "Email a verificar", required = true, example = "usuario@empresa.com")
            @PathVariable String email,
            @Parameter(description = "ID del colaborador a excluir de la verificación", required = false, example = "1")
            @RequestParam(required = false) Long excludeId,
            HttpServletRequest request) {

        if (!securityHelper.isValidRequest(request)) {
            return securityHelper.unauthorizedResponse();
        }

        try {
            boolean exists = collaboratorService.emailExists(email, excludeId);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al verificar email");
        }
    }
}