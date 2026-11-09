package com.guty.siemlite.security.service;

import com.guty.siemlite.security.dto.AdminUserResponse;
import com.guty.siemlite.security.model.Role;
import com.guty.siemlite.security.model.User;
import com.guty.siemlite.security.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserManagementService {

    private final UserRepository userRepository;

    public UserManagementService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminUserResponse updateRole(
            Long userId, String newRole, String currentUsername) {

        User user = getUser(userId);

        Role role;
        try {
            role = Role.valueOf(newRole.trim().toUpperCase());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid role");
        }

        if (user.getUsername().equals(currentUsername)
                && user.getRole() == Role.ADMIN
                && role != Role.ADMIN) {
            throw new IllegalArgumentException(
                    "You cannot remove your own ADMIN role"
            );
        }

        if (user.getRole() == Role.ADMIN
                && role != Role.ADMIN
                && user.isEnabled()
                && countEnabledAdmins() <= 1) {
            throw new IllegalArgumentException(
                    "Cannot demote the last enabled ADMIN"
            );
        }

        user.setRole(role);

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse updateStatus(
            Long userId, boolean enabled, String currentUsername) {

        User user = getUser(userId);

        if (user.getUsername().equals(currentUsername) && !enabled) {
            throw new IllegalArgumentException(
                    "You cannot disable your own account"
            );
        }

        if (user.getRole() == Role.ADMIN
                && user.isEnabled()
                && !enabled
                && countEnabledAdmins() <= 1) {
            throw new IllegalArgumentException(
                    "Cannot disable the last enabled ADMIN"
            );
        }

        user.setEnabled(enabled);

        return toResponse(userRepository.save(user));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }

    private long countEnabledAdmins() {
        return userRepository.findAll()
                .stream()
                .filter(user ->
                        user.getRole() == Role.ADMIN && user.isEnabled())
                .count();
    }

    private AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                user.isEnabled(),
                user.getCreatedAt()
        );
    }
}