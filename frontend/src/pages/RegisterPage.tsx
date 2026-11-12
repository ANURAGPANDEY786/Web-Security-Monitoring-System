
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography,
} from "@mui/material";

import SecurityIcon from "@mui/icons-material/Security";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import RegisterSecurityScene from "../components/RegisterSecurityScene";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setError("");
        setSuccess("");

        if (!username.trim() || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await api.post(
    "/auth/register",
                {
                    username: username.trim(),
                    password,
                    role: "VIEWER",
                }
            );

            setSuccess("Account created successfully! Redirecting...");

            setTimeout(() => {
                navigate("/login");
            }, 1200);

        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Registration failed. Username may already exist."
            );
        } finally {
            setLoading(false);
        }
    };

    const fieldStyle = {
    "& input::-ms-reveal, & input::-ms-clear": {
        display: "none",
    },
    "& input::-webkit-credentials-auto-fill-button": {
        visibility: "hidden",
        display: "none !important",
        pointerEvents: "none",
    },

    "& .MuiOutlinedInput-root": {
        color: "#e2e8f0",
        backgroundColor: "#0b1423",
        borderRadius: "10px",
        "& fieldset": {
            borderColor: "#26364b",
        },
        "&:hover fieldset": {
            borderColor: "#22d3ee",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#22d3ee",
        },
    },

    "& .MuiInputLabel-root": {
        color: "#94a3b8",
    },

    "& .MuiInputLabel-root.Mui-focused": {
        color: "#22d3ee",
    },
};

    return (
        <Box
            sx={{
                
                width: "100%",
                height: "100vh",
            
                minHeight: 0,
                overflow: "hidden",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                    "radial-gradient(circle at 20% 20%, #11263b 0%, #070d18 45%, #050914 100%)",
                p: { xs: 1, sm: 2, md: 3 },
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: "100%",
                    maxWidth: 1400,
                    height: "100%",
                    maxHeight: 850,
                    minHeight: 0,
                    display: "flex",
                    overflow: "hidden",
                    borderRadius: { xs: "14px", sm: "20px" },
                    background: "#0b1423",
                    border: "1px solid #1e293b",
                    boxShadow: "0 25px 80px rgba(0,0,0,0.45)",
                }}
            >
                {/* LEFT: 3D SCENE */}
                <Box
                    sx={{
                        width: "55%",
                        display: { xs: "none", md: "flex" },
                        flexDirection: "column",
                        justifyContent: "space-between",
                        position: "relative",
                        overflow: "hidden",
                        background:
                            "radial-gradient(circle at center, #102e46 0%, #091827 55%, #07111f 100%)",
                        borderRight: "1px solid #1e293b",
                    }}
                >
                    <Box sx={{ position: "absolute", inset: 0 }}>
                        <RegisterSecurityScene />
                    </Box>

                    <Box sx={{ position: "relative", zIndex: 1, p: 4 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <SecurityIcon sx={{ color: "#22d3ee", fontSize: 32 }} />

                            <Typography
                                variant="h5"
                                component="h5"
                                sx={{
                                    fontWeight: 800,
                                    color: "#e2e8f0",
                                }}
                            >
                                SIEM<span style={{ color: "#22d3ee" }}>-Lite</span>
                            </Typography>
                        </Box>

                        <Typography
                            sx={{
                                color: "#22d3ee",
                                fontSize: 11,
                                letterSpacing: 3,
                                mt: 1,
                            }}
                        >
                            SECURITY OPERATIONS PLATFORM
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            position: "relative",
                            zIndex: 1,
                            p: 4,
                            mt: "auto",
                            background:
                                "linear-gradient(transparent, rgba(5,9,20,0.85))",
                        }}
                    >
                        <Typography
                            variant="h3"
                            component="h3"
                            sx={{
                                fontWeight: 800,
                                color: "#f1f5f9",
                                maxWidth: 500,
                                lineHeight: 1.2,
                                fontSize: { md: "2.3rem", lg: "3rem" },
                            }}
                        >
                            Secure your
                            <Box component="span" sx={{ color: "#22d3ee" }}>
                                {" "}digital future.
                            </Box>
                        </Typography>

                        <Typography
                            sx={{
                                color: "#94a3b8",
                                mt: 2,
                                maxWidth: 420,
                                lineHeight: 1.8,
                                fontSize: 14,
                            }}
                        >
                            Create your account and explore a security
                            operations platform designed to monitor,
                            analyze and detect cyber threats.
                        </Typography>

                        <Box
                            sx={{
                                display: "flex",
                                gap: 1,
                                mt: 3,
                                alignItems: "center",
                            }}
                        >
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    bgcolor: "#22d3ee",
                                    boxShadow: "0 0 12px #22d3ee",
                                }}
                            />

                            <Typography
                                sx={{
                                    color: "#64748b",
                                    fontSize: 11,
                                    letterSpacing: 1.5,
                                }}
                            >
                                CREATE ACCOUNT • STAY PROTECTED
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* RIGHT: REGISTER FORM */}
                <Box
                    sx={{
                        width: { xs: "100%", md: "45%" },
                        flex: { xs: 1, md: "initial" },
                        minWidth: 0,
                        minHeight: 0,
                        height: "100%",
                        overflowY: "auto",
                        overflowX: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        p: {
                            xs: 2,
                            sm: 3,
                            md: 3,
                            lg: 4,
                        },
                        scrollbarWidth: "thin",
                        scrollbarColor: "#26364b transparent",
                    }}
                >
                    <Box
                        sx={{
                            width: "100%",
                            maxWidth: 400,
                            flexShrink: 0,
                            py: { xs: 1, sm: 2 },
                        }}
                    >
                        {/* FORM HEADING */}
                        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: { xs: 46, sm: 54 },
                                    height: { xs: 46, sm: 54 },
                                    borderRadius: "14px",
                                    bgcolor: "rgba(34,211,238,0.1)",
                                    border: "1px solid rgba(34,211,238,0.3)",
                                    mb: { xs: 1.5, sm: 2 },
                                }}
                            >
                                <SecurityIcon
                                    sx={{
                                        color: "#22d3ee",
                                        fontSize: { xs: 25, sm: 29 },
                                    }}
                                />
                            </Box>

                            <Typography
                                variant="h4"
                                component="h4"
                                sx={{
                                    fontWeight: 800,
                                    color: "#f1f5f9",
                                    fontSize: {
                                        xs: "1.65rem",
                                        sm: "2rem",
                                    },
                                }}
                            >
                                Create account
                            </Typography>

                            <Typography
                                sx={{
                                    color: "#94a3b8",
                                    mt: 0.7,
                                    fontSize: 13,
                                }}
                            >
                                Join the SIEM-Lite security platform.
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 1.5 }}>
                                {String(error)}
                            </Alert>
                        )}

                        {success && (
                            <Alert severity="success" sx={{ mb: 1.5 }}>
                                {success}
                            </Alert>
                        )}

                        {/* REGISTER FORM */}
                        <Box
                            component="form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleRegister();
                            }}
                        >
                            <Typography
                                sx={{
                                    color: "#cbd5e1",
                                    fontSize: 13,
                                    mb: 0.7,
                                }}
                            >
                                Username
                            </Typography>

                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                sx={{ ...fieldStyle, mb: 1.8 }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AccountCircleOutlinedIcon
                                                    sx={{ color: "#64748b" }}
                                                />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <Typography
                                sx={{
                                    color: "#cbd5e1",
                                    fontSize: 13,
                                    mb: 0.7,
                                }}
                            >
                                Password
                            </Typography>

                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Create a password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                sx={{ ...fieldStyle, mb: 1.8 }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlinedIcon
                                                    sx={{ color: "#64748b" }}
                                                />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() =>
                                                        setShowPassword(!showPassword)
                                                    }
                                                    edge="end"
                                                    sx={{ color: "#94a3b8" }}
                                                >
                                                    {showPassword ? (
                                                        <VisibilityOff />
                                                    ) : (
                                                        <Visibility />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <Typography
                                sx={{
                                    color: "#cbd5e1",
                                    fontSize: 13,
                                    mb: 0.7,
                                }}
                            >
                                Confirm Password
                            </Typography>

                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Re-enter your password"
                                type={
                                    showConfirmPassword ? "text" : "password"
                                }
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                autoComplete="new-password"
                                sx={fieldStyle}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlinedIcon
                                                    sx={{ color: "#64748b" }}
                                                />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() =>
                                                        setShowConfirmPassword(
                                                            !showConfirmPassword
                                                        )
                                                    }
                                                    edge="end"
                                                    sx={{ color: "#94a3b8" }}
                                                >
                                                    {showConfirmPassword ? (
                                                        <VisibilityOff />
                                                    ) : (
                                                        <Visibility />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    mt: { xs: 2.2, sm: 3 },
                                    py: { xs: 1.2, sm: 1.4 },
                                    borderRadius: "10px",
                                    textTransform: "none",
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: "#07111f",
                                    background:
                                        "linear-gradient(90deg, #22d3ee, #06b6d4)",
                                    "&:hover": {
                                        background:
                                            "linear-gradient(90deg, #06b6d4, #22d3ee)",
                                    },
                                }}
                            >
                                {loading ? (
                                    <CircularProgress
                                        size={23}
                                        sx={{ color: "#07111f" }}
                                    />
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </Box>

                        <Typography
                            align="center"
                            sx={{
                                mt: 2.5,
                                color: "#94a3b8",
                                fontSize: 13,
                            }}
                        >
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                style={{
                                    color: "#22d3ee",
                                    textDecoration: "none",
                                    fontWeight: 700,
                                }}
                            >
                                Sign In
                            </Link>
                        </Typography>

                        <Typography
                            align="center"
                            sx={{
                                mt: 2.5,
                                color: "#475569",
                                fontSize: 10,
                                letterSpacing: 1,
                            }}
                        >
                            SECURE REGISTRATION • SIEM-LITE
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}
