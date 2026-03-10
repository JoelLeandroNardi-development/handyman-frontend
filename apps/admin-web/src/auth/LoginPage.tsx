import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiClient, login } from "@smart/api";
import { decodeJwt } from "@smart/core";
import { API_BASE_URL, createApiClient } from "../lib/api";
import { storeToken } from "./session";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [status, setStatus] = useState<string>("");

  const navigate = useNavigate();
  const api = useMemo(() => createApiClient(() => localStorage.getItem("token")), []);

  async function onLogin() {
    setStatus("Signing in…");

    try {
      const res = await login(api as ApiClient, { email, password });
      storeToken(res.access_token);

      const claims = decodeJwt(res.access_token);
      if (!(claims.roles ?? []).includes("admin")) {
        setStatus(`Logged in, but not admin. roles=${JSON.stringify(claims.roles ?? [])}`);
        return;
      }

      setStatus("Logged in as admin.");
      navigate("/", { replace: true });
    } catch (e) {
      setStatus(`Login failed: ${(e as Error).message}`);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(circle at top, rgba(37,99,235,0.08), transparent 30%), #f3f5f9",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 24,
          boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
          padding: 28,
        }}
      >
        <div style={{ marginBottom: 22 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "#2563eb",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              marginBottom: 14,
            }}
          >
            S
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: 1.1,
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            Admin
          </h1>

          <div style={{ marginTop: 8, color: "#64748b", fontSize: 14 }}>
            Sign in to the Smart back office.
          </div>

          <div style={{ marginTop: 8, color: "#94a3b8", fontSize: 13 }}>
            API: {API_BASE_URL}
          </div>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </label>

          <button
            onClick={onLogin}
            style={{
              marginTop: 4,
              padding: "12px 14px",
              borderRadius: 12,
              background: "#2563eb",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(37,99,235,0.18)",
            }}
          >
            Login
          </button>

          <div
            style={{
              minHeight: 22,
              fontSize: 13,
              color: status.startsWith("Login failed") ? "#dc2626" : "#475569",
            }}
          >
            {status}
          </div>
        </div>
      </div>
    </div>
  );
}