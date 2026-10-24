package com.guty.siemlite.service;

import com.guty.siemlite.exception.IncidentNotFoundException;
import com.guty.siemlite.model.Incident;
import com.guty.siemlite.repository.IncidentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;

    public IncidentService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    public List<Incident> getAllIncidents(String ownerUsername) {
        return incidentRepository.findByOwnerUsername(ownerUsername);
    }

    public Incident getIncidentById(Long id, String ownerUsername) {
        return incidentRepository.findByIdAndOwnerUsername(id, ownerUsername)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Incident not found"));
    }

    public Incident assignIncident(
            Long id, String assignedAnalyst, String ownerUsername) {

        Incident incident = getIncidentById(id, ownerUsername);
        incident.setAssignedAnalyst(assignedAnalyst);
        incident.setUpdatedAt(LocalDateTime.now());

        return incidentRepository.save(incident);
    }

  
public Incident updateIncidentStatus(
        Long id, String status, String ownerUsername) {

    if (status == null) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Status is required.");
    }

    status = status.trim().toUpperCase();

    if (!status.equals("OPEN")
            && !status.equals("INVESTIGATING")
            && !status.equals("RESOLVED")) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid status. Use OPEN, INVESTIGATING, or RESOLVED.");
    }

    Incident incident = getIncidentById(id, ownerUsername);
    incident.setStatus(status);
    incident.setUpdatedAt(LocalDateTime.now());

    return incidentRepository.save(incident);
}


    

    public Incident updateIncidentNotes(
            Long id, String notes, String ownerUsername) {

        Incident incident = getIncidentById(id, ownerUsername);
        incident.setNotes(notes);
        incident.setUpdatedAt(LocalDateTime.now());

        return incidentRepository.save(incident);
    }
}