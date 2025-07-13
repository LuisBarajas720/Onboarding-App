package com.challenge.onboarding.app_gestion.repository;

import com.challenge.onboarding.app_gestion.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Buscar usuario por username
    Optional<User> findByUsername(String username);

    // Verificar si existe el username
    boolean existsByUsername(String username);

    // Verificar si existe el email
    boolean existsByEmail(String email);
}