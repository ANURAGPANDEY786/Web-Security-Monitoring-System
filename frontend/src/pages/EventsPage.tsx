
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Drawer,
    IconButton,
    Link,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    InputAdornment,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import StorageIcon from "@mui/icons-material/Storage";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LanIcon from "@mui/icons-material/Lan";
import ShieldIcon from "@mui/icons-material/Shield";

import AppLayout from "../components/layout/AppLayout";
import { getEvents } from "../services/events";
import type { SecurityEvent } from "../types/event";

const colors = {
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

export default function EventsPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const [selectedEvent, setSelectedEvent] =
        useState<SecurityEvent | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const sourceIpFilter = searchParams.get("sourceIp") ?? "";
    const usernameFilter = searchParams.get("username") ?? "";
    const mitreFilter = searchParams.get("mitreTechnique") ?? "";

    const loadEvents = async () => {
        try {
            setLoading(true);
            const data = await getEvents();
            setEvents(data);
            setError("");
        } catch {
            setError("Failed to load events. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let active = true;

        getEvents()
            .then((data) => {
                if (active) {
                    setEvents(data);
                    setError("");
                }
            })
            .catch(() => {
                if (active) {
                    setError("Failed to load events. Please try again.");
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

    const getEventType = (event: SecurityEvent) =>
        event.eventType ?? event.type ?? "N/A";

    const getEventTime = (event: SecurityEvent) =>
        event.timestamp ?? event.createdAt ?? "";

    const formatTime = (value?: string) => {
        if (!value) return "N/A";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleString();
    };

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const eventType = getEventType(event);
            const sourceIp = event.sourceIp ?? "";
            const username = event.username ?? "";
            const mitreTechnique = event.mitreTechnique ?? "";

            const searchableText = [
                eventType,
                sourceIp,
                username,
                mitreTechnique,
                event.message ?? "",
                event.rawLog ?? "",
            ]
                .join(" ")
                .toLowerCase();

            return (
                (!sourceIpFilter || sourceIp === sourceIpFilter) &&
                (!usernameFilter || username === usernameFilter) &&
                (!mitreFilter || mitreTechnique === mitreFilter) &&
                (!search.trim() ||
                    searchableText.includes(search.trim().toLowerCase()))
            );
        });
    }, [events, sourceIpFilter, usernameFilter, mitreFilter, search]);

    const failedLoginCount = events.filter((event) => {
        const type = getEventType(event).toLowerCase();
        return type.includes("failed_login") ||
            type.includes("failed login");
    }).length;

    const uniqueSourceIps = new Set(
        events.map((event) => event.sourceIp).filter(Boolean)
    ).size;

    const pivotTo = (
        key: "sourceIp" | "username" | "mitreTechnique",
        value?: string
    ) => {
        if (!value) return;

        setSelectedEvent(null);
        navigate(`/events?${key}=${encodeURIComponent(value)}`);
    };

    const clearFilters = () => {
        setSearch("");
        navigate("/events");
    };

    const PivotLink = ({
        field,
        value,
    }: {
        field: "sourceIp" | "username" | "mitreTechnique";
        value?: string;
    }) => {
        if (!value) {
            return <Typography color={colors.muted}>N/A</Typography>;
        }

        return (
            <Link
                component="button"
                underline="hover"
                onClick={() => pivotTo(field, value)}
                sx={{
                    color: colors.cyan,
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "monospace",
                }}
            >
                {value}
            </Link>
        );
    };

    const getSeverityColor = (severity?: string) => {
        const value = severity?.toLowerCase();

        if (value === "critical") return colors.red;
        if (value === "high") return colors.orange;
        if (value === "medium") return "#facc15";
        if (value === "low") return colors.green;

        return colors.muted;
    };

    const statCard = (
        label: string,
        value: number,
        icon: React.ReactNode,
        color: string
    ) => (
        <Paper
            elevation={0}
            sx={{
                flex: 1,
                minWidth: { xs: "100%", sm: 180 },
                p: 2.5,
                bgcolor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: 3,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Typography sx={{ color: colors.muted, fontSize: 13 }}>
                    {label}
                </Typography>

                <Box sx={{ color, display: "flex" }}>{icon}</Box>
            </Box>

            <Typography
                sx={{
                    fontSize: 29,
                    fontWeight: 800,
                    color: "#f8fafc",
                }}
            >
                {value}
            </Typography>
        </Paper>
    );

    return (
        <AppLayout title="Security Events">
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
                        SECURITY OPERATIONS / EVENT MONITORING
                    </Typography>

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
                                    color: "#f8fafc",
                                    fontSize: 28,
                                    fontWeight: 900,
                                }}
                            >
                                Security Events
                            </Typography>

                            <Typography
                                sx={{
                                    color: colors.muted,
                                    fontSize: 13,
                                    mt: 0.5,
                                }}
                            >
                                Monitor, search and investigate ingested security events.
                            </Typography>
                        </Box>

                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={loadEvents}
                            disabled={loading}
                            sx={{
                                color: colors.cyan,
                                borderColor: "rgba(34,211,238,0.35)",
                                "&:hover": {
                                    borderColor: colors.cyan,
                                    bgcolor: "rgba(34,211,238,0.08)",
                                },
                            }}
                        >
                            Refresh Events
                        </Button>
                    </Box>
                </Box>

                {/* SUMMARY CARDS */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ flexWrap: "wrap" }}
                >
                    {statCard(
                        "Total Events",
                        events.length,
                        <StorageIcon />,
                        colors.cyan
                    )}

                    {statCard(
                        "Failed Logins",
                        failedLoginCount,
                        <WarningAmberIcon />,
                        colors.red
                    )}

                    {statCard(
                        "Unique Source IPs",
                        uniqueSourceIps,
                        <LanIcon />,
                        colors.green
                    )}
                </Stack>

                {/* SEARCH AND FILTERS */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        bgcolor: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 3,
                    }}
                >
                    <TextField
                        fullWidth
                        placeholder="Search by event type, IP, username, MITRE or message..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: colors.muted }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                color: colors.text,
                                bgcolor: "#080f1c",
                                borderRadius: 2,
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
                        }}
                    />

                    {(sourceIpFilter || usernameFilter || mitreFilter) && (
                        <Box
                            sx={{
                                display: "flex",
                                gap: 1,
                                mt: 2,
                                flexWrap: "wrap",
                                alignItems: "center",
                            }}
                        >
                            <Typography
                                sx={{
                                    color: colors.muted,
                                    fontSize: 12,
                                }}
                            >
                                ACTIVE FILTERS:
                            </Typography>

                            {sourceIpFilter && (
                                <Chip
                                    label={`IP: ${sourceIpFilter}`}
                                    size="small"
                                    sx={{
                                        color: colors.cyan,
                                        bgcolor: "rgba(34,211,238,0.10)",
                                    }}
                                />
                            )}

                            {usernameFilter && (
                                <Chip
                                    label={`User: ${usernameFilter}`}
                                    size="small"
                                    sx={{
                                        color: colors.cyan,
                                        bgcolor: "rgba(34,211,238,0.10)",
                                    }}
                                />
                            )}

                            {mitreFilter && (
                                <Chip
                                    label={`MITRE: ${mitreFilter}`}
                                    size="small"
                                    sx={{
                                        color: colors.cyan,
                                        bgcolor: "rgba(34,211,238,0.10)",
                                    }}
                                />
                            )}

                            <Button
                                size="small"
                                onClick={clearFilters}
                                sx={{
                                    color: colors.red,
                                    textTransform: "none",
                                }}
                            >
                                Clear Filters
                            </Button>
                        </Box>
                    )}
                </Paper>

                {/* EVENTS TABLE */}
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
                            borderBottom: `1px solid ${colors.border}`,
                        }}
                    >
                        <Box>
                            <Typography
                                sx={{
                                    color: "#f8fafc",
                                    fontWeight: 800,
                                    fontSize: 17,
                                }}
                            >
                                Event Log
                            </Typography>

                            <Typography
                                sx={{
                                    color: colors.muted,
                                    fontSize: 12,
                                    mt: 0.5,
                                }}
                            >
                                Security events generated by the ingestion engine
                            </Typography>
                        </Box>

                        <Chip
                            label={`${filteredEvents.length} Events`}
                            size="small"
                            sx={{
                                color: colors.cyan,
                                bgcolor: "rgba(34,211,238,0.10)",
                                border: "1px solid rgba(34,211,238,0.2)",
                            }}
                        />
                    </Box>

                    {error && (
                        <Box sx={{ p: 2 }}>
                            <Typography sx={{ color: colors.red, fontSize: 13 }}>
                                {error}
                            </Typography>
                        </Box>
                    )}

                    {loading ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                py: 8,
                            }}
                        >
                            <CircularProgress sx={{ color: colors.cyan }} />
                        </Box>
                    ) : (
                        <TableContainer sx={{ overflowX: "auto" }}>
                            <Table sx={{ minWidth: 950 }}>
                                <TableHead>
                                    <TableRow
                                        sx={{
                                            bgcolor: "rgba(15,23,42,0.65)",
                                        }}
                                    >
                                        {[
                                            "EVENT TYPE",
                                            "SOURCE IP",
                                            "USERNAME",
                                            "MITRE TECHNIQUE",
                                            "MESSAGE",
                                            "TIMESTAMP",
                                            "ACTIONS",
                                        ].map((heading) => (
                                            <TableCell
                                                key={heading}
                                                align={heading === "ACTIONS" ? "right" : "left"}
                                                sx={{
                                                    color: "#94a3b8",
                                                    fontSize: 11,
                                                    fontWeight: 800,
                                                    borderColor: colors.border,
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {heading}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {filteredEvents.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                align="center"
                                                sx={{
                                                    py: 7,
                                                    color: colors.muted,
                                                    borderColor: colors.border,
                                                }}
                                            >
                                                <StorageIcon
                                                    sx={{
                                                        fontSize: 35,
                                                        mb: 1,
                                                        opacity: 0.5,
                                                    }}
                                                />

                                                <Typography>
                                                    No security events found.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredEvents.map((event) => (
                                            <TableRow
                                                key={event.id}
                                                hover
                                                sx={{
                                                    "&:hover": {
                                                        bgcolor: "rgba(34,211,238,0.035) !important",
                                                    },
                                                    "& td": {
                                                        borderColor: colors.border,
                                                    },
                                                }}
                                            >
                                                <TableCell>
                                                    <Chip
                                                        label={getEventType(event)}
                                                        size="small"
                                                        sx={{
                                                            color: colors.cyan,
                                                            bgcolor: "rgba(34,211,238,0.08)",
                                                            border: "1px solid rgba(34,211,238,0.18)",
                                                            fontWeight: 700,
                                                            fontSize: 11,
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <PivotLink
                                                        field="sourceIp"
                                                        value={event.sourceIp}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <PivotLink
                                                        field="username"
                                                        value={event.username}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <PivotLink
                                                        field="mitreTechnique"
                                                        value={event.mitreTechnique}
                                                    />
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        maxWidth: 240,
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                        color: colors.muted,
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    {event.message ?? event.rawLog ?? "No message"}
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        color: colors.muted,
                                                        fontSize: 12,
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {formatTime(getEventTime(event))}
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<VisibilityIcon />}
                                                        onClick={() => setSelectedEvent(event)}
                                                        sx={{
                                                            color: colors.cyan,
                                                            borderColor: "rgba(34,211,238,0.3)",
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

                <Divider sx={{ borderColor: colors.border }} />

                <Typography sx={{ color: "#64748b", fontSize: 11 }}>
                    SIEM-Lite Security Monitoring Platform · Event Monitoring
                </Typography>
            </Stack>

            {/* EVENT DETAILS DRAWER */}
            <Drawer
                anchor="right"
                open={Boolean(selectedEvent)}
                onClose={() => setSelectedEvent(null)}
                slotProps={{
                    paper: {
                        sx: {
                            width: { xs: "100%", sm: 540 },
                            bgcolor: "#090f1c",
                            color: colors.text,
                            borderLeft: `1px solid ${colors.border}`,
                            p: 3,
                        },
                    },
                }}
            >
                {selectedEvent && (
                    <Stack spacing={2.5}>
                        {/* DRAWER HEADER */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: "rgba(34,211,238,0.10)",
                                    }}
                                >
                                    <ShieldIcon sx={{ color: colors.cyan }} />
                                </Box>

                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: 19,
                                            fontWeight: 800,
                                            color: "#f8fafc",
                                        }}
                                    >
                                        Event Details
                                    </Typography>

                                    <Typography
                                        sx={{
                                            color: colors.muted,
                                            fontSize: 11,
                                        }}
                                    >
                                        Security event investigation
                                    </Typography>
                                </Box>
                            </Box>

                            <IconButton
                                onClick={() => setSelectedEvent(null)}
                                sx={{ color: colors.muted }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        <Divider sx={{ borderColor: colors.border }} />

                        {/* EVENT TYPE */}
                        <Box>
                            <Typography
                                sx={{
                                    color: colors.muted,
                                    fontSize: 11,
                                    mb: 1,
                                }}
                            >
                                EVENT TYPE
                            </Typography>

                            <Chip
                                label={getEventType(selectedEvent)}
                                sx={{
                                    color: colors.cyan,
                                    bgcolor: "rgba(34,211,238,0.10)",
                                    fontWeight: 700,
                                }}
                            />
                        </Box>

                        {/* EVENT INFORMATION */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: colors.card,
                                border: `1px solid ${colors.border}`,
                                borderRadius: 2,
                            }}
                        >
                            <Typography
                                sx={{
                                    color: colors.cyan,
                                    fontSize: 12,
                                    fontWeight: 800,
                                    mb: 2,
                                }}
                            >
                                EVENT INFORMATION
                            </Typography>

                            <Stack spacing={2}>
                                <Detail
                                    label="Source IP"
                                    value={selectedEvent.sourceIp ?? "N/A"}
                                />

                                <Detail
                                    label="Username"
                                    value={selectedEvent.username ?? "N/A"}
                                />

                                <Detail
                                    label="MITRE Technique"
                                    value={selectedEvent.mitreTechnique ?? "N/A"}
                                />

                                <Detail
                                    label="Destination IP"
                                    value={selectedEvent.destinationIp ?? "N/A"}
                                />

                                <Detail
                                    label="Severity"
                                    value={selectedEvent.severity ?? "N/A"}
                                    valueColor={getSeverityColor(selectedEvent.severity)}
                                />

                                <Detail
                                    label="Timestamp"
                                    value={formatTime(getEventTime(selectedEvent))}
                                />
                            </Stack>
                        </Paper>

                        {/* RAW EVENT */}
                        <Box>
                            <Typography
                                sx={{
                                    color: colors.cyan,
                                    fontSize: 12,
                                    fontWeight: 800,
                                    mb: 1.5,
                                }}
                            >
                                RAW EVENT / LOG DATA
                            </Typography>

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: "#050a12",
                                    border: `1px solid ${colors.border}`,
                                    maxHeight: 250,
                                    overflow: "auto",
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: "#86efac",
                                        fontSize: 12,
                                        fontFamily: "monospace",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                        lineHeight: 1.8,
                                    }}
                                >
                                    {selectedEvent.rawLog ??
                                        selectedEvent.message ??
                                        "No raw event available."}
                                </Typography>
                            </Paper>
                        </Box>

                        {/* PIVOT INVESTIGATION */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: colors.card,
                                border: `1px solid ${colors.border}`,
                                borderRadius: 2,
                            }}
                        >
                            <Typography
                                sx={{
                                    color: colors.cyan,
                                    fontSize: 12,
                                    fontWeight: 800,
                                    mb: 2,
                                }}
                            >
                                PIVOT INVESTIGATION
                            </Typography>

                            <Stack spacing={1.5}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    disabled={!selectedEvent.sourceIp}
                                    onClick={() =>
                                        pivotTo("sourceIp", selectedEvent.sourceIp)
                                    }
                                    sx={{
                                        justifyContent: "flex-start",
                                        color: colors.cyan,
                                        borderColor: colors.border,
                                        textTransform: "none",
                                    }}
                                >
                                    View all events from this IP
                                </Button>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    disabled={!selectedEvent.username}
                                    onClick={() =>
                                        pivotTo("username", selectedEvent.username)
                                    }
                                    sx={{
                                        justifyContent: "flex-start",
                                        color: colors.cyan,
                                        borderColor: colors.border,
                                        textTransform: "none",
                                    }}
                                >
                                    View all events for this user
                                </Button>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    disabled={!selectedEvent.mitreTechnique}
                                    onClick={() =>
                                        pivotTo(
                                            "mitreTechnique",
                                            selectedEvent.mitreTechnique
                                        )
                                    }
                                    sx={{
                                        justifyContent: "flex-start",
                                        color: colors.cyan,
                                        borderColor: colors.border,
                                        textTransform: "none",
                                    }}
                                >
                                    View all {selectedEvent.mitreTechnique ?? "MITRE"} events
                                </Button>
                            </Stack>
                        </Paper>
                    </Stack>
                )}
            </Drawer>
        </AppLayout>
    );
}

function Detail({
    label,
    value,
    valueColor,
}: {
    label: string;
    value: string;
    valueColor?: string;
}) {
    return (
        <Box>
            <Typography
                sx={{
                    color: "#64748b",
                    fontSize: 11,
                    mb: 0.5,
                }}
            >
                {label}
            </Typography>

            <Typography
                sx={{
                    color: valueColor ?? "#e2e8f0",
                    fontSize: 13,
                    fontWeight: 600,
                    wordBreak: "break-word",
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}
