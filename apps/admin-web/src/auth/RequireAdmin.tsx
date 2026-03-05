import React from "react";
import { Navigate } from "react-router-dom";
import { getSession } from "./session";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  if (!session.isAdmin) return <div style={{ padding: 24 }}>Unauthorized (not admin).</div>;
  return <>{children}</>;
}