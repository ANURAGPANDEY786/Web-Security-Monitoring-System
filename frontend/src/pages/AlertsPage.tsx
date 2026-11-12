
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert as MuiAlert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

import AppLayout from "../components/layout/AppLayout";

import {
    assignAlert,
    getAlerts,
    getRelatedEvents,
    updateAlertNotes,
    updateAlertStatus,
} from "../services/alerts";

import AlertDetailsDrawer from "../components/AlertDetailsDrawer";
import type { Alert } from "../types/alert";
import type { SecurityEvent } from "../types/event";

const colors = {
    background: "#070d18",
    card: "#0b1423",
    cardLight: "#101c2e",
    border: "#1e293b",
    text: "#e2e8f0",
    muted: "#94a3b8",
    cyan: "#22d3ee",
    red: "#fb7185",
    orange: "#fb923c",
    yellow: "#fbbf24",
    green: "#34d399",
};

function getSeverityColor(
    severity: string
): "default" | "error" | "warning" | "info" | "success" {
    switch (severity?.toUpperCase()) {
        case "CRITICAL":
            return "error";
        case "HIGH":
            return "warning";
        case "MEDIUM":
            return "info";
        case "LOW":
            return "success";
        default:
            return "default";
    }
}

function getSeverityTextColor(severity: string) {
    switch (severity?.toUpperCase()) {
        case "CRITICAL":
            return colors.red;
        case "HIGH":
            return colors.orange;
        case "MEDIUM":
            return colors.yellow;
        case "LOW":
            return colors.green;
        default:
            return colors.muted;
    }
}

function sortAlertsByCreatedAt(alerts: Alert[]) {
    return [...alerts].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });
}

export default function AlertsPage() {
    const navigate = useNavigate();

    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [relatedEvents, setRelatedEvents] = useState<SecurityEvent[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [assignOpen, setAssignOpen] = useState(false);

    const [analyst, setAnalyst] = useState("");
    const [notes, setNotes] = useState("");

    async function loadAlerts() {
        try {
            const data = await getAlerts();
            setAlerts(sortAlertsByCreatedAt(data));
            setError("");
        } catch {
            setError("Failed to load alerts.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let active = true;

        getAlerts()
            .then((data) => {
                if (active) {
                    setAlerts(sortAlertsByCreatedAt(data));
                    setError("");
                }
            })
            .catch(() => {
                if (active) {
                    setError("Failed to load alerts.");
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

    async function handleStatusChange(id: number, status: string) {
        await updateAlertStatus(id, status);

        setAlerts((currentAlerts) =>
            currentAlerts.map((alert) =>
                alert.id === id ? { ...alert, status } : alert
            )
        );

        if (selectedAlert?.id === id) {
            setSelectedAlert({ ...selectedAlert, status });
        }

        await loadAlerts();
    }

    async function openDrawer(alert: Alert) {
        setSelectedAlert(alert);
        setNotes(alert.notes ?? "");
        setRelatedEvents([]);
        setDrawerOpen(true);

        try {
            const events = await getRelatedEvents(alert.id);
            setRelatedEvents(events);
        } catch {
            setRelatedEvents([]);
        }
    }

    function closeDrawer() {
        setDrawerOpen(false);
        setRelatedEvents([]);
    }

    function openAssignDialog(alert: Alert) {
        setSelectedAlert(alert);
        setAnalyst(alert.assignedAnalyst ?? "");
        setAssignOpen(true);
    }

    async function handleAssignSave() {
        if (!selectedAlert) return;

        await assignAlert(selectedAlert.id, analyst);

        setSelectedAlert({
            ...selectedAlert,
            assignedAnalyst: analyst,
        });

        setAlerts((currentAlerts) =>
            currentAlerts.map((alert) =>
                alert.id === selectedAlert.id
                    ? { ...alert, assignedAnalyst: analyst }
                    : alert
            )
        );

        setAssignOpen(false);
        await loadAlerts();
    }

    async function handleNotesSave() {
        if (!selectedAlert) return;

        await updateAlertNotes(selectedAlert.id, notes);

        setSelectedAlert({
            ...selectedAlert,
            notes,
        });

        setAlerts((currentAlerts) =>
            currentAlerts.map((alert) =>
                alert.id === selectedAlert.id ? { ...alert, notes } : alert
            )
        );

        await loadAlerts();
    }

    function handlePivot(
        field: "sourceIp" | "username" | "mitreTechnique",
        value: string
    ) {
        navigate(`/events?${field}=${encodeURIComponent(value)}`);
    }

    const criticalCount = alerts.filter(
        (alert) => alert.severity?.toUpperCase() === "CRITICAL"
    ).length;

    const highCount = alerts.filter(
        (alert) => alert.severity?.toUpperCase() === "HIGH"
    ).length;

    const openCount = alerts.filter(
        (alert) => alert.status?.toUpperCase() === "OPEN"
    ).length;

    const assignedCount = alerts.filter(
        (alert) => Boolean(alert.assignedAnalyst)
    ).length;

    return (
        <AppLayout title="Security Alerts">

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

                {/* PAGE HEADER */}
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
                        <Typography
                            sx={{
                                color: colors.muted,
                                fontSize: 12,
                                mb: 0.7,
                                letterSpacing: 1,
                            }}
                        >
                            SECURITY OPERATIONS / THREAT DETECTION
                        </Typography>

                        <Typography
                            sx={{
                                color: "#f8fafc",
                                fontSize: { xs: 23, md: 29 },
                                fontWeight: 800,
                            }}
                        >
                            Security Alerts
                        </Typography>

                        <Typography
                            sx={{
                                color: colors.muted,
                                fontSize: 13,
                                mt: 0.7,
                            }}
                        >
                            Monitor, investigate and manage detected security threats.
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => {
                            setLoading(true);
                            loadAlerts();
                        }}
                        disabled={loading}
                        sx={{
                            color: colors.cyan,
                            borderColor: "#164e63",
                            px: 2,
                            "&:hover": {
                                borderColor: colors.cyan,
                                bgcolor: "rgba(34,211,238,0.08)",
                            },
                        }}
                    >
                        Refresh Alerts
                    </Button>
                </Box>

                {/* SUMMARY CARDS */}
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
                            label: "Total Alerts",
                            value: alerts.length,
                            color: colors.cyan,
                            icon: <NotificationsActiveIcon />,
                        },
                        {
                            label: "Critical Alerts",
                            value: criticalCount,
                            color: colors.red,
                            icon: <NotificationsActiveIcon />,
                        },
                        {
                            label: "High Alerts",
                            value: highCount,
                            color: colors.orange,
                            icon: <NotificationsActiveIcon />,
                        },
                        {
                            label: "Open Alerts",
                            value: openCount,
                            color: colors.yellow,
                            icon: <AssignmentIndIcon />,
                        },
                    ].map((item) => (
                        <Paper
                            key={item.label}
                            elevation={0}
                            sx={{
                                p: 2.3,
                                bgcolor: colors.card,
                                color: colors.text,
                                border: `1px solid ${colors.border}`,
                                borderRadius: 3,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1.5,
                                }}
                            >
                                <Typography sx={{ color: colors.muted, fontSize: 12 }}>
                                    {item.label}
                                </Typography>

                                <Box sx={{ color: item.color, display: "flex" }}>
                                    {item.icon}
                                </Box>
                            </Box>

                            <Typography
                                sx={{
                                    fontSize: 28,
                                    fontWeight: 800,
                                    color: "#f8fafc",
                                }}
                            >
                                {item.value}
                            </Typography>
                        </Paper>
                    ))}
                </Box>

                {/* ERROR */}
                {error && (
                    <MuiAlert severity="error">
                        {error}
                    </MuiAlert>
                )}

                {/* ALERT TABLE */}
                <Paper
                    elevation={0}
                    sx={{
                        bgcolor: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 3,
                        overflow: "hidden",
                    }}
                >
                    <Box
                        sx={{
                            p: 2.5,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 1,
                            borderBottom: `1px solid ${colors.border}`,
                        }}
                    >
                        <Box>
                            <Typography
                                sx={{
                                    color: "#f8fafc",
                                    fontWeight: 800,
                                    fontSize: 16,
                                }}
                            >
                                Detected Alerts
                            </Typography>

                            <Typography
                                sx={{ color: colors.muted, fontSize: 11, mt: 0.5 }}
                            >
                                Security incidents generated by the detection engine
                            </Typography>
                        </Box>

                        <Chip
                            label={`${assignedCount} Assigned`}
                            size="small"
                            sx={{
                                bgcolor: "rgba(34,211,238,0.1)",
                                color: colors.cyan,
                                border: "1px solid #164e63",
                            }}
                        />
                    </Box>

                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                            <CircularProgress sx={{ color: colors.cyan }} />
                        </Box>
                    ) : (
                        <TableContainer sx={{ overflowX: "auto" }}>
                            <Table sx={{ minWidth: 1050 }}>
                                <TableHead>
                                    <TableRow
                                        sx={{
                                            bgcolor: colors.cardLight,
                                            "& th": {
                                                color: colors.muted,
                                                fontSize: 11,
                                                fontWeight: 800,
                                                textTransform: "uppercase",
                                                letterSpacing: 0.5,
                                                borderBottom: `1px solid ${colors.border}`,
                                                whiteSpace: "nowrap",
                                            },
                                        }}
                                    >
                                        <TableCell>Severity</TableCell>
                                        <TableCell>Alert Type</TableCell>
                                        <TableCell>Risk Score</TableCell>
                                        <TableCell>MITRE Technique</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Assigned Analyst</TableCell>
                                        <TableCell>Created</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {alerts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                <Box sx={{ py: 5 }}>
                                                    <NotificationsActiveIcon
                                                        sx={{
                                                            fontSize: 35,
                                                            color: colors.muted,
                                                            mb: 1,
                                                        }}
                                                    />
                                                    <Typography sx={{ color: colors.muted }}>
                                                        No alerts found.
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        alerts.map((alert) => (
                                            <TableRow
                                                key={alert.id}
                                                hover
                                                sx={{
                                                    "& td": {
                                                        color: colors.text,
                                                        fontSize: 12,
                                                        borderBottom: `1px solid ${colors.border}`,
                                                        py: 1.8,
                                                    },
                                                    "&:hover": {
                                                        bgcolor: "rgba(34,211,238,0.035) !important",
                                                    },
                                                }}
                                            >
                                                <TableCell>
                                                    <Chip
                                                        label={alert.severity ?? "UNKNOWN"}
                                                        color={getSeverityColor(alert.severity)}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 800,
                                                            fontSize: 10,
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell sx={{ fontWeight: 700 }}>
                                                    {alert.alertType ?? alert.type ?? "N/A"}
                                                </TableCell>

                                                <TableCell>
                                                    <Typography
                                                        sx={{
                                                            color: getSeverityTextColor(alert.severity),
                                                            fontWeight: 800,
                                                        }}
                                                    >
                                                        {alert.riskScore ?? 0}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    {alert.mitreTechnique ?? "N/A"}
                                                </TableCell>

                                                <TableCell>
                                                    <Chip
                                                        label={alert.status ?? "OPEN"}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{
                                                            color: colors.cyan,
                                                            borderColor: "#164e63",
                                                            fontSize: 10,
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    {alert.assignedAnalyst ?? (
                                                        <Typography
                                                            sx={{ color: colors.muted, fontSize: 11 }}
                                                        >
                                                            Unassigned
                                                        </Typography>
                                                    )}
                                                </TableCell>

                                                <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                    {alert.createdAt
                                                        ? new Date(alert.createdAt).toLocaleString()
                                                        : "N/A"}
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<VisibilityIcon />}
                                                        onClick={() => openDrawer(alert)}
                                                        sx={{
                                                            color: colors.cyan,
                                                            borderColor: "#164e63",
                                                            fontSize: 11,
                                                            textTransform: "none",
                                                            "&:hover": {
                                                                borderColor: colors.cyan,
                                                                bgcolor: "rgba(34,211,238,0.08)",
                                                            },
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>

                <Typography
                    sx={{
                        color: "#64748b",
                        fontSize: 11,
                        borderTop: `1px solid ${colors.border}`,
                        pt: 2,
                    }}
                >
                    SIEM-Lite Security Monitoring Platform · Alert Management
                </Typography>
            </Box>

            <AlertDetailsDrawer
                open={drawerOpen}
                alert={selectedAlert}
                relatedEvents={relatedEvents}
                notes={notes}
                onNotesChange={setNotes}
                onClose={closeDrawer}
                onStatusChange={handleStatusChange}
                onSaveNotes={handleNotesSave}
                onOpenAssign={openAssignDialog}
                onPivot={handlePivot}
            />

            <Dialog
                open={assignOpen}
                onClose={() => setAssignOpen(false)}
                fullWidth
                maxWidth="sm"
                slotProps={{
                    paper: {
                        sx: {
                            bgcolor: colors.card,
                            color: colors.text,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 3,
                        },
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    Assign Alert
                </DialogTitle>

                <DialogContent>
                    <Typography sx={{ color: colors.muted, fontSize: 12, mb: 1 }}>
                        Assign this security alert to an analyst.
                    </Typography>

                    <TextField
                        label="Analyst"
                        fullWidth
                        value={analyst}
                        onChange={(event) => setAnalyst(event.target.value)}
                        sx={{
                            mt: 2,
                            "& .MuiInputBase-root": {
                                color: colors.text,
                            },
                            "& .MuiInputLabel-root": {
                                color: colors.muted,
                            },
                        }}
                    />
                </DialogContent>

                <DialogActions sx={{ p: 2.5 }}>
                    <Button
                        onClick={() => setAssignOpen(false)}
                        sx={{ color: colors.muted }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleAssignSave}
                        sx={{
                            bgcolor: "#0891b2",
                            "&:hover": { bgcolor: "#0e7490" },
                        }}
                    >
                        Save Assignment
                    </Button>
                </DialogActions>
            </Dialog>

        </AppLayout>
    );
}
