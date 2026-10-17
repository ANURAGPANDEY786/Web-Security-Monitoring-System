
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

import {
    Alert,
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
} from "@mui/material";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
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
            await axios.post(
                "http://localhost:8081/api/auth/register",
                {
                    username: username.trim(),
                    password: password,
                    role: "VIEWER",
                }
            );

            setSuccess("Registration successful! Redirecting to login...");

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

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: "flex",
                    minHeight: "100vh",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Paper elevation={6} sx={{ p: 4, width: "100%" }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        SIEM-Lite
                    </Typography>

                    <Typography
                        variant="body2"
                        align="center"
                        sx={{ mb: 3 }}
                    >
                        Create your account
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {String(error)}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <TextField
                        label="Username"
                        fullWidth
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <TextField
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <Button
                        variant="contained"
                        fullWidth
                        sx={{ mt: 3 }}
                        onClick={handleRegister}
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </Button>

                    <Typography align="center" sx={{ mt: 3 }}>
                        Already have an account?{" "}
                        <Link to="/login">Sign In</Link>
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
}
