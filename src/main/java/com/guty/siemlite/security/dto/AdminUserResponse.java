package com.guty.siemlite.security.dto;

import java.time.LocalDateTime;

public class AdminUserResponse {

    private Long id;
    private String username;
    private String role;
    private boolean enabled;
    private LocalDateTime createdAt;

    public AdminUserResponse(
            Long id,
            String username,
            String role,
            boolean enabled,
            LocalDateTime createdAt) {

        this.id = id;
        this.username = username;
        this.role = role;
        this.enabled = enabled;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}