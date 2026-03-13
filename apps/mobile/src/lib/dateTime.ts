export function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export function formatDateLabel(value: Date): string {
  return value.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTimeLabel(value: Date): string {
  return value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function combineDateAndTime(datePart: Date, timePart: Date): Date {
  const next = new Date(datePart);
  next.setHours(timePart.getHours(), timePart.getMinutes(), 0, 0);
  return next;
}