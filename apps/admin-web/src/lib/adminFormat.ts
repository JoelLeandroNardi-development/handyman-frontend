export function getStatusTone(
  value?: string
): "success" | "warning" | "danger" | "neutral" | "info" {
  const normalized = (value ?? "").toLowerCase();

  if (["confirmed", "up", "ok", "closed", "connected", "active", "enabled"].includes(normalized)) {
    return "success";
  }

  if (["pending", "half-open", "degraded"].includes(normalized)) {
    return "warning";
  }

  if (["failed", "cancelled", "canceled", "down", "open", "error", "disabled"].includes(normalized)) {
    return "danger";
  }

  if (["info"].includes(normalized)) {
    return "info";
  }

  return "neutral";
}

export function formatDateTime(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function safeJsonParse<T>(value: string): T {
  return JSON.parse(value) as T;
}

export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}