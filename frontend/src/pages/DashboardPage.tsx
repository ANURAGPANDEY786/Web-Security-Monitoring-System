import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    LinearProgress,
    Stack,
    Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import StorageIcon from "@mui/icons-material/Storage";
import LoginIcon from "@mui/icons-material/Login";
import RadarIcon from "@mui/icons-material/Radar";
import SecurityIcon from "@mui/icons-material/Security";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShieldIcon from "@mui/icons-material/Shield";
import TimelineIcon from "@mui/icons-material/Timeline";

import AppLayout from "../components/layout/AppLayout";
import CyberThreatGlobe from "../components/dashboard/CyberThreatGlobe";

import {
    getDashboardSummary,
    getDashboardTrends,
    getDashboardTimeline,
    getTopAlertTypes,
    getTopSourceIps,
    getTopUsernames,
    getRiskDistribution,
    getMitreStatistics,
    getIocStatistics,
} from "../services/dashboard";

import type {
    DashboardSummary,
    DashboardTimelinePoint,
    DashboardTrends,
    IocStatistics,
    MitreStatistic,
    RiskDistribution,
    TopAlertType,
    TopSourceIp,
    TopUsername,
} from "../types/dashboard";

const colors = {
    background: "#070d18",
    card: "#0b1423",
    cardLight: "#101c2e",
    border: "#1e293b",
    text: "#e2e8f0",
    muted: "#94a3b8",
    cyan: "#22d3ee",
    red: "#fb7185",
    orange: "#fb923c",
    yellow: "#fbbf24",
    green: "#34d399",
    purple: "#a78bfa",
};

