
import { useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    Typography,
    Box,
    InputAdornment,
} from "@mui/material";
import {
    ShieldOutlined,
    CloseRounded,
    SaveRounded,
} from "@mui/icons-material";

import type {
    IndicatorOfCompromise,
    IndicatorOfCompromiseRequest,
} from "../../types/ioc";

const IOC_TYPES = ["IP", "DOMAIN", "URL", "FILE_HASH"];

interface Props {
    open: boolean;
    ioc: IndicatorOfCompromise | null;
    onClose: () => void;
    onSave: (request: IndicatorOfCompromiseRequest) => Promise<void>;
}

const emptyForm: IndicatorOfCompromiseRequest = {
    value: "",
    type: "IP",
    threatSource: "",
    confidence: 50,
    malwareFamily: "",
    campaign: "",
    description: "",
};

const fieldSx = {
    "& .MuiInputLabel-root": {
        color: "#94a3b8",
    },
    "& .MuiInputLabel-root.Mui-focused": {
        color: "#22d3ee",
    },
    "& .MuiOutlinedInput-root": {
        color: "#e2e8f0",
        backgroundColor: "#080f1c",
        borderRadius: 2,
        "& fieldset": {
            borderColor: "#263449",
        },
        "&:hover fieldset": {
            borderColor: "#475569",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#22d3ee",
        },
    },
    "& .MuiFormHelperText-root": {
        color: "#64748b",
    },
};

export default function IocDialog(props: Props) {
    if (!props.open) {
        return null;
    }

    return (
        <IocDialogForm
            key={props.ioc?.id ?? "new"}
            {...props}
        />
    );
}

function IocDialogForm({
    open,
    ioc,
    onClose,
    onSave,
}: Props) {
    const [form, setForm] = useState<IndicatorOfCompromiseRequest>(() =>
        ioc
            ? {
                value: ioc.value ?? "",
                type: ioc.type ?? "IP",
                threatSource: ioc.threatSource ?? "",
                confidence: ioc.confidence ?? 50,
                malwareFamily: ioc.malwareFamily ?? "",
                campaign: ioc.campaign ?? "",
                description: ioc.description ?? "",
            }
            : { ...emptyForm }
    );
    const [saving, setSaving] = useState(false);

    function updateField(
        field: keyof IndicatorOfCompromiseRequest,
        value: string | number
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    async function handleSave() {
        if (!form.value.trim() || saving) return;

        setSaving(true);

        try {
            await onSave({
                ...form,
                value: form.value.trim(),
            });
            onClose();
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog
            open={open}
            onClose={saving ? undefined : onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: "#0b1423",
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
                    px: 3,
                    py: 2.5,
                    borderBottom: "1px solid #263449",
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
                            bgcolor: "rgba(34,211,238,0.10)",
                            color: "#22d3ee",
                        }}
                    >
                        <ShieldOutlined />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
                            {ioc ? "Edit Indicator" : "Add Threat Indicator"}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                            IOC MANAGEMENT / THREAT INTELLIGENCE
                        </Typography>
                    </Box>

                    <Button
                        onClick={onClose}
                        disabled={saving}
                        sx={{
                            minWidth: 36,
                            width: 36,
                            height: 36,
                            color: "#94a3b8",
                        }}
                    >
                        <CloseRounded />
                    </Button>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 3 }}>
                <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                    <Box>
                        <Typography
                            sx={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#22d3ee",
                                letterSpacing: 1,
                                mb: 1.5,
                            }}
                        >
                            INDICATOR DETAILS
                        </Typography>

                        <Stack spacing={2}>
                            <TextField
                                label="IOC Value"
                                placeholder="e.g. 192.168.1.100"
                                value={form.value}
                                onChange={(event) =>
                                    updateField("value", event.target.value)
                                }
                                fullWidth
                                required
                                sx={fieldSx}
                            />

                            <TextField
                                label="IOC Type"
                                value={form.type}
                                onChange={(event) =>
                                    updateField("type", event.target.value)
                                }
                                select
                                fullWidth
                                required
                                sx={fieldSx}
                            >
                                {IOC_TYPES.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    </Box>

                    <Box
                        sx={{
                            borderTop: "1px solid #263449",
                            pt: 2.5,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#22d3ee",
                                letterSpacing: 1,
                                mb: 1.5,
                            }}
                        >
                            THREAT CLASSIFICATION
                        </Typography>

                        <Stack spacing={2}>
                            <TextField
                                label="Threat Source"
                                placeholder="e.g. Internal Analysis, AbuseIPDB"
                                value={form.threatSource}
                                onChange={(event) =>
                                    updateField("threatSource", event.target.value)
                                }
                                fullWidth
                                sx={fieldSx}
                            />

                            <TextField
                                label="Confidence"
                                type="number"
                                value={form.confidence}
                                onChange={(event) =>
                                    updateField(
                                        "confidence",
                                        Number(event.target.value)
                                    )
                                }
                                fullWidth
                                sx={fieldSx}
                                slotProps={{
                                    htmlInput: {
                                        min: 0,
                                        max: 100,
                                    },
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Typography sx={{ color: "#94a3b8" }}>
                                                    %
                                                </Typography>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <TextField
                                label="Malware Family"
                                placeholder="e.g. Emotet"
                                value={form.malwareFamily}
                                onChange={(event) =>
                                    updateField("malwareFamily", event.target.value)
                                }
                                fullWidth
                                sx={fieldSx}
                            />

                            <TextField
                                label="Campaign"
                                placeholder="e.g. Campaign identifier"
                                value={form.campaign}
                                onChange={(event) =>
                                    updateField("campaign", event.target.value)
                                }
                                fullWidth
                                sx={fieldSx}
                            />

                            <TextField
                                label="Description"
                                placeholder="Add investigation notes or threat context..."
                                value={form.description}
                                onChange={(event) =>
                                    updateField("description", event.target.value)
                                }
                                fullWidth
                                multiline
                                minRows={3}
                                sx={fieldSx}
                            />
                        </Stack>
                    </Box>
                </Stack>
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
                    disabled={saving}
                    sx={{
                        color: "#94a3b8",
                        textTransform: "none",
                    }}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving || form.value.trim() === ""}
                    startIcon={<SaveRounded />}
                    sx={{
                        bgcolor: "#0891b2",
                        color: "#fff",
                        textTransform: "none",
                        fontWeight: 700,
                        px: 2.5,
                        "&:hover": {
                            bgcolor: "#0e7490",
                        },
                        "&.Mui-disabled": {
                            bgcolor: "#263449",
                            color: "#64748b",
                        },
                    }}
                >
                    {saving ? "Saving..." : ioc ? "Update Indicator" : "Save Indicator"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
