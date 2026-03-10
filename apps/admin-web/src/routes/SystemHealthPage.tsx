import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { systemHealth, systemOutbox, systemRabbit } from "@smart/api";
import { createApiClient } from "../lib/api";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import DataTable, { type DataTableColumn } from "../ui/DataTable";
import Page from "../ui/Page";
import StatCard from "../ui/StatCard";
import {
  formatLatency,
  getStatusTone,
  normalizeOutboxRows,
  normalizeRabbitRows,
  type HealthServiceRow,
  type OutboxRow,
  type RabbitEntry,
  type SystemHealthResponse,
} from "../lib/systemHealth";

export default function SystemHealthPage() {
  const api = useMemo(() => createApiClient(() => localStorage.getItem("token")), []);

  const healthQ = useQuery({
    queryKey: ["system-health"],
    queryFn: () => systemHealth(api),
  });

  const rabbitQ = useQuery({
    queryKey: ["system-rabbit"],
    queryFn: () => systemRabbit(api),
  });

  const outboxQ = useQuery({
    queryKey: ["system-outbox"],
    queryFn: () => systemOutbox(api),
  });

  const healthData = (healthQ.data ?? {}) as SystemHealthResponse;
  const rabbitData = rabbitQ.data ?? {};
  const outboxData = outboxQ.data ?? {};

  const healthRows = Array.isArray(healthData.services) ? healthData.services : [];
  const rabbitRows = normalizeRabbitRows(rabbitData);
  const outboxRows = normalizeOutboxRows(outboxData);

  const servicesUp = healthRows.filter((row) => (row.status ?? "").toLowerCase() === "up").length;
  const servicesDown = healthRows.filter((row) => (row.status ?? "").toLowerCase() !== "up").length;

  const rabbitConnected = rabbitRows.filter((row) => row.data?.connected === true).length;

  const outboxPending = outboxRows.reduce((sum, row) => sum + (row.pending ?? 0), 0);
  const outboxProcessing = outboxRows.reduce((sum, row) => sum + (row.processing ?? 0), 0);
  const outboxFailed = outboxRows.reduce((sum, row) => sum + (row.failed ?? 0), 0);

  const healthColumns: DataTableColumn<HealthServiceRow>[] = [
    {
      key: "service",
      header: "Service",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: "#0f172a" }}>{row.service ?? "-"}</div>
          <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{row.url ?? "-"}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: 120,
      render: (row) => <Badge label={row.status ?? "unknown"} tone={getStatusTone(row.status)} />,
    },
    {
      key: "http_status",
      header: "HTTP",
      width: 100,
      render: (row) => <span>{typeof row.http_status === "number" ? row.http_status : "-"}</span>,
    },
    {
      key: "latency",
      header: "Latency",
      width: 120,
      render: (row) => <span>{formatLatency(row.latency_ms)}</span>,
    },
  ];

  const rabbitColumns: DataTableColumn<RabbitEntry>[] = [
    {
      key: "service",
      header: "Service",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.service ?? "-"}</div>
          <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{row.url ?? "-"}</div>
        </div>
      ),
    },
    {
      key: "connected",
      header: "Connected",
      width: 130,
      render: (row) => (
        <Badge
          label={row.data?.connected ? "connected" : "disconnected"}
          tone={row.data?.connected ? "success" : "danger"}
        />
      ),
    },
    {
      key: "events_enabled",
      header: "Events",
      width: 120,
      render: (row) => (
        <Badge
          label={row.data?.events_enabled ? "enabled" : "disabled"}
          tone={row.data?.events_enabled ? "info" : "neutral"}
        />
      ),
    },
    {
      key: "exchange_name",
      header: "Exchange",
      width: 180,
      render: (row) => <span>{row.data?.exchange_name ?? "-"}</span>,
    },
    {
      key: "url_set",
      header: "URL set",
      width: 100,
      render: (row) => <span>{row.data?.rabbit_url_set ? "Yes" : "No"}</span>,
    },
  ];

  const outboxColumns: DataTableColumn<OutboxRow>[] = [
    {
      key: "service",
      header: "Service",
      render: (row) => <span style={{ fontWeight: 700 }}>{row.service ?? "-"}</span>,
    },
    {
      key: "exchange_name",
      header: "Exchange",
      width: 180,
      render: (row) => <span>{row.exchange_name ?? "-"}</span>,
    },
    {
      key: "transport",
      header: "Transport",
      width: 120,
      render: (row) => <span>{row.transport ?? "-"}</span>,
    },
    {
      key: "pending",
      header: "Pending",
      width: 100,
      render: (row) => <span>{row.pending ?? 0}</span>,
    },
    {
      key: "processing",
      header: "Processing",
      width: 110,
      render: (row) => <span>{row.processing ?? 0}</span>,
    },
    {
      key: "failed",
      header: "Failed",
      width: 90,
      render: (row) => <span>{row.failed ?? 0}</span>,
    },
    {
      key: "dlq",
      header: "DLQ",
      width: 80,
      render: (row) => <span>{row.dlq ?? 0}</span>,
    },
  ];

  return (
    <Page title="System Health" subtitle="Service fanout, messaging, and outbox diagnostics">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <StatCard label="Services up" value={servicesUp} hint={`${servicesDown} degraded or down`} />
        <StatCard label="Rabbit connected" value={rabbitConnected} hint={`${rabbitRows.length} services checked`} />
        <StatCard label="Outbox pending" value={outboxPending} hint="Queued messages" />
        <StatCard label="Outbox processing" value={outboxProcessing} hint="In-flight messages" />
        <StatCard label="Outbox failed" value={outboxFailed} hint="Needs investigation" />
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <Card title="Health" right={healthQ.isFetching ? "Refreshing…" : `${healthRows.length} services`}>
          {healthQ.error ? (
            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                border: "1px solid #fecaca",
                borderRadius: 14,
                padding: 14,
              }}
            >
              {String((healthQ.error as Error).message)}
            </div>
          ) : (
            <DataTable
              rows={healthRows}
              columns={healthColumns}
              emptyText="No services returned by /system/health."
            />
          )}
        </Card>

        <Card title="Rabbit" right={rabbitQ.isFetching ? "Refreshing…" : `${rabbitRows.length} services`}>
          {rabbitQ.error ? (
            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                border: "1px solid #fecaca",
                borderRadius: 14,
                padding: 14,
              }}
            >
              {String((rabbitQ.error as Error).message)}
            </div>
          ) : (
            <DataTable
              rows={rabbitRows}
              columns={rabbitColumns}
              emptyText="No services returned by /system/rabbit."
            />
          )}
        </Card>

        <Card title="Outbox" right={outboxQ.isFetching ? "Refreshing…" : `${outboxRows.length} services`}>
          {outboxQ.error ? (
            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                border: "1px solid #fecaca",
                borderRadius: 14,
                padding: 14,
              }}
            >
              {String((outboxQ.error as Error).message)}
            </div>
          ) : (
            <DataTable
              rows={outboxRows}
              columns={outboxColumns}
              emptyText="No services returned by /system/outbox."
            />
          )}
        </Card>
      </div>

      <div style={{ height: 12 }} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        <Card title="Raw health payload">
          <pre>{JSON.stringify(healthData ?? {}, null, 2)}</pre>
        </Card>

        <Card title="Raw rabbit payload">
          <pre>{JSON.stringify(rabbitData ?? {}, null, 2)}</pre>
        </Card>

        <Card title="Raw outbox payload">
          <pre>{JSON.stringify(outboxData ?? {}, null, 2)}</pre>
        </Card>
      </div>
    </Page>
  );
}