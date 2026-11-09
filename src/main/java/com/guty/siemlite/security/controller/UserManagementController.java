package com.guty.siemlite.security.controller;

import com.guty.siemlite.security.dto.AdminUserResponse;
import com.guty.siemlite.security.dto.UpdateUserRoleRequest;
import com.guty.siemlite.security.dto.UpdateUserStatusRequest;
import com.guty.siemlite.security.service.UserManagementService;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class UserManagementController {

    private final UserManagementService userManagementService;

    public UserManagementController(
            UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @GetMapping
    public List<AdminUserResponse> getAllUsers() {
        return userManagementService.getAllUsers();
    }

    @PutMapping("/{id}/role")
    public AdminUserResponse updateRole(
            @PathVariable Long id,
            @RequestBody UpdateUserRoleRequest request,
            Authentication authentication) {

        return userManagementService.updateRole(
                id,
                request.getRole(),
                authentication.getName()
        );
    }

    @PutMapping("/{id}/status")
    public AdminUserResponse updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateUserStatusRequest request,
            Authentication authentication) {

        return userManagementService.updateStatus(
                id,
                request.isEnabled(),
                authentication.getName()
        );
    }
}