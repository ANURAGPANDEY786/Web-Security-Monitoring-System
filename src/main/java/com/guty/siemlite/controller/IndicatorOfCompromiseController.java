package com.guty.siemlite.controller;

import com.guty.siemlite.dto.IndicatorOfCompromiseRequest;
import com.guty.siemlite.model.IndicatorOfCompromise;
import com.guty.siemlite.service.IndicatorOfCompromiseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing Indicators of Compromise.
 */
@RestController
@RequestMapping("/api/iocs")
@Tag(name = "Indicators of Compromise", description = "Threat intelligence IOC management")
public class IndicatorOfCompromiseController {

    private final IndicatorOfCompromiseService indicatorOfCompromiseService;

    /**
     * Creates a new IndicatorOfCompromiseController.
     *
     * @param indicatorOfCompromiseService IOC service
     */
    public IndicatorOfCompromiseController(IndicatorOfCompromiseService indicatorOfCompromiseService) {
        this.indicatorOfCompromiseService = indicatorOfCompromiseService;
    }

    /**
     * Creates a new Indicator of Compromise.
     *
     * @param request IOC creation request
     * @return created IOC
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create IOC", description = "Creates a new Indicator of Compromise")
    public IndicatorOfCompromise createIoc(@RequestBody IndicatorOfCompromiseRequest request, Authentication authentication) {
        return indicatorOfCompromiseService.createIoc(request, authentication.getName());
    }

    /**
     * Returns all Indicators of Compromise.
     *
     * @return list of IOCs
     */
    @GetMapping
    @Operation(summary = "Get all IOCs", description = "Returns all stored Indicators of Compromise")
    public List<IndicatorOfCompromise> getAllIocs(Authentication authentication) {
        return indicatorOfCompromiseService.getAllIocs(authentication.getName());
    }

    /**
     * Returns one Indicator of Compromise by ID.
     *
     * @param id IOC ID
     * @return matching IOC
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get IOC by ID", description = "Returns a single Indicator of Compromise by ID")
    public IndicatorOfCompromise getIocById(@PathVariable Long id, Authentication authentication) {
        return indicatorOfCompromiseService.getIocById(id, authentication.getName());
    }

    /**
     * Updates an existing Indicator of Compromise.
     *
     * @param id IOC ID
     * @param request IOC update request
     * @return updated IOC
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update IOC", description = "Updates an existing Indicator of Compromise")
    public IndicatorOfCompromise updateIoc(
            @PathVariable Long id,
            @RequestBody IndicatorOfCompromiseRequest request,
            Authentication authentication) {
        return indicatorOfCompromiseService.updateIoc(id, request, authentication.getName());
    }

    /**
     * Enables an IOC for active matching.
     *
     * @param id IOC ID
     * @return enabled IOC
     */
    @PutMapping("/{id}/enable")
    @Operation(summary = "Enable IOC", description = "Enables an IOC for active threat intelligence matching")
    public IndicatorOfCompromise enableIoc(@PathVariable Long id, Authentication authentication) {
        return indicatorOfCompromiseService.enableIoc(id, authentication.getName());
    }

    /**
     * Disables an IOC from active matching.
     *
     * @param id IOC ID
     * @return disabled IOC
     */
    @PutMapping("/{id}/disable")
    @Operation(summary = "Disable IOC", description = "Disables an IOC from active threat intelligence matching")
    public IndicatorOfCompromise disableIoc(@PathVariable Long id, Authentication authentication) {
        return indicatorOfCompromiseService.disableIoc(id, authentication.getName());
    }

    /**
     * Deletes an Indicator of Compromise.
     *
     * @param id IOC ID
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete IOC", description = "Deletes an Indicator of Compromise")
    public void deleteIoc(@PathVariable Long id, Authentication authentication) {
        indicatorOfCompromiseService.deleteIoc(id, authentication.getName());
    }
}
