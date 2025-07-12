package com.challenge.onboarding.app_gestion.controller;

import com.challenge.onboarding.app_gestion.model.Collaborator;
import com.challenge.onboarding.app_gestion.model.UpdateStatusRequest;
import com.challenge.onboarding.app_gestion.service.CollaboratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @RestController: Combina @Controller y @ResponseBody. Crea una API REST.
 * @RequestMapping: Define la URL base para todos los endpoints en este controlador.
 */
@RestController
@RequestMapping("/api/v1/collaborators")
// @CrossOrigin: ¡MUY IMPORTANTE! Permite que nuestra app de Angular (en localhost:4200)
// pueda hacer peticiones a este backend (en localhost:8080) sin errores de CORS.
@CrossOrigin(origins = "http://localhost:4200")
public class CollaboratorController {

    @Autowired
    private CollaboratorService collaboratorService;

    /**
     * Endpoint para OBTENER todos los colaboradores.
     * Se accede vía: GET http://localhost:8080/api/v1/collaborators
     */
    @GetMapping
    public List<Collaborator> getAllCollaborators() {
        return collaboratorService.getAllCollaborators();
    }

    /**
     * Endpoint para CREAR un nuevo colaborador.
     * Se accede vía: POST http://localhost:8080/api/v1/collaborators
     * @RequestBody: Le dice a Spring que el objeto 'collaborator' vendrá en el cuerpo (body) de la petición HTTP en formato JSON.
     */
    @PostMapping
    public Collaborator createCollaborator(@RequestBody Collaborator collaborator) {
        return collaboratorService.createCollaborator(collaborator);
    }

    /**
     * Endpoint para ACTUALIZAR un colaborador existente.
     * Se accede vía: PUT http://localhost:8080/api/v1/collaborators/{id}
     */
    @PutMapping("/{id}")
    public Collaborator updateCollaborator(@PathVariable Long id, @RequestBody Collaborator collaboratorDetails) {
        return collaboratorService.updateCollaborator(id, collaboratorDetails);
    }

    /**
     * Endpoint para ELIMINAR un colaborador.
     * Se accede vía: DELETE http://localhost:8080/api/v1/collaborators/{id}
     */
    @DeleteMapping("/{id}")
    public void deleteCollaborator(@PathVariable Long id) {
        collaboratorService.deleteCollaborator(id);
    }

    /**
     * Endpoint para ACTUALIZAR PARCIALMENTE el estado de un onboarding.
     * Se accede vía: PATCH http://localhost:8080/api/v1/collaborators/{id}/status
     */
    @PatchMapping("/{id}/status")
    public Collaborator updateOnboardingStatus(@PathVariable Long id, @RequestBody UpdateStatusRequest request) {
        return collaboratorService.updateOnboardingStatus(id, request.getOnboardingType(), request.isStatus());
    }

}