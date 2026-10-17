package com.guty.siemlite.service;

import com.guty.siemlite.model.Alert;
import com.guty.siemlite.model.Incident;
import com.guty.siemlite.repository.IncidentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service responsible for correlating related alerts into incidents.
 *
 * <p>This service analyzes generated alerts and creates higher-level
 * security incidents when detections indicate serious attacker activity
 * rather than isolated events.</p>
 */
@Service
public class CorrelationService {

    private final IncidentRepository incidentRepository;

    public CorrelationService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    /**
     * Evaluates an alert for potential incident creation.
     *
     * @param alert generated alert
     */
    public void analyze(Alert alert) {

        switch (alert.getAlertType()) {

            case "IOC_MATCH" ->
                    createIncident(
                            "THREAT_INTELLIGENCE_INCIDENT",
                            "CRITICAL",
                            95,
                            "Threat intelligence incident generated from known malicious IOC activity.",
                            alert.getSourceIp()
                    );

            case "ACCOUNT_COMPROMISE" ->
                    createIncident(
                            "ACCOUNT_COMPROMISE_INCIDENT",
                            "CRITICAL",
                            95,
                            "Incident generated from account compromise activity.",
                            alert.getSourceIp()
                    );

            case "PRIVILEGE_ESCALATION" ->
                    createIncident(
                            "PRIVILEGE_ESCALATION_INCIDENT",
                            "CRITICAL",
                            100,
                            "Incident generated from privilege escalation activity.",
                            alert.getSourceIp()
                    );

            case "BRUTE_FORCE_AGGRESSIVE" ->
                    createIncident(
                            "AGGRESSIVE_BRUTE_FORCE_INCIDENT",
                            "CRITICAL",
                            90,
                            "Incident generated from aggressive brute force activity.",
                            alert.getSourceIp()
                    );

            default -> {
                // Lower-priority alerts do not automatically create incidents.
            }
        }
    }

    /**
     * Creates a correlated incident.
     *
     * @param incidentType incident classification
     * @param severity incident severity
     * @param riskScore incident risk score
     * @param summary incident summary
     * @param sourceIp source IP involved
     */
    protected void createIncident(String incidentType,
                                  String severity,
                                  Integer riskScore,
                                  String summary,
                                  String sourceIp) {

        if (incidentRepository.existsBySourceIpAndIncidentType(sourceIp, incidentType)) {
            return;
        }

        Incident incident = new Incident(
                LocalDateTime.now(),
                incidentType,
                severity,
                riskScore,
                summary,
                sourceIp
        );

        incidentRepository.save(incident);
    }
}
