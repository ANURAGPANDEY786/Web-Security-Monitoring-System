
package com.guty.siemlite.scanner;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/scans")
public class ZapScanController {

    private final ZapScanService zapScanService;

    public ZapScanController(ZapScanService zapScanService) {
        this.zapScanService = zapScanService;
    }

    @PostMapping("/spider")
    public ResponseEntity<?> startSpider(
            @RequestBody Map<String, String> request) {
        try {
            String targetUrl = request.get("targetUrl");

            String result = zapScanService.startSpiderScan(targetUrl);

            return ResponseEntity.ok(Map.of(
                    "message", "Spider scan request sent to ZAP",
                    "result", result
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(
                    Map.of("error", "Scanner request failed"));
        }
    }

    @GetMapping("/spider/{scanId}")
    public ResponseEntity<?> spiderStatus(@PathVariable String scanId) {
        try {
            return ResponseEntity.ok(Map.of(
                    "result", zapScanService.getSpiderStatus(scanId)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(
                    Map.of("error", "Scanner request failed"));
        }
    }
    
@GetMapping("/alerts")
public ResponseEntity<?> getAlerts(
        @RequestParam String targetUrl) {
    try {
        return ResponseEntity.ok(Map.of(
                "result", zapScanService.getAlerts(targetUrl)
        ));
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage()));
    } catch (IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(
                Map.of("error", "Could not retrieve scanner alerts"));
    }
}

}
