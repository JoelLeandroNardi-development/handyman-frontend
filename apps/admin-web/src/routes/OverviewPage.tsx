import { useQuery } from "@tanstack/react-query";
import { breakersStatus, systemHealth } from "@smart/api";
import { createApiClient } from "../lib/api";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import DataTable, { type DataTableColumn } from "../ui/DataTable";
import Page from "../ui/Page";
import StatCard from "../ui/StatCard";

type HealthServiceRow = {
  service?: string;
  status?: string;
  http_status?: number;
  latency_ms?: number;
  url?: string;
  data?: unknown;
};

type SystemHealthResponse = {
  status?: string;
  services?: HealthServiceRow[];
};

type BreakerRow = {
  name?: string;
  state?: string;
  failures?: number;
  failure_threshold?: number;
  reset_timeout_seconds?: number;
  open_for_seconds?: number | null;
};

type BreakersResponse = {
  breakers?: BreakerRow[];
};

function getStatusTone(value?: string): "success" | "warning" | "danger" | "neutral" {
  const normalized = (value ?? "").toLowerCase();

  if (normalized === "up" || normalized === "closed" || normalized === "ok") {
    return "success";
  }

  if (normalized === "open" || normalized === "down" || normalized === "error") {
    return "danger";
  }

  if (normalized === "half-open" || normalized === "degraded") {
    return "warning";
  }

  return "neutral";
}

function formatLatency(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `${value.toFixed(1)} ms`;
}

function formatHttpStatus(value?: number) {
  if (typeof value !== "number") return "-";
  return String(value);
}

function getPendingOutboxCount(services: HealthServiceRow[]) {
  return services.reduce((sum, service) => {
    const maybeData = service.data as
      | {
          outbox?: {
            pending?: number;
            processing?: number;
            failed?: number;
          };
        }
      | undefined;

    return sum + (maybeData?.outbox?.pending ?? 0);
  }, 0);
}

function getProcessingOutboxCount(services: HealthServiceRow[]) {
  return services.reduce((sum, service) => {
    const maybeData = service.data as
      | {
          outbox?: {
            pending?: number;
            processing?: number;
            failed?: number;
          };
        }
      | undefined;

    return sum + (maybeData?.outbox?.processing ?? 0);
  }, 0);
}

function getOpenBreakersCount(breakers: BreakerRow[]) {
  return breakers.filter((breaker) => (breaker.state ?? "").toLowerCase() === "open").length;
}

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

  const healthData = (healthQ.data ?? {}) as SystemHealthResponse;
  const breakersData = (breakersQ.data ?? {}) as BreakersResponse;

  const services = Array.isArray(healthData.services) ? healthData.services : [];
  const breakers = Array.isArray(breakersData.breakers) ? breakersData.breakers : [];

  const servicesUp = services.filter((service) => (service.status ?? "").toLowerCase() === "up").length;
  const servicesDown = services.filter((service) => (service.status ?? "").toLowerCase() !== "up").length;
  const pendingOutbox = getPendingOutboxCount(services);
  const processingOutbox = getProcessingOutboxCount(services);
  const openBreakers = getOpenBreakersCount(breakers);

  const serviceColumns: DataTableColumn<HealthServiceRow>[] = [
    {
      key: "service",
      header: "Service",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: "var(--text)" }}>{row.service ?? "-"}</div>
          <div style={{ color: "var(--text-faint)", fontSize: 12, marginTop: 4 }}>{row.url ?? "-"}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: 120,
      render: (row) => (
        <Badge label={row.status ?? "unknown"} tone={getStatusTone(row.status)} />
      ),
    },
    {
      key: "http_status",
      header: "HTTP",
      width: 100,
      render: (row) => (
        <span style={{ color: "var(--text-soft)", fontWeight: 600 }}>{formatHttpStatus(row.http_status)}</span>
      ),
    },
    {
      key: "latency",
      header: "Latency",
      width: 120,
      render: (row) => (
        <span style={{ color: "var(--text-soft)", fontWeight: 600 }}>{formatLatency(row.latency_ms)}</span>
      ),
    },
  ];

  const breakerColumns: DataTableColumn<BreakerRow>[] = [
    {
      key: "name",
      header: "Breaker",
      render: (row) => <span style={{ fontWeight: 700 }}>{row.name ?? "-"}</span>,
    },
    {
      key: "state",
      header: "State",
      width: 120,
      render: (row) => (
        <Badge label={row.state ?? "unknown"} tone={getStatusTone(row.state)} />
      ),
    },
    {
      key: "failures",
      header: "Failures",
      width: 120,
      render: (row) => (
        <span>
          {typeof row.failures === "number" ? row.failures : "-"}
          {typeof row.failure_threshold === "number" ? ` / ${row.failure_threshold}` : ""}
        </span>
      ),
    },
    {
      key: "reset_timeout",
      header: "Reset timeout",
      width: 140,
      render: (row) => (
        <span>
          {typeof row.reset_timeout_seconds === "number" ? `${row.reset_timeout_seconds}s` : "-"}
        </span>
      ),
    },
    {
      key: "open_for",
      header: "Open for",
      width: 120,
      render: (row) => (
        <span>
          {typeof row.open_for_seconds === "number" ? `${row.open_for_seconds}s` : "-"}
        </span>
      ),
    },
  ];

  return (
    <Page title="Overview" subtitle="Operational snapshot">
      <div className="app-page-grid-4" style={{ marginBottom: 18 }}>
        <StatCard label="Services up" value={servicesUp} hint={`${servicesDown} not healthy`} />
        <StatCard label="Open breakers" value={openBreakers} hint={`${breakers.length} total breakers`} />
        <StatCard label="Outbox pending" value={pendingOutbox} hint="Pending messages across services" />
        <StatCard label="Outbox processing" value={processingOutbox} hint="Messages currently processing" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)",
          gap: 12,
        }}
      >
        <Card title="Service health" right={healthQ.isFetching ? "Refreshing…" : `${services.length} services`}>
          {healthQ.error ? (
            <div style={{ color: "var(--danger)" }}>{String((healthQ.error as Error).message)}</div>
          ) : (
            <DataTable
              rows={services}
              columns={serviceColumns}
              emptyText="No services returned by /system/health."
            />
          )}
        </Card>

        <Card title="Breakers" right={breakersQ.isFetching ? "Refreshing…" : `${breakers.length} breakers`}>
          {breakersQ.error ? (
            <div style={{ color: "var(--danger)" }}>{String((breakersQ.error as Error).message)}</div>
          ) : (
            <DataTable
              rows={breakers}
              columns={breakerColumns}
              emptyText="No breakers returned by /system/breakers."
            />
          )}
        </Card>
      </div>

      <div style={{ height: 12 }} />

      <div className="app-page-grid-2">
        <Card title="Raw health payload">
          <div className="app-code-block">
            <pre>{JSON.stringify(healthData ?? {}, null, 2)}</pre>
          </div>
        </Card>

        <Card title="Raw breaker payload">
          <div className="app-code-block">
            <pre>{JSON.stringify(breakersData ?? {}, null, 2)}</pre>
          </div>
        </Card>
      </div>
    </Page>
  );
}