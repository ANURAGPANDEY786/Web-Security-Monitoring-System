import { useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";

import AppLayout from "../components/layout/AppLayout";
import { scenarios } from "../data/demoLogScenarios";
import { ingestBulkLogs, ingestSingleLog } from "../services/logIngestion";

const textFieldSx = {
    mb: 2,
    "& .MuiOutlinedInput-root": {
        backgroundColor: "#ffffff",
        color: "#111827",
    },
    "& .MuiInputBase-input": {
        color: "#111827",
    },
    "& .MuiInputBase-input::placeholder": {
        color: "#6b7280",
        opacity: 1,
    },
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#475569",
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

        const text = await file.text();
        setBulkLogs(text);
        setSelectedBulkExample("");
        resetMessages();
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

    return (
        <AppLayout title="Log Ingestion">
            <Box sx={{ width: "100%" }}>
                <Typography variant="body1" sx={{ color: "#d1d5db", mb: 3 }}>
                    Choose a built-in demo log or paste your own parser-supported logs.
                    Built-in examples are designed to trigger events, alerts, incidents,
                    MITRE enrichment, and IOC matching.
                </Typography>

                {successCount !== null && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        ✔ Logs successfully ingested. Created: {successCount} Security Events.
                        Refresh Dashboard, Events, Alerts and Incidents to view results.
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{ bgcolor: "#111827", color: "#e5e7eb" }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 1 }}>
                                    Single Log
                                </Typography>

                                <Typography variant="body2" sx={{ color: "#9ca3af", mb: 2 }}>
                                    Select one built-in example or paste one log line manually.
                                </Typography>

                                <TextField
                                    select
                                    fullWidth
                                    label="Choose Single Log Example"
                                    value={selectedSingleExample}
                                    onChange={(e) => handleSingleExampleChange(e.target.value)}
                                    sx={textFieldSx}
                                >
                                    <MenuItem value="">
                                        Select a built-in single log example
                                    </MenuItem>

                                    {singleLogExamples.map((scenario) => (
                                        <MenuItem key={scenario.name} value={scenario.name}>
                                            {scenario.name} - {scenario.severity}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                {selectedSingleScenario && (
                                    <Box
                                        sx={{
                                            mb: 2,
                                            p: 2,
                                            border: "1px solid #374151",
                                            borderRadius: 1,
                                            bgcolor: "#1f2937",
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ color: "#facc15", fontWeight: 600 }}>
                                            Severity: {selectedSingleScenario.severity}
                                        </Typography>

                                        <Typography variant="body2" sx={{ color: "#60a5fa", fontWeight: 600 }}>
                                            MITRE ATT&CK: {selectedSingleScenario.mitre}
                                        </Typography>

                                        <Typography variant="body2" sx={{ color: "#d1d5db", mt: 1 }}>
                                            {selectedSingleScenario.description}
                                        </Typography>
                                    </Box>
                                )}

                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={8}
                                    value={singleLog}
                                    onChange={(e) => setSingleLog(e.target.value)}
                                    placeholder="Paste one parser-supported log line here..."
                                    sx={textFieldSx}
                                />

                                <Button
                                    variant="contained"
                                    onClick={submitSingleLog}
                                    disabled={loading}
                                >
                                    Submit Single Log
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{ bgcolor: "#111827", color: "#e5e7eb" }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 1 }}>
                                    Bulk Logs / Detection Scenarios
                                </Typography>

                                <Typography variant="body2" sx={{ color: "#9ca3af", mb: 2 }}>
                                    Select a built-in detection scenario, upload a TXT file, or paste
                                    multiple logs manually.
                                </Typography>

                                <TextField
                                    select
                                    fullWidth
                                    label="Choose Detection Scenario"
                                    value={selectedBulkExample}
                                    onChange={(e) => handleBulkExampleChange(e.target.value)}
                                    sx={textFieldSx}
                                >
                                    <MenuItem value="">
                                        Select a built-in detection scenario
                                    </MenuItem>

                                    {bulkLogExamples.map((scenario) => (
                                        <MenuItem key={scenario.name} value={scenario.name}>
                                            {scenario.name} - {scenario.severity}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                {selectedBulkScenario && (
                                    <Box
                                        sx={{
                                            mb: 2,
                                            p: 2,
                                            border: "1px solid #374151",
                                            borderRadius: 1,
                                            bgcolor: "#1f2937",
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ color: "#facc15", fontWeight: 600 }}>
                                            Severity: {selectedBulkScenario.severity}
                                        </Typography>

                                        <Typography variant="body2" sx={{ color: "#60a5fa", fontWeight: 600 }}>
                                            MITRE ATT&CK: {selectedBulkScenario.mitre}
                                        </Typography>

                                        <Typography variant="body2" sx={{ color: "#d1d5db", mt: 1 }}>
                                            {selectedBulkScenario.description}
                                        </Typography>
                                    </Box>
                                )}

                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={8}
                                    value={bulkLogs}
                                    onChange={(e) => setBulkLogs(e.target.value)}
                                    placeholder="Paste multiple logs here, one log per line..."
                                    sx={textFieldSx}
                                />

                                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                    <Button
                                        variant="contained"
                                        onClick={submitBulkLogs}
                                        disabled={loading}
                                    >
                                        Submit Bulk Logs
                                    </Button>

                                    <Button variant="outlined" component="label">
                                        Upload Your Own .txt
                                        <input
                                            hidden
                                            type="file"
                                            accept=".txt,text/plain"
                                            onChange={(e) =>
                                                handleFileUpload(e.target.files?.[0] ?? null)
                                            }
                                        />
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </AppLayout>
    );
}