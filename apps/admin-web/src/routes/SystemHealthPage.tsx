import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { systemHealth, systemOutbox, systemRabbit } from "@smart/api";
import { createApiClient } from "../lib/api";
import Card from "../ui/Card";
import Page from "../ui/Page";

export default function SystemHealthPage() {
  const api = useMemo(() => createApiClient(() => localStorage.getItem("token")), []);

  const healthQ = useQuery({ queryKey: ["system-health"], queryFn: () => systemHealth(api) });
  const rabbitQ = useQuery({ queryKey: ["system-rabbit"], queryFn: () => systemRabbit(api) });
  const outboxQ = useQuery({ queryKey: ["system-outbox"], queryFn: () => systemOutbox(api) });

  return (
    <Page title="System Health" subtitle="Raw system fanout endpoints">
      <div style={{ display: "grid", gap: 12 }}>
        <Card title="Health" right={healthQ.isFetching ? "Loading…" : undefined}>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {healthQ.error ? String((healthQ.error as Error).message) : JSON.stringify(healthQ.data ?? {}, null, 2)}
          </pre>
        </Card>

        <Card title="Rabbit" right={rabbitQ.isFetching ? "Loading…" : undefined}>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {rabbitQ.error ? String((rabbitQ.error as Error).message) : JSON.stringify(rabbitQ.data ?? {}, null, 2)}
          </pre>
        </Card>

        <Card title="Outbox" right={outboxQ.isFetching ? "Loading…" : undefined}>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {outboxQ.error ? String((outboxQ.error as Error).message) : JSON.stringify(outboxQ.data ?? {}, null, 2)}
          </pre>
        </Card>
      </div>
    </Page>
  );
}