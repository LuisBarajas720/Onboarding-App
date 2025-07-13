package com.challenge.onboarding.app_gestion.controller;

import com.challenge.onboarding.app_gestion.model.Collaborator;
import com.challenge.onboarding.app_gestion.model.UpdateStatusRequest;
import com.challenge.onboarding.app_gestion.service.CollaboratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/collaborators")
@CrossOrigin(origins = "http://localhost:4200")
public class CollaboratorController {

    @Autowired
    private CollaboratorService collaboratorService;

    @GetMapping
    public List<Collaborator> getAllCollaborators() {
        return collaboratorService.getAllCollaborators();
    }

    @PostMapping
    public Collaborator createCollaborator(@RequestBody Collaborator collaborator) {
        return collaboratorService.createCollaborator(collaborator);
    }

    @PutMapping("/{id}")
    public Collaborator updateCollaborator(@PathVariable Long id, @RequestBody Collaborator collaboratorDetails) {
        return collaboratorService.updateCollaborator(id, collaboratorDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteCollaborator(@PathVariable Long id) {
        collaboratorService.deleteCollaborator(id);
    }

    @PatchMapping("/{id}/status")
    public Collaborator updateOnboardingStatus(@PathVariable Long id, @RequestBody UpdateStatusRequest request) {
        return collaboratorService.updateOnboardingStatus(id, request.getOnboardingType(), request.isStatus());
    }

    // ===========================
    // ENDPOINT SIMPLE DE ALERTAS
    // ===========================

    /**
     * Endpoint para verificar y enviar alertas de onboarding técnico.
     * Se accede vía: POST http://localhost:8080/api/v1/collaborators/check-alerts
     */
    @PostMapping("/check-alerts")
    public ResponseEntity<Map<String, Object>> checkAndSendAlerts() {
        try {
            System.out.println("🔔 Iniciando verificación de alertas...");
            Map<String, Object> result = collaboratorService.checkAndSendAlerts();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("❌ Error al verificar alertas: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    @GetMapping("/check-email/{email}")
    public ResponseEntity<Boolean> checkEmailExists(
            @PathVariable String email,
            @RequestParam(required = false) Long excludeId) {

        boolean exists = collaboratorService.emailExists(email, excludeId);
        return ResponseEntity.ok(exists);
    }
}