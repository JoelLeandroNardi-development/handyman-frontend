import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  adminListAllAvailability,
  clearAvailability,
  getAvailability,
  setAvailability,
  type AvailabilitySlot,
} from "@smart/api";
import { useAdminApiClient, useActionBusy } from "../lib/api";
import { formatDateTime, safeJsonParse } from "../lib/adminFormat";
import Card from "../ui/Card";
import Page from "../ui/Page";

function normalizeAvailabilityResponse(data: unknown): { email: string; slots: AvailabilitySlot[] }[] {
  if (Array.isArray(data)) {
    return data as { email: string; slots: AvailabilitySlot[] }[];
  }

  if (data && typeof data === "object") {
    const obj = data as { items?: unknown; results?: unknown };
    if (Array.isArray(obj.items)) return obj.items as { email: string; slots: AvailabilitySlot[] }[];
    if (Array.isArray(obj.results)) return obj.results as { email: string; slots: AvailabilitySlot[] }[];
  }

  return [];
}

export default function AvailabilityPage() {
  const api = useAdminApiClient();
  const [email, setEmail] = useState("");
  const [slotsJson, setSlotsJson] = useState(JSON.stringify({ slots: [] }, null, 2));
  const { busy, is, run } = useActionBusy();

  const listQ = useQuery({
    queryKey: ["admin-availability"],
    queryFn: () => adminListAllAvailability(api, { limit: 200, cursor: 0 }),
  });

  const rows = normalizeAvailabilityResponse(listQ.data);

  async function loadByEmail() {
    if (!email.trim()) return;
    await run("load", async () => {
      const res = await getAvailability(api, email.trim());
      setSlotsJson(JSON.stringify(res, null, 2));
    });
  }

  async function saveByEmail() {
    if (!email.trim()) return;
    await run("save", async () => {
      const parsed = safeJsonParse<{ slots: AvailabilitySlot[] }>(slotsJson);
      await setAvailability(api, email.trim(), parsed);
      await listQ.refetch();
    });
  }

  async function clearByEmail() {
    if (!email.trim()) return;
    const ok = window.confirm(`Clear availability for ${email}?`);
    if (!ok) return;
    await run("clear", async () => {
      await clearAvailability(api, email.trim());
      setSlotsJson(JSON.stringify({ slots: [] }, null, 2));
      await listQ.refetch();
    });
  }

  return (
    <Page title="Availability" subtitle="Inspect, set, and clear handyman availability by email">
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "0.9fr 1.1fr",
        }}
      >
        <Card title="Availability actions">
          <div style={{ display: "grid", gap: 12 }}>
            <label className="app-label">
              <span>Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="handyman@example.com"
              />
            </label>

            <label className="app-label">
              <span>Availability JSON</span>
              <textarea
                value={slotsJson}
                onChange={(e) => setSlotsJson(e.target.value)}
                rows={16}
                style={{ resize: "vertical" }}
              />
            </label>

            <div
              style={{
                display: "grid",
                gap: 10,
                gridTemplateColumns: "1fr 1fr 1fr",
              }}
            >
              <button
                onClick={loadByEmail}
                disabled={busy}
                className="app-button app-button-primary"
              >
                {is("load") ? "Loading…" : "Load"}
              </button>

              <button
                onClick={saveByEmail}
                disabled={busy}
                className="app-button app-button-success"
              >
                {is("save") ? "Saving…" : "Save"}
              </button>

              <button
                onClick={clearByEmail}
                disabled={busy}
                className="app-button app-button-danger"
              >
                {is("clear") ? "Clearing…" : "Clear"}
              </button>
            </div>
          </div>
        </Card>

        <Card title="All availability" right={listQ.isFetching ? "Refreshing…" : `${rows.length} row(s)`}>
          <div style={{ display: "grid", gap: 10 }}>
            {rows.length ? (
              rows.map((row) => (
                <div
                  key={row.email}
                  className="app-panel"
                  style={{
                    padding: 14,
                    background: "var(--surface)",
                  }}
                >
                  <div style={{ fontWeight: 800, color: "var(--text)" }}>{row.email}</div>

                  <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                    {(row.slots ?? []).map((slot, index) => (
                      <div key={`${row.email}-${index}`} style={{ color: "var(--text-soft)", fontSize: 14 }}>
                        {formatDateTime(slot.start)} → {formatDateTime(slot.end)}
                      </div>
                    ))}

                    {!row.slots?.length ? (
                      <div style={{ color: "var(--text-faint)" }}>No slots</div>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "var(--text-faint)" }}>No availability data returned.</div>
            )}
          </div>
        </Card>
      </div>
    </Page>
  );
}