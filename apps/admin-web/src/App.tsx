import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import { RequireAdmin } from "./auth/RequireAdmin";
import AdminLayout from "./layout/AdminLayout";
import OverviewPage from "./routes/OverviewPage";
import BookingsPage from "./routes/BookingsPage";
import SystemHealthPage from "./routes/SystemHealthPage";

export default function App() {
  return (
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
        <Route path="system/health" element={<SystemHealthPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}