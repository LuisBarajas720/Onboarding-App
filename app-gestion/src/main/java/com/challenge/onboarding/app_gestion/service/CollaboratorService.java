package com.challenge.onboarding.app_gestion.service;

import com.challenge.onboarding.app_gestion.model.Collaborator;
import com.challenge.onboarding.app_gestion.repository.CollaboratorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @Service: Marca esta clase como un componente de servicio de Spring.
 * Aquí es donde reside la lógica de negocio principal.
 */
@Service
public class CollaboratorService {

    // @Autowired: Inyección de Dependencias. Spring nos 'inyecta' automáticamente
    // una instancia del CollaboratorRepository para que podamos usarla.
    @Autowired
    private CollaboratorRepository collaboratorRepository;

    public List<Collaborator> getAllCollaborators() {
        return collaboratorRepository.findAll();
    }

    public Collaborator createCollaborator(Collaborator collaborator) {
        // Aquí podríamos añadir lógica de negocio, como validaciones, antes de guardar.
        return collaboratorRepository.save(collaborator);
    }

    public Collaborator updateCollaborator(Long id, Collaborator collaboratorDetails) {
        // Buscamos el colaborador por ID. Si no existe, arrojamos una excepción.
        Collaborator collaborator = collaboratorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Colaborador no encontrado con id: " + id));

        // Actualizamos los campos con los nuevos valores
        collaborator.setFullName(collaboratorDetails.getFullName());
        collaborator.setEmail(collaboratorDetails.getEmail());
        collaborator.setStartDate(collaboratorDetails.getStartDate());
        collaborator.setWelcomeOnboardingStatus(collaboratorDetails.isWelcomeOnboardingStatus());
        collaborator.setTechOnboardingStatus(collaboratorDetails.isTechOnboardingStatus());
        collaborator.setAssignedTechOnboardingEvent(collaboratorDetails.getAssignedTechOnboardingEvent());

        // Guardamos el colaborador actualizado en la base de datos
        return collaboratorRepository.save(collaborator);
    }

    public void deleteCollaborator(Long id) {
        // Buscamos para asegurarnos de que existe antes de borrar
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

}