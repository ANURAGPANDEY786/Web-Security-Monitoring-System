
import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Pagination,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import {
    HistoryRounded,
    RefreshRounded,
    SecurityRounded,
} from "@mui/icons-material";

import AppLayout from "../components/layout/AppLayout";
import AuditLogTable from "../components/AuditLogTable";
import { getAuditLogs } from "../services/audit";
import type { AuditLog, PageResponse } from "../types/audit";

const PAGE_SIZE = 20;

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAuditLogs(page);
    }, [page]);

    async function loadAuditLogs(currentPage: number) {
        try {
            setLoading(true);
            setError("");

            const response: PageResponse<AuditLog> =
                await getAuditLogs(currentPage - 1, PAGE_SIZE);

            setLogs(response.content);
            setTotalPages(Math.max(response.totalPages, 1));
        } catch (err) {
            console.error(err);
            setError("Failed to load audit logs.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AppLayout title="Audit Logs">
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
                            <HistoryRounded
                                sx={{ color: "#22d3ee", fontSize: 26 }}
                            />
                            <Typography
                                variant="h5"
                                sx={{ color: "#e2e8f0", fontWeight: 800 }}
                            >
                                Audit Logs
                            </Typography>
                        </Stack>

                        <Typography
                            variant="body2"
                            sx={{ color: "#8493a8", mt: 0.7 }}
                        >
                            Review and monitor recorded system activities.
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<RefreshRounded />}
                        onClick={() => loadAuditLogs(page)}
                        disabled={loading}
                        sx={{
                            color: "#22d3ee",
                            borderColor: "#164e63",
                            borderRadius: 2,
                            textTransform: "none",
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

                {/* Error State */}
                {error && (
                    <Alert
                        severity="error"
                        onClose={() => setError("")}
                        sx={{
                            bgcolor: "#2a1720",
                            color: "#fecdd3",
                            border: "1px solid #7f1d35",
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {/* Audit Log Panel */}
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
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: "center" }}
                            >
                                <SecurityRounded
                                    sx={{ color: "#22d3ee", fontSize: 19 }}
                                />
                                <Typography
                                    variant="subtitle1"
                                    sx={{ color: "#e2e8f0", fontWeight: 750 }}
                                >
                                    System Activity Records
                                </Typography>
                            </Stack>

                            <Typography
                                variant="caption"
                                sx={{ color: "#64748b" }}
                            >
                                Page {page} of {totalPages}
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
                            {logs.length} Records
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
                        ) : error ? (
                            <Box
                                sx={{
                                    py: 5,
                                    textAlign: "center",
                                    color: "#94a3b8",
                                }}
                            >
                                Unable to display audit records.
                            </Box>
                        ) : (
                            <AuditLogTable logs={logs} />
                        )}
                    </Box>

                    {/* Pagination */}
                    {!loading && !error && (
                        <Box
                            sx={{
                                px: 2,
                                py: 2.2,
                                borderTop: "1px solid #1e293b",
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            <Pagination
                                page={page}
                                count={totalPages}
                                color="primary"
                                onChange={(_, value) => setPage(value)}
                                sx={{
                                    "& .MuiPaginationItem-root": {
                                        color: "#94a3b8",
                                        borderColor: "#334155",
                                    },
                                    "& .Mui-selected": {
                                        bgcolor: "rgba(34,211,238,0.15) !important",
                                        color: "#22d3ee",
                                    },
                                    "& .MuiPaginationItem-root:hover": {
                                        bgcolor: "rgba(34,211,238,0.08)",
                                    },
                                }}
                            />
                        </Box>
                    )}
                </Paper>
            </Stack>
        </AppLayout>
    );
}
