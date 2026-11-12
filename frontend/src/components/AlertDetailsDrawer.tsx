
import {
    Box,
    Button,
    Chip,
    Divider,
    Drawer,
    IconButton,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    Paper,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ShieldIcon from "@mui/icons-material/Shield";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import SaveIcon from "@mui/icons-material/Save";
import SecurityIcon from "@mui/icons-material/Security";
import TimelineIcon from "@mui/icons-material/Timeline";

import type { Alert } from "../types/alert";
import type { SecurityEvent } from "../types/event";

const colors = {
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

interface Props {
    open: boolean;
    alert: Alert | null;
    relatedEvents: SecurityEvent[];
    notes: string;
    onNotesChange: (value: string) => void;
    onClose: () => void;
    onStatusChange: (id: number, status: string) => Promise<void>;
    onSaveNotes: () => Promise<void>;
    onOpenAssign: (alert: Alert) => void;
    onPivot: (
        field: "sourceIp" | "username" | "mitreTechnique",
        value: string
    ) => void;
}

export default function AlertDetailsDrawer({
    open,
    alert,
    relatedEvents,
    notes,
    onNotesChange,
    onClose,
    onStatusChange,
    onSaveNotes,
    onOpenAssign,
    onPivot,
}: Props) {
    if (!alert) return null;

    const alertType = alert.alertType || alert.type || "Unknown Alert";

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        width: { xs: "100vw", sm: 500 },
                        maxWidth: "100vw",
                        bgcolor: "#070d18",
                        color: colors.text,
                        borderLeft: `1px solid ${colors.border}`,
                        overflowX: "hidden",
                        boxSizing: "border-box",
                    },
                },
            }}
        >
            <Box sx={{ width: "100%", boxSizing: "border-box" }}>

                {/* HEADER */}
                <Box
                    sx={{
                        p: 3,
                        bgcolor: colors.card,
                        borderBottom: `1px solid ${colors.border}`,
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 2,
                                bgcolor: "rgba(34,211,238,0.1)",
                                color: colors.cyan,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <ShieldIcon />
                        </Box>

                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography
                                sx={{
                                    fontSize: 17,
                                    fontWeight: 800,
                                    color: "#f8fafc",
                                    overflowWrap: "anywhere",
                                }}
                            >
                                {alertType}
                            </Typography>

                            <Typography
                                sx={{
                                    color: colors.muted,
                                    fontSize: 11,
                                    mt: 0.5,
                                }}
                            >
                                SECURITY ALERT · ID #{alert.id}
                            </Typography>
                        </Box>

                        <IconButton
                            onClick={onClose}
                            sx={{
                                color: colors.muted,
                                "&:hover": {
                                    color: colors.red,
                                    bgcolor: "rgba(251,113,133,0.1)",
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <Chip
                            label={alert.severity ?? "UNKNOWN"}
                            size="small"
                            color={getSeverityColor(alert.severity)}
                            sx={{ fontWeight: 800, fontSize: 10 }}
                        />

                        <Chip
                            label={`Risk Score: ${alert.riskScore ?? 0}`}
                            size="small"
                            variant="outlined"
                            sx={{
                                color: colors.cyan,
                                borderColor: "#164e63",
                                fontWeight: 700,
                                fontSize: 10,
                            }}
                        />
                    </Stack>
                </Box>

                {/* DRAWER CONTENT */}
                <Box sx={{ p: 3 }}>
                    <Stack spacing={3}>

                        {/* STATUS */}
                        <SectionTitle
                            title="Alert Management"
                            icon={<SecurityIcon />}
                        />

                        <Box>
                            <FieldLabel>Status</FieldLabel>

                            <Select
                                fullWidth
                                size="small"
                                value={alert.status ?? "OPEN"}
                                onChange={(event) =>
                                    onStatusChange(alert.id, event.target.value)
                                }
                                sx={selectStyle}
                            >
                                <MenuItem value="OPEN">OPEN</MenuItem>
                                <MenuItem value="INVESTIGATING">
                                    INVESTIGATING
                                </MenuItem>
                                <MenuItem value="RESOLVED">RESOLVED</MenuItem>
                            </Select>
                        </Box>

                        <Box>
                            <FieldLabel>Assigned Analyst</FieldLabel>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    mt: 0.7,
                                    p: 1.5,
                                    bgcolor: colors.cardLight,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: 2,
                                }}
                            >
                                <AssignmentIndIcon
                                    sx={{ color: colors.cyan }}
                                />

                                <Typography
                                    sx={{
                                        flexGrow: 1,
                                        fontWeight: 700,
                                        fontSize: 13,
                                        overflowWrap: "anywhere",
                                    }}
                                >
                                    {alert.assignedAnalyst || "Unassigned"}
                                </Typography>

                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => onOpenAssign(alert)}
                                    sx={outlineButtonStyle}
                                >
                                    Assign
                                </Button>
                            </Box>
                        </Box>

                        <Divider sx={{ borderColor: colors.border }} />

                        {/* ALERT DETAILS */}
                        <SectionTitle
                            title="Threat Intelligence"
                            icon={<ShieldIcon />}
                        />

                        <PivotDetail
                            label="MITRE Technique"
                            value={alert.mitreTechnique || "N/A"}
                            onClick={() =>
                                alert.mitreTechnique &&
                                onPivot("mitreTechnique", alert.mitreTechnique)
                            }
                        />

                        <Detail
                            label="MITRE Description"
                            value={alert.mitreDescription || "N/A"}
                        />

                        <PivotDetail
                            label="Source IP"
                            value={alert.sourceIp || "N/A"}
                            onClick={() =>
                                alert.sourceIp &&
                                onPivot("sourceIp", alert.sourceIp)
                            }
                        />

                        <PivotDetail
                            label="Username"
                            value={alert.username || "N/A"}
                            onClick={() =>
                                alert.username &&
                                onPivot("username", alert.username)
                            }
                        />

                        <Detail
                            label="Event Type"
                            value={alert.eventType || "N/A"}
                        />

                        <Detail
                            label="Created At"
                            value={
                                alert.createdAt
                                    ? new Date(alert.createdAt).toLocaleString()
                                    : "N/A"
                            }
                        />

                        {/* DETECTION SUMMARY */}
                        <Box
                            sx={{
                                p: 2,
                                bgcolor: colors.cardLight,
                                border: `1px solid ${colors.border}`,
                                borderLeft: `3px solid ${colors.cyan}`,
                                borderRadius: 2,
                            }}
                        >
                            <Typography
                                sx={{
                                    color: colors.cyan,
                                    fontSize: 11,
                                    fontWeight: 800,
                                    mb: 1,
                                    letterSpacing: 0.5,
                                }}
                            >
                                DETECTION SUMMARY
                            </Typography>

                            <Typography
                                sx={{
                                    color: colors.text,
                                    fontSize: 13,
                                    lineHeight: 1.7,
                                    overflowWrap: "anywhere",
                                }}
                            >
                                {alert.message ||
                                    alert.description ||
                                    "No detection summary available."}
                            </Typography>
                        </Box>

                        <Divider sx={{ borderColor: colors.border }} />

                        {/* RELATED EVENTS */}
                        <SectionTitle
                            title="Related Events / Evidence"
                            icon={<TimelineIcon />}
                        />

                        {relatedEvents.length === 0 ? (
                            <Box
                                sx={{
                                    p: 3,
                                    textAlign: "center",
                                    bgcolor: colors.cardLight,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: 2,
                                }}
                            >
                                <Typography
                                    sx={{ color: colors.muted, fontSize: 12 }}
                                >
                                    No related events found.
                                </Typography>
                            </Box>
                        ) : (
                            <Stack spacing={2}>
                                {relatedEvents.map((event, index) => (
                                    <Paper
                                        key={`${event.id ?? index}-${event.timestamp ?? index}`}
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            bgcolor: colors.card,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: 2,
                                            color: colors.text,
                                        }}
                                    >
                                        <Stack spacing={1.5}>
                                            <Chip
                                                label={
                                                    event.eventType ||
                                                    "UNKNOWN_EVENT"
                                                }
                                                size="small"
                                                sx={{
                                                    alignSelf: "flex-start",
                                                    bgcolor: "rgba(34,211,238,0.1)",
                                                    color: colors.cyan,
                                                    border: "1px solid #164e63",
                                                    fontWeight: 700,
                                                    fontSize: 10,
                                                }}
                                            />

                                            <Typography
                                                sx={{
                                                    color: colors.muted,
                                                    fontSize: 11,
                                                }}
                                            >
                                                {event.timestamp
                                                    ? new Date(
                                                          event.timestamp
                                                      ).toLocaleString()
                                                    : "No timestamp available"}
                                            </Typography>

                                            <Box
                                                sx={{
                                                    p: 1.5,
                                                    bgcolor: "#070d18",
                                                    borderRadius: 1.5,
                                                    border: `1px solid ${colors.border}`,
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontFamily: "monospace",
                                                        fontSize: 11,
                                                        whiteSpace: "pre-wrap",
                                                        overflowWrap: "anywhere",
                                                        color: "#cbd5e1",
                                                        lineHeight: 1.7,
                                                    }}
                                                >
                                                    {event.rawLog ||
                                                        "No raw log available."}
                                                </Typography>
                                            </Box>

                                            <Detail
                                                label="Source IP"
                                                value={event.sourceIp || "N/A"}
                                            />

                                            <Detail
                                                label="Username"
                                                value={event.username || "N/A"}
                                            />
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        )}

                        <Divider sx={{ borderColor: colors.border }} />

                        {/* INVESTIGATION NOTES */}
                        <SectionTitle
                            title="Investigation Notes"
                            icon={<AssignmentIndIcon />}
                        />

                        <TextField
                            fullWidth
                            multiline
                            minRows={5}
                            placeholder="Write investigation findings, observations and response actions..."
                            value={notes}
                            onChange={(event) =>
                                onNotesChange(event.target.value)
                            }
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    bgcolor: colors.cardLight,
                                    color: colors.text,
                                    fontSize: 13,
                                    alignItems: "flex-start",
                                    "& fieldset": {
                                        borderColor: colors.border,
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "#475569",
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: colors.cyan,
                                    },
                                },
                                "& textarea::placeholder": {
                                    color: colors.muted,
                                    opacity: 1,
                                },
                            }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={onSaveNotes}
                            sx={{
                                py: 1.2,
                                bgcolor: "#0891b2",
                                fontWeight: 800,
                                "&:hover": {
                                    bgcolor: "#0e7490",
                                },
                            }}
                        >
                            Save Investigation Notes
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Drawer>
    );
}

/* REUSABLE COMPONENTS */

function SectionTitle({
    title,
    icon,
}: {
    title: string;
    icon: React.ReactNode;
}) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ color: colors.cyan, display: "flex" }}>
                {icon}
            </Box>

            <Typography
                sx={{
                    color: "#f8fafc",
                    fontSize: 14,
                    fontWeight: 800,
                }}
            >
                {title}
            </Typography>
        </Box>
    );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <Typography
            sx={{
                color: colors.muted,
                fontSize: 11,
                mb: 0.7,
                fontWeight: 700,
            }}
        >
            {children}
        </Typography>
    );
}

function Detail({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <Box>
            <FieldLabel>{label}</FieldLabel>

            <Typography
                sx={{
                    color: colors.text,
                    fontSize: 13,
                    fontWeight: 700,
                    overflowWrap: "anywhere",
                    lineHeight: 1.6,
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

function PivotDetail({
    label,
    value,
    onClick,
}: {
    label: string;
    value: string;
    onClick: () => void;
}) {
    const disabled = value === "N/A";

    return (
        <Box>
            <FieldLabel>{label}</FieldLabel>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1.2,
                    bgcolor: colors.cardLight,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 2,
                }}
            >
                <Typography
                    sx={{
                        flexGrow: 1,
                        color: colors.text,
                        fontSize: 12,
                        fontWeight: 700,
                        overflowWrap: "anywhere",
                    }}
                >
                    {value}
                </Typography>

                <IconButton
                    size="small"
                    disabled={disabled}
                    onClick={onClick}
                    title="Investigate in Events"
                    sx={{
                        color: colors.cyan,
                        "&:hover": {
                            bgcolor: "rgba(34,211,238,0.1)",
                        },
                    }}
                >
                    <SearchIcon fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );
}

const selectStyle = {
    color: colors.text,
    bgcolor: colors.cardLight,
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.border,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#475569",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.cyan,
    },
    "& .MuiSvgIcon-root": {
        color: colors.muted,
    },
};

const outlineButtonStyle = {
    color: colors.cyan,
    borderColor: "#164e63",
    textTransform: "none" as const,
    "&:hover": {
        borderColor: colors.cyan,
        bgcolor: "rgba(34,211,238,0.08)",
    },
};

function getSeverityColor(
    severity?: string
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
