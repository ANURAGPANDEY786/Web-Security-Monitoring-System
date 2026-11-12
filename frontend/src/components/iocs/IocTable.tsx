
import {
    Box,
    Chip,
    IconButton,
    LinearProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";

import {
    EditRounded,
    DeleteOutlineRounded,
    PowerSettingsNewRounded,
    ShieldOutlined,
} from "@mui/icons-material";

import type { IndicatorOfCompromise } from "../../types/ioc";

interface Props {
    iocs: IndicatorOfCompromise[];
    onEdit: (ioc: IndicatorOfCompromise) => void;
    onDelete: (ioc: IndicatorOfCompromise) => void;
    onToggleActive: (ioc: IndicatorOfCompromise) => void;
}

const typeColors: Record<string, string> = {
    IP: "#38bdf8",
    DOMAIN: "#a78bfa",
    URL: "#fbbf24",
    FILE_HASH: "#fb7185",
};

function getConfidenceColor(confidence: number) {
    if (confidence >= 80) return "#34d399";
    if (confidence >= 50) return "#fbbf24";
    return "#fb7185";
}

function formatDate(value: string) {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleString();
}

export default function IocTable({
    iocs,
    onEdit,
    onDelete,
    onToggleActive,
}: Props) {
    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                bgcolor: "#070d18",
                border: "1px solid #1e293b",
                borderRadius: 2.5,
                overflowX: "auto",
            }}
        >
            <Table sx={{ minWidth: 1100 }}>
                <TableHead>
                    <TableRow
                        sx={{
                            bgcolor: "#101b2b",
                            "& th": {
                                color: "#94a3b8",
                                fontSize: "0.7rem",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                letterSpacing: "0.07em",
                                borderBottom: "1px solid #263449",
                                whiteSpace: "nowrap",
                                py: 2,
                            },
                        }}
                    >
                        <TableCell>Status</TableCell>
                        <TableCell>Indicator Type</TableCell>
                        <TableCell>Indicator Value</TableCell>
                        <TableCell>Confidence</TableCell>
                        <TableCell>Threat Source</TableCell>
                        <TableCell>Malware Family</TableCell>
                        <TableCell>Campaign</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {iocs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9} sx={{ borderBottom: 0 }}>
                                <Stack
                                    spacing={1.5}
                                    sx={{
                                        py: 7,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 54,
                                            height: 54,
                                            borderRadius: 3,
                                            bgcolor: "#132238",
                                            display: "grid",
                                            placeItems: "center",
                                        }}
                                    >
                                        <ShieldOutlined
                                            sx={{ color: "#64748b", fontSize: 28 }}
                                        />
                                    </Box>

                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            color: "#cbd5e1",
                                        }}
                                    >
                                        No indicators found
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ color: "#64748b", textAlign: "center" }}
                                    >
                                        Add an indicator or change your search filters.
                                    </Typography>
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ) : (
                        iocs.map((ioc) => {
                            const confidence = Math.min(
                                100,
                                Math.max(0, ioc.confidence ?? 0)
                            );

                            const typeColor =
                                typeColors[ioc.type] ?? "#94a3b8";

                            const confidenceColor =
                                getConfidenceColor(confidence);

                            return (
                                <TableRow
                                    key={ioc.id}
                                    hover
                                    sx={{
                                        "& td": {
                                            color: "#cbd5e1",
                                            borderBottom: "1px solid #1e293b",
                                            py: 1.8,
                                        },
                                        "&:hover": {
                                            bgcolor: "#111d2e !important",
                                        },
                                        transition: "background-color 0.2s",
                                    }}
                                >
                                    {/* Status */}
                                    <TableCell>
                                        <Chip
                                            label={ioc.active ? "ACTIVE" : "DISABLED"}
                                            size="small"
                                            icon={
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: "50%",
                                                        bgcolor: ioc.active
                                                            ? "#34d399"
                                                            : "#94a3b8",
                                                        ml: 1,
                                                    }}
                                                />
                                            }
                                            sx={{
                                                height: 25,
                                                fontSize: "0.67rem",
                                                fontWeight: 800,
                                                letterSpacing: "0.04em",
                                                color: ioc.active
                                                    ? "#34d399"
                                                    : "#94a3b8",
                                                bgcolor: ioc.active
                                                    ? "#064e3b55"
                                                    : "#33415555",
                                                border: `1px solid ${
                                                    ioc.active ? "#065f46" : "#475569"
                                                }`,
                                                "& .MuiChip-icon": {
                                                    mr: "-3px",
                                                },
                                            }}
                                        />
                                    </TableCell>

                                    {/* Type */}
                                    <TableCell>
                                        <Chip
                                            label={ioc.type.replace("_", " ")}
                                            size="small"
                                            sx={{
                                                color: typeColor,
                                                bgcolor: `${typeColor}15`,
                                                border: `1px solid ${typeColor}55`,
                                                fontWeight: 800,
                                                fontSize: "0.68rem",
                                                letterSpacing: "0.03em",
                                                borderRadius: 1.5,
                                            }}
                                        />
                                    </TableCell>

                                    {/* Value */}
                                    <TableCell sx={{ maxWidth: 260 }}>
                                        <Tooltip title={ioc.value} arrow>
                                            <Typography
                                                sx={{
                                                    fontFamily: "monospace",
                                                    fontSize: "0.82rem",
                                                    color: "#e2e8f0",
                                                    overflowWrap: "anywhere",
                                                    maxWidth: 250,
                                                }}
                                            >
                                                {ioc.value}
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>

                                    {/* Confidence */}
                                    <TableCell sx={{ minWidth: 125 }}>
                                        <Stack spacing={0.8}>
                                            <Stack
                                                direction="row"
                                                sx={{
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: confidenceColor,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {confidence}%
                                                </Typography>
                                            </Stack>

                                            <LinearProgress
                                                variant="determinate"
                                                value={confidence}
                                                sx={{
                                                    height: 5,
                                                    borderRadius: 5,
                                                    bgcolor: "#263449",
                                                    "& .MuiLinearProgress-bar": {
                                                        bgcolor: confidenceColor,
                                                        borderRadius: 5,
                                                    },
                                                }}
                                            />
                                        </Stack>
                                    </TableCell>

                                    {/* Threat source */}
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#cbd5e1" }}
                                        >
                                            {ioc.threatSource || "—"}
                                        </Typography>
                                    </TableCell>

                                    {/* Malware family */}
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#cbd5e1" }}
                                        >
                                            {ioc.malwareFamily || "—"}
                                        </Typography>
                                    </TableCell>

                                    {/* Campaign */}
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#cbd5e1" }}
                                        >
                                            {ioc.campaign || "—"}
                                        </Typography>
                                    </TableCell>

                                    {/* Created */}
                                    <TableCell>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "#94a3b8",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {formatDate(ioc.createdAt)}
                                        </Typography>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell align="center">
                                        <Stack
                                            direction="row"
                                            spacing={0.5}
                                            sx={{ justifyContent: "center" }}
                                        >
                                            <Tooltip title="Edit indicator">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onEdit(ioc)}
                                                    sx={{
                                                        color: "#38bdf8",
                                                        bgcolor: "#0c4a6e30",
                                                        "&:hover": {
                                                            bgcolor: "#07598555",
                                                        },
                                                    }}
                                                >
                                                    <EditRounded fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip
                                                title={
                                                    ioc.active
                                                        ? "Disable indicator"
                                                        : "Enable indicator"
                                                }
                                            >
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onToggleActive(ioc)}
                                                    sx={{
                                                        color: ioc.active
                                                            ? "#fbbf24"
                                                            : "#34d399",
                                                        bgcolor: ioc.active
                                                            ? "#78350f30"
                                                            : "#064e3b30",
                                                        "&:hover": {
                                                            bgcolor: ioc.active
                                                                ? "#78350f60"
                                                                : "#065f4660",
                                                        },
                                                    }}
                                                >
                                                    <PowerSettingsNewRounded fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Delete indicator">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onDelete(ioc)}
                                                    sx={{
                                                        color: "#fb7185",
                                                        bgcolor: "#88133730",
                                                        "&:hover": {
                                                            bgcolor: "#88133760",
                                                        },
                                                    }}
                                                >
                                                    <DeleteOutlineRounded fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
