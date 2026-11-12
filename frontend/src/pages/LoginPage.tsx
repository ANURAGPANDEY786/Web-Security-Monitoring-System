
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
} from "@mui/material";

import SecurityIcon from "@mui/icons-material/Security";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { useAuth } from "../context/AuthContext";
import AuthSecurityScene from "../components/AuthSecurityScene";

export default function LoginPage() {
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setError("");
            setLoading(true);

            await loginUser({ username, password });
            navigate("/dashboard");
        } catch {
            setError("Invalid username or password.");
        } finally {
            setLoading(false);
        }
    };

    const fieldStyle = {
        "& .MuiOutlinedInput-root": {
            color: "#e2e8f0",
            backgroundColor: "#0b1423",
            borderRadius: "10px",
            "& fieldset": { borderColor: "#26364b" },
            "&:hover fieldset": { borderColor: "#22d3ee" },
            "&.Mui-focused fieldset": { borderColor: "#22d3ee" },
        },
        "& .MuiInputLabel-root": { color: "#94a3b8" },
        "& .MuiInputLabel-root.Mui-focused": { color: "#22d3ee" },
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "radial-gradient(circle at 20% 20%, #11263b 0%, #070d18 45%, #050914 100%)",
                p: { xs: 2, md: 4 },
            }}
        >
            <Container maxWidth="xl" disableGutters>
                <Paper
                    elevation={0}
                    sx={{
                        display: "flex",
                        minHeight: { md: 650 },
                        overflow: "hidden",
                        borderRadius: "22px",
                        background: "#0b1423",
                        border: "1px solid #1e293b",
                        boxShadow: "0 25px 80px rgba(0,0,0,0.45)",
                    }}
                >
                    {/* LEFT: 3D SECURITY SCENE */}
                    <Box
                        sx={{
                            width: { xs: "100%", md: "55%" },
                            minHeight: { xs: 330, md: "auto" },
                            display: { xs: "none", md: "flex" },
                            flexDirection: "column",
                            justifyContent: "space-between",
                            position: "relative",
                            overflow: "hidden",
                            background: "radial-gradient(circle at center, #102e46 0%, #091827 55%, #07111f 100%)",
                            borderRight: "1px solid #1e293b",
                        }}
                    >
                        <Box sx={{ position: "absolute", inset: 0 }}>
                            <AuthSecurityScene />
                        </Box>

                        <Box sx={{ position: "relative", zIndex: 1, p: 5 }}>
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
                                p: 5,
                                mt: "auto",
                                background: "linear-gradient(transparent, rgba(5,9,20,0.85))",
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
    }}
>
    Defend your
    <Box component="span" sx={{ color: "#22d3ee" }}>
        {" "}digital world.
    </Box>
</Typography>

                            <Typography
                                sx={{
                                    color: "#94a3b8",
                                    mt: 2,
                                    maxWidth: 420,
                                    lineHeight: 1.8,
                                }}
                            >
                                Monitor security events, identify suspicious
                                activity and stay ahead of potential cyber threats.
                            </Typography>

                            <Box sx={{ display: "flex", gap: 1, mt: 3, alignItems: "center" }}>
                                <Box sx={{
                                    width: 8, height: 8, borderRadius: "50%",
                                    bgcolor: "#22d3ee",
                                    boxShadow: "0 0 12px #22d3ee",
                                }} />
                                <Typography sx={{ color: "#64748b", fontSize: 11, letterSpacing: 1.5 }}>
                                    SECURITY MONITORING • THREAT DETECTION
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* RIGHT: LOGIN FORM */}
                    <Box
                        sx={{
                            width: { xs: "100%", md: "45%" },
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            p: { xs: 3, sm: 5, md: 6 },
                        }}
                    >
                        <Box sx={{ width: "100%", maxWidth: 400 }}>
                            <Box sx={{ mb: 4 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 58,
                                        height: 58,
                                        borderRadius: "16px",
                                        bgcolor: "rgba(34,211,238,0.1)",
                                        border: "1px solid rgba(34,211,238,0.3)",
                                        mb: 3,
                                    }}
                                >
                                    <LockOutlinedIcon sx={{ color: "#22d3ee", fontSize: 30 }} />
                                </Box>

                                <Typography
    variant="h4"
    component="h4"
    sx={{
        fontWeight: 800,
        color: "#f1f5f9",
    }}
>
    Welcome back
</Typography>
                                <Typography sx={{ color: "#94a3b8", mt: 1, fontSize: 14 }}>
                                    Sign in to access your security dashboard.
                                </Typography>
                            </Box>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Box
                                component="form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleLogin();
                                }}
                            >
                                <Typography sx={{ color: "#cbd5e1", fontSize: 13, mb: 1 }}>
                                    Username
                                </Typography>

                                <TextField
                                    fullWidth
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    sx={{ ...fieldStyle, mb: 2.5 }}
                                    autoComplete="username"
                                />

                                <Typography sx={{ color: "#cbd5e1", fontSize: 13, mb: 1 }}>
                                    Password
                                </Typography>

                                <TextField
                                    fullWidth
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    sx={fieldStyle}
                                    autoComplete="current-password"
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    disabled={loading || !username.trim() || !password}
                                    sx={{
                                        mt: 3.5,
                                        py: 1.5,
                                        borderRadius: "10px",
                                        textTransform: "none",
                                        fontSize: 15,
                                        fontWeight: 700,
                                        color: "#07111f",
                                        background: "linear-gradient(90deg, #22d3ee, #06b6d4)",
                                        "&:hover": {
                                            background: "linear-gradient(90deg, #06b6d4, #22d3ee)",
                                        },
                                    }}
                                >
                                    {loading ? "Signing in..." : "Sign In"}
                                </Button>
                            </Box>

                            <Typography
                                align="center"
                                sx={{ mt: 3, color: "#94a3b8", fontSize: 13 }}
                            >
                                Don't have an account?{" "}
                                <Link
                                    to="/register"
                                    style={{
                                        color: "#22d3ee",
                                        textDecoration: "none",
                                        fontWeight: 700,
                                    }}
                                >
                                    Create account
                                </Link>
                            </Typography>

                            <Typography
                                align="center"
                                sx={{
                                    mt: 5,
                                    color: "#475569",
                                    fontSize: 10,
                                    letterSpacing: 1,
                                }}
                            >
                                SECURE ACCESS • SIEM-LITE
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
