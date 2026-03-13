export type BookingAudience = "user" | "handyman" | "admin";

export type BookingStatusTone = "success" | "warning" | "danger" | "neutral";

export function normalizeBookingStatus(status?: string | null): string {
  return (status ?? "").trim().toLowerCase();
}

export function isPendingLikeBookingStatus(status?: string | null): boolean {
  const value = normalizeBookingStatus(status);
  return value === "pending" || value === "reserved";
}

export function isIncomingLikeBookingStatus(status?: string | null): boolean {
  return isPendingLikeBookingStatus(status);
}

export function getBookingStatusTone(status?: string | null): BookingStatusTone {
  switch (normalizeBookingStatus(status)) {
    case "confirmed":
      return "success";
    case "pending":
    case "reserved":
      return "warning";
    case "cancelled":
    case "failed":
      return "danger";
    default:
      return "neutral";
  }
}

export function getBookingDisplayStatus(
  status?: string | null,
  audience: BookingAudience = "admin"
): string {
  const value = normalizeBookingStatus(status);

  if (!value) return "-";

  if (audience === "user" && value === "reserved") {
    return "PENDING";
  }

  if (audience === "handyman" && value === "reserved") {
    return "INCOMING";
  }

  return value.toUpperCase();
}