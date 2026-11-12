
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
    Box,
} from "@mui/material";

import {
    DeleteOutlineRounded,
    WarningAmberRounded,
} from "@mui/icons-material";

import type { IndicatorOfCompromise } from "../../types/ioc";

interface Props {
    open: boolean;
    ioc: IndicatorOfCompromise | null;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export default function DeleteIocDialog({
    open,
    ioc,
    onClose,
    onConfirm,
}: Props) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            slotProps={{
                paper: {
                    sx: {
                        bgcolor: "#0b1423",
                        color: "#e2e8f0",
                        border: "1px solid #263449",
                        borderRadius: 3,
                        backgroundImage: "none",
                    },
                },
            }}
        >
            <DialogTitle
                sx={{
                    borderBottom: "1px solid #263449",
                    px: 3,
                    py: 2.5,
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
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 2,
                            bgcolor: "rgba(248,113,113,0.12)",
                            color: "#f87171",
                        }}
                    >
                        <WarningAmberRounded />
                    </Box>

                    <Box>
                        <Typography sx={{ fontSize: 17, fontWeight: 700 }}>
                            Delete Indicator
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                            THREAT INTELLIGENCE
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 3 }}>
                <Typography sx={{ color: "#cbd5e1", fontSize: 14 }}>
                    Are you sure you want to permanently delete this indicator?
                    This action cannot be undone.
                </Typography>

                <Box
                    sx={{
                        mt: 2.5,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "#080f1c",
                        border: "1px solid #263449",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 11,
                            color: "#64748b",
                            fontWeight: 700,
                            letterSpacing: 1,
                            mb: 1,
                        }}
                    >
                        INDICATOR VALUE
                    </Typography>

                    <Typography
                        sx={{
                            color: "#fca5a5",
                            fontFamily: "monospace",
                            fontSize: 14,
                            fontWeight: 700,
                            overflowWrap: "anywhere",
                        }}
                    >
                        {ioc?.value || "No indicator selected"}
                    </Typography>

                    {ioc && (
                        <Typography
                            sx={{ fontSize: 11, color: "#94a3b8", mt: 1 }}
                        >
                            Type: {ioc.type}
                        </Typography>
                    )}
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    px: 3,
                    py: 2,
                    borderTop: "1px solid #263449",
                    gap: 1,
                }}
            >
                <Button
                    onClick={onClose}
                    sx={{
                        color: "#94a3b8",
                        textTransform: "none",
                    }}
                >
                    Cancel
                </Button>

                <Button
                    color="error"
                    variant="contained"
                    onClick={onConfirm}
                    disabled={!ioc}
                    startIcon={<DeleteOutlineRounded />}
                    sx={{
                        bgcolor: "#dc2626",
                        textTransform: "none",
                        fontWeight: 700,
                        "&:hover": {
                            bgcolor: "#b91c1c",
                        },
                    }}
                >
                    Delete Indicator
                </Button>
            </DialogActions>
        </Dialog>
    );
}
