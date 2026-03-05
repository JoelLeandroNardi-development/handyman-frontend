import React from "react";
import { NavLink } from "react-router-dom";

const linkStyle: React.CSSProperties = {
  display: "block",
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: "inherit"
};

export default function Sidebar() {
  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 12 }}>Back Office</div>

      <nav style={{ display: "grid", gap: 6 }}>
        <NavLink to="/" style={({ isActive }) => ({ ...linkStyle, background: isActive ? "#eef2ff" : "transparent" })}>
          Overview
        </NavLink>
        <NavLink
          to="/bookings"
          style={({ isActive }) => ({ ...linkStyle, background: isActive ? "#eef2ff" : "transparent" })}
        >
          Bookings
        </NavLink>
        <NavLink
          to="/system/health"
          style={({ isActive }) => ({ ...linkStyle, background: isActive ? "#eef2ff" : "transparent" })}
        >
          System Health
        </NavLink>
      </nav>
    </div>
  );
}