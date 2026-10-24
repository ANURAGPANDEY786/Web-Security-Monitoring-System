import { Navigate, Route, Routes } from "react-router-dom";
import UrlScannerPage from "./pages/UrlScannerPage";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import AlertsPage from "./pages/AlertsPage";
import EventsPage from "./pages/EventsPage";
import IocsPage from "./pages/IocsPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import SettingsPage from "./pages/SettingsPage";
import IncidentsPage from "./pages/IncidentsPage";
import LogIngestionPage from "./pages/LogIngestionPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/alerts"
                element={
                    <ProtectedRoute>
                        <AlertsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/events"
                element={
                    <ProtectedRoute>
                        <EventsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/log-ingestion"
                element={
                    <ProtectedRoute>
                        <LogIngestionPage />
                    </ProtectedRoute>
                }
            />
             <Route
    path="/url-scanner"
    element={
        <ProtectedRoute>
            <UrlScannerPage />
        </ProtectedRoute>
    }
/>

            <Route
                path="/iocs"
                element={
                    <ProtectedRoute>
                        <IocsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/incidents"
                element={
                    <ProtectedRoute>
                        <IncidentsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/audit"
                element={
                    <ProtectedRoute>
                        <AuditLogsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <SettingsPage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}