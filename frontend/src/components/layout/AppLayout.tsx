
import { useState, type ReactNode } from "react";
import {
    AppBar,
    Box,
    Button,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import DashboardIcon from "@mui/icons-material/Dashboard";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import StorageIcon from "@mui/icons-material/Storage";
import InputIcon from "@mui/icons-material/Input";
import SecurityIcon from "@mui/icons-material/Security";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";

import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import ShieldIcon from "@mui/icons-material/Shield";
import CircleIcon from "@mui/icons-material/Circle";

import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const drawerWidth = 260;

interface Props {
    children: ReactNode;
    title: string;
}

const navItems = [
    {
        title: "Dashboard",
        path: "/dashboard",
        icon: <DashboardIcon />,
        color: "#38bdf8",
    },
    {
        title: "Alerts",
        path: "/alerts",
        icon: <WarningAmberIcon />,
        color: "#fb7185",
    },
    {
        title: "Events",
        path: "/events",
        icon: <StorageIcon />,
        color: "#34d399",
    },
    {
        title: "Log Ingestion",
        path: "/log-ingestion",
        icon: <InputIcon />,
        color: "#22d3ee",
    },
    {
        title: "URL Scanner",
        path: "/url-scanner",
        icon: <TravelExploreIcon />,
        color: "#a78bfa",
    },
    {
        title: "Threat Intelligence",
        path: "/iocs",
        icon: <SecurityIcon />,
        color: "#fbbf24",
    },
    {
        title: "Incidents",
        path: "/incidents",
        icon: <ReportProblemIcon />,
        color: "#f97373",
    },
    {
        title: "Audit Logs",
        path: "/audit",
        icon: <HistoryIcon />,
        color: "#c084fc",
    },
    {
        title: "Settings",
        path: "/settings",
        icon: <SettingsIcon />,
        color: "#facc15",
    },
];

export default function AppLayout({ children, title }: Props) {
    const { logoutUser } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [mobileOpen, setMobileOpen] = useState(false);

    const closeMobileDrawer = () => {
        setMobileOpen(false);
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const sidebarContent = (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: "#090f1c",
                color: "#e2e8f0",
            }}
        >
            {/* BRAND */}
            <Box
                sx={{
                    px: 2.5,
                    py: 3,
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
                        bgcolor: "rgba(34,211,238,0.12)",
                        border: "1px solid rgba(34,211,238,0.3)",
                    }}
                >
                    <ShieldIcon sx={{ color: "#22d3ee", fontSize: 26 }} />
                </Box>

                <Box>
                    <Typography
                        sx={{
                            fontSize: 17,
                            fontWeight: 900,
                            letterSpacing: 1.5,
                            color: "#f8fafc",
                        }}
                    >
                        SIEM-LITE
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: 10,
                            letterSpacing: 2,
                            color: "#64748b",
                            fontWeight: 700,
                        }}
                    >
                        SECURITY CONSOLE
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ borderColor: "#1e293b" }} />

            {/* SYSTEM STATUS */}
            <Box
                sx={{
                    mx: 2,
                    mt: 2.5,
                    mb: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "rgba(16,185,129,0.07)",
                    border: "1px solid rgba(16,185,129,0.18)",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircleIcon
                        sx={{
                            fontSize: 9,
                            color: "#34d399",
                        }}
                    />

                    <Typography
                        sx={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: "#34d399",
                            letterSpacing: 1,
                        }}
                    >
                        SOC CONSOLE
                    </Typography>
                </Box>

                <Typography
                    sx={{
                        fontSize: 11,
                        color: "#94a3b8",
                        mt: 0.7,
                    }}
                >
                    Security monitoring workspace
                </Typography>
            </Box>

            {/* NAVIGATION */}
            <Box sx={{ px: 2, mb: 1 }}>
                <Typography
                    sx={{
                        color: "#64748b",
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 1.8,
                    }}
                >
                    WORKSPACE
                </Typography>
            </Box>

            <List sx={{ px: 1.5, py: 0, flexGrow: 1 }}>
                {navItems.map((item) => {
                    const active = isActive(item.path);

                    return (
                        <ListItemButton
                            key={item.path}
                            component={Link}
                            to={item.path}
                            selected={active}
                            onClick={closeMobileDrawer}
                            sx={{
                                mb: 0.7,
                                minHeight: 46,
                                borderRadius: 2,
                                border: "1px solid transparent",
                                color: active ? "#f8fafc" : "#94a3b8",
                                transition: "all 0.2s ease",

                                "&:hover": {
                                    bgcolor: "rgba(148,163,184,0.08)",
                                    color: "#f8fafc",
                                },

                                "&.Mui-selected": {
                                    bgcolor: "rgba(34,211,238,0.10)",
                                    borderColor: "rgba(34,211,238,0.22)",
                                    color: "#67e8f9",
                                },

                                "&.Mui-selected:hover": {
                                    bgcolor: "rgba(34,211,238,0.15)",
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 38,
                                    color: active ? "#22d3ee" : item.color,
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>

                            <ListItemText
                                primary={item.title}
                                sx={{
                                    "& .MuiListItemText-primary": {
                                        fontSize: 13,
                                        fontWeight: active ? 700 : 500,
                                    },
                                }}
                            />

                            {active && (
                                <Box
                                    sx={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: "50%",
                                        bgcolor: "#22d3ee",
                                        boxShadow: "0 0 10px #22d3ee",
                                    }}
                                />
                            )}
                        </ListItemButton>
                    );
                })}
            </List>

            {/* FOOTER */}
            <Divider sx={{ borderColor: "#1e293b" }} />

            <Box sx={{ p: 2 }}>
                <Typography
                    sx={{
                        fontSize: 10,
                        color: "#64748b",
                        textAlign: "center",
                    }}
                >
                    SIEM-Lite Security Platform
                </Typography>

                <Typography
                    sx={{
                        fontSize: 10,
                        color: "#475569",
                        textAlign: "center",
                        mt: 0.5,
                    }}
                >
                    SOC Workspace
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Box
            sx={{
                display: "flex",
                minHeight: "100vh",
                width: "100%",
                bgcolor: "#070d18",
                color: "#e2e8f0",
            }}
        >
            <CssBaseline />

            {/* TOP HEADER */}
            
<AppBar
    position="fixed"
    elevation={0}
    sx={{
        width: isMobile
            ? "100%"
            : `calc(100% - ${drawerWidth}px)`,
        ml: isMobile ? 0 : `${drawerWidth}px`,
        zIndex: theme.zIndex.drawer - 1,
        bgcolor: "rgba(7,13,24,0.98)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid #1e293b",
        transition: theme.transitions.create(
            ["width", "margin"],
            {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }
        ),
    }}
>
    <Toolbar sx={{ minHeight: "72px !important", gap: 1.5 }}>

        {isMobile && (
            <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{ color: "#cbd5e1" }}
            >
                <MenuIcon />
            </IconButton>
        )}

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
                noWrap
                sx={{
                    fontSize: { xs: 15, md: 19 },
                    fontWeight: 800,
                    color: "#f8fafc",
                }}
            >
                {title}
            </Typography>

            <Typography
                sx={{
                    fontSize: 10,
                    color: "#64748b",
                    letterSpacing: 1.2,
                    display: { xs: "none", sm: "block" },
                }}
            >
                SECURITY OPERATIONS CENTER
            </Typography>
        </Box>

        <Box
            sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 0.7,
            }}
        >
            <CircleIcon sx={{ fontSize: 9, color: "#34d399" }} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#34d399" }}>
                ONLINE
            </Typography>
        </Box>

        <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
                display: { xs: "none", md: "inline-flex" },
                color: "#94a3b8",
                textTransform: "none",
                fontSize: 12,
            }}
        >
            Back
        </Button>

        <Button
            startIcon={<HomeIcon />}
            component={Link}
            to="/dashboard"
            sx={{
                display: { xs: "none", sm: "inline-flex" },
                color: "#94a3b8",
                textTransform: "none",
                fontSize: 12,
            }}
        >
            Home
        </Button>

        <Button
            startIcon={<LogoutIcon />}
            onClick={logoutUser}
            sx={{
                color: "#fb7185",
                textTransform: "none",
                fontWeight: 700,
                fontSize: 12,
                minWidth: "auto",
                "&:hover": {
                    bgcolor: "rgba(251,113,133,0.1)",
                },
            }}
        >
            Logout
        </Button>
    </Toolbar>
