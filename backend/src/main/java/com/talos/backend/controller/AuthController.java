package com.talos.backend.controller;

import com.talos.backend.dto.LoginRequest;
import com.talos.backend.dto.LoginResponse;
import com.talos.backend.entity.User;
import com.talos.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request
    ) {

        try {

            User user = userService.authenticateUser(
                    request.getUsername(),
                    request.getPassword()
            );

            return new LoginResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName()
            );

        } catch (RuntimeException exception) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid username or password"
            );
        }
    }
}