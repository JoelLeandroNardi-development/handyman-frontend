import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import { RequireAdmin } from "./auth/RequireAdmin";
import AdminLayout from "./layout/AdminLayout";
import OverviewPage from "./routes/OverviewPage";
import BookingsPage from "./routes/BookingsPage";
import SystemHealthPage from "./routes/SystemHealthPage";
import UsersPage from "./routes/UsersPage";
import HandymenPage from "./routes/HandymenPage";
import SkillsCatalogPage from "./routes/SkillsCatalogPage";
import AvailabilityPage from "./routes/AvailabilityPage";
import MatchLogsPage from "./routes/MatchLogsPage";
import { ThemeProvider } from "./theme";

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="handymen" element={<HandymenPage />} />
        <Route path="skills" element={<SkillsCatalogPage />} />
        <Route path="availability" element={<AvailabilityPage />} />
        <Route path="match-logs" element={<MatchLogsPage />} />
        <Route path="system/health" element={<SystemHealthPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}