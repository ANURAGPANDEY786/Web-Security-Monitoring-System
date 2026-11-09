import { useEffect, useState } from "react";
import axios from "axios";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    FormControl,
    MenuItem,
    Select,
    Stack,
    Switch,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";

import AppLayout from "../components/layout/AppLayout";
import api from "../services/api";

interface User {
    id: number;
    username: string;
    role: "ADMIN" | "ANALYST" | "VIEWER";
    enabled: boolean;
    createdAt: string;
}

const roles = ["ADMIN", "ANALYST", "VIEWER"] as const;

const panelCardStyles = {
    background: "#111827",
    border: "1px solid #263244",
    borderRadius: 2,
    color: "#f9fafb",
};

const passwordFieldStyles = {
    "& .MuiInputLabel-root": { color: "#9ca3af" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#60a5fa" },
    "& .MuiOutlinedInput-root": {
        color: "#f3f4f6",
        background: "#1f2937",
        "& fieldset": { borderColor: "#374151" },
        "&:hover fieldset": { borderColor: "#6b7280" },
        "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
    },
    "& .MuiFormHelperText-root": { color: "#9ca3af" },
};

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingUser, setUpdatingUser] = useState<number | null>(null);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        let active = true;

        api.get<User[]>("/admin/users")
            .then((response) => {
                if (active) setUsers(response.data);
            })
            .catch((err: unknown) => {
                if (!active) return;

                if (axios.isAxiosError(err)) {
                    if (err.response?.status === 401) {
                        setError("Your session has expired. Please log in again.");
                    } else if (err.response?.status === 403) {
                        setError("Access denied. Only ADMIN users can manage users.");
                    } else {
                        setError(
                            err.response?.data?.message ||
                                "Unable to load users. Please try again."
                        );
                    }
                } else {
                    setError("Something went wrong while loading users.");
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const handleRoleChange = async (userId: number, newRole: string) => {
        const previousUsers = [...users];

        try {
            setUpdatingUser(userId);
            setError("");

            const response = await api.put(`/admin/users/${userId}/role`, {
                role: newRole,
            });

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === userId ? response.data : user
                )
            );
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.message || "Unable to update user role."
                );
            } else {
                setError("Something went wrong while updating the role.");
            }
            setUsers(previousUsers);
        } finally {
            setUpdatingUser(null);
        }
    };

    const handleStatusChange = async (userId: number, enabled: boolean) => {
        const previousUsers = [...users];

        try {
            setUpdatingUser(userId);
            setError("");

            const response = await api.put(`/admin/users/${userId}/status`, {
                enabled,
            });

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === userId ? response.data : user
                )
            );
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.message ||
                        "Unable to update account status."
                );
            } else {
                setError("Something went wrong while updating account status.");
            }
            setUsers(previousUsers);
        } finally {
            setUpdatingUser(null);
        }
    };

    const handleChangePassword = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Please fill in all password fields.");
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError("New password must contain at least 8 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New password and confirm password do not match.");
            return;
        }
        if (currentPassword === newPassword) {
            setPasswordError(
                "New password must be different from current password."
            );
            return;
        }

        try {
            setChangingPassword(true);
            await api.put("/auth/change-password", {
                currentPassword,
                newPassword,
                confirmPassword,
            });

            setPasswordSuccess("Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    setPasswordError(
                        "Your session has expired. Please log in again."
                    );
                } else if (err.response?.status === 400) {
                    setPasswordError(
                        err.response?.data?.message ||
                            "Please check your password details."
                    );
                } else {
                    setPasswordError(
                        err.response?.data?.message ||
                            "Unable to change password. Please try again."
                    );
                }
            } else {
                setPasswordError("Something went wrong. Please try again.");
            }
        } finally {
            setChangingPassword(false);
        }
    };

    const adminCount = users.filter((user) => user.role === "ADMIN").length;
    const analystCount = users.filter((user) => user.role === "ANALYST").length;
    const viewerCount = users.filter((user) => user.role === "VIEWER").length;

    const statistics = [
        { label: "Total Users", value: users.length, color: "#60a5fa" },
        { label: "Administrators", value: adminCount, color: "#c084fc" },
        { label: "Analysts", value: analystCount, color: "#34d399" },
        { label: "Viewers", value: viewerCount, color: "#fbbf24" },
    ];

    return (
        <AppLayout title="Settings">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Page heading */}
                <Box>
                    <Typography
                        component="h1"
                        variant="h5"
                        sx={{ color: "#f3f4f6", fontWeight: 700 }}
                    >
                        Settings
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#9ca3af", mt: 0.75 }}>
                        Manage your account security and platform users.
                    </Typography>
                </Box>

                {/* Settings navigation */}
                <Box
                    sx={{
                        borderBottom: "1px solid #263244",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 1,
                    }}
                >
                    <Tabs
                        value={activeTab}
                        onChange={(_, value: number) => setActiveTab(value)}
                        sx={{
                            minHeight: 46,
                            "& .MuiTab-root": {
                                minHeight: 46,
                                color: "#9ca3af",
                                textTransform: "none",
                                fontWeight: 600,
                                px: 2.5,
                            },
                            "& .Mui-selected": { color: "#60a5fa !important" },
                            "& .MuiTabs-indicator": {
                                backgroundColor: "#3b82f6",
                                height: 3,
                                borderRadius: "3px 3px 0 0",
                            },
                        }}
                    >
                        <Tab label="Security" />
                        <Tab label="User Management" />
                    </Tabs>
                    <Chip
                        size="small"
                        label={activeTab === 0 ? "Account settings" : `${users.length} registered users`}
                        sx={{
                            mb: 1,
                            color: "#93c5fd",
                            background: "#172554",
                            border: "1px solid #1e3a8a",
                            fontWeight: 600,
                        }}
                    />
                </Box>

                {/* Security tab */}
                {activeTab === 0 && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                        <Card sx={{ ...panelCardStyles, maxWidth: 900, width: "100%" }}>
                            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    sx={{ mb: 1, alignItems: "center" }}
                                >
                                    <Box
                                        sx={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: 2,
                                            display: "grid",
                                            placeItems: "center",
                                            background: "#172554",
                                            color: "#93c5fd",
                                            fontSize: 19,
                                            fontWeight: 700,
                                        }}
                                    >
                                        ✓
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ color: "#f3f4f6", fontWeight: 650 }}>
                                            Change Password
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                                            Update the password used to access your account.
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Divider sx={{ borderColor: "#263244", my: 2.5 }} />

                                {passwordSuccess && (
                                    <Alert
                                        severity="success"
                                        sx={{ mb: 2.5 }}
                                        onClose={() => setPasswordSuccess("")}
                                    >
                                        {passwordSuccess} Please sign in again with your new password if your session is invalidated.
                                    </Alert>
                                )}
                                {passwordError && (
                                    <Alert
                                        severity="error"
                                        sx={{ mb: 2.5 }}
                                        onClose={() => setPasswordError("")}
                                    >
                                        {passwordError}
                                    </Alert>
                                )}

                                <Box
                                    component="form"
                                    onSubmit={handleChangePassword}
                                    sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                                >
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                                            gap: 2.5,
                                        }}
                                    >
                                        <TextField
                                            label="Current Password"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            fullWidth
                                            required
                                            autoComplete="current-password"
                                            disabled={changingPassword}
                                            sx={passwordFieldStyles}
                                        />
                                        <TextField
                                            label="New Password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            fullWidth
                                            required
                                            autoComplete="new-password"
                                            disabled={changingPassword}
                                            helperText="Use at least 8 characters."
                                            sx={passwordFieldStyles}
                                        />
                                        <TextField
                                            label="Confirm New Password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            fullWidth
                                            required
                                            autoComplete="new-password"
                                            disabled={changingPassword}
                                            sx={passwordFieldStyles}
                                        />
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: { xs: "stretch", sm: "center" },
                                            justifyContent: "space-between",
                                            flexDirection: { xs: "column", sm: "row" },
                                            gap: 2,
                                            pt: 1,
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                                            Your new password must be different from your current password.
                                        </Typography>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={changingPassword}
                                            sx={{
                                                minWidth: 170,
                                                background: "#2563eb",
                                                color: "#fff",
                                                textTransform: "none",
                                                fontWeight: 650,
                                                px: 2.5,
                                                py: 1.1,
                                                "&:hover": { background: "#1d4ed8" },
                                            }}
                                        >
                                            {changingPassword ? (
                                                <CircularProgress size={21} color="inherit" />
                                            ) : (
                                                "Update Password"
                                            )}
                                        </Button>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        <Box
                            sx={{
                                maxWidth: 900,
                                width: "100%",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1.5,
                                p: 2,
                                border: "1px solid #263244",
                                borderRadius: 2,
                                background: "rgba(31, 41, 55, 0.45)",
                            }}
                        >
                            <Typography sx={{ color: "#60a5fa", fontWeight: 700 }}>i</Typography>
                            <Box>
                                <Typography variant="body2" sx={{ color: "#d1d5db", fontWeight: 600 }}>
                                    Account security
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                                    Never share your password. Choose a unique password that you do not use on other websites.
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* User management tab */}
                {activeTab === 1 && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                        {error && (
                            <Alert severity="error" onClose={() => setError("")}>
                                {error}
                            </Alert>
                        )}

                        <Box>
                            <Typography variant="h6" sx={{ color: "#f3f4f6", fontWeight: 650 }}>
                                User Overview
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#9ca3af", mt: 0.5 }}>
                                View registered accounts and their assigned access levels.
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                                gap: 2,
                            }}
                        >
                            {statistics.map((item) => (
                                <Card key={item.label} sx={panelCardStyles}>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                                            {item.label}
                                        </Typography>
                                        <Typography
                                            component="div"
                                            variant="h4"
                                            sx={{ color: item.color, mt: 1, fontWeight: 700 }}
                                        >
                                            {item.value}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>

                        <Card sx={panelCardStyles}>
                            <CardContent sx={{ p: 0 }}>
                                <Box
                                    sx={{
                                        p: { xs: 2, md: 2.5 },
                                        display: "flex",
                                        alignItems: { xs: "flex-start", sm: "center" },
                                        justifyContent: "space-between",
                                        flexDirection: { xs: "column", sm: "row" },
                                        gap: 1.5,
                                    }}
                                >
                                    <Box>
                                        <Typography variant="h6" sx={{ color: "#f3f4f6", fontWeight: 650 }}>
                                            Registered Users
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "#9ca3af", mt: 0.25 }}>
                                            Manage user roles and account access.
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={`${users.length} Users`}
                                        sx={{ color: "#93c5fd", background: "#172554", fontWeight: 600 }}
                                    />
                                </Box>
                                <Divider sx={{ borderColor: "#263244" }} />

                                {loading ? (
                                    <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <TableContainer sx={{ overflowX: "auto" }}>
                                        <Table sx={{ minWidth: 720 }}>
                                            <TableHead>
                                                <TableRow
                                                    sx={{
                                                        background: "#1f2937",
                                                        "& th": {
                                                            color: "#9ca3af",
                                                            fontWeight: 650,
                                                            borderColor: "#374151",
                                                            whiteSpace: "nowrap",
                                                        },
                                                    }}
                                                >
                                                    <TableCell>ID</TableCell>
                                                    <TableCell>Username</TableCell>
                                                    <TableCell>Role</TableCell>
                                                    <TableCell>Account Status</TableCell>
                                                    <TableCell>Created At</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {users.map((user) => (
                                                    <TableRow
                                                        key={user.id}
                                                        hover
                                                        sx={{
                                                            "& td": { color: "#d1d5db", borderColor: "#263244" },
                                                            "&:hover": { background: "#1f2937" },
                                                        }}
                                                    >
                                                        <TableCell sx={{ color: "#9ca3af !important" }}>
                                                            #{user.id}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ color: "#f3f4f6", fontWeight: 600 }}>
                                                                {user.username}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <FormControl size="small">
                                                                <Select
                                                                    value={user.role}
                                                                    disabled={updatingUser === user.id}
                                                                    onChange={(event) =>
                                                                        handleRoleChange(user.id, event.target.value)
                                                                    }
                                                                    sx={{
                                                                        minWidth: 125,
                                                                        color: "#e5e7eb",
                                                                        background: "#1f2937",
                                                                        ".MuiOutlinedInput-notchedOutline": {
                                                                            borderColor: "#374151",
                                                                        },
                                                                        "& .MuiSvgIcon-root": { color: "#9ca3af" },
                                                                    }}
                                                                >
                                                                    {roles.map((role) => (
                                                                        <MenuItem key={role} value={role}>
                                                                            {role}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                                <Switch
                                                                    checked={user.enabled}
                                                                    disabled={updatingUser === user.id}
                                                                    onChange={(event) =>
                                                                        handleStatusChange(user.id, event.target.checked)
                                                                    }
                                                                    color="success"
                                                                    size="small"
                                                                />
                                                                <Chip
                                                                    size="small"
                                                                    label={user.enabled ? "Active" : "Disabled"}
                                                                    color={user.enabled ? "success" : "error"}
                                                                    variant="outlined"
                                                                />
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(user.createdAt).toLocaleDateString("en-IN")}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {users.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={5} align="center" sx={{ py: 5, color: "#9ca3af" }}>
                                                            No users found.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </CardContent>
                        </Card>

                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                            Only administrators can manage user roles and account access.
                        </Typography>
                    </Box>
                )}
            </Box>
        </AppLayout>
    );
}
