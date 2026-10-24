
package com.guty.siemlite.service;

import com.guty.siemlite.model.Alert;
import com.guty.siemlite.model.Incident;
import com.guty.siemlite.repository.IncidentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CorrelationService {

    private final IncidentRepository incidentRepository;

    public CorrelationService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    
        public void analyze(Alert alert) {


    System.out.println(
        "CORRELATION CALLED: alertType=" + alert.getAlertType()
        + ", owner=" + alert.getOwnerUsername()
        + ", sourceIp=" + alert.getSourceIp()
    );
   
    
        // Keep your existing cases unchanged

        switch (alert.getAlertType()) {

            case "IOC_MATCH" ->
                    createIncident(
                            alert,
                            "THREAT_INTELLIGENCE_INCIDENT",
                            "CRITICAL",
                            95,
                            "Threat intelligence incident generated from known malicious IOC activity."
                    );

            case "ACCOUNT_COMPROMISE" ->
                    createIncident(
                            alert,
                            "ACCOUNT_COMPROMISE_INCIDENT",
                            "CRITICAL",
                            95,
                            "Incident generated from account compromise activity."
                    );

            case "PRIVILEGE_ESCALATION" ->
                    createIncident(
                            alert,
                            "PRIVILEGE_ESCALATION_INCIDENT",
                            "CRITICAL",
                            100,
                            "Incident generated from privilege escalation activity."
                    );

            case "BRUTE_FORCE_AGGRESSIVE" ->
                    createIncident(
                            alert,
                            "AGGRESSIVE_BRUTE_FORCE_INCIDENT",
                            "CRITICAL",
                            90,
                            "Incident generated from aggressive brute force activity."
                    );

            default -> {
                // Other alerts do not automatically create incidents.
            }
        }
    }


private void createIncident(
        Alert alert,
        String incidentType,
        String severity,
        Integer riskScore,
        String summary) {
                System.out.println("CREATE INCIDENT ENTERED: " + incidentType);

    String ownerUsername = alert.getOwnerUsername();
    System.out.println("INCIDENT OWNER: " + ownerUsername);


    System.out.println("=== INCIDENT DEBUG ===");
    System.out.println("Alert Type: " + alert.getAlertType());
    System.out.println("Owner: " + ownerUsername);
    System.out.println("Source IP: " + alert.getSourceIp());

    if (ownerUsername == null || ownerUsername.isBlank()) {
        System.out.println("STOPPED: Owner is missing");
        return;
    }

    boolean alreadyExists =
            incidentRepository.existsByOwnerUsernameAndSourceIpAndIncidentType(
                    ownerUsername,
                    alert.getSourceIp(),
                    incidentType
            );

    System.out.println("Incident already exists: " + alreadyExists);

    if (alreadyExists) {
        System.out.println("STOPPED: Duplicate incident");
        return;
    }

    Incident incident = new Incident(
            LocalDateTime.now(),
            incidentType,
            severity,
            riskScore,
            summary,
            alert.getSourceIp()
    );
    incident.setOwnerUsername(ownerUsername);

System.out.println(
    "SAVING INCIDENT: owner=" + ownerUsername
    + ", type=" + incidentType
);

Incident savedIncident = incidentRepository.save(incident);

System.out.println("INCIDENT SAVED SUCCESSFULLY");
System.out.println("CREATED incident for: " + ownerUsername);
System.out.println("Incident ID: " + savedIncident.getId());

        }

}
