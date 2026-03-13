import React from "react";
import { NavLink } from "react-router-dom";

const baseLinkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 14px",
  borderRadius: 14,
  textDecoration: "none",
  color: "var(--text)",
  fontWeight: 700,
};

export default function Sidebar() {
  return (
    <div
      style={{
        padding: 18,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div style={{ padding: "6px 6px 18px 6px" }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            background: "var(--primary)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
            marginBottom: 14,
          }}
        >
          S
        </div>

        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)" }}>
          Back Office
        </div>
        <div style={{ color: "var(--text-faint)", fontSize: 14, marginTop: 4 }}>
          Admin dashboard and operations
        </div>
      </div>

      <nav style={{ display: "grid", gap: 6 }}>
        {[
          ["/", "Overview"],
          ["/bookings", "Bookings"],
          ["/users", "Users"],
          ["/handymen", "Handymen"],
          ["/skills", "Skills Catalog"],
          ["/availability", "Availability"],
          ["/match-logs", "Match Logs"],
          ["/system/health", "System Health"],
        ].map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            style={({ isActive }) => ({
              ...baseLinkStyle,
              background: isActive ? "var(--primary-soft)" : "transparent",
              color: isActive ? "var(--primary)" : "var(--text)",
            })}
          >
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: "auto", padding: 6 }}>
        <div
          className="app-panel"
          style={{
            background: "var(--surface-muted)",
            padding: 14,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Environment</div>
          <div style={{ fontSize: 13, color: "var(--text-faint)", marginTop: 4 }}>
            Local development dashboard
          </div>
        </div>
      </div>
    </div>
  );
}