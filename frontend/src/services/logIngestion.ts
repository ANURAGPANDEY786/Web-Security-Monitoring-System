import api from "./api";

export interface LogRequest {
    logLine: string;
}

export interface SecurityEvent {
    id: number;
    timestamp: string;
    sourceIp: string;
    username: string;
    eventType: string;
    rawLog: string;
    destinationPort: number | null;
}

export async function ingestSingleLog(logLine: string): Promise<SecurityEvent> {
    const response = await api.post("/logs", {
        logLine,
    });

    return response.data;
}

export async function ingestBulkLogs(logLines: string[]): Promise<SecurityEvent[]> {
    const response = await api.post(
        "/logs/bulk",
        logLines.map((line) => ({ logLine: line }))
    );

    if (Array.isArray(response.data)) {
        return response.data;
    }

    if (Array.isArray(response.data.content)) {
        return response.data.content;
    }

    return [];
}