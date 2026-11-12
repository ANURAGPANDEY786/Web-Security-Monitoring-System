
import { useState } from "react";
import {
    Box,
    Button,
    Chip,
    Divider,
    Drawer,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import SecurityIcon from "@mui/icons-material/Security";
import NotesIcon from "@mui/icons-material/Notes";
import SaveIcon from "@mui/icons-material/Save";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import type { Incident, IncidentStatus } from "../../types/incident";

interface Props {
    open: boolean;
    incident: Incident | null;
    onClose: () => void;
    onAssign: (assignedAnalyst: string) => void;
    onStatusChange: (status: IncidentStatus) => void;
    onNotesSave: (notes: string) => void;
}

const statuses: IncidentStatus[] = [
    "OPEN",
    "INVESTIGATING",
    "RESOLVED",
];

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

function formatDate(value: string | null | undefined) {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleString();
}

function getSeverityStyle(severity: string) {
    switch (severity?.toUpperCase()) {
        case "CRITICAL":
            return {
                color: C.red,
                bgcolor: "rgba(251,113,133,0.10)",
                border: "1px solid rgba(251,113,133,0.3)",
            };
        case "HIGH":
            return {
                color: C.orange,
                bgcolor: "rgba(251,146,60,0.10)",
                border: "1px solid rgba(251,146,60,0.3)",
            };
        case "MEDIUM":
            return {
                color: C.cyan,
                bgcolor: "rgba(34,211,238,0.10)",
                border: "1px solid rgba(34,211,238,0.3)",
            };
        case "LOW":
            return {
                color: C.green,
                bgcolor: "rgba(52,211,153,0.10)",
                border: "1px solid rgba(52,211,153,0.3)",
            };
        default:
            return {
                color: C.muted,
                bgcolor: "rgba(148,163,184,0.08)",
                border: `1px solid ${C.border}`,
            };
    }
}

function getStatusStyle(status: string) {
    switch (status?.toUpperCase()) {
        case "OPEN":
            return {
                color: C.red,
                bgcolor: "rgba(251,113,133,0.10)",
                border: "1px solid rgba(251,113,133,0.3)",
            };
        case "INVESTIGATING":
            return {
                color: C.orange,
                bgcolor: "rgba(251,146,60,0.10)",
                border: "1px solid rgba(251,146,60,0.3)",
            };
        case "RESOLVED":
            return {
                color: C.green,
                bgcolor: "rgba(52,211,153,0.10)",
                border: "1px solid rgba(52,211,153,0.3)",
            };
        default:
            return {
                color: C.muted,
                bgcolor: "rgba(148,163,184,0.08)",
                border: `1px solid ${C.border}`,
            };
    }
}

function getRiskColor(score: number) {
    if (score >= 80) return C.red;
    if (score >= 60) return C.orange;
    if (score >= 30) return C.cyan;
    return C.green;
}

function SectionTitle({
    icon,
    title,
}: {
    icon: React.ReactNode;
    title: string;
}) {
    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 2, alignItems: "center" }}
        >
            <Box sx={{ color: C.cyan, display: "flex" }}>
                {icon}
            </Box>

            <Typography
                variant="subtitle1"
                sx={{
                    color: C.text,
                    fontWeight: 800,
                }}
            >
                {title}
            </Typography>
        </Stack>
    );
}

function InfoItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <Box>
            <Typography
                variant="caption"
                sx={{
                    color: C.muted,
                    display: "block",
                    mb: 0.5,
                }}
            >
                {label}
            </Typography>

            <Typography
                variant="body2"
                sx={{
                    color: C.text,
                    fontWeight: 600,
                    overflowWrap: "anywhere",
                }}
            >
                {value || "N/A"}
            </Typography>
        </Box>
    );
}

const inputSx = {
    "& .MuiInputLabel-root": {
        color: C.muted,
    },
    "& .MuiInputLabel-root.Mui-focused": {
        color: C.cyan,
    },
    "& .MuiOutlinedInput-root": {
        color: C.text,
        bgcolor: C.bg,
        "& fieldset": {
            borderColor: C.border,
        },
        "&:hover fieldset": {
            borderColor: "#475569",
        },
        "&.Mui-focused fieldset": {
            borderColor: C.cyan,
        },
    },
    "& .MuiSvgIcon-root": {
        color: C.muted,
    },
};

export default function IncidentDetailsDrawer({
    open,
    incident,
    onClose,
    onAssign,
    onStatusChange,
    onNotesSave,
}: Props) {
    const [formState, setFormState] = useState<{
        incidentId: number;
        assignedAnalyst: string;
        status: IncidentStatus;
        notes: string;
    } | null>(null);

    if (!incident) {
        return null;
    }

    const currentForm = formState?.incidentId === incident.id
        ? formState
        : {
            incidentId: incident.id,
            assignedAnalyst: incident.assignedAnalyst ?? "",
            status: statuses.includes(incident.status as IncidentStatus)
                ? incident.status as IncidentStatus
                : "OPEN",
            notes: incident.notes ?? "",
        };
    const { assignedAnalyst, status, notes } = currentForm;

    const updateForm = (
        updates: Partial<Omit<typeof currentForm, "incidentId">>
    ) => {
        setFormState({ ...currentForm, ...updates });
    };

    const severityStyle = getSeverityStyle(incident.severity);
    const statusStyle = getStatusStyle(incident.status);
    const riskColor = getRiskColor(incident.riskScore);

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        width: {
                            xs: "100%",
                            sm: 500,
                        },
                        bgcolor: C.bg,
                        color: C.text,
                        borderLeft: `1px solid ${C.border}`,
                        backgroundImage: "none",
                    },
                },
            }}
        >
            <Box
                sx={{
                    minHeight: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* DRAWER HEADER */}
                <Box
                    sx={{
                        p: 2.5,
                        bgcolor: C.card,
                        borderBottom: `1px solid ${C.border}`,
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "center" }}
                    >
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 2,
                                bgcolor: "rgba(34,211,238,0.10)",
                                border: "1px solid rgba(34,211,238,0.2)",
                                display: "grid",
                                placeItems: "center",
                                color: C.cyan,
                            }}
                        >
                            <SecurityIcon />
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 800,
                                    color: C.text,
                                }}
                            >
                                Incident Investigation
                            </Typography>

                            <Typography
                                variant="caption"
                                sx={{ color: C.muted }}
                            >
                                Incident #{incident.id}
                            </Typography>
                        </Box>

                        <Button
                            onClick={onClose}
                            sx={{
                                minWidth: 38,
                                width: 38,
                                height: 38,
                                color: C.muted,
                                border: `1px solid ${C.border}`,
                                borderRadius: 2,
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </Button>
                    </Stack>
                </Box>

                {/* SCROLLABLE CONTENT */}
                <Box
                    sx={{
                        flex: 1,
                        p: 2.5,
                        overflowY: "auto",
                    }}
                >
                    <Stack spacing={3}>

                        {/* INCIDENT CLASSIFICATION */}
                        <Box>
                            <Stack
                                direction="row"
                                spacing={1}
                                useFlexGap
                                sx={{ flexWrap: "wrap", mb: 2 }}
                            >
                                <Chip
                                    label={incident.severity}
                                    size="small"
                                    sx={{
                                        ...severityStyle,
                                        fontWeight: 800,
                                    }}
                                />

                                <Chip
                                    label={incident.status}
                                    size="small"
                                    sx={{
                                        ...statusStyle,
                                        fontWeight: 800,
                                    }}
                                />
                            </Stack>

                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: C.card,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 2.5,
                                }}
                            >
                                <Stack
                                    direction="row"
                                    sx={{
                                        mb: 1,
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{ color: C.muted }}
                                    >
                                        Risk Score
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        sx={{
                                            color: riskColor,
                                            fontWeight: 900,
                                        }}
                                    >
                                        {incident.riskScore}
                                        <Typography
                                            component="span"
                                            variant="caption"
                                            sx={{ color: C.muted }}
                                        >
                                            {" "}/ 100
                                        </Typography>
                                    </Typography>
                                </Stack>

                                <Box
                                    sx={{
                                        height: 7,
                                        bgcolor: "#1e293b",
                                        borderRadius: 5,
                                        overflow: "hidden",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: `${Math.max(
                                                0,
                                                Math.min(100, incident.riskScore)
                                            )}%`,
                                            height: "100%",
                                            bgcolor: riskColor,
                                            borderRadius: 5,
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ borderColor: C.border }} />

                        {/* OVERVIEW */}
                        <Box>
                            <SectionTitle
                                icon={<SecurityIcon fontSize="small" />}
                                title="Incident Overview"
                            />

                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: C.card,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 2.5,
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 2.5,
                                }}
                            >
                                <InfoItem
                                    label="Incident Type"
                                    value={incident.incidentType}
                                />

                                <InfoItem
                                    label="Source IP"
                                    value={incident.sourceIp}
                                />

                                <InfoItem
                                    label="Assigned Analyst"
                                    value={incident.assignedAnalyst || "Unassigned"}
                                />

                                <InfoItem
                                    label="Incident ID"
                                    value={String(incident.id)}
                                />
                            </Box>
                        </Box>

                        {/* TIMELINE */}
                        <Box>
                            <SectionTitle
                                icon={<CalendarTodayIcon fontSize="small" />}
                                title="Incident Timeline"
                            />

                            <Stack
                                spacing={2}
                                sx={{
                                    p: 2,
                                    bgcolor: C.card,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 2.5,
                                }}
                            >
                                <InfoItem
                                    label="Event Timestamp"
                                    value={formatDate(incident.timestamp)}
                                />

                                <Divider sx={{ borderColor: C.border }} />

                                <InfoItem
                                    label="Created At"
                                    value={formatDate(incident.createdAt)}
                                />

                                <Divider sx={{ borderColor: C.border }} />

                                <InfoItem
                                    label="Last Updated"
                                    value={formatDate(incident.updatedAt)}
                                />
                            </Stack>
                        </Box>

                        {/* SUMMARY */}
                        <Box>
                            <SectionTitle
                                icon={<NotesIcon fontSize="small" />}
                                title="Incident Summary"
                            />

                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: C.card,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 2.5,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: C.muted,
                                        lineHeight: 1.8,
                                        whiteSpace: "pre-wrap",
                                    }}
                                >
                                    {incident.summary || "No incident summary available."}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ borderColor: C.border }} />

                        {/* ANALYST WORKFLOW */}
                        <Box>
                            <SectionTitle
                                icon={<AssignmentIndIcon fontSize="small" />}
                                title="Analyst Workflow"
                            />

                            <Stack
                                spacing={2}
                                sx={{
                                    p: 2,
                                    bgcolor: C.card,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 2.5,
                                }}
                            >
                                {/* ASSIGNMENT */}
                                <Box>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            color: C.text,
                                            mb: 1.5,
                                            fontWeight: 700,
                                        }}
                                    >
                                        Assign Analyst
                                    </Typography>

                                    <TextField
                                        label="Assigned Analyst"
                                        placeholder="Enter analyst username"
                                        value={assignedAnalyst}
                                        onChange={(event) =>
                                            updateForm({
                                                assignedAnalyst: event.target.value,
                                            })
                                        }
                                        fullWidth
                                        sx={inputSx}
                                    />

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        onClick={() =>
                                            onAssign(assignedAnalyst)
                                        }
                                        disabled={!assignedAnalyst.trim()}
                                        sx={{
                                            mt: 1.5,
                                            py: 1.1,
                                            bgcolor: C.cyan,
                                            color: "#07111f",
                                            fontWeight: 800,
                                            "&:hover": {
                                                bgcolor: "#67e8f9",
                                            },
                                        }}
                                    >
                                        Save Assignment
                                    </Button>
                                </Box>

                                <Divider sx={{ borderColor: C.border }} />

                                {/* STATUS */}
                                <Box>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            color: C.text,
                                            mb: 1.5,
                                            fontWeight: 700,
                                        }}
                                    >
                                        Update Incident Status
                                    </Typography>

                                    <TextField
                                        select
                                        label="Incident Status"
                                        value={status}
                                        onChange={(event) =>
                                            updateForm({
                                                status: event.target.value as IncidentStatus,
                                            })
                                        }
                                        fullWidth
                                        sx={inputSx}
                                    >
                                        {statuses.map((item) => (
                                            <MenuItem
                                                key={item}
                                                value={item}
                                            >
                                                {item}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        onClick={() =>
                                            onStatusChange(status)
                                        }
                                        sx={{
                                            mt: 1.5,
                                            py: 1.1,
                                            bgcolor: "#1d4ed8",
                                            color: "#fff",
                                            fontWeight: 800,
                                            "&:hover": {
                                                bgcolor: "#2563eb",
                                            },
                                        }}
                                    >
                                        Save Status
                                    </Button>
                                </Box>

                                <Divider sx={{ borderColor: C.border }} />

                                {/* INVESTIGATION NOTES */}
                                <Box>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            color: C.text,
                                            mb: 1.5,
                                            fontWeight: 700,
                                        }}
                                    >
                                        Investigation Notes
                                    </Typography>

                                    <TextField
                                        label="Analyst Notes"
                                        placeholder="Record investigation observations..."
                                        value={notes}
                                        onChange={(event) =>
                                            updateForm({ notes: event.target.value })
                                        }
                                        multiline
                                        minRows={5}
                                        fullWidth
                                        sx={inputSx}
                                    />

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        onClick={() =>
                                            onNotesSave(notes)
                                        }
                                        sx={{
                                            mt: 1.5,
                                            py: 1.1,
                                            bgcolor: C.green,
                                            color: "#07111f",
                                            fontWeight: 800,
                                            "&:hover": {
                                                bgcolor: "#6ee7b7",
                                            },
                                        }}
                                    >
                                        Save Investigation Notes
                                    </Button>
                                </Box>
                            </Stack>
                        </Box>

                    </Stack>
                </Box>

                {/* DRAWER FOOTER */}
                <Box
                    sx={{
                        p: 2,
                        bgcolor: C.card,
                        borderTop: `1px solid ${C.border}`,
                    }}
                >
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<CloseIcon />}
                        onClick={onClose}
                        sx={{
                            py: 1.1,
                            color: C.muted,
                            borderColor: C.border,
                            fontWeight: 700,
                            "&:hover": {
                                borderColor: C.cyan,
                                color: C.cyan,
                                bgcolor: "rgba(34,211,238,0.05)",
                            },
                        }}
                    >
                        Close Investigation
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
}