export default function DashboardPage() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [trends, setTrends] = useState<DashboardTrends | null>(null);
    const [timeline, setTimeline] = useState<DashboardTimelinePoint[]>([]);
    const [topAlertTypes, setTopAlertTypes] = useState<TopAlertType[]>([]);
    const [topSourceIps, setTopSourceIps] = useState<TopSourceIp[]>([]);
    const [topUsernames, setTopUsernames] = useState<TopUsername[]>([]);
    const [riskDistribution, setRiskDistribution] = useState<RiskDistribution | null>(null);
    const [mitreStats, setMitreStats] = useState<MitreStatistic[]>([]);
    const [iocStats, setIocStats] = useState<IocStatistics | null>(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchDashboardData = useCallback(async () => {
        const [
            summaryData,
            trendsData,
            timelineData,
            alertTypesData,
            sourceIpsData,
            usernamesData,
            riskData,
            mitreData,
            iocData,
        ] = await Promise.all([
            getDashboardSummary(),
            getDashboardTrends(),
            getDashboardTimeline(7),
            getTopAlertTypes(),
            getTopSourceIps(),
            getTopUsernames(),
            getRiskDistribution(),
            getMitreStatistics(),
            getIocStatistics(),
        ]);

        return {
            summary: summaryData,
            trends: trendsData,
            timeline: timelineData,
            alertTypes: alertTypesData,
            sourceIps: sourceIpsData,
            usernames: usernamesData,
            risk: riskData,
            mitre: mitreData,
            ioc: iocData,
        };
    }, []);

    const applyDashboardData = useCallback((data: Awaited<ReturnType<typeof fetchDashboardData>>) => {
        setSummary(data.summary);
        setTrends(data.trends);
        setTimeline(data.timeline);
        setTopAlertTypes(data.alertTypes);
        setTopSourceIps(data.sourceIps);
        setTopUsernames(data.usernames);
        setRiskDistribution(data.risk);
        setMitreStats(data.mitre);
        setIocStats(data.ioc);
        setError("");
    }, []);

    const loadDashboard = useCallback(async (manualRefresh = false) => {
        if (manualRefresh) {
            setRefreshing(true);
        }

        try {
            const data = await fetchDashboardData();
            applyDashboardData(data);
        } catch (err) {
            console.error("Dashboard error:", err);
            setError("Unable to load dashboard metrics. Please check your backend connection.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [applyDashboardData, fetchDashboardData]);

    useEffect(() => {
        let active = true;

        fetchDashboardData()
            .then((data) => {
                if (active) {
                    applyDashboardData(data);
                }
            })
            .catch((err: unknown) => {
                if (active) {
                    console.error("Dashboard error:", err);
                    setError("Unable to load dashboard metrics. Please check your backend connection.");
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
    }, [applyDashboardData, fetchDashboardData]);


const totalAlerts = summary?.totalAlerts ?? 0;
const totalEvents = summary?.totalEvents ?? 0;

const metricCards = summary
    ? [
        {
            title: "Total Alerts",
            value: totalAlerts,
            progress: Math.min(100, (totalAlerts / 100) * 100),
            icon: <WarningAmberIcon />,
            color: colors.cyan,
        },
        {
            title: "Critical Alerts",
            value: summary.criticalAlerts,
            progress: totalAlerts > 0
                ? Math.min(100, (summary.criticalAlerts / totalAlerts) * 100)
                : 0,
            icon: <ErrorOutlineIcon />,
            color: colors.red,
        },
        {
            title: "High Alerts",
            value: summary.highAlerts,
            progress: totalAlerts > 0
                ? Math.min(100, (summary.highAlerts / totalAlerts) * 100)
                : 0,
            icon: <ShieldIcon />,
            color: colors.orange,
        },
        {
            title: "Total Events",
            value: totalEvents,
            progress: Math.min(100, (totalEvents / 1000) * 100),
            icon: <StorageIcon />,
            color: colors.purple,
        },
        {
            title: "Failed Logins",
            value: summary.failedLogins,
            progress: totalEvents > 0
                ? Math.min(100, (summary.failedLogins / totalEvents) * 100)
                : 0,
            icon: <LoginIcon />,
            color: colors.red,
        },
        {
            title: "Port Scans",
            value: summary.portScans,
            progress: totalEvents > 0
                ? Math.min(100, (summary.portScans / totalEvents) * 100)
                : 0,
            icon: <RadarIcon />,
            color: colors.yellow,
        },
        {
            title: "Privilege Escalations",
            value: summary.privilegeEscalations,
            progress: totalEvents > 0
                ? Math.min(100, (summary.privilegeEscalations / totalEvents) * 100)
                : 0,
            icon: <SecurityIcon />,
            color: colors.orange,
        },
        {
            title: "Highest Risk Score",
            value: summary.highestRiskScore,
            progress: Math.min(100, Math.max(0, summary.highestRiskScore)),
            icon: <TrendingUpIcon />,
            color: colors.green,
        },
    ]
    : [];

    return (
        <AppLayout title="Security Operations Dashboard">

            <Stack spacing={3}>

                {/* PAGE INTRO */}
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
                        <Typography
                            sx={{
                                color: colors.muted,
                                fontSize: 13,
                                mb: 0.7,
                            }}
                        >
                            SECURITY OVERVIEW / SOC MONITORING
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: { xs: 22, md: 28 },
                                fontWeight: 800,
                                color: "#f8fafc",
                            }}
                        >
                            Security Overview
                        </Typography>

                        <Typography
                            sx={{
                                color: colors.muted,
                                fontSize: 13,
                                mt: 0.7,
                            }}
                        >
                            Monitor threats, security events and system risk.
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={
                            refreshing
                                ? <CircularProgress size={15} />
                                : <RefreshIcon />
                        }
                        onClick={() => loadDashboard(true)}
                        disabled={loading || refreshing}
                        sx={{
                            color: colors.cyan,
                            borderColor: "#164e63",
                            px: 2,
                            py: 1,
                            "&:hover": {
                                borderColor: colors.cyan,
                                bgcolor: "rgba(34,211,238,0.08)",
                            },
                        }}
                    >
                        Refresh Data
                    </Button>
                </Box>

                {/* ERROR */}
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            bgcolor: "#2a1420",
                            color: "#fecdd3",
                            border: "1px solid #7f1d3a",
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {/* LOADING */}
                {loading && (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 8,
                        }}
                    >
                        <CircularProgress sx={{ color: colors.cyan }} />
                    </Box>
                )}

                {/* DASHBOARD DATA */}
                {!loading && summary && (
                    <>
                        {/* METRIC CARDS */}
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "repeat(2, minmax(0, 1fr))",
                                    lg: "repeat(4, minmax(0, 1fr))",
                                },
                                gap: 2,
                            }}
                        >

{metricCards.map((metric) => (
    <MetricCard
        key={metric.title}
        title={metric.title}
        value={metric.value}
        icon={metric.icon}
        color={metric.color}
        progress={metric.progress}
    />
))}

                        </Box>



{/* 3D GLOBAL NETWORK + SOC SNAPSHOT */}
<Box
    sx={{
        display: "grid",
        gridTemplateColumns: {
            xs: "1fr",
            lg: "1.4fr 1fr",
        },
        gap: 2,
        alignItems: "start",
        minWidth: 0,
    }}
>
    {/* 3D Globe */}
    <Box
        sx={{
            width: "100%",
            minWidth: 0,
            height: { xs: 340, sm: 400, lg: 460 },
        }}
    >
        <CyberThreatGlobe />
    </Box>

    {/* SOC Snapshot */}
    <Section
        title="SOC Network Snapshot"
        subtitle="Current security metrics from your SIEM backend"
        icon={<SecurityIcon />}
    >
        <Stack spacing={2}>
            <TrendCard
                title="Total Security Events"
                value={summary.totalEvents}
                color={colors.cyan}
            />

            <TrendCard
                title="Total Security Alerts"
                value={summary.totalAlerts}
                color={colors.red}
            />

            <TrendCard
                title="Highest Risk Score"
                value={summary.highestRiskScore}
                color={colors.orange}
            />

            {/* Disclaimer */}
            <Box
                sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: colors.cardLight,
                    border: `1px solid ${colors.border}`,
                }}
            >
                <Typography
                    sx={{
                        fontSize: 11,
                        color: colors.muted,
                        lineHeight: 1.7,
                    }}
                >
                    The 3D globe is an illustrative network visualization.
                    Its nodes and connections are live attack locations
                    or geographically verified threat data.
                </Typography>
            </Box>
        </Stack>
    </Section>
</Box>


                        {/* TRENDS */}
                        {trends && (
                            <Section
                                title="Security Activity Trends"
                                subtitle="Alert and event activity over different time periods"
                                icon={<TimelineIcon />}
                            >
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: {
                                            xs: "1fr",
                                            sm: "repeat(2, minmax(0, 1fr))",
                                            lg: "repeat(3, minmax(0, 1fr))",
                                        },
                                        gap: 2,
                                    }}
                                >
                                    <TrendCard
                                        title="Alerts / 24 Hours"
                                        value={trends.alertsLast24Hours}
                                        color={colors.red}
                                    />
                                    <TrendCard
                                        title="Alerts / 7 Days"
                                        value={trends.alertsLast7Days}
                                        color={colors.orange}
                                    />
                                    <TrendCard
                                        title="Alerts / 30 Days"
                                        value={trends.alertsLast30Days}
                                        color={colors.yellow}
                                    />
                                    <TrendCard
                                        title="Events / 24 Hours"
                                        value={trends.eventsLast24Hours}
                                        color={colors.cyan}
                                    />
                                    <TrendCard
                                        title="Events / 7 Days"
                                        value={trends.eventsLast7Days}
                                        color={colors.green}
                                    />
                                    <TrendCard
                                        title="Events / 30 Days"
                                        value={trends.eventsLast30Days}
                                        color={colors.purple}
                                    />
                                </Box>
                            </Section>
                        )}

                        {/* TOP SECURITY ACTIVITY */}
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    lg: "repeat(2, minmax(0, 1fr))",
                                },
                                gap: 2,
                            }}
                        >
                            <ListCard
                                title="Top Alert Types"
                                subtitle="Most frequently detected alert categories"
                                items={topAlertTypes.map((item) => ({
                                    label: item.alertType,
                                    value: item.count,
                                }))}
                                color={colors.red}
                            />

                            <Section
    title="Top Source IPs"
    subtitle="Event volume by source IP address"
    icon={<RadarIcon />}
>
    {topSourceIps.length === 0 ? (
        <Typography sx={{ color: colors.muted, fontSize: 13 }}>
            No source IP data available.
        </Typography>
    ) : (
        <Box sx={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={topSourceIps}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 15, bottom: 5 }}
                >
                    <CartesianGrid
                        stroke="#1e293b"
                        strokeDasharray="3 3"
                        horizontal={false}
                    />
                    <XAxis
                        type="number"
                        stroke={colors.muted}
                        tick={{ fill: colors.muted, fontSize: 11 }}
                        allowDecimals={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="sourceIp"
                        width={115}
                        stroke={colors.muted}
                        tick={{ fill: colors.text, fontSize: 11 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: colors.cardLight,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 8,
                            color: colors.text,
                        }}
                        formatter={(value) => [value, "Events"]}
                    />
                    <Bar
                        dataKey="count"
                        name="Events"
                        fill={colors.cyan}
                        radius={[0, 5, 5, 0]}
                        barSize={18}
                    />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    )}
</Section>

                            <ListCard
                                title="Top Usernames"
                                subtitle="User accounts appearing in security events"
                                items={topUsernames.map((item) => ({
                                    label: item.username,
                                    value: item.count,
                                }))}
                                color={colors.orange}
                            />

                            <ListCard
                                title="MITRE ATT&CK Statistics"
                                subtitle="Observed technique activity"
                                items={mitreStats.map((item) => ({
                                    label: item.mitreTechnique,
                                    value: item.count,
                                }))}
                                color={colors.purple}
                            />
                        </Box>

                        {/* RISK DISTRIBUTION */}
                        {riskDistribution && (
                            <Section
                                title="Risk Distribution"
                                subtitle="Breakdown of alert severity"
                                icon={<ShieldIcon />}
                            >
                                <Stack spacing={2.5}>
                                    <RiskBar
                                        label="Critical"
                                        value={riskDistribution.critical}
                                        total={summary.totalAlerts}
                                        color={colors.red}
                                    />
                                    <RiskBar
                                        label="High"
                                        value={riskDistribution.high}
                                        total={summary.totalAlerts}
                                        color={colors.orange}
                                    />
                                    <RiskBar
                                        label="Medium"
                                        value={riskDistribution.medium}
                                        total={summary.totalAlerts}
                                        color={colors.yellow}
                                    />
                                    <RiskBar
                                        label="Low"
                                        value={riskDistribution.low}
                                        total={summary.totalAlerts}
                                        color={colors.green}
                                    />
                                </Stack>
                            </Section>
                        )}

                        {/* TIMELINE AND IOC */}
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    lg: "repeat(2, minmax(0, 1fr))",
                                },
                                gap: 2,
                            }}
                        >
                           <Section
    title="7-Day Security Activity"
    subtitle="Daily security events compared with alerts"
    icon={<TimelineIcon />}
>
    {timeline.length === 0 ? (
        <Typography sx={{ color: colors.muted, fontSize: 13 }}>
            No timeline data available.
        </Typography>
    ) : (
        <Box sx={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={timeline}
                    margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
                >
                    <CartesianGrid
                        stroke="#1e293b"
                        strokeDasharray="3 3"
                    />
                    <XAxis
                        dataKey="date"
                        stroke={colors.muted}
                        tick={{ fill: colors.muted, fontSize: 10 }}
                    />
                    <YAxis
                        stroke={colors.muted}
                        tick={{ fill: colors.muted, fontSize: 11 }}
                        allowDecimals={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: colors.cardLight,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 8,
                            color: colors.text,
                        }}
                    />
                    <Legend
                        wrapperStyle={{
                            fontSize: 12,
                            color: colors.muted,
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="events"
                        name="Security Events"
                        stroke={colors.cyan}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: colors.cyan }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="alerts"
                        name="Security Alerts"
                        stroke={colors.red}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: colors.red }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    )}
</Section>

                                

                            {iocStats && (
                                <Section
                                    title="IOC Intelligence"
                                    subtitle="Indicator of compromise overview"
                                    icon={<SecurityIcon />}
                                >
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                            gap: 2,
                                        }}
                                    >
                                        <TrendCard
                                            title="Total IOC Alerts"
                                            value={iocStats.totalIocAlerts}
                                            color={colors.red}
                                        />
                                        <TrendCard
                                            title="Enabled IOCs"
                                            value={iocStats.enabledIocs}
                                            color={colors.green}
                                        />
                                        <TrendCard
                                            title="Disabled IOCs"
                                            value={iocStats.disabledIocs}
                                            color={colors.muted}
                                        />
                                    </Box>
                                </Section>
                            )}
                        </Box>
                    </>
                )}

                {!loading && !error && !summary && (
                    <Alert severity="info">
                        Dashboard summary is not available yet.
                    </Alert>
                )}

                {/* FOOTER */}
                <Box
                    sx={{
                        pt: 2,
                        borderTop: `1px solid ${colors.border}`,
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 1,
                    }}
                >
                    <Typography sx={{ color: "#64748b", fontSize: 11 }}>
                        SIEM-Lite Security Monitoring Platform
                    </Typography>

                    <Typography sx={{ color: "#64748b", fontSize: 11 }}>
                        SOC Dashboard
                    </Typography>
                </Box>

            </Stack>
        </AppLayout>
    );
}

/* METRIC CARD */


function MetricCard({
    title,
    value,
    icon,
    color,
    progress,
}: {
    title: string;
    value: number;
    icon: ReactNode;
    color: string;
    progress: number;
}) {
    const percentage = Math.round(progress);

    return (
        <Card
            elevation={0}
            sx={{
                bgcolor: colors.card,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: 3,
                position: "relative",
                overflow: "hidden",
                transition: "all 0.2s ease",
                "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: color,
                    boxShadow: `0 8px 30px ${color}12`,
                },
            }}
        >
            <CardContent sx={{ p: 2.5 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Typography sx={{ color: colors.muted, fontSize: 12 }}>
                        {title}
                    </Typography>

                    <Box
                        sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color,
                            bgcolor: `${color}15`,
                        }}
                    >
                        {icon}
                    </Box>
                </Box>

                <Typography
                    sx={{
                        fontSize: 29,
                        fontWeight: 800,
                        color: "#f8fafc",
                        letterSpacing: -0.8,
                    }}
                >
                    {value ?? 0}
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 2,
                        mb: 0.8,
                    }}
                >
                    <Typography sx={{ fontSize: 10, color: colors.muted }}>
                        Activity level
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: 11,
                            fontWeight: 800,
                            color,
                        }}
                    >
                        {percentage}%
                    </Typography>
                </Box>

                <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                        height: 5,
                        borderRadius: 10,
                        bgcolor: `${color}20`,
                        "& .MuiLinearProgress-bar": {
                            bgcolor: color,
                            borderRadius: 10,
                            transition: "transform 0.5s ease",
                        },
                    }}
                />
            </CardContent>
        </Card>
    );
}

