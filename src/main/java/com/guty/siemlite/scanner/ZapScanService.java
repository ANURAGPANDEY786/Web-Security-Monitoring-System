
package com.guty.siemlite.scanner;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ZapScanService {

    private final String baseUrl;
    private final String apiKey;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public ZapScanService(
            @Value("${zap.base-url:http://localhost:8090}") String baseUrl,
            @Value("${zap.api-key:}") String apiKey) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    public String startSpiderScan(String targetUrl) {
        validateTarget(targetUrl);

        String endpoint = baseUrl
                + "/JSON/spider/action/scan/?url="
                + encode(targetUrl)
                + "&apikey=" + encode(apiKey);

        return sendGet(endpoint);
    }

    public String getSpiderStatus(String scanId) {
        if (scanId == null || !scanId.matches("\\d{1,10}")) {
            throw new IllegalArgumentException("Invalid scan ID");
        }

        return sendGet(baseUrl
                + "/JSON/spider/view/status/?scanId="
                + scanId
                + "&apikey=" + encode(apiKey));
    }

    private String sendGet(String endpoint) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200
                    || response.statusCode() >= 300) {
                throw new IllegalStateException(
                        "ZAP returned HTTP " + response.statusCode());
            }

            return response.body();

        } catch (IOException e) {
            throw new IllegalStateException(
                    "Could not communicate with the ZAP scanner", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(
                    "ZAP request was interrupted", e);
        }
    }

    private void validateTarget(String targetUrl) {
        if (targetUrl == null || targetUrl.isBlank()) {
            throw new IllegalArgumentException("Target URL is required");
        }

        URI uri;
        try {
            uri = URI.create(targetUrl.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid target URL");
        }

        String scheme = uri.getScheme();
        String host = uri.getHost();

        if (scheme == null
                || !(scheme.equalsIgnoreCase("http")
                || scheme.equalsIgnoreCase("https"))
                || host == null
                || uri.getUserInfo() != null
                || host.equalsIgnoreCase("localhost")
                || host.equals("127.0.0.1")
                || host.equals("::1")
                || !host.contains(".")) {
            throw new IllegalArgumentException(
                    "Provide an approved public HTTP/HTTPS target URL");
        }
    }

    private String encode(String value) {
        return java.net.URLEncoder.encode(
                value, java.nio.charset.StandardCharsets.UTF_8);
    }
    
public String getAlerts(String targetUrl) {
    validateTarget(targetUrl);

    String endpoint = baseUrl
            + "/JSON/alert/view/alerts/?baseurl="
            + encode(targetUrl)
            + "&start=0&count=100"
            + "&apikey=" + encode(apiKey);

    return sendGet(endpoint);
}

}
