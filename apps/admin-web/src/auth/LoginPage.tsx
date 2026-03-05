import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiClient, login } from "@smart/api";
import { decodeJwt } from "@smart/core";
import { API_BASE_URL, createApiClient } from "../lib/api";
import { storeToken } from "./session";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [status, setStatus] = useState<string>("Not logged in");
  const navigate = useNavigate();

  const api = useMemo(() => createApiClient(() => localStorage.getItem("token")), []);

  async function onLogin() {
    try {
      const res = await login(api as ApiClient, { email, password });
      storeToken(res.access_token);

      const claims = decodeJwt(res.access_token);
      if (!(claims.roles ?? []).includes("admin")) {
        setStatus(`Logged in, but NOT admin. roles=${JSON.stringify(claims.roles ?? [])}`);
        return;
      }

      setStatus("Logged in as admin.");
      navigate("/", { replace: true });
    } catch (e) {
      setStatus(`Login failed: ${(e as Error).message}`);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Admin</h1>
      <div style={{ opacity: 0.7, marginBottom: 16 }}>API: {API_BASE_URL}</div>

      <div style={{ display: "grid", gap: 10 }}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: 10 }} />
        </label>
        <label>
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            style={{ width: "100%", padding: 10 }}
          />
        </label>

        <button onClick={onLogin} style={{ padding: 12, cursor: "pointer" }}>
          Login
        </button>

        <div>{status}</div>
      </div>
    </div>
  );
}