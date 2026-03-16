import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminDeleteMatchLog, adminListMatchLogs } from "@smart/api";
import { PAGINATION_DEFAULTS } from "@smart/core";
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
        limit: PAGINATION_DEFAULTS.LIMIT_MEDIUM,
        offset: PAGINATION_DEFAULTS.OFFSET,
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
          <label className="app-label" style={{ flex: 1 }}>
            <span>Skill</span>
            <input
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="Filter by skill"
            />
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
                  className="app-panel"
                  style={{
                    padding: 14,
                    display: "grid",
                    gap: 10,
                    background: "var(--surface)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                    <div>
                      <div style={{ fontWeight: 800, color: "var(--text)" }}>Log #{logId}</div>
                      <div style={{ color: "var(--text-faint)", marginTop: 4 }}>
                        skill={String(row.skill ?? "-")}
                      </div>
                    </div>

                    {typeof logId === "number" ? (
                      <button onClick={() => handleDelete(logId)} className="app-button app-button-danger">
                        Delete
                      </button>
                    ) : null}
                  </div>

                  <div className="app-code-block">
                    <pre>{JSON.stringify(row, null, 2)}</pre>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ color: "var(--text-faint)" }}>No match logs found.</div>
          )}
        </div>
      </Card>
    </Page>
  );
}