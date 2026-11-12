
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    LinearProgress,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import RefreshIcon from "@mui/icons-material/Refresh";
import SecurityIcon from "@mui/icons-material/Security";
import LanguageIcon from "@mui/icons-material/Language";
import BugReportIcon from "@mui/icons-material/BugReport";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AppLayout from "../components/layout/AppLayout";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import api from "../services/api";

interface ScannerAlert {
    alert?: string;
    risk?: string;
    url?: string;
    description?: string;
    solution?: string;
    reference?: string;
    [key: string]: unknown;
}

const API_URL = "/scans";

const C = {
    bg: "#070d18",
    card: "#0b1423",
    border: "#1e293b",
    text: "#e2e8f0",
    muted: "#94a3b8",
    cyan: "#22d3ee",
    green: "#34d399",
    red: "#fb7185",
    orange: "#fb923c",
};

function parseResponse(data: unknown): Record<string, unknown> {
    if (typeof data === "string") {
        return JSON.parse(data) as Record<string, unknown>;
    }

    if (data && typeof data === "object") {
        return data as Record<string, unknown>;
    }

    return {};
}

function getRiskColor(
    risk?: string
): "error" | "warning" | "info" | "default" {
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

function getRiskStyle(risk?: string) {
    switch (risk?.toLowerCase()) {
        case "critical":
        case "high":
            return {
                color: C.red,
                background: "rgba(251,113,133,0.10)",
                border: "1px solid rgba(251,113,133,0.3)",
            };
        case "medium":
            return {
                color: C.orange,
                background: "rgba(251,146,60,0.10)",
                border: "1px solid rgba(251,146,60,0.3)",
            };
        case "low":
            return {
                color: C.cyan,
                background: "rgba(34,211,238,0.10)",
                border: "1px solid rgba(34,211,238,0.3)",
            };
        default:
            return {
                color: C.muted,
                background: "rgba(148,163,184,0.08)",
                border: `1px solid ${C.border}`,
            };
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
    const [resultsLoaded, setResultsLoaded] = useState(false);

    const checkResultsRef = useRef<() => Promise<void>>(
        async () => {}
    );

    const token = localStorage.getItem("token");

    const headers = useMemo(
        () => token ? { Authorization: `Bearer ${token}` } : {},
        [token]
    );

    const validateUrl = useCallback((): string | null => {
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
    }, [url]);

    const startScan = async () => {
        setError("");
        setStatus("");
        setProgress(null);
        setFindings([]);
        setResultsLoaded(false);
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
            const response = await api.post(
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

    const checkResults = useCallback(async () => {
        if (!scanId || checking || resultsLoaded) return;

        setError("");
        setChecking(true);

        try {
            const progressResponse = await api.get(
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

            const alertsResponse = await api.get(
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
            setResultsLoaded(true);

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
    }, [scanId, checking, resultsLoaded, headers, validateUrl]);

    useEffect(() => {
        checkResultsRef.current = checkResults;
    }, [checkResults]);

    useEffect(() => {
        if (!scanId || resultsLoaded) return;

        let cancelled = false;
        let timeoutId: number | undefined;

        const poll = async () => {
            if (cancelled) return;

            await checkResultsRef.current();

            if (!cancelled) {
                timeoutId = window.setTimeout(() => {
                    void poll();
                }, 2000);
            }
        };

        void poll();

        return () => {
            cancelled = true;

            if (timeoutId !== undefined) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [scanId, resultsLoaded]);

    const criticalCount = findings.filter(
        (f) => f.risk?.toLowerCase() === "critical"
    ).length;

    const highCount = findings.filter(
        (f) => f.risk?.toLowerCase() === "high"
    ).length;

    const mediumCount = findings.filter(
        (f) => f.risk?.toLowerCase() === "medium"
    ).length;

    const lowCount = findings.filter(
        (f) => f.risk?.toLowerCase() === "low"
    ).length;

    return (
        <AppLayout title="Website URL Scanner">
            <Stack spacing={3}>

                {/* PAGE HEADER */}
                <Box>
                    <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ mb: 1, alignItems: "center" }}
                    >
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 2,
                                display: "grid",
                                placeItems: "center",
                                color: C.cyan,
                                background: "rgba(34,211,238,0.10)",
                                border: "1px solid rgba(34,211,238,0.2)",
                            }}
                        >
                            <TravelExploreIcon />
                        </Box>

                        <Box>
                            <Typography
                                variant="h5"
                                sx={{ color: C.text, fontWeight: 800 }}
                            >
                                Website Security Scanner
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{ color: C.muted }}
                            >
                                Discover potential web application security issues
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                {/* AUTHORIZATION NOTICE */}
                <Alert
                    severity="info"
                    sx={{
                        bgcolor: "rgba(34,211,238,0.06)",
                        color: C.text,
                        border: "1px solid rgba(34,211,238,0.2)",
                        "& .MuiAlert-icon": { color: C.cyan },
                    }}
                >
                    Scan only websites you own or are explicitly authorized
                    to test. Results depend on the pages discovered and
                    scanner rules enabled.
                </Alert>

                {/* SCANNER INPUT */}
                <Card
                    elevation={0}
                    sx={{
                        bgcolor: C.card,
                        color: C.text,
                        border: `1px solid ${C.border}`,
                        borderRadius: 3,
                    }}
                >
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <Stack spacing={3}>

                            <Stack
                                direction="row"
                                spacing={1.5}
                                sx={{ alignItems: "center" }}
                            >
                                <SecurityIcon sx={{ color: C.cyan }} />

                                <Box>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 800 }}
                                    >
                                        Start New Scan
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        sx={{ color: C.muted }}
                                    >
                                        OWASP ZAP Spider Scanner
                                    </Typography>
                                </Box>

                                <Box sx={{ flex: 1 }} />

                                <Chip
                                    size="small"
                                    label="ZAP ENGINE"
                                    sx={{
                                        color: C.cyan,
                                        bgcolor: "rgba(34,211,238,0.08)",
                                        border: "1px solid rgba(34,211,238,0.2)",
                                        fontWeight: 700,
                                    }}
                                />
                            </Stack>

                            <Divider sx={{ borderColor: C.border }} />

                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    sx={{ mb: 1, color: C.muted }}
                                >
                                    TARGET WEBSITE URL
                                </Typography>

                                <TextField
                                    fullWidth
                                    placeholder="https://your-authorized-website.com"
                                    value={url}
                                    onChange={(event) =>
                                        setUrl(event.target.value)
                                    }
                                    disabled={loading || checking}
                                    slotProps={{
                                        htmlInput: {
                                            autoComplete: "url",
                                        },
                                    }}
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            color: C.text,
                                            bgcolor: "#070d18",
                                            borderRadius: 2,
                                        },
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: C.border,
                                        },
                                        "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: C.cyan,
                                        },
                                        "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: C.cyan,
                                        },
                                        "& input::placeholder": {
                                            color: "#64748b",
                                            opacity: 1,
                                        },
                                    }}
                                />
                            </Box>

                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1.5}
                                sx={{ alignItems: { sm: "center" } }}
                            >
                                <Button
                                    variant="contained"
                                    startIcon={
                                        loading
                                            ? undefined
                                            : <TravelExploreIcon />
                                    }
                                    disabled={
                                        !url.trim() || loading || checking
                                    }
                                    onClick={startScan}
                                    sx={{
                                        px: 3,
                                        py: 1.2,
                                        fontWeight: 800,
                                        bgcolor: C.cyan,
                                        color: "#07111f",
                                        "&:hover": {
                                            bgcolor: "#67e8f9",
                                        },
                                        "&.Mui-disabled": {
                                            bgcolor: "#164e63",
                                            color: "#94a3b8",
                                        },
                                    }}
                                >
                                    {loading
                                        ? "Starting Scan..."
                                        : "Start Spider Scan"}
                                </Button>

                                {scanId && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<RefreshIcon />}
                                        disabled={checking}
                                        onClick={checkResults}
                                        sx={{
                                            color: C.cyan,
                                            borderColor: "rgba(34,211,238,0.4)",
                                            "&:hover": {
                                                borderColor: C.cyan,
                                                bgcolor: "rgba(34,211,238,0.06)",
                                            },
                                        }}
                                    >
                                        Check Progress
                                    </Button>
                                )}
                            </Stack>

                            {loading && (
                                <LinearProgress
                                    sx={{
                                        bgcolor: "#1e293b",
                                        "& .MuiLinearProgress-bar": {
                                            bgcolor: C.cyan,
                                        },
                                    }}
                                />
                            )}

                            {status && (
                                <Alert
                                    severity={resultsLoaded ? "success" : "info"}
                                    sx={{
                                        bgcolor: resultsLoaded
                                            ? "rgba(52,211,153,0.08)"
                                            : "rgba(34,211,238,0.06)",
                                        color: C.text,
                                        border: `1px solid ${
                                            resultsLoaded
                                                ? "rgba(52,211,153,0.25)"
                                                : "rgba(34,211,238,0.2)"
                                        }`,
                                    }}
                                >
                                    {status}
                                </Alert>
                            )}

                            {error && (
                                <Alert severity="error">
                                    {error}
                                </Alert>
                            )}

                            {/* SCAN PROGRESS */}
                            {scanId && (
                                <Box
                                    sx={{
                                        p: 2.5,
                                        bgcolor: "#070d18",
                                        border: `1px solid ${C.border}`,
                                        borderRadius: 2,
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        sx={{
                                            mb: 2,
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            flexWrap: "wrap",
                                            gap: 1,
                                        }}
                                    >
                                        <Box>
                                            <Typography
                                                variant="caption"
                                                sx={{ color: C.muted }}
                                            >
                                                SCAN IDENTIFIER
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: C.text,
                                                    fontWeight: 700,
                                                    overflowWrap: "anywhere",
                                                }}
                                            >
                                                {scanId}
                                            </Typography>
                                        </Box>

                                        <Chip
                                            size="small"
                                            icon={
                                                resultsLoaded
                                                    ? <CheckCircleOutlineIcon />
                                                    : <TravelExploreIcon />
                                            }
                                            label={
                                                resultsLoaded
                                                    ? "Completed"
                                                    : "Scanning"
                                            }
                                            sx={{
                                                color: resultsLoaded
                                                    ? C.green
                                                    : C.cyan,
                                                bgcolor: resultsLoaded
                                                    ? "rgba(52,211,153,0.08)"
                                                    : "rgba(34,211,238,0.08)",
                                            }}
                                        />
                                    </Stack>

                                    {progress !== null && (
                                        <Stack spacing={1}>
                                            <Stack
                                                direction="row"
                                                sx={{ justifyContent: "space-between" }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: C.muted }}
                                                >
                                                    Spider Scan Progress
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: C.cyan,
                                                        fontWeight: 800,
                                                    }}
                                                >
                                                    {progress}%
                                                </Typography>
                                            </Stack>

                                            <LinearProgress
                                                variant="determinate"
                                                value={progress}
                                                sx={{
                                                    height: 9,
                                                    borderRadius: 5,
                                                    bgcolor: "#1e293b",
                                                    "& .MuiLinearProgress-bar": {
                                                        borderRadius: 5,
                                                        bgcolor: C.cyan,
                                                    },
                                                }}
                                            />
                                        </Stack>
                                    )}

                                    {checking && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: "block",
                                                color: C.muted,
                                                mt: 1.5,
                                            }}
                                        >
                                            Checking scanner response...
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {/* DETECTION COVERAGE */}
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        color: C.text,
                                        fontWeight: 700,
                                        mb: 1.5,
                                    }}
                                >
                                    Detection Coverage
                                </Typography>

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    useFlexGap
                                    sx={{ flexWrap: "wrap" }}
                                >
                                    {[
                                        "SQL Injection",
                                        "Cross-Site Scripting (XSS)",
                                        "Security Misconfiguration",
                                        "Other ZAP Findings",
                                    ].map((item) => (
                                        <Chip
                                            key={item}
                                            label={item}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                color: C.muted,
                                                borderColor: C.border,
                                            }}
                                        />
                                    ))}
                                </Stack>

                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "block",
                                        color: C.muted,
                                        mt: 1.5,
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

                {/* FINDINGS SUMMARY */}
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            color: C.text,
                            fontWeight: 800,
                            mb: 2,
                        }}
                    >
                        Scan Findings Overview
                    </Typography>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "repeat(2, minmax(0, 1fr))",
                                md: "repeat(4, minmax(0, 1fr))",
                            },
                            gap: 2,
                        }}
                    >
                        {[
                            {
                                label: "Total Findings",
                                value: findings.length,
                                color: C.cyan,
                                icon: <BugReportIcon />,
                            },
                            {
                                label: "Critical / High",
                                value: criticalCount + highCount,
                                color: C.red,
                                icon: <WarningAmberIcon />,
                            },
                            {
                                label: "Medium",
                                value: mediumCount,
                                color: C.orange,
                                icon: <SecurityIcon />,
                            },
                            {
                                label: "Low",
                                value: lowCount,
                                color: C.green,
                                icon: <CheckCircleOutlineIcon />,
                            },
                        ].map((item) => (
                            <Card
                                key={item.label}
                                elevation={0}
                                sx={{
                                    bgcolor: C.card,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 2.5,
                                }}
                            >
                                <CardContent sx={{ p: 2 }}>
                                    <Stack
                                        direction="row"
                                        sx={{
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{ color: C.muted }}
                                        >
                                            {item.label}
                                        </Typography>

                                        <Box sx={{ color: item.color }}>
                                            {item.icon}
                                        </Box>
                                    </Stack>

                                    <Typography
                                        variant="h4"
                                        sx={{
                                            color: item.color,
                                            fontWeight: 800,
                                            mt: 1,
                                        }}
                                    >
                                        {resultsLoaded ? item.value : "—"}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Box>

                {/* FINDINGS LIST */}
                <Card
                    elevation={0}
                    sx={{
                        bgcolor: C.card,
                        color: C.text,
                        border: `1px solid ${C.border}`,
                        borderRadius: 3,
                    }}
                >
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <Stack spacing={2.5}>

                            <Stack
                                direction="row"
                                sx={{
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    flexWrap: "wrap",
                                    gap: 1,
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 800 }}
                                    >
                                        Security Findings
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        sx={{ color: C.muted }}
                                    >
                                        Vulnerability details returned by OWASP ZAP
                                    </Typography>
                                </Box>

                                <Chip
                                    label={`${findings.length} Findings`}
                                    size="small"
                                    sx={{
                                        color: C.cyan,
                                        bgcolor: "rgba(34,211,238,0.08)",
                                        border: "1px solid rgba(34,211,238,0.2)",
                                    }}
                                />
                            </Stack>

                            <Divider sx={{ borderColor: C.border }} />

                            {!resultsLoaded && findings.length === 0 ? (
                                <Box
                                    sx={{
                                        py: 5,
                                        textAlign: "center",
                                    }}
                                >
                                    <TravelExploreIcon
                                        sx={{
                                            fontSize: 42,
                                            color: "#475569",
                                            mb: 1,
                                        }}
                                    />

                                    <Typography
                                        sx={{
                                            color: C.text,
                                            fontWeight: 700,
                                        }}
                                    >
                                        Awaiting Scan Results
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: C.muted,
                                            mt: 0.5,
                                        }}
                                    >
                                        Start a scan to retrieve security findings.
                                    </Typography>
                                </Box>
                            ) : findings.length === 0 ? (
                                <Box
                                    sx={{
                                        py: 5,
                                        textAlign: "center",
                                    }}
                                >
                                    <CheckCircleOutlineIcon
                                        sx={{
                                            fontSize: 42,
                                            color: C.green,
                                            mb: 1,
                                        }}
                                    />

                                    <Typography
                                        sx={{
                                            color: C.text,
                                            fontWeight: 700,
                                        }}
                                    >
                                        No Findings Returned
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: C.muted,
                                            mt: 0.5,
                                        }}
                                    >
                                        ZAP returned no findings for this scan.
                                        This does not guarantee the website is vulnerability-free.
                                    </Typography>
                                </Box>
                            ) : (
                                <Stack spacing={2}>
                                    {findings.map((finding, index) => (
                                        <Box
                                            key={`${finding.url ?? "finding"}-${index}`}
                                            sx={{
                                                p: { xs: 1.5, md: 2.5 },
                                                border: `1px solid ${C.border}`,
                                                borderRadius: 2.5,
                                                bgcolor: "#070d18",
                                            }}
                                        >
                                            <Stack spacing={1.5}>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    sx={{
                                                        alignItems: "center",
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    <BugReportIcon
                                                        sx={{
                                                            color: C.cyan,
                                                            fontSize: 20,
                                                        }}
                                                    />

                                                    <Typography
                                                        sx={{
                                                            color: C.text,
                                                            fontWeight: 800,
                                                            flex: 1,
                                                            minWidth: 150,
                                                        }}
                                                    >
                                                        {finding.alert ??
                                                            "Security Finding"}
                                                    </Typography>

                                                    <Chip
                                                        size="small"
                                                        label={
                                                            finding.risk ??
                                                            "Informational"
                                                        }
                                                        color={getRiskColor(
                                                            finding.risk
                                                        )}
                                                        sx={{
                                                            ...getRiskStyle(
                                                                finding.risk
                                                            ),
                                                            fontWeight: 800,
                                                        }}
                                                    />
                                                </Stack>

                                                <Box
                                                    sx={{
                                                        p: 1.5,
                                                        bgcolor: "#0b1423",
                                                        borderRadius: 1.5,
                                                        border: `1px solid ${C.border}`,
                                                    }}
                                                >
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        sx={{ alignItems: "center" }}
                                                    >
                                                        <LanguageIcon
                                                            sx={{
                                                                color: C.cyan,
                                                                fontSize: 18,
                                                            }}
                                                        />

                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: C.muted,
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            AFFECTED URL
                                                        </Typography>
                                                    </Stack>

                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: C.text,
                                                            mt: 0.5,
                                                            overflowWrap: "anywhere",
                                                        }}
                                                    >
                                                        {finding.url ??
                                                            "Not provided"}
                                                    </Typography>
                                                </Box>

                                                {finding.description && (
                                                    <Box>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: C.cyan,
                                                                fontWeight: 800,
                                                            }}
                                                        >
                                                            DESCRIPTION
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: C.muted,
                                                                mt: 0.5,
                                                                whiteSpace: "pre-wrap",
                                                            }}
                                                        >
                                                            {finding.description}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {finding.solution && (
                                                    <Box
                                                        sx={{
                                                            p: 1.5,
                                                            borderRadius: 1.5,
                                                            bgcolor: "rgba(52,211,153,0.05)",
                                                            border: "1px solid rgba(52,211,153,0.15)",
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: C.green,
                                                                fontWeight: 800,
                                                            }}
                                                        >
                                                            RECOMMENDED SOLUTION
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: C.text,
                                                                mt: 0.5,
                                                                whiteSpace: "pre-wrap",
                                                            }}
                                                        >
                                                            {finding.solution}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {finding.reference && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: C.muted,
                                                            overflowWrap: "anywhere",
                                                        }}
                                                    >
                                                        Reference: {finding.reference}
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </Stack>
                    </CardContent>
                </Card>

                {/* FOOTER NOTE */}
                <Typography
                    variant="caption"
                    sx={{
                        color: C.muted,
                        textAlign: "center",
                        pb: 1,
                    }}
                >
                    SIEM-Lite · Website Security Assessment · OWASP ZAP
                </Typography>

            </Stack>
        </AppLayout>
    );
}
