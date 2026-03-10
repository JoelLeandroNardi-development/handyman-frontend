export type HealthServiceRow = {
  service?: string;
  status?: string;
  http_status?: number;
  latency_ms?: number;
  url?: string;
  data?: unknown;
};

export type SystemHealthResponse = {
  status?: string;
  services?: HealthServiceRow[];
};

export type RabbitEntry = {
  service?: string;
  status?: string;
  http_status?: number;
  latency_ms?: number;
  url?: string;
  data?: {
    connected?: boolean;
    events_enabled?: boolean;
    exchange_name?: string;
    rabbit_url_set?: boolean;
    [key: string]: unknown;
  };
};

export type SystemRabbitResponse =
  | {
      services?: RabbitEntry[];
      [key: string]: unknown;
    }
  | RabbitEntry[]
  | Record<string, unknown>;

export type OutboxRow = {
  service?: string;
  exchange_name?: string;
  transport?: string;
  pending?: number;
  processing?: number;
  failed?: number;
  dlq?: number;
  status?: string;
};

export type SystemOutboxResponse =
  | {
      items?: OutboxRow[];
      services?: OutboxRow[];
      [key: string]: unknown;
    }
  | OutboxRow[]
  | Record<string, unknown>;

export function getStatusTone(
  value?: string
): "success" | "warning" | "danger" | "neutral" {
  const normalized = (value ?? "").toLowerCase();

  if (normalized === "up" || normalized === "closed" || normalized === "ok" || normalized === "connected") {
    return "success";
  }

  if (normalized === "open" || normalized === "down" || normalized === "error" || normalized === "disconnected") {
    return "danger";
  }

  if (normalized === "half-open" || normalized === "degraded" || normalized === "unknown") {
    return "warning";
  }

  return "neutral";
}

export function formatLatency(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `${value.toFixed(1)} ms`;
}

export function normalizeRabbitRows(input: unknown): RabbitEntry[] {
  if (Array.isArray(input)) {
    return input as RabbitEntry[];
  }

  if (input && typeof input === "object") {
    const obj = input as { services?: unknown };
    if (Array.isArray(obj.services)) {
      return obj.services as RabbitEntry[];
    }
  }

  return [];
}

export function normalizeOutboxRows(input: unknown): OutboxRow[] {
  if (Array.isArray(input)) {
    return input as OutboxRow[];
  }

  if (input && typeof input === "object") {
    const obj = input as { items?: unknown; services?: unknown };

    if (Array.isArray(obj.items)) {
      return obj.items as OutboxRow[];
    }

    if (Array.isArray(obj.services)) {
      return obj.services as OutboxRow[];
    }
  }

  return [];
}