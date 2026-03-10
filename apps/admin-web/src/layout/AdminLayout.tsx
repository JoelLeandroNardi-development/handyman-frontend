import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { clearToken, getSession } from "../auth/session";

export default function AdminLayout() {
  const navigate = useNavigate();
  const session = getSession();

  function logout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px minmax(0, 1fr)",
        minHeight: "100vh",
        background: "#f3f5f9",
      }}
    >
      <aside
        style={{
          background: "#ffffff",
          borderRight: "1px solid #e2e8f0",
        }}
      >
        <Sidebar />
      </aside>

      <main style={{ minWidth: 0 }}>
        <header
          style={{
            height: 76,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 28px",
            borderBottom: "1px solid #e2e8f0",
            background: "rgba(255,255,255,0.86)",
            backdropFilter: "blur(8px)",
            position: "sticky",
            top: 0,
            zIndex: 5,
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Admin Console
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
              Operational control center
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 999,
                padding: "8px 12px",
                color: "#475569",
                fontSize: 14,
              }}
            >
              {session?.claims?.email ?? session?.claims?.sub ?? ""}
            </div>

            <button
              onClick={logout}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                background: "#0f172a",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <div style={{ padding: 28 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}