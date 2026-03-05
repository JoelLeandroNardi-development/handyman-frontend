import React from "react";
import { useQuery } from "@tanstack/react-query";
import { breakersStatus, systemHealth } from "@smart/api";
import { createApiClient } from "../lib/api";
import Card from "../ui/Card";
import Page from "../ui/Page";

export default function OverviewPage() {
  const api = createApiClient(() => localStorage.getItem("token"));

  const healthQ = useQuery({
    queryKey: ["system-health"],
    queryFn: () => systemHealth(api),
  });

  const breakersQ = useQuery({
    queryKey: ["breakers-status"],
    queryFn: () => breakersStatus(api),
  });

  return (
    <Page title="Overview" subtitle="Operational snapshot">
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        <Card title="System Health" right={healthQ.isFetching ? "Loading…" : undefined}>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {healthQ.error ? String((healthQ.error as Error).message) : JSON.stringify(healthQ.data ?? {}, null, 2)}
          </pre>
        </Card>

        <Card title="Breakers" right={breakersQ.isFetching ? "Loading…" : undefined}>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {breakersQ.error ? String((breakersQ.error as Error).message) : JSON.stringify(breakersQ.data ?? {}, null, 2)}
          </pre>
        </Card>
      </div>

      <div style={{ marginTop: 12, opacity: 0.7 }}>
        Next: we’ll replace these raw JSON blocks with real status badges + tables.
      </div>
    </Page>
  );
}