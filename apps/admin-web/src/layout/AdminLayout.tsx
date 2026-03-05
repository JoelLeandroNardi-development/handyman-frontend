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
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh", background: "#f6f7fb" }}>
      <aside style={{ background: "#fff", borderRight: "1px solid #e6e8ef" }}>
        <Sidebar />
      </aside>

      <main>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 18px",
            borderBottom: "1px solid #e6e8ef",
            background: "#fff"
          }}
        >
          <div style={{ fontWeight: 600 }}>Admin Console</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ opacity: 0.75 }}>{session?.claims?.email ?? session?.claims?.sub ?? ""}</div>
            <button onClick={logout} style={{ padding: "8px 10px", cursor: "pointer" }}>
              Logout
            </button>
          </div>
        </header>

        <div style={{ padding: 18 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}