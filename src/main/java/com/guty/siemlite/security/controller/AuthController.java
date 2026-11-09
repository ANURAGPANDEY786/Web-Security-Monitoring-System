
package com.guty.siemlite.security.controller;

import com.guty.siemlite.security.dto.LoginRequest;
import com.guty.siemlite.security.dto.LoginResponse;
import com.guty.siemlite.security.dto.RegisterRequest;
import com.guty.siemlite.security.dto.UserResponse;
import com.guty.siemlite.security.dto.ChangePasswordRequest;
import com.guty.siemlite.security.service.AuthenticationService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationService authenticationService;

    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authenticationService.login(request);
    }

    @PostMapping("/register")
    public UserResponse register(@RequestBody RegisterRequest request) {
        return authenticationService.register(request);
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return authenticationService.getCurrentUser(authentication.getName());
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        authenticationService.changePassword(
                authentication.getName(),
                request
        );

        return ResponseEntity.ok("Password changed successfully");
    }
}
