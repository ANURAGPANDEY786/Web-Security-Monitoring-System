
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import RefreshIcon from "@mui/icons-material/Refresh";
import AppLayout from "../components/layout/AppLayout";
import { useState } from "react";
import axios from "axios";

interface ScannerAlert {
    alert?: string;
    risk?: string;
    url?: string;
    description?: string;
    solution?: string;
    reference?: string;
    [key: string]: unknown;
}

const API_URL = "http://localhost:8081/api/scans";

function parseResponse(data: unknown): Record<string, unknown> {
    if (typeof data === "string") {
        return JSON.parse(data) as Record<string, unknown>;
    }

    if (data && typeof data === "object") {
        return data as Record<string, unknown>;
    }

    return {};
}

function getRiskColor(risk?: string): "error" | "warning" | "info" | "default" {
    switch (risk?.toLowerCase()) {
        case "high":
        case "critical":
            return "error";
        case "medium":
            return "warning";
        case "low":
            return "info";
        default:
            return "default";
    }
}

export default function UrlScannerPage() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [scanId, setScanId] = useState<string | null>(null);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [progress, setProgress] = useState<number | null>(null);
    const [findings, setFindings] = useState<ScannerAlert[]>([]);

    // Uses the existing JWT token stored by the login page.
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const validateUrl = (): string | null => {
        try {
            const parsed = new URL(url.trim());

            if (
                !["http:", "https:"].includes(parsed.protocol) ||
                !parsed.hostname.includes(".") ||
                parsed.username ||
                parsed.password
            ) {
                return null;
            }

            return parsed.href;
        } catch {
            return null;
        }
    };

    const startScan = async () => {
        setError("");
        setStatus("");
        setProgress(null);
        setFindings([]);
        setScanId(null);

        const targetUrl = validateUrl();

        if (!targetUrl) {
            setError("Please enter a valid HTTP/HTTPS website URL.");
            return;
        }

        if (!token) {
            setError("Please log in again before starting a scan.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/spider`,
                { targetUrl },
                { headers }
            );

            const result = parseResponse(response.data.result);
            const id = result.scan;

            if (id === undefined || id === null) {
                throw new Error("Scanner did not return a scan ID.");
            }

            setScanId(String(id));
            setProgress(0);
            setStatus("Spider scan started. Check progress below.");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.error ??
                    `Could not start scan (${err.response?.status ?? "network error"}).`
                );
            } else {
                setError("Could not start the scan. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const checkResults = async () => {
        if (!scanId) return;

        setError("");
        setChecking(true);

        try {
            const progressResponse = await axios.get(
                `${API_URL}/spider/${scanId}`,
                { headers }
            );

            const progressResult = parseResponse(
                progressResponse.data.result
            );

            const percentage = Number(progressResult.status ?? 0);

            setProgress(
                Number.isFinite(percentage)
                    ? Math.max(0, Math.min(100, percentage))
                    : 0
            );

            if (percentage < 100) {
                setStatus(`Spider scan in progress: ${percentage}%`);
                return;
            }

            setStatus("Spider scan completed. Retrieving findings...");

            const targetUrl = validateUrl();

            if (!targetUrl) {
                setError("Please re-enter a valid target URL.");
                return;
            }

            const alertsResponse = await axios.get(
                `${API_URL}/alerts`,
                {
                    params: { targetUrl },
                    headers,
                }
            );

            const alertsResult = parseResponse(
                alertsResponse.data.result
            );

            const returnedAlerts = Array.isArray(alertsResult.alerts)
                ? alertsResult.alerts as ScannerAlert[]
                : [];

            setFindings(returnedAlerts);
            setStatus(
                `Scan completed. ${returnedAlerts.length} finding(s) returned by ZAP.`
            );
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.error ??
                    "Could not retrieve progress or findings. Please try again."
                );
            } else {
                setError("Could not retrieve scan results.");
            }
        } finally {
            setChecking(false);
        }
    };

    return (
        <AppLayout title="Website URL Scanner">
            <Stack spacing={3}>
                <Alert severity="info">
                    Scan only websites you own or are explicitly
                    authorized to test. Results depend on the pages
                    discovered and the scanner rules enabled.
                </Alert>

                <Card
                    elevation={0}
                    sx={{
                        bgcolor: "#111827",
                        color: "#e5e7eb",
                        border: "1px solid #1f2937",
                        borderRadius: 3,
                    }}
                >
                    <CardContent>
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Scan a Website
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{ color: "#9ca3af", mt: 1 }}
                                >
                                    Enter an authorized target URL to begin
                                    website security assessment.
                                </Typography>
                            </Box>

                            <TextField
                                fullWidth
                                label="Target URL"
                                placeholder="https://your-authorized-website.com"
                                value={url}
                                onChange={(event) => setUrl(event.target.value)}
                                disabled={loading || checking}
                                slotProps={{
                                    htmlInput: {
                                        autoComplete: "url",
                                    },
                                }}
                                sx={{
                                    "& .MuiInputBase-root": {
                                        color: "#e5e7eb",
                                    },
                                    "& .MuiInputLabel-root": {
                                        color: "#9ca3af",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#374151",
                                    },
                                    "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#6b7280",
                                    },
                                }}
                            />

                            <Box>
                                <Button
                                    variant="contained"
                                    startIcon={<TravelExploreIcon />}
                                    disabled={!url.trim() || loading || checking}
                                    onClick={startScan}
                                >
                                    {loading ? "Starting Scan..." : "Start Spider Scan"}
                                </Button>
                            </Box>

                            {loading && <LinearProgress />}

                            {status && (
                                <Alert severity="info">
                                    {status}
                                </Alert>
                            )}

                            {error && (
                                <Alert severity="error">
                                    {error}
                                </Alert>
                            )}

                            {scanId && (
                                <Box>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "#9ca3af", mb: 1 }}
                                    >
                                        Scan ID: {scanId}
                                    </Typography>

                                    {progress !== null && (
                                        <Stack spacing={1} sx={{ mb: 2 }}>
                                            <Stack
                                                direction="row"
                                                sx={{ justifyContent: "space-between" }}
                                            >
                                                <Typography variant="body2">
                                                    Spider Progress
                                                </Typography>
                                                <Typography variant="body2">
                                                    {progress}%
                                                </Typography>
                                            </Stack>

                                            <LinearProgress
                                                variant="determinate"
                                                value={progress}
                                            />
                                        </Stack>
                                    )}

                                    <Button
                                        variant="outlined"
                                        startIcon={<RefreshIcon />}
                                        disabled={checking}
                                        onClick={checkResults}
                                    >
                                        {checking
                                            ? "Checking..."
                                            : "Check Progress & Findings"}
                                    </Button>
                                </Box>
                            )}

                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    sx={{ mb: 1 }}
                                >
                                    Detection Coverage
                                </Typography>

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    useFlexGap
                                    sx={{ flexWrap: "wrap" }}
                                >
                                    <Chip label="SQL Injection" />
                                    <Chip label="Cross-Site Scripting (XSS)" />
                                    <Chip label="Security Misconfiguration" />
                                    <Chip label="Other ZAP Findings" />
                                </Stack>

                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "block",
                                        color: "#9ca3af",
                                        mt: 1,
                                    }}
                                >
                                    These are potential detection categories,
                                    not a guarantee that every vulnerability
                                    will be detected by a Spider scan.
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>

                <Card
                    elevation={0}
                    sx={{
                        bgcolor: "#111827",
                        color: "#e5e7eb",
                        border: "1px solid #1f2937",
                        borderRadius: 3,
                    }}
                >
                    <CardContent>
                        <Stack spacing={2}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Security Findings ({findings.length})
                            </Typography>

                            {findings.length === 0 ? (
                                <Typography
                                    variant="body2"
                                    sx={{ color: "#9ca3af" }}
                                >
                                    No findings loaded yet. Complete a scan
                                    and check its results.
                                </Typography>
                            ) : (
                                findings.map((finding, index) => (
                                    <Box
                                        key={`${finding.url ?? "finding"}-${index}`}
                                        sx={{
                                            p: 2,
                                            border: "1px solid #374151",
                                            borderRadius: 2,
                                        }}
                                    >
                                        <Stack spacing={1}>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                useFlexGap
                                                sx={{
                                                    alignItems: "center",
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <Typography sx={{ fontWeight: 700 }}>
                                                    {finding.alert ?? "Security Finding"}
                                                </Typography>

                                                <Chip
                                                    size="small"
                                                    label={finding.risk ?? "Informational"}
                                                    color={getRiskColor(finding.risk)}
                                                />
                                            </Stack>

                                            <Typography
                                                variant="body2"
                                                sx={{ overflowWrap: "anywhere" }}
                                            >
                                                <strong>URL:</strong>{" "}
                                                {finding.url ?? "Not provided"}
                                            </Typography>

                                            {finding.description && (
                                                <Typography variant="body2">
                                                    {finding.description}
                                                </Typography>
                                            )}

                                            {finding.solution && (
                                                <Typography variant="body2">
                                                    <strong>Solution:</strong>{" "}
                                                    {finding.solution}
                                                </Typography>
                                            )}

                                            {finding.reference && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{ color: "#9ca3af" }}
                                                >
                                                    Reference: {finding.reference}
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Box>
                                ))
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </AppLayout>
    );
}
