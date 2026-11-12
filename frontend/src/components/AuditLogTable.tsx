
import {
    Box,
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

import HistoryRounded from "@mui/icons-material/HistoryRounded";
import type { AuditLog } from "../types/audit";

interface AuditLogTableProps {
    logs: AuditLog[];
}

function getActionStyle(action: string) {
    if (action.startsWith("USER")) {
        return {
            color: "#60a5fa",
            background: "rgba(59,130,246,0.12)",
            border: "1px solid rgba(59,130,246,0.3)",
        };
    }

    if (action.startsWith("ALERT")) {
        return {
            color: "#fbbf24",
            background: "rgba(251,191,36,0.12)",
            border: "1px solid rgba(251,191,36,0.3)",
        };
    }

    return {
        color: "#94a3b8",
        background: "rgba(148,163,184,0.10)",
        border: "1px solid rgba(148,163,184,0.2)",
    };
}

function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "Invalid timestamp";
    }

    return date.toLocaleString();
}

export default function AuditLogTable({ logs }: AuditLogTableProps) {
    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                bgcolor: "transparent",
                borderRadius: 2,
                overflowX: "auto",
            }}
        >
            <Table sx={{ minWidth: 750 }}>
                <TableHead>
                    <TableRow
                        sx={{
                            "& th": {
                                bgcolor: "#101d30",
                                color: "#94a3b8",
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                borderBottom: "1px solid #263449",
                                py: 1.8,
                                whiteSpace: "nowrap",
                            },
                        }}
                    >
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Username</TableCell>
                        <TableCell>Details</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {logs.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                sx={{
                                    borderBottom: "none",
                                    py: 7,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 1.2,
                                    }}
                                >
                                    <HistoryRounded
                                        sx={{
                                            fontSize: 38,
                                            color: "#475569",
                                        }}
                                    />
                                    <Typography
                                        sx={{ color: "#cbd5e1", fontWeight: 700 }}
                                    >
                                        No audit logs found
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "#64748b" }}
                                    >
                                        System activity records will appear here.
                                    </Typography>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ) : (
                        logs.map((log) => (
                            <TableRow
                                key={log.id}
                                hover
                                sx={{
                                    transition: "background 0.2s",
                                    "&:hover": {
                                        bgcolor: "rgba(34,211,238,0.045) !important",
                                    },
                                    "& td": {
                                        color: "#cbd5e1",
                                        borderBottom: "1px solid #1e293b",
                                        py: 2,
                                    },
                                }}
                            >
                                <TableCell sx={{ minWidth: 190 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "#94a3b8",
                                            fontSize: "0.82rem",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {formatTimestamp(log.timestamp)}
                                    </Typography>
                                </TableCell>

                                <TableCell sx={{ minWidth: 160 }}>
                                    <Chip
                                        label={log.action}
                                        size="small"
                                        sx={{
                                            ...getActionStyle(log.action),
                                            fontWeight: 700,
                                            fontSize: "0.72rem",
                                            borderRadius: 1.5,
                                        }}
                                    />
                                </TableCell>

                                <TableCell sx={{ minWidth: 140 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "#e2e8f0", fontWeight: 600 }}
                                    >
                                        {log.username || "System"}
                                    </Typography>
                                </TableCell>

                                <TableCell sx={{ minWidth: 250 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "#94a3b8",
                                            lineHeight: 1.6,
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        {log.details || "—"}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
