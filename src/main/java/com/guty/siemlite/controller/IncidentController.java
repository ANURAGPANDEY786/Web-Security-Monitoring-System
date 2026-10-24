package com.guty.siemlite.controller;

import com.guty.siemlite.model.Incident;
import com.guty.siemlite.service.IncidentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    public List<Incident> getAllIncidents(
            Authentication authentication) {

        return incidentService.getAllIncidents(
                authentication.getName());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncidentById(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                incidentService.getIncidentById(
                        id, authentication.getName()));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Incident> assignIncident(
            @PathVariable Long id,
            @RequestParam String assignedAnalyst,
            Authentication authentication) {

        return ResponseEntity.ok(
                incidentService.assignIncident(
                        id, assignedAnalyst, authentication.getName()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Incident> updateIncidentStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) {

        return ResponseEntity.ok(
                incidentService.updateIncidentStatus(
                        id, status, authentication.getName()));
    }

    @PutMapping("/{id}/notes")
    public ResponseEntity<Incident> updateIncidentNotes(
            @PathVariable Long id,
            @RequestParam String notes,
            Authentication authentication) {

        return ResponseEntity.ok(
                incidentService.updateIncidentNotes(
                        id, notes, authentication.getName()));
    }
}