
package com.guty.siemlite.controller;

import com.guty.siemlite.dto.*;
import com.guty.siemlite.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    @Operation(summary = "Get dashboard summary metrics")
    public DashboardSummary getDashboardSummary(Authentication authentication) {
        return dashboardService.getDashboardSummary(authentication.getName());
    }

    @GetMapping("/trends")
    @Operation(summary = "Get dashboard trend analytics")
    public DashboardTrends getDashboardTrends(Authentication authentication) {
        return dashboardService.getDashboardTrends(authentication.getName());
    }

    @GetMapping("/top-alert-types")
    @Operation(summary = "Get top alert types")
    public List<TopAlertType> getTopAlertTypes(Authentication authentication) {
        return dashboardService.getTopAlertTypes(authentication.getName());
    }

    @GetMapping("/top-source-ips")
    @Operation(summary = "Get top source IP addresses")
    public List<TopSourceIp> getTopSourceIps(Authentication authentication) {
        return dashboardService.getTopSourceIps(authentication.getName());
    }

    @GetMapping("/top-usernames")
    @Operation(summary = "Get top usernames")
    public List<TopUsername> getTopUsernames(Authentication authentication) {
        return dashboardService.getTopUsernames(authentication.getName());
    }

    @GetMapping("/risk-distribution")
    @Operation(summary = "Get alert risk distribution")
    public RiskDistribution getRiskDistribution(Authentication authentication) {
        return dashboardService.getRiskDistribution(authentication.getName());
    }

    @GetMapping("/mitre-statistics")
    @Operation(summary = "Get MITRE ATT&CK statistics")
    public List<MitreStatistic> getMitreStatistics(Authentication authentication) {
        return dashboardService.getMitreStatistics(authentication.getName());
    }

    @GetMapping("/timeline")
    @Operation(summary = "Get dashboard timeline analytics")
    public List<DashboardTimelinePoint> getDashboardTimeline(
            @RequestParam(defaultValue = "7") int days,
            Authentication authentication) {
        return dashboardService.getDashboardTimeline(days, authentication.getName());
    }

    @GetMapping("/ioc-statistics")
    @Operation(summary = "Get IOC alert statistics")
    public IocStatistics getIocStatistics(Authentication authentication) {
        return dashboardService.getIocStatistics(authentication.getName());
    }
}
