import type { AvailabilitySlot } from "@smart/api";

function isAvailabilitySlot(value: unknown): value is AvailabilitySlot {
  return !!value &&
    typeof value === "object" &&
    typeof (value as { start?: unknown }).start === "string" &&
    typeof (value as { end?: unknown }).end === "string";
}

export function normalizeAvailabilityResponse(data: unknown): AvailabilitySlot[] {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data.filter(isAvailabilitySlot);
  }

  if (typeof data === "object" && data !== null) {
    const maybeSlots = (data as { slots?: unknown }).slots;
    if (Array.isArray(maybeSlots)) {
      return maybeSlots.filter(isAvailabilitySlot);
    }
  }

  return [];
}

export function sortAvailabilitySlots(slots: AvailabilitySlot[]): AvailabilitySlot[] {
  return [...slots].sort((a, b) => {
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
}