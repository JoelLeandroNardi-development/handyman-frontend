import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminDeleteMatchLog, adminListMatchLogs } from "@smart/api";
import { createApiClient } from "../lib/api";
import Card from "../ui/Card";
import Page from "../ui/Page";

type MatchLogRow = {
  id?: number;
  log_id?: number;
  skill?: string;
  latitude?: number;
  longitude?: number;
  desired_start?: string;
  desired_end?: string;
  created_at?: string;
  [key: string]: unknown;
};

function normalizeRows(data: unknown): MatchLogRow[] {
  if (Array.isArray(data)) return data as MatchLogRow[];

  if (data && typeof data === "object") {
    const obj = data as { items?: unknown; results?: unknown };
    if (Array.isArray(obj.items)) return obj.items as MatchLogRow[];
    if (Array.isArray(obj.results)) return obj.results as MatchLogRow[];
  }

  return [];
}

export default function MatchLogsPage() {
  const api = useMemo(() => createApiClient(() => localStorage.getItem("token")), []);
  const [skill, setSkill] = useState("");

  const q = useQuery({
    queryKey: ["match-logs", skill],
    queryFn: () =>
      adminListMatchLogs(api, {
        limit: 100,
        offset: 0,
        skill: skill || undefined,
      }),
  });

  const rows = normalizeRows(q.data);

  async function handleDelete(logId: number) {
    const ok = window.confirm(`Delete match log ${logId}?`);
    if (!ok) return;

    await adminDeleteMatchLog(api, logId);
    await q.refetch();
  }

  return (
    <Page title="Match Logs" subtitle="Inspect and delete historical matchmaking logs">
      <Card title="Filters">
        <div style={{ display: "flex", gap: 12, alignItems: "end" }}>
          <label style={{ flex: 1, display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Skill</span>
            <input value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="Filter by skill" />
          </label>
        </div>
      </Card>

      <div style={{ height: 12 }} />

      <Card title="Logs" right={q.isFetching ? "Refreshing…" : `${rows.length} row(s)`}>
        <div style={{ display: "grid", gap: 10 }}>
          {rows.length ? (
            rows.map((row, index) => {
              const logId = row.log_id ?? row.id ?? index;
              return (
                <div
                  key={String(logId)}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 14,
                    padding: 14,
                    display: "grid",
                    gap: 10,
                    background: "#fff",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>Log #{logId}</div>
                      <div style={{ color: "#64748b", marginTop: 4 }}>
                        skill={String(row.skill ?? "-")}
                      </div>
                    </div>

                    {typeof logId === "number" ? (
                      <button
                        onClick={() => handleDelete(logId)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 12,
                          background: "#dc2626",
                          color: "#fff",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>

                  <pre>{JSON.stringify(row, null, 2)}</pre>
                </div>
              );
            })
          ) : (
            <div style={{ color: "#64748b" }}>No match logs found.</div>
          )}
        </div>
      </Card>
    </Page>
  );
}