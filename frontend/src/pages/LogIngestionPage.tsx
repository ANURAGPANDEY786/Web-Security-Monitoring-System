
import { useState, type ReactNode } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    MenuItem,
    Divider,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import SendIcon from "@mui/icons-material/Send";
import TerminalIcon from "@mui/icons-material/Terminal";
import SecurityIcon from "@mui/icons-material/Security";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

import AppLayout from "../components/layout/AppLayout";
import { scenarios } from "../data/demoLogScenarios";
import { ingestBulkLogs, ingestSingleLog } from "../services/logIngestion";

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

const selectSx = {
    "& .MuiOutlinedInput-root": {
        bgcolor: "#080f1c",
        color: C.text,
        borderRadius: 2,
        "& fieldset": { borderColor: C.border },
        "&:hover fieldset": { borderColor: "#475569" },
        "&.Mui-focused fieldset": { borderColor: C.cyan },
    },
    "& .MuiInputLabel-root": { color: C.muted },
    "& .MuiInputLabel-root.Mui-focused": { color: C.cyan },
    "& .MuiSvgIcon-root": { color: C.muted },
};

const editorSx = {
    "& .MuiOutlinedInput-root": {
        bgcolor: "#050a12",
        color: "#86efac",
        borderRadius: 2,
        alignItems: "flex-start",
        fontFamily: "monospace",
        fontSize: 12,
        lineHeight: 1.8,
        "& fieldset": { borderColor: C.border },
        "&:hover fieldset": { borderColor: "#475569" },
        "&.Mui-focused fieldset": { borderColor: C.cyan },
    },
    "& .MuiInputBase-input::placeholder": {
        color: "#64748b",
        opacity: 1,
    },
};

