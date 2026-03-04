import React, { useMemo, useState } from "react";
import { ApiClient, login } from "@smart/api";
import { decodeJwt } from "@smart/core";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export default function App() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [status, setStatus] = useState<string>("Not logged in");

  const api = useMemo(() => {
    return new ApiClient(API_BASE_URL, () => localStorage.getItem("token"));
  }, []);

  async function onLogin() {
    try {
      const res = await login(api, { email, password });
      localStorage.setItem("token", res.access_token);

      const claims = decodeJwt(res.access_token);
      if (!(claims.roles ?? []).includes("admin")) {
        setStatus(`Logged in, but NOT admin. roles=${JSON.stringify(claims.roles ?? [])}`);
        return;
      }
      setStatus(`Logged in as admin. roles=${JSON.stringify(claims.roles ?? [])}`);
    } catch (e) {
      setStatus(`Login failed: ${(e as Error).message}`);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 480 }}>
      <h1>Admin Web</h1>
      <p style={{ opacity: 0.7 }}>API: {API_BASE_URL}</p>

      <div style={{ display: "grid", gap: 8 }}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: 8 }} />
        </label>
        <label>
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <button onClick={onLogin} style={{ padding: 10 }}>
          Login
        </button>

        <div>{status}</div>
      </div>
    </div>
  );
}