
package com.guty.siemlite.service;

import com.guty.siemlite.model.SecurityEvent;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class LogParserService {

    private static final Pattern FAILED_LOGIN =
            Pattern.compile("Failed password for (\\w+) from ([0-9.]+)");

    private static final Pattern SUCCESS_LOGIN =
            Pattern.compile("Accepted password for (\\w+) from ([0-9.]+)");

    private static final Pattern ADMIN_COMMAND =
            Pattern.compile("(?i)(admin|sudo) command executed by (\\w+) from ([0-9.]+)");

    private static final Pattern CONNECTION =
            Pattern.compile("Connection attempt from ([0-9.]+) to port (\\d+)");

    // Common Apache/Nginx access log:
    // 192.168.1.10 - - [date] "GET /search?q=test HTTP/1.1" 200 123
    private static final Pattern WEB_ACCESS =
            Pattern.compile(
                    "^([0-9.]+)\\s+\\S+\\s+\\S+\\s+\\[[^]]+\\]\\s+\"(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\\s+(\\S+)\\s+HTTP/[^\\\"]+\"\\s+(\\d{3})\\s+\\S+.*$",
                    Pattern.CASE_INSENSITIVE
            );

    public SecurityEvent parseLog(String logLine) {
        if (logLine == null || logLine.isBlank()) {
            return null;
        }

        Matcher matcher = FAILED_LOGIN.matcher(logLine);
        if (matcher.find()) {
            return new SecurityEvent(
                    LocalDateTime.now(), matcher.group(2),
                    matcher.group(1), "FAILED_LOGIN", logLine, null
            );
        }

        matcher = SUCCESS_LOGIN.matcher(logLine);
        if (matcher.find()) {
            return new SecurityEvent(
                    LocalDateTime.now(), matcher.group(2),
                    matcher.group(1), "SUCCESSFUL_LOGIN", logLine, null
            );
        }

        matcher = ADMIN_COMMAND.matcher(logLine);
        if (matcher.find()) {
            return new SecurityEvent(
                    LocalDateTime.now(), matcher.group(3),
                    matcher.group(2), "ADMIN_COMMAND_EXECUTED", logLine, null
            );
        }

        matcher = CONNECTION.matcher(logLine);
        if (matcher.find()) {
            return new SecurityEvent(
                    LocalDateTime.now(), matcher.group(1), null,
                    "CONNECTION_ATTEMPT", logLine,
                    Integer.parseInt(matcher.group(2))
            );
        }

        matcher = WEB_ACCESS.matcher(logLine);
        if (matcher.matches()) {
            return new SecurityEvent(
                    LocalDateTime.now(),
                    matcher.group(1),
                    null,
                    "WEB_REQUEST",
                    logLine,
                    null
            );
        }

        return null;
    }
}