export default function LogIngestionPage() {
    const [singleLog, setSingleLog] = useState("");
    const [bulkLogs, setBulkLogs] = useState("");
    const [selectedSingleExample, setSelectedSingleExample] = useState("");
    const [selectedBulkExample, setSelectedBulkExample] = useState("");
    const [loading, setLoading] = useState(false);
    const [successCount, setSuccessCount] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const singleLogExamples = scenarios.filter(
        (scenario) => !scenario.logs.includes("\n")
    );

    const bulkLogExamples = scenarios.filter(
        (scenario) => scenario.logs.includes("\n")
    );

    const selectedSingleScenario = singleLogExamples.find(
        (scenario) => scenario.name === selectedSingleExample
    );

    const selectedBulkScenario = bulkLogExamples.find(
        (scenario) => scenario.name === selectedBulkExample
    );

    const resetMessages = () => {
        setSuccessCount(null);
        setError(null);
    };

    const submitSingleLog = async () => {
        resetMessages();

        if (!singleLog.trim()) {
            setError("Single log cannot be empty.");
            return;
        }

        setLoading(true);

        try {
            const createdEvent = await ingestSingleLog(singleLog.trim());
            setSuccessCount(createdEvent ? 1 : 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to ingest log.");
        } finally {
            setLoading(false);
        }
    };

    const submitBulkLogs = async () => {
        resetMessages();

        const lines = bulkLogs
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

        if (lines.length === 0) {
            setError("Bulk logs cannot be empty.");
            return;
        }

        setLoading(true);

        try {
            const createdEvents = await ingestBulkLogs(lines);
            setSuccessCount(createdEvents.length);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to ingest logs.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File | null) => {
        if (!file) return;

        try {
            const text = await file.text();
            setBulkLogs(text);
            setSelectedBulkExample("");
            resetMessages();
        } catch {
            setError("Unable to read the selected file.");
        }
    };

    const handleSingleExampleChange = (scenarioName: string) => {
        setSelectedSingleExample(scenarioName);

        const selected = singleLogExamples.find(
            (scenario) => scenario.name === scenarioName
        );

        if (selected) {
            setSingleLog(selected.logs);
            resetMessages();
        }
    };

    const handleBulkExampleChange = (scenarioName: string) => {
        setSelectedBulkExample(scenarioName);

        const selected = bulkLogExamples.find(
            (scenario) => scenario.name === scenarioName
        );

        if (selected) {
            setBulkLogs(selected.logs);
            resetMessages();
        }
    };

    const bulkLineCount = bulkLogs
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean).length;

    return (
        <AppLayout title="Log Ingestion">
            <Stack spacing={3}>
                {/* PAGE HEADER */}
                <Box>
                    <Typography
                        sx={{
                            color: "#60a5fa",
                            fontSize: 12,
                            letterSpacing: 1,
                            mb: 1,
                        }}
                    >
                        SECURITY OPERATIONS / DATA INGESTION
                    </Typography>

                    <Typography
                        sx={{
                            color: "#f8fafc",
                            fontSize: 28,
                            fontWeight: 900,
                        }}
                    >
                        Log Ingestion
                    </Typography>

                    <Typography
                        sx={{
                            color: C.muted,
                            fontSize: 13,
                            mt: 0.7,
                            maxWidth: 750,
                        }}
                    >
                        Ingest individual security logs or bulk detection scenarios
                        into your SIEM-Lite monitoring pipeline.
                    </Typography>
                </Box>

                {/* STATUS */}
                {successCount !== null && (
                    <Alert
                        severity="success"
                        icon={<CheckCircleOutlineIcon />}
                        sx={{
                            bgcolor: "rgba(16,185,129,0.10)",
                            color: "#a7f3d0",
                            border: "1px solid rgba(52,211,153,0.25)",
                            "& .MuiAlert-icon": { color: C.green },
                        }}
                    >
                        <Typography sx={{ fontWeight: 700 }}>
                            Logs successfully ingested.
                        </Typography>
                        <Typography sx={{ fontSize: 13 }}>
                            Created: {successCount} Security Events. Refresh Dashboard,
                            Events, Alerts and Incidents to view the results.
                        </Typography>
                    </Alert>
                )}

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            bgcolor: "rgba(251,113,133,0.08)",
                            color: "#fecdd3",
                            border: "1px solid rgba(251,113,133,0.25)",
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {/* INGESTION PANELS */}
                <Grid container spacing={3}>
                    {/* SINGLE LOG */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <IngestionCard
                            title="Single Log"
                            subtitle="Submit one parser-supported security log."
                            icon={<DescriptionIcon />}
                            tag="INDIVIDUAL EVENT"
                        >
                            <ScenarioSelector
                                label="Choose Single Log Example"
                                value={selectedSingleExample}
                                onChange={handleSingleExampleChange}
                                examples={singleLogExamples}
                            />

                            {selectedSingleScenario && (
                                <ScenarioInfo scenario={selectedSingleScenario} />
                            )}

                            <EditorLabel
                                title="LOG INPUT"
                                subtitle="Paste or edit your log entry"
                            />

                            <TextField
                                fullWidth
                                multiline
                                minRows={9}
                                maxRows={15}
                                value={singleLog}
                                onChange={(e) => setSingleLog(e.target.value)}
                                placeholder="Paste one parser-supported log line here..."
                                sx={editorSx}
                            />

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mt: 1,
                                    mb: 2.5,
                                }}
                            >
                                <Typography sx={{ color: C.muted, fontSize: 11 }}>
                                    Single event submission
                                </Typography>

                                <Chip
                                    size="small"
                                    label={`${singleLog.trim() ? 1 : 0} log`}
                                    sx={{
                                        color: C.cyan,
                                        bgcolor: "rgba(34,211,238,0.08)",
                                    }}
                                />
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={
                                    loading ? (
                                        <CircularProgress size={17} color="inherit" />
                                    ) : (
                                        <SendIcon />
                                    )
                                }
                                onClick={submitSingleLog}
                                disabled={loading}
                                sx={primaryButtonSx}
                            >
                                {loading ? "Submitting..." : "Submit Single Log"}
                            </Button>
                        </IngestionCard>
                    </Grid>

                    {/* BULK LOGS */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <IngestionCard
                            title="Bulk Logs"
                            subtitle="Upload multiple events or use a detection scenario."
                            icon={<TerminalIcon />}
                            tag="BATCH INGESTION"
                        >
                            <ScenarioSelector
                                label="Choose Detection Scenario"
                                value={selectedBulkExample}
                                onChange={handleBulkExampleChange}
                                examples={bulkLogExamples}
                            />

                            {selectedBulkScenario && (
                                <ScenarioInfo scenario={selectedBulkScenario} />
                            )}

                            <EditorLabel
                                title="BULK LOG INPUT"
                                subtitle="One log entry per line"
                            />

                            <TextField
                                fullWidth
                                multiline
                                minRows={9}
                                maxRows={15}
                                value={bulkLogs}
                                onChange={(e) => setBulkLogs(e.target.value)}
                                placeholder={"Paste multiple logs here...\nOne log per line"}
                                sx={editorSx}
                            />

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mt: 1,
                                    mb: 2.5,
                                }}
                            >
                                <Typography sx={{ color: C.muted, fontSize: 11 }}>
                                    TXT file or manual input
                                </Typography>

                                <Chip
                                    size="small"
                                    label={`${bulkLineCount} logs`}
                                    sx={{
                                        color: C.cyan,
                                        bgcolor: "rgba(34,211,238,0.08)",
                                    }}
                                />
                            </Box>

                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1.5}
                            >
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={
                                        loading ? (
                                            <CircularProgress size={17} color="inherit" />
                                        ) : (
                                            <SendIcon />
                                        )
                                    }
                                    onClick={submitBulkLogs}
                                    disabled={loading}
                                    sx={primaryButtonSx}
                                >
                                    {loading ? "Submitting..." : "Submit Bulk Logs"}
                                </Button>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    component="label"
                                    startIcon={<UploadFileIcon />}
                                    disabled={loading}
                                    sx={{
                                        minHeight: 44,
                                        color: C.cyan,
                                        borderColor: "rgba(34,211,238,0.35)",
                                        textTransform: "none",
                                        fontWeight: 700,
                                        "&:hover": {
                                            borderColor: C.cyan,
                                            bgcolor: "rgba(34,211,238,0.07)",
                                        },
                                    }}
                                >
                                    Upload TXT File
                                    <input
                                        hidden
                                        type="file"
                                        accept=".txt,text/plain"
                                        onChange={(e) => {
                                            handleFileUpload(e.target.files?.[0] ?? null);
                                            e.target.value = "";
                                        }}
                                    />
                                </Button>
                            </Stack>
                        </IngestionCard>
                    </Grid>
                </Grid>

                {/* INFORMATION FOOTER */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        bgcolor: "rgba(34,211,238,0.035)",
                        border: "1px solid rgba(34,211,238,0.15)",
                        borderRadius: 3,
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "flex-start" }}
                    >
                        <SecurityIcon sx={{ color: C.cyan, mt: 0.2 }} />

                        <Box>
                            <Typography
                                sx={{
                                    color: "#e2e8f0",
                                    fontSize: 13,
                                    fontWeight: 800,
                                    mb: 0.5,
                                }}
                            >
                                Detection Pipeline
                            </Typography>

                            <Typography
                                sx={{
                                    color: C.muted,
                                    fontSize: 12,
                                    lineHeight: 1.8,
                                }}
                            >
                                Built-in examples are designed to trigger events,
                                alerts, incidents, MITRE enrichment and IOC matching
                                according to the existing backend detection pipeline.
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>
            </Stack>
        </AppLayout>
    );
}

/* REUSABLE UI COMPONENTS */

function IngestionCard({
    title,
    subtitle,
    icon,
    tag,
    children,
}: {
    title: string;
    subtitle: string;
    icon: ReactNode;
    tag: string;
    children: ReactNode;
}) {
    return (
        <Card
            elevation={0}
            sx={{
                height: "100%",
                bgcolor: C.card,
                color: C.text,
                border: `1px solid ${C.border}`,
                borderRadius: 3,
            }}
        >
            <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: 2.5 } }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.5,
                        mb: 2.5,
                    }}
                >
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            flexShrink: 0,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "rgba(34,211,238,0.09)",
                            color: C.cyan,
                        }}
                    >
                        {icon}
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                        <Typography
                            sx={{
                                color: "#f8fafc",
                                fontSize: 18,
                                fontWeight: 800,
                            }}
                        >
                            {title}
                        </Typography>

                        <Typography
                            sx={{
                                color: C.muted,
                                fontSize: 12,
                                mt: 0.4,
                            }}
                        >
                            {subtitle}
                        </Typography>
                    </Box>

                    <Chip
                        label={tag}
                        size="small"
                        sx={{
                            display: { xs: "none", sm: "flex" },
                            color: C.cyan,
                            bgcolor: "rgba(34,211,238,0.07)",
                            fontSize: 9,
                            fontWeight: 800,
                        }}
                    />
                </Box>

                <Divider sx={{ borderColor: C.border, mb: 2.5 }} />

                {children}
            </CardContent>
        </Card>
    );
}

function ScenarioSelector({
    label,
    value,
    onChange,
    examples,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    examples: typeof scenarios;
}) {
    return (
        <TextField
            select
            fullWidth
            label={label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            sx={{ ...selectSx, mb: 2.5 }}
        >
            <MenuItem value="">Select a built-in example</MenuItem>

            {examples.map((scenario) => (
                <MenuItem key={scenario.name} value={scenario.name}>
                    {scenario.name} - {scenario.severity}
                </MenuItem>
            ))}
        </TextField>
    );
}

function ScenarioInfo({
    scenario,
}: {
    scenario: (typeof scenarios)[number];
}) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                mb: 2.5,
                bgcolor: "#080f1c",
                border: `1px solid ${C.border}`,
                borderLeft: `3px solid ${C.orange}`,
                borderRadius: 2,
            }}
        >
            <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{ mb: 1.5, flexWrap: "wrap" }}
            >
                <Chip
                    size="small"
                    label={`Severity: ${scenario.severity}`}
                    sx={{
                        color: C.orange,
                        bgcolor: "rgba(251,146,60,0.09)",
                    }}
                />

                <Chip
                    size="small"
                    label={`MITRE: ${scenario.mitre}`}
                    sx={{
                        color: "#60a5fa",
                        bgcolor: "rgba(96,165,250,0.09)",
                    }}
                />
            </Stack>

            <Typography
                sx={{
                    color: C.muted,
                    fontSize: 12,
                    lineHeight: 1.7,
                }}
            >
                {scenario.description}
            </Typography>
        </Paper>
    );
}

function EditorLabel({
    title,
    subtitle,
}: {
    title: string;
    subtitle: string;
}) {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
                gap: 1,
            }}
        >
            <Typography
                sx={{
                    color: "#cbd5e1",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 1,
                }}
            >
                {title}
            </Typography>

            <Typography
                sx={{
                    color: "#64748b",
                    fontSize: 10,
                }}
            >
                {subtitle}
            </Typography>
        </Box>
    );
}

const primaryButtonSx = {
    minHeight: 44,
    bgcolor: "#0891b2",
    color: "#ecfeff",
    textTransform: "none",
    fontWeight: 800,
    boxShadow: "none",
    "&:hover": {
        bgcolor: "#0e7490",
        boxShadow: "none",
    },
};