</AppBar>

            {/* DESKTOP SIDEBAR */}
            {!isMobile && (
                <Drawer
                    variant="permanent"
                    sx={{
    width: drawerWidth,
    flexShrink: 0,
    zIndex: theme.zIndex.drawer,

    "& .MuiDrawer-paper": {
        width: drawerWidth,
        boxSizing: "border-box",
        borderRight: "1px solid #1e293b",
        bgcolor: "#090f1c",
    },
}}
                >
                    
                    {sidebarContent}
                </Drawer>
            )}

            {/* MOBILE SIDEBAR */}
            {isMobile && (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={closeMobileDrawer}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        "& .MuiDrawer-paper": {
                            width: drawerWidth,
                            boxSizing: "border-box",
                            borderRight: "1px solid #1e293b",
                            bgcolor: "#090f1c",
                        },
                    }}
                >
                    <Toolbar />
                    {sidebarContent}
                </Drawer>
            )}

            {/* MAIN CONTENT */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: isMobile
                        ? "100%"
                        : `calc(100% - ${drawerWidth}px)`,
                    minWidth: 0,
                    minHeight: "100vh",
                    bgcolor: "#070d18",
                    color: "#e2e8f0",
                    overflowX: "hidden",
                }}
            >
                <Toolbar />

                <Box
                    sx={{
                        p: {
                            xs: 2,
                            sm: 3,
                            md: 4,
                        },
                        maxWidth: 1800,
                        mx: "auto",
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