/* SECTION */

function Section({
    title,
    subtitle,
    icon,
    children,
}: {
    title: string;
    subtitle: string;
    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <Card
            elevation={0}
            sx={{
                bgcolor: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: 3,
                color: colors.text,
            }}
        >
            <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 2.5 }}>
                    <Box
                        sx={{
                            color: colors.cyan,
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        {icon}
                    </Box>

                    <Box>
                        <Typography sx={{ fontWeight: 800, color: "#f8fafc" }}>
                            {title}
                        </Typography>

                        <Typography sx={{ color: colors.muted, fontSize: 11 }}>
                            {subtitle}
                        </Typography>
                    </Box>
                </Box>

                {children}
            </CardContent>
        </Card>
    );
}

/* TREND CARD */

function TrendCard({
    title,
    value,
    color,
}: {
    title: string;
    value: number;
    color: string;
}) {
    return (
        <Box
            sx={{
                p: 2,
                bgcolor: colors.cardLight,
                border: `1px solid ${colors.border}`,
                borderRadius: 2,
            }}
        >
            <Typography sx={{ fontSize: 11, color: colors.muted }}>
                {title}
            </Typography>

            <Typography
                sx={{
                    fontSize: 25,
                    fontWeight: 800,
                    color,
                    mt: 0.7,
                }}
            >
                {value ?? 0}
            </Typography>
        </Box>
    );
}

/* LIST CARD */

function ListCard({
    title,
    subtitle,
    items,
    color,
}: {
    title: string;
    subtitle: string;
    items: Array<{ label: string; value: string | number }>;
    color: string;
}) {
    return (
        <Section
            title={title}
            subtitle={subtitle}
            icon={<DashboardIcon />}
        >
            {items.length === 0 ? (
                <Typography sx={{ color: colors.muted, fontSize: 13 }}>
                    No data available.
                </Typography>
            ) : (
                <Stack spacing={1}>
                    {items.map((item, index) => (
                        <Box
                            key={`${item.label}-${index}`}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 2,
                                p: 1.5,
                                bgcolor: colors.cardLight,
                                border: `1px solid ${colors.border}`,
                                borderRadius: 2,
                            }}
                        >
                            <Box sx={{ display: "flex", gap: 1.5, minWidth: 0 }}>
                                <Typography
                                    sx={{
                                        color: "#475569",
                                        fontSize: 12,
                                        fontWeight: 700,
                                    }}
                                >
                                    {String(index + 1).padStart(2, "0")}
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        color: colors.text,
                                        overflowWrap: "anywhere",
                                    }}
                                >
                                    {item.label}
                                </Typography>
                            </Box>

                            <Typography
                                sx={{
                                    color,
                                    fontSize: 13,
                                    fontWeight: 800,
                                    flexShrink: 0,
                                }}
                            >
                                {item.value}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            )}
        </Section>
    );
}

/* RISK BAR */

function RiskBar({
    label,
    value,
    total,
    color,
}: {
    label: string;
    value: number;
    total: number;
    color: string;
}) {
    const percent =
        total > 0
            ? Math.min(100, Math.round((value / total) * 100))
            : 0;

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.8,
                }}
            >
                <Typography sx={{ color: colors.text, fontSize: 13 }}>
                    {label}
                </Typography>

                <Typography
                    sx={{
                        color: colors.muted,
                        fontSize: 12,
                        fontWeight: 700,
                    }}
                >
                    {value} / {percent}%
                </Typography>
            </Box>

            <LinearProgress
                variant="determinate"
                value={percent}
                sx={{
                    height: 9,
                    borderRadius: 10,
                    bgcolor: "#1e293b",
                    "& .MuiLinearProgress-bar": {
                        bgcolor: color,
                        borderRadius: 10,
                    },
                }}
            />
        </Box>
    );
}
