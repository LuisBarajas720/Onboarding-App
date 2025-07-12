package com.challenge.onboarding.app_gestion.repository;

import com.challenge.onboarding.app_gestion.model.Collaborator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * @Repository: Le indica a Spring que esta interfaz es un componente de Repositorio.
 * JpaRepository<Collaborator, Long>: Heredamos de JpaRepository.
 * - 'Collaborator': Es la entidad que este repositorio manejará.
 * - 'Long': Es el tipo de dato de la clave primaria de la entidad (el campo 'id').
 *
 * ¡Y eso es todo! Spring Data JPA nos proveerá métodos como save(), findById(), findAll(), deleteById(), etc.,
 * sin que tengamos que escribir una sola línea de implementación.
 */
@Repository
public interface CollaboratorRepository extends JpaRepository<Collaborator, Long> {
}