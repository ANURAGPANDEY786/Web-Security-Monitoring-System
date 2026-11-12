
import {
    Box,
    Button,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlineOutlined";
import type { Incident } from "../../types/incident";

interface Props {
    incidents: Incident[];
    onInvestigate: (incident: Incident) => void;
}

const C = {
    card: "#0b1423",
    bg: "#070d18",
    border: "#1e293b",
    text: "#e2e8f0",
    muted: "#94a3b8",
    cyan: "#22d3ee",
    green: "#34d399",
    red: "#fb7185",
    orange: "#fb923c",
};

function getSeverityStyle(severity: string) {
    switch (severity?.toUpperCase()) {
        case "CRITICAL":
            return {
                color: C.red,
                bgcolor: "rgba(251,113,133,0.10)",
                borderColor: "rgba(251,113,133,0.3)",
            };
        case "HIGH":
            return {
                color: C.orange,
                bgcolor: "rgba(251,146,60,0.10)",
                borderColor: "rgba(251,146,60,0.3)",
            };
        case "MEDIUM":
            return {
                color: C.cyan,
                bgcolor: "rgba(34,211,238,0.10)",
                borderColor: "rgba(34,211,238,0.3)",
            };
        case "LOW":
            return {
                color: C.green,
                bgcolor: "rgba(52,211,153,0.10)",
                borderColor: "rgba(52,211,153,0.3)",
            };
        default:
            return {
                color: C.muted,
                bgcolor: "rgba(148,163,184,0.08)",
                borderColor: C.border,
            };
    }
}

function getStatusStyle(status: string) {
    switch (status?.toUpperCase()) {
        case "OPEN":
            return {
                color: C.red,
                bgcolor: "rgba(251,113,133,0.10)",
                borderColor: "rgba(251,113,133,0.3)",
            };
        case "INVESTIGATING":
            return {
                color: C.orange,
                bgcolor: "rgba(251,146,60,0.10)",
                borderColor: "rgba(251,146,60,0.3)",
            };
        case "RESOLVED":
            return {
                color: C.green,
                bgcolor: "rgba(52,211,153,0.10)",
                borderColor: "rgba(52,211,153,0.3)",
            };
        default:
            return {
                color: C.muted,
                bgcolor: "rgba(148,163,184,0.08)",
                borderColor: C.border,
            };
    }
}

function formatDate(value: string) {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleString();
}

function getRiskColor(score: number) {
    if (score >= 80) return C.red;
    if (score >= 60) return C.orange;
    if (score >= 30) return C.cyan;
    return C.green;
}

function SeverityChip({ severity }: { severity: string }) {
    const style = getSeverityStyle(severity);

    return (
        <Chip
            label={severity || "UNKNOWN"}
            size="small"
            sx={{
                color: style.color,
                bgcolor: style.bgcolor,
                border: `1px solid ${style.borderColor}`,
                fontWeight: 800,
                letterSpacing: 0.4,
                minWidth: 85,
            }}
        />
    );
}

function StatusChip({ status }: { status: string }) {
    const style = getStatusStyle(status);

    return (
        <Chip
            label={status || "UNKNOWN"}
            size="small"
            sx={{
                color: style.color,
                bgcolor: style.bgcolor,
                border: `1px solid ${style.borderColor}`,
                fontWeight: 700,
            }}
        />
    );
}

export default function IncidentTable({
    incidents,
    onInvestigate,
}: Props) {
    if (incidents.length === 0) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 5,
                    bgcolor: C.card,
                    color: C.text,
                    border: `1px solid ${C.border}`,
                    borderRadius: 3,
                    textAlign: "center",
                }}
            >
                <SearchIcon
                    sx={{
                        fontSize: 42,
                        color: "#475569",
                        mb: 1,
                    }}
                />

                <Typography
                    variant="h6"
                    sx={{ fontWeight: 800 }}
                >
                    No Incidents Found
                </Typography>

                <Typography
                    variant="body2"
                    sx={{ color: C.muted, mt: 0.5 }}
                >
                    There are currently no incidents available for investigation.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper
            elevation={0}
            sx={{
                bgcolor: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 3,
                overflow: "hidden",
            }}
        >
            {/* TABLE HEADER */}
            <Box
                sx={{
                    p: 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1,
                }}
            >
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            color: C.text,
                            fontWeight: 800,
                        }}
                    >
                        Incident Queue
                    </Typography>

                    <Typography
                        variant="caption"
                        sx={{ color: C.muted }}
                    >
                        Review and investigate detected security incidents
                    </Typography>
                </Box>

                <Chip
                    label={`${incidents.length} Incidents`}
                    size="small"
                    sx={{
                        color: C.cyan,
                        bgcolor: "rgba(34,211,238,0.08)",
                        border: "1px solid rgba(34,211,238,0.2)",
                        fontWeight: 700,
                    }}
                />
            </Box>

            <Box
                sx={{
                    height: "1px",
                    bgcolor: C.border,
                }}
            />

            {/* TABLE */}
            <TableContainer
                sx={{
                    overflowX: "auto",
                    "&::-webkit-scrollbar": {
                        height: 7,
                    },
                    "&::-webkit-scrollbar-thumb": {
                        bgcolor: "#334155",
                        borderRadius: 5,
                    },
                }}
            >
                <Table
                    sx={{
                        minWidth: 1050,
                        borderCollapse: "separate",
                        borderSpacing: 0,
                    }}
                >
                    <TableHead>
                        <TableRow
                            sx={{
                                bgcolor: "#070d18",
                            }}
                        >
                            {[
                                "SEVERITY",
                                "STATUS",
                                "RISK SCORE",
                                "INCIDENT TYPE",
                                "SOURCE IP",
                                "ASSIGNED ANALYST",
                                "TIMESTAMP",
                                "ACTION",
                            ].map((heading) => (
                                <TableCell
                                    key={heading}
                                    align={heading === "ACTION" ? "right" : "left"}
                                    sx={{
                                        color: "#64748b",
                                        fontSize: 10,
                                        fontWeight: 800,
                                        letterSpacing: 0.8,
                                        borderBottom: `1px solid ${C.border}`,
                                        py: 2,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {heading}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {incidents.map((incident) => (
                            <TableRow
                                key={incident.id}
                                hover
                                sx={{
                                    "&:hover": {
                                        bgcolor: "rgba(34,211,238,0.035) !important",
                                    },
                                    "& td": {
                                        borderBottom: `1px solid ${C.border}`,
                                    },
                                    "&:last-child td": {
                                        borderBottom: 0,
                                    },
                                }}
                            >
                                {/* SEVERITY */}
                                <TableCell sx={{ py: 2 }}>
                                    <SeverityChip
                                        severity={incident.severity}
                                    />
                                </TableCell>

                                {/* STATUS */}
                                <TableCell>
                                    <StatusChip
                                        status={incident.status}
                                    />
                                </TableCell>

                                {/* RISK SCORE */}
                                <TableCell>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                color: getRiskColor(
                                                    incident.riskScore
                                                ),
                                                fontWeight: 800,
                                                fontSize: 14,
                                                minWidth: 25,
                                            }}
                                        >
                                            {incident.riskScore}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            sx={{ color: C.muted }}
                                        >
                                            /100
                                        </Typography>
                                    </Box>
                                </TableCell>

                                {/* INCIDENT TYPE */}
                                <TableCell>
                                    <Typography
                                        sx={{
                                            color: C.text,
                                            fontWeight: 600,
                                            fontSize: 13,
                                        }}
                                    >
                                        {incident.incidentType || "N/A"}
                                    </Typography>
                                </TableCell>

                                {/* SOURCE IP */}
                                <TableCell>
                                    <Typography
                                        sx={{
                                            color: C.cyan,
                                            fontSize: 13,
                                            fontFamily: "monospace",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {incident.sourceIp || "N/A"}
                                    </Typography>
                                </TableCell>

                                {/* ASSIGNED ANALYST */}
                                <TableCell>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <PersonOutlineIcon
                                            sx={{
                                                color: C.muted,
                                                fontSize: 18,
                                            }}
                                        />

                                        <Typography
                                            sx={{
                                                color: incident.assignedAnalyst
                                                    ? C.text
                                                    : C.muted,
                                                fontSize: 13,
                                            }}
                                        >
                                            {incident.assignedAnalyst ||
                                                "Unassigned"}
                                        </Typography>
                                    </Box>
                                </TableCell>

                                {/* TIMESTAMP */}
                                <TableCell>
                                    <Typography
                                        sx={{
                                            color: C.muted,
                                            fontSize: 12,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {formatDate(incident.timestamp)}
                                    </Typography>
                                </TableCell>

                                {/* ACTION */}
                                <TableCell align="right">
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        endIcon={<ArrowForwardIcon />}
                                        onClick={() =>
                                            onInvestigate(incident)
                                        }
                                        sx={{
                                            color: C.cyan,
                                            borderColor: "rgba(34,211,238,0.35)",
                                            fontWeight: 700,
                                            textTransform: "none",
                                            borderRadius: 1.5,
                                            "&:hover": {
                                                borderColor: C.cyan,
                                                bgcolor: "rgba(34,211,238,0.07)",
                                            },
                                        }}
                                    >
                                        Investigate
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* TABLE FOOTER */}
            <Box
                sx={{
                    px: 2.5,
                    py: 1.5,
                    borderTop: `1px solid ${C.border}`,
                    bgcolor: "#070d18",
                }}
            >
                <Typography
                    variant="caption"
                    sx={{ color: C.muted }}
                >
                    Showing {incidents.length} incident(s)
                </Typography>
            </Box>
        </Paper>
    );
}
