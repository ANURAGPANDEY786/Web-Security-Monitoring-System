package com.guty.siemlite.security.service;

import com.guty.siemlite.audit.model.AuditAction;
import com.guty.siemlite.audit.service.AuditLogService;
import com.guty.siemlite.security.dto.ChangePasswordRequest;
import com.guty.siemlite.security.dto.LoginRequest;
import com.guty.siemlite.security.dto.LoginResponse;
import com.guty.siemlite.security.dto.RegisterRequest;
import com.guty.siemlite.security.dto.UserResponse;
import com.guty.siemlite.security.jwt.JwtService;
import com.guty.siemlite.security.model.Role;
import com.guty.siemlite.security.model.User;
import com.guty.siemlite.security.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.guty.siemlite.security.dto.ChangePasswordRequest;

@Service
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomUserDetailsService userDetailsService;
    private final AuditLogService auditLogService;

    public AuthenticationService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            CustomUserDetailsService userDetailsService,
            AuditLogService auditLogService) {

        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userDetailsService = userDetailsService;
        this.auditLogService = auditLogService;
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtService.generateToken(userDetails);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        auditLogService.log(
                AuditAction.USER_LOGIN_SUCCESS,
                user.getUsername(),
                "User logged in successfully"
        );

        return new LoginResponse(
                token,
                user.getUsername(),
                user.getRole().name()
        );
    }

   
public UserResponse register(RegisterRequest request) {
    if (userRepository.findByUsername(request.getUsername()).isPresent()) {
        throw new RuntimeException("Username already exists");
    }

    // Public registration always creates an ANALYST.
    // Never trust the role supplied by the frontend.
    Role role = Role.ANALYST;

    User user = new User(
            request.getUsername(),
            passwordEncoder.encode(request.getPassword()),
            role
    );

    User savedUser = userRepository.save(user);

    auditLogService.log(
            AuditAction.USER_REGISTERED,
            savedUser.getUsername(),
            "User registered with role: " + savedUser.getRole().name()
    );

    return new UserResponse(
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getRole().name()
    );
}

    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole().name()
        );
    }
    


// Add this method inside AuthenticationService class

@Transactional
public void changePassword(
        String username,
        ChangePasswordRequest request) {

    User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

    // Verify current password
    if (!passwordEncoder.matches(
            request.getCurrentPassword(),
            user.getPassword())) {

        throw new IllegalArgumentException("Current password is incorrect");
    }

    // Validate new password
    if (request.getNewPassword() == null ||
            request.getNewPassword().length() < 8) {

        throw new IllegalArgumentException(
                "New password must contain at least 8 characters");
    }

    // Confirm new password
    if (!request.getNewPassword().equals(request.getConfirmPassword())) {

        throw new IllegalArgumentException(
                "New password and confirm password do not match");
    }

    // Prevent reusing the current password
    if (passwordEncoder.matches(
            request.getNewPassword(),
            user.getPassword())) {

        throw new IllegalArgumentException(
                "New password must be different from current password");
    }

    // Save encrypted password
    // Save encrypted password
user.setPassword(passwordEncoder.encode(request.getNewPassword()));

// Invalidate all previously generated JWT tokens
user.setTokenVersion(user.getTokenVersion() + 1);

userRepository.save(user);
    // Record security audit event
    auditLogService.log(
            AuditAction.PASSWORD_CHANGED,
            username,
            "User changed their password"
    );
}

}