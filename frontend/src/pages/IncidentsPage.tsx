
import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import {
    RefreshRounded,
    ShieldRounded,
    ErrorOutlineRounded,
    SearchRounded,
    CheckCircleRounded,
    AssignmentRounded,
} from "@mui/icons-material";

import AppLayout from "../components/layout/AppLayout";
import IncidentTable from "../components/incidents/IncidentTable";
import IncidentDetailsDrawer from "../components/incidents/IncidentDetailsDrawer";

import type { Incident, IncidentStatus } from "../types/incident";
import {
    assignIncident,
    getIncidents,
    updateIncidentNotes,
    updateIncidentStatus,
} from "../services/incidents";

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function loadIncidents() {
        try {
            setLoading(true);
            setError(null);

            const data = await getIncidents();
            setIncidents(data);
        } catch {
            setError("Failed to load incidents.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let active = true;

        getIncidents()
            .then((data) => {
                if (active) {
                    setIncidents(data);
                }
            })
            .catch(() => {
                if (active) {
                    setError("Failed to load incidents.");
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    function handleInvestigate(incident: Incident) {
        setSelectedIncident(incident);
        setDrawerOpen(true);
        setSuccess(null);
        setError(null);
    }

    function updateSelectedIncident(updatedIncident: Incident) {
        setSelectedIncident(updatedIncident);
        setIncidents((current) =>
            current.map((incident) =>
                incident.id === updatedIncident.id ? updatedIncident : incident
            )
        );
    }

    async function handleAssign(assignedAnalyst: string) {
        if (!selectedIncident) return;

        try {
            const updatedIncident = await assignIncident(
                selectedIncident.id,
                assignedAnalyst
            );
            updateSelectedIncident(updatedIncident);
            setSuccess("Incident assignment updated.");
        } catch {
            setError("Failed to update incident assignment.");
        }
    }

    async function handleStatusChange(status: IncidentStatus) {
        if (!selectedIncident) return;

        try {
            const updatedIncident = await updateIncidentStatus(
                selectedIncident.id,
                status
            );
            updateSelectedIncident(updatedIncident);
            setSuccess("Incident status updated.");
        } catch {
            setError("Failed to update incident status.");
        }
    }

    async function handleNotesSave(notes: string) {
        if (!selectedIncident) return;

        try {
            const updatedIncident = await updateIncidentNotes(
                selectedIncident.id,
                notes
            );
            updateSelectedIncident(updatedIncident);
            setSuccess("Incident notes updated.");
        } catch {
            setError("Failed to update incident notes.");
        }
    }

    const criticalCount = incidents.filter(
        (incident) => incident.severity?.toUpperCase() === "CRITICAL"
    ).length;

    const investigatingCount = incidents.filter(
        (incident) => incident.status?.toUpperCase() === "INVESTIGATING"
    ).length;

    const resolvedCount = incidents.filter(
        (incident) => incident.status?.toUpperCase() === "RESOLVED"
    ).length;

    const metrics = [
        {
            label: "Total Incidents",
            value: incidents.length,
            description: "All recorded incidents",
            icon: <ShieldRounded />,
            color: "#22d3ee",
        },
        {
            label: "Critical Incidents",
            value: criticalCount,
            description: "Critical severity cases",
            icon: <ErrorOutlineRounded />,
            color: "#fb7185",
        },
        {
            label: "Investigating",
            value: investigatingCount,
            description: "Currently under investigation",
            icon: <SearchRounded />,
            color: "#fbbf24",
        },
        {
            label: "Resolved",
            value: resolvedCount,
            description: "Successfully resolved cases",
            icon: <CheckCircleRounded />,
            color: "#34d399",
        },
    ];

    return (
        <AppLayout title="Incident Management">
            <Stack spacing={3}>
                {/* Page Header */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 2,
                    }}
                >
                    <Box>
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: "center" }}
                        >
                            <AssignmentRounded sx={{ color: "#22d3ee", fontSize: 25 }} />
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: 800, color: "#e2e8f0" }}
                            >
                                Incident Management
                            </Typography>
                        </Stack>

                        <Typography
                            variant="body2"
                            sx={{ color: "#8493a8", mt: 0.7 }}
                        >
                            Monitor, investigate and manage security incidents.
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<RefreshRounded />}
                        onClick={loadIncidents}
                        disabled={loading}
                        sx={{
                            color: "#22d3ee",
                            borderColor: "#164e63",
                            textTransform: "none",
                            borderRadius: 2,
                            px: 2,
                            "&:hover": {
                                borderColor: "#22d3ee",
                                bgcolor: "rgba(34,211,238,0.07)",
                            },
                        }}
                    >
                        Refresh
                    </Button>
                </Box>

                {/* Notifications */}
                {error && (
                    <Alert
                        severity="error"
                        onClose={() => setError(null)}
                        sx={{
                            bgcolor: "#2a1720",
                            color: "#fecdd3",
                            border: "1px solid #7f1d35",
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert
                        severity="success"
                        onClose={() => setSuccess(null)}
                        sx={{
                            bgcolor: "#102820",
                            color: "#a7f3d0",
                            border: "1px solid #166534",
                        }}
                    >
                        {success}
                    </Alert>
                )}

                {/* Summary Cards */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            xl: "repeat(4, 1fr)",
                        },
                        gap: 2,
                    }}
                >
                    {metrics.map((metric) => (
                        <Paper
                            key={metric.label}
                            elevation={0}
                            sx={{
                                p: 2.3,
                                bgcolor: "#0b1423",
                                border: "1px solid #1e293b",
                                borderRadius: 3,
                                minWidth: 0,
                            }}
                        >
                            <Stack
                                direction="row"
                                sx={{
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{ color: "#94a3b8", fontWeight: 600 }}
                                >
                                    {metric.label}
                                </Typography>

                                <Box
                                    sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: `${metric.color}15`,
                                        color: metric.color,
                                    }}
                                >
                                    {metric.icon}
                                </Box>
                            </Stack>

                            <Typography
                                variant="h4"
                                sx={{
                                    color: "#f1f5f9",
                                    mt: 1.5,
                                    fontWeight: 800,
                                }}
                            >
                                {metric.value}
                            </Typography>

                            <Typography
                                variant="caption"
                                sx={{ color: "#64748b", display: "block", mt: 0.6 }}
                            >
                                {metric.description}
                            </Typography>
                        </Paper>
                    ))}
                </Box>

                {/* Incident Queue */}
                <Paper
                    elevation={0}
                    sx={{
                        bgcolor: "#0b1423",
                        border: "1px solid #1e293b",
                        borderRadius: 3,
                        overflow: "hidden",
                    }}
                >
                    <Box
                        sx={{
                            px: 2.5,
                            py: 2,
                            borderBottom: "1px solid #1e293b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                        }}
                    >
                        <Box>
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 750, color: "#e2e8f0" }}
                            >
                                Incident Queue
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ color: "#64748b" }}
                            >
                                Security cases requiring SOC attention
                            </Typography>
                        </Box>

                        <Typography
                            variant="caption"
                            sx={{
                                color: "#22d3ee",
                                bgcolor: "rgba(34,211,238,0.08)",
                                border: "1px solid rgba(34,211,238,0.2)",
                                borderRadius: 5,
                                px: 1.4,
                                py: 0.6,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {incidents.length} Records
                        </Typography>
                    </Box>

                    <Box sx={{ p: { xs: 1.2, sm: 2 } }}>
                        {loading ? (
                            <Box
                                sx={{
                                    minHeight: 220,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <CircularProgress
                                    size={30}
                                    sx={{ color: "#22d3ee" }}
                                />
                            </Box>
                        ) : (
                            <IncidentTable
                                incidents={incidents}
                                onInvestigate={handleInvestigate}
                            />
                        )}
                    </Box>
                </Paper>

                {/* Incident Details */}
                <IncidentDetailsDrawer
                    open={drawerOpen}
                    incident={selectedIncident}
                    onClose={() => setDrawerOpen(false)}
                    onAssign={handleAssign}
                    onStatusChange={handleStatusChange}
                    onNotesSave={handleNotesSave}
                />
            </Stack>
        </AppLayout>
    );
}
