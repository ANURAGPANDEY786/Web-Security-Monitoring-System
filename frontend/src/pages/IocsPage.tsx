
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {
    AddRounded,
    SearchRounded,
    RefreshRounded,
    SecurityRounded,
    ShieldRounded,
    WarningAmberRounded,
    VerifiedUserRounded,
} from "@mui/icons-material";

import AppLayout from "../components/layout/AppLayout";
import IocTable from "../components/iocs/IocTable";
import IocDialog from "../components/iocs/IocDialog";
import DeleteIocDialog from "../components/iocs/DeleteIocDialog";

import {
    createIoc,
    deleteIoc,
    disableIoc,
    enableIoc,
    getIocs,
    updateIoc,
} from "../services/iocs";

import type {
    IndicatorOfCompromise,
    IndicatorOfCompromiseRequest,
} from "../types/ioc";

const panelSx = {
    background: "#0b1423",
    border: "1px solid #1e293b",
    borderRadius: 3,
    color: "#e2e8f0",
};

export default function IocsPage() {
    const [iocs, setIocs] = useState<IndicatorOfCompromise[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedIoc, setSelectedIoc] =
        useState<IndicatorOfCompromise | null>(null);

    async function loadIocs(isRefresh = false) {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const data = await getIocs();
            setIocs(data);
            setError("");
        } catch (err) {
            console.error("IOC load error:", err);
            setError("Failed to load threat intelligence indicators.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        let active = true;

        getIocs()
            .then((data) => {
                if (active) {
                    setIocs(data);
                    setError("");
                }
            })
            .catch((err: unknown) => {
                if (active) {
                    console.error("IOC load error:", err);
                    setError("Failed to load threat intelligence indicators.");
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

    const statistics = useMemo(() => {
        const total = iocs.length;
        const active = iocs.filter((ioc) => ioc.active).length;
        const inactive = total - active;
        const highConfidence = iocs.filter(
            (ioc) => (ioc.confidence ?? 0) >= 80
        ).length;

        return { total, active, inactive, highConfidence };
    }, [iocs]);

    const filteredIocs = useMemo(() => {
        const query = search.trim().toLowerCase();

        return iocs.filter((ioc) => {
            const matchesSearch = !query || [
                ioc.value,
                ioc.type,
                ioc.threatSource,
                ioc.malwareFamily,
                ioc.campaign,
                ioc.description,
            ]
                .filter(Boolean)
                .some((field) => String(field).toLowerCase().includes(query));

            const matchesType =
                typeFilter === "ALL" || ioc.type === typeFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && ioc.active) ||
                (statusFilter === "INACTIVE" && !ioc.active);

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [iocs, search, typeFilter, statusFilter]);

    function openCreateDialog() {
        setSelectedIoc(null);
        setDialogOpen(true);
    }

    function openEditDialog(ioc: IndicatorOfCompromise) {
        setSelectedIoc(ioc);
        setDialogOpen(true);
    }

    function openDeleteDialog(ioc: IndicatorOfCompromise) {
        setSelectedIoc(ioc);
        setDeleteDialogOpen(true);
    }

    async function handleSave(request: IndicatorOfCompromiseRequest) {
        if (selectedIoc) {
            await updateIoc(selectedIoc.id, request);
        } else {
            await createIoc(request);
        }

        setDialogOpen(false);
        setSelectedIoc(null);
        await loadIocs();
    }

    async function handleDelete() {
        if (!selectedIoc) return;

        await deleteIoc(selectedIoc.id);
        setDeleteDialogOpen(false);
        setSelectedIoc(null);
        await loadIocs();
    }

    async function handleToggleActive(ioc: IndicatorOfCompromise) {
        if (ioc.active) {
            await disableIoc(ioc.id);
        } else {
            await enableIoc(ioc.id);
        }

        await loadIocs();
    }

    const statCards = [
        {
            label: "Total Indicators",
            value: statistics.total,
            description: "All registered IOCs",
            icon: <SecurityRounded />,
            color: "#22d3ee",
        },
        {
            label: "Active Indicators",
            value: statistics.active,
            description: "Enabled for matching",
            icon: <VerifiedUserRounded />,
            color: "#34d399",
        },
        {
            label: "Inactive Indicators",
            value: statistics.inactive,
            description: "Currently disabled",
            icon: <ShieldRounded />,
            color: "#fbbf24",
        },
        {
            label: "High Confidence",
            value: statistics.highConfidence,
            description: "Confidence score ≥ 80%",
            icon: <WarningAmberRounded />,
            color: "#fb7185",
        },
    ];

    return (
        <AppLayout title="Threat Intelligence">
            <Stack spacing={3}>
                {/* Page heading */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", md: "center" },
                        flexDirection: { xs: "column", md: "row" },
                        gap: 2,
                    }}
                >
                    <Box>
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: "center" }}
                        >
                            <SecurityRounded sx={{ color: "#22d3ee", fontSize: 27 }} />
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: 800, color: "#f1f5f9" }}
                            >
                                Threat Intelligence
                            </Typography>
                        </Stack>

                        <Typography
                            variant="body2"
                            sx={{ color: "#94a3b8", mt: 0.8 }}
                        >
                            Manage and monitor Indicators of Compromise across your security environment.
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            startIcon={
                                refreshing ? (
                                    <CircularProgress size={16} />
                                ) : (
                                    <RefreshRounded />
                                )
                            }
                            disabled={refreshing || loading}
                            onClick={() => loadIocs(true)}
                            sx={{
                                color: "#cbd5e1",
                                borderColor: "#334155",
                                textTransform: "none",
                            }}
                        >
                            Refresh
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<AddRounded />}
                            onClick={openCreateDialog}
                            sx={{
                                bgcolor: "#0891b2",
                                "&:hover": { bgcolor: "#0e7490" },
                                textTransform: "none",
                                fontWeight: 700,
                            }}
                        >
                            Add Indicator
                        </Button>
                    </Stack>
                </Box>

                {/* Statistics */}
                <Grid container spacing={2}>
                    {statCards.map((card) => (
                        <Grid size={{ xs: 12, sm: 6, xl: 3 }} key={card.label}>
                            <Card sx={{ ...panelSx, height: "100%" }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Stack
                                        direction="row"
                                        sx={{
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: "#94a3b8",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {card.label}
                                        </Typography>

                                        <Box
                                            sx={{
                                                width: 38,
                                                height: 38,
                                                borderRadius: 2,
                                                display: "grid",
                                                placeItems: "center",
                                                color: card.color,
                                                bgcolor: `${card.color}18`,
                                            }}
                                        >
                                            {card.icon}
                                        </Box>
                                    </Stack>

                                    <Typography
                                        variant="h4"
                                        sx={{
                                            color: "#f8fafc",
                                            mt: 1.5,
                                            fontWeight: 800,
                                        }}
                                    >
                                        {loading ? "—" : card.value}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        sx={{ color: "#64748b" }}
                                    >
                                        {card.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* IOC management */}
                <Card sx={panelSx}>
                    <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={2}
                            sx={{
                                mb: 2.5,
                                justifyContent: "space-between",
                                alignItems: { xs: "stretch", md: "center" },
                            }}
                        >
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 700, color: "#f1f5f9" }}
                                >
                                    Indicator Management
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{ color: "#64748b" }}
                                >
                                    Search, review and manage registered indicators.
                                </Typography>
                            </Box>

                            <Chip
                                label={`${filteredIocs.length} of ${iocs.length} indicators`}
                                size="small"
                                sx={{
                                    color: "#67e8f9",
                                    bgcolor: "#164e6330",
                                    border: "1px solid #155e75",
                                    alignSelf: { xs: "flex-start", md: "center" },
                                }}
                            />
                        </Stack>

                        <Stack
                            direction={{ xs: "column", lg: "row" }}
                            spacing={1.5}
                            sx={{ mb: 2.5 }}
                        >
                            <TextField
                                placeholder="Search value, type, source, malware, campaign..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                fullWidth
                                size="small"
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchRounded sx={{ color: "#64748b" }} />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        bgcolor: "#070d18",
                                        color: "#e2e8f0",
                                        "& fieldset": { borderColor: "#263449" },
                                        "&:hover fieldset": { borderColor: "#475569" },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#0891b2",
                                        },
                                    },
                                    "& input::placeholder": {
                                        color: "#64748b",
                                        opacity: 1,
                                    },
                                }}
                            />

                            <TextField
                                select
                                size="small"
                                value={typeFilter}
                                onChange={(event) => setTypeFilter(event.target.value)}
                                slotProps={{ select: { native: true } }}
                                sx={{
                                    minWidth: { xs: "100%", lg: 150 },
                                    "& .MuiOutlinedInput-root": {
                                        bgcolor: "#070d18",
                                        color: "#e2e8f0",
                                    },
                                    "& fieldset": { borderColor: "#263449" },
                                }}
                            >
                                <option value="ALL">All Types</option>
                                <option value="IP">IP</option>
                                <option value="DOMAIN">Domain</option>
                                <option value="URL">URL</option>
                                <option value="FILE_HASH">File Hash</option>
                            </TextField>

                            <TextField
                                select
                                size="small"
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                slotProps={{ select: { native: true } }}
                                sx={{
                                    minWidth: { xs: "100%", lg: 150 },
                                    "& .MuiOutlinedInput-root": {
                                        bgcolor: "#070d18",
                                        color: "#e2e8f0",
                                    },
                                    "& fieldset": { borderColor: "#263449" },
                                }}
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </TextField>
                        </Stack>

                        {error && (
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 2,
                                    bgcolor: "#451a1a",
                                    color: "#fecaca",
                                    "& .MuiAlert-icon": { color: "#f87171" },
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        {loading ? (
                            <Box
                                sx={{
                                    py: 8,
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                <CircularProgress sx={{ color: "#22d3ee" }} />
                            </Box>
                        ) : !error ? (
                            <IocTable
                                iocs={filteredIocs}
                                onEdit={openEditDialog}
                                onDelete={openDeleteDialog}
                                onToggleActive={handleToggleActive}
                            />
                        ) : null}
                    </CardContent>
                </Card>

                <Typography
                    variant="caption"
                    sx={{ color: "#64748b", textAlign: "right" }}
                >
                    Threat intelligence data is scoped to your authenticated account.
                </Typography>
            </Stack>

            <IocDialog
                open={dialogOpen}
                ioc={selectedIoc}
                onClose={() => setDialogOpen(false)}
                onSave={handleSave}
            />

            <DeleteIocDialog
                open={deleteDialogOpen}
                ioc={selectedIoc}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
