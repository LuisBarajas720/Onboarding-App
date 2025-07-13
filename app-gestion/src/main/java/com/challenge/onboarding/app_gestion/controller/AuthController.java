package com.challenge.onboarding.app_gestion.controller;

import com.challenge.onboarding.app_gestion.dto.LoginRequest;
import com.challenge.onboarding.app_gestion.dto.LoginResponse;
import com.challenge.onboarding.app_gestion.dto.RegisterRequest;
import com.challenge.onboarding.app_gestion.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Authentication", description = "Endpoints para autenticación y autorización de usuarios")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Operation(
            summary = "Iniciar sesión",
            description = "Autenticar usuario con credenciales y obtener token JWT"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Login exitoso",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = LoginResponse.class),
                            examples = @ExampleObject(
                                    value = """
                    {
                        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "username": "usuario123",
                        "message": "Login exitoso"
                    }
                    """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Credenciales incorrectas",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = "\"Credenciales incorrectas\"")
                    )
            )
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Credenciales de usuario",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = LoginRequest.class),
                            examples = @ExampleObject(
                                    value = """
                    {
                        "username": "usuario123",
                        "password": "miPassword123"
                    }
                    """
                            )
                    )
            )
            @RequestBody LoginRequest loginRequest) {

        LoginResponse response = authService.login(loginRequest);

        if (response != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body("Credenciales incorrectas");
        }
    }

    @Operation(
            summary = "Registrar nuevo usuario",
            description = "Crear una nueva cuenta de usuario en el sistema"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Usuario registrado exitosamente",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = """
                    {
                        "message": "Usuario registrado exitosamente",
                        "username": "nuevoUsuario"
                    }
                    """
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Error en el registro",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = """
                    {
                        "error": "El usuario ya existe"
                    }
                    """
                            )
                    )
            )
    })
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Datos para registro de usuario",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = RegisterRequest.class),
                            examples = @ExampleObject(
                                    value = """
                    {
                        "username": "nuevoUsuario",
                        "password": "miPassword123",
                        "email": "usuario@ejemplo.com"
                    }
                    """
                            )
                    )
            )
            @RequestBody RegisterRequest registerRequest) {

        String result = authService.register(registerRequest);

        if (result.equals("Usuario registrado exitosamente")) {
            Map<String, String> response = new HashMap<>();
            response.put("message", result);
            response.put("username", registerRequest.getUsername());
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", result);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @Operation(
            summary = "Validar token JWT",
            description = "Verificar si un token JWT es válido y obtener información del usuario"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Token válido",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = "\"Token válido para: usuario123\"")
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Token inválido",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = "\"Token inválido\"")
                    )
            )
    })
    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(
            @Parameter(
                    description = "Token JWT con prefijo 'Bearer '",
                    required = true,
                    example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            )
            @RequestHeader("Authorization") String token) {

        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        boolean isValid = authService.validateToken(token);

        if (isValid) {
            String username = authService.getUsernameFromToken(token);
            return ResponseEntity.ok("Token válido para: " + username);
        } else {
            return ResponseEntity.badRequest().body("Token inválido");
        }
    }
}