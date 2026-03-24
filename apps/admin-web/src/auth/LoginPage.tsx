import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiClient, login } from "@smart/api";
import { decodeJwt } from "@smart/core";
import { useAdminApiClient, API_BASE_URL } from "../lib/api";
import { storeToken } from "./session";

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background:
      "radial-gradient(circle at top, color-mix(in srgb, var(--primary) 14%, transparent), transparent 30%), var(--bg)",
  } as const,
  card: {
    width: "100%",
    maxWidth: 460,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 24,
    boxShadow: "var(--shadow-md)",
    padding: 28,
  } as const,
};

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [status, setStatus] = useState<string>("");

  const navigate = useNavigate();
  const api = useAdminApiClient();

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
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ marginBottom: 22 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              marginBottom: 14,
              overflow: "hidden",
              border: "1px solid var(--border)",
              background: "var(--surface-muted, var(--surface))",
            }}
          >
            <img
              src="/logo.png"
              alt="NearHand logo"
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: 1.1,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--text)",
            }}
          >
            Admin
          </h1>

          <div style={{ marginTop: 8, color: "var(--text-soft)", fontSize: 14 }}>
            Sign in to the NearHand back office.
          </div>

          <div style={{ marginTop: 8, color: "var(--text-faint)", fontSize: 13 }}>
            API: {API_BASE_URL}
          </div>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <label className="app-label">
            <span>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </label>

          <label className="app-label">
            <span>Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </label>

          <button onClick={onLogin} className="app-button app-button-primary" style={{ marginTop: 4 }}>
            Login
          </button>

          <div
            style={{
              minHeight: 22,
              fontSize: 13,
              color: status.startsWith("Login failed") ? "var(--danger)" : "var(--text-soft)",
            }}
          >
            {status}
          </div>
        </div>
      </div>
    </div>
  );
}