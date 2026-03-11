import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { clearToken, getSession } from "../auth/session";
import { useTheme } from "../theme";

export default function AdminLayout() {
  const navigate = useNavigate();
  const session = getSession();
  const { mode, toggle } = useTheme();

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
        background: "var(--bg)",
      }}
    >
      <aside
        style={{
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
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
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
            position: "sticky",
            top: 0,
            zIndex: 5,
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)" }}>
              Admin Console
            </div>
            <div style={{ fontSize: 13, color: "var(--text-faint)", marginTop: 2 }}>
              Operational control center
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={toggle} className="app-button app-button-secondary" style={{ borderRadius: 999 }}>
              {mode === "light" ? "Dark Mode" : "Light Mode"}
            </button>

            <div
              className="app-chip"
              style={{
                background: "var(--surface)",
              }}
            >
              {session?.claims?.email ?? session?.claims?.sub ?? ""}
            </div>

            <button onClick={logout} className="app-button app-button-primary">
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