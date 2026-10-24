
package com.guty.siemlite.service;

import com.guty.siemlite.dto.*;
import com.guty.siemlite.model.Alert;
import com.guty.siemlite.model.SecurityEvent;
import com.guty.siemlite.repository.AlertRepository;
import com.guty.siemlite.repository.SecurityEventRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final SecurityEventRepository securityEventRepository;
    private final AlertRepository alertRepository;

    public DashboardService(
            SecurityEventRepository securityEventRepository,
            AlertRepository alertRepository) {
        this.securityEventRepository = securityEventRepository;
        this.alertRepository = alertRepository;
    }

    private List<SecurityEvent> getEvents(String ownerUsername) {
        return securityEventRepository.findAll().stream()
                .filter(e -> ownerUsername.equals(e.getOwnerUsername()))
                .toList();
    }

    private List<Alert> getAlerts(String ownerUsername) {
        return alertRepository.findAll().stream()
                .filter(a -> ownerUsername.equals(a.getOwnerUsername()))
                .toList();
    }

    public DashboardSummary getDashboardSummary(String ownerUsername) {
        List<SecurityEvent> events = getEvents(ownerUsername);
        List<Alert> alerts = getAlerts(ownerUsername);

        DashboardSummary summary = new DashboardSummary();

        summary.setTotalEvents(events.size());
        summary.setTotalAlerts(alerts.size());
        summary.setCriticalAlerts(countSeverity(alerts, "CRITICAL"));
        summary.setHighAlerts(countSeverity(alerts, "HIGH"));
        summary.setFailedLogins(countEventType(events, "FAILED_LOGIN"));
        summary.setPortScans(countEventType(events, "PORT_SCAN"));
        summary.setPrivilegeEscalations(countEventType(events, "PRIV_ESC"));

        int totalRisk = alerts.stream()
                .map(Alert::getRiskScore)
                .filter(v -> v != null)
                .mapToInt(Integer::intValue)
                .sum();

        int highestRisk = alerts.stream()
                .map(Alert::getRiskScore)
                .filter(v -> v != null)
                .mapToInt(Integer::intValue)
                .max().orElse(0);

        summary.setTotalRiskScore(totalRisk);
        summary.setAverageRiskScore(
                alerts.isEmpty() ? 0.0 : (double) totalRisk / alerts.size());
        summary.setHighestRiskScore(highestRisk);
        summary.setCriticalRiskAlertCount(
                (int) alerts.stream().filter(a ->
                        a.getRiskScore() != null && a.getRiskScore() >= 90).count());
        summary.setHighRiskAlertCount(
                (int) alerts.stream().filter(a ->
                        a.getRiskScore() != null && a.getRiskScore() >= 70).count());

        return summary;
    }

    public DashboardTrends getDashboardTrends(String ownerUsername) {
        LocalDateTime now = LocalDateTime.now();
        List<SecurityEvent> events = getEvents(ownerUsername);
        List<Alert> alerts = getAlerts(ownerUsername);

        return new DashboardTrends(
                alerts.stream().filter(a -> after(a.getCreatedAt(), now.minusHours(24))).count(),
                alerts.stream().filter(a -> after(a.getCreatedAt(), now.minusDays(7))).count(),
                alerts.stream().filter(a -> after(a.getCreatedAt(), now.minusDays(30))).count(),
                events.stream().filter(e -> after(e.getTimestamp(), now.minusHours(24))).count(),
                events.stream().filter(e -> after(e.getTimestamp(), now.minusDays(7))).count(),
                events.stream().filter(e -> after(e.getTimestamp(), now.minusDays(30))).count()
        );
    }

    public List<TopAlertType> getTopAlertTypes(String ownerUsername) {
        return getAlerts(ownerUsername).stream()
                .filter(a -> a.getAlertType() != null)
                .collect(Collectors.groupingBy(Alert::getAlertType, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .map(e -> new TopAlertType(e.getKey(), e.getValue()))
                .toList();
    }

    public List<TopSourceIp> getTopSourceIps(String ownerUsername) {
        return getEvents(ownerUsername).stream()
                .filter(e -> e.getSourceIp() != null)
                .collect(Collectors.groupingBy(SecurityEvent::getSourceIp, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .map(e -> new TopSourceIp(e.getKey(), e.getValue()))
                .toList();
    }

    public List<TopUsername> getTopUsernames(String ownerUsername) {
        return getEvents(ownerUsername).stream()
                .filter(e -> e.getUsername() != null)
                .collect(Collectors.groupingBy(SecurityEvent::getUsername, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .map(e -> new TopUsername(e.getKey(), e.getValue()))
                .toList();
    }

    public RiskDistribution getRiskDistribution(String ownerUsername) {
        List<Alert> alerts = getAlerts(ownerUsername);

        return new RiskDistribution(
                alerts.stream().filter(a -> risk(a) < 40).count(),
                alerts.stream().filter(a -> risk(a) >= 40 && risk(a) <= 69).count(),
                alerts.stream().filter(a -> risk(a) >= 70 && risk(a) <= 89).count(),
                alerts.stream().filter(a -> risk(a) >= 90).count()
        );
    }

    public List<MitreStatistic> getMitreStatistics(String ownerUsername) {
        return getAlerts(ownerUsername).stream()
                .filter(a -> a.getMitreTechnique() != null)
                .collect(Collectors.groupingBy(Alert::getMitreTechnique, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .map(e -> new MitreStatistic(e.getKey(), e.getValue()))
                .toList();
    }

    public List<DashboardTimelinePoint> getDashboardTimeline(
            int days, String ownerUsername) {

        if (days < 1) {
            days = 1;
        }

        List<DashboardTimelinePoint> timeline = new ArrayList<>();
        List<SecurityEvent> events = getEvents(ownerUsername);
        List<Alert> alerts = getAlerts(ownerUsername);

        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(days - 1L);

        for (int i = 0; i < days; i++) {
            LocalDate date = startDate.plusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.plusDays(1).atStartOfDay();

            long eventCount = events.stream()
                    .filter(e -> inRange(e.getTimestamp(), start, end)).count();

            long alertCount = alerts.stream()
                    .filter(a -> inRange(a.getCreatedAt(), start, end)).count();

            timeline.add(new DashboardTimelinePoint(date, eventCount, alertCount));
        }

        return timeline;
    }

    public IocStatistics getIocStatistics(String ownerUsername) {
        List<Alert> iocAlerts = getAlerts(ownerUsername).stream()
                .filter(a -> "IOC_MATCH".equals(a.getAlertType()))
                .toList();

        long critical = iocAlerts.stream()
                .filter(a -> "CRITICAL".equals(a.getSeverity())).count();

        long uniqueIps = iocAlerts.stream()
                .map(Alert::getSourceIp)
                .filter(ip -> ip != null)
                .distinct()
                .count();

        return new IocStatistics(iocAlerts.size(), critical, uniqueIps);
    }

    private long countSeverity(List<Alert> alerts, String severity) {
        return alerts.stream().filter(a -> severity.equals(a.getSeverity())).count();
    }

    private long countEventType(List<SecurityEvent> events, String type) {
        return events.stream().filter(e -> type.equals(e.getEventType())).count();
    }

    private int risk(Alert alert) {
        return alert.getRiskScore() == null ? 0 : alert.getRiskScore();
    }

    private boolean after(LocalDateTime value, LocalDateTime threshold) {
        return value != null && value.isAfter(threshold);
    }

    private boolean inRange(LocalDateTime value, LocalDateTime start, LocalDateTime end) {
        return value != null && !value.isBefore(start) && value.isBefore(end);
    }
}
