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

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export const ALL_WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];
export const BUSINESS_WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5];
export const WEEKEND_DAYS: Weekday[] = [0, 6];

export interface RecurringRule {
  weekdays: Weekday[];
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

const RECURRENCE_HORIZON_DAYS = 14;

export function expandRecurrence(
  rules: RecurringRule[],
  fromDate: Date = new Date(),
  horizonDays: number = RECURRENCE_HORIZON_DAYS,
): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < horizonDays; offset++) {
    const day = new Date(start);
    day.setDate(day.getDate() + offset);
    const weekday = day.getDay() as Weekday;

    for (const rule of rules) {
      if (!rule.weekdays.includes(weekday)) continue;

      const slotStart = new Date(day);
      slotStart.setHours(rule.startHour, rule.startMinute, 0, 0);

      const slotEnd = new Date(day);
      slotEnd.setHours(rule.endHour, rule.endMinute, 0, 0);

      if (slotEnd <= slotStart) continue;
      if (slotStart < fromDate) continue;

      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
      });
    }
  }

  return slots;
}

export function toDateKey(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function applyBlockouts(
  slots: AvailabilitySlot[],
  blockedDates: string[], // "YYYY-MM-DD"
): AvailabilitySlot[] {
  const blocked = new Set(blockedDates);
  return slots.filter(s => !blocked.has(toDateKey(s.start)));
}

function slotKey(s: AvailabilitySlot): string {
  return `${s.start}|${s.end}`;
}

export function deduplicateSlots(slots: AvailabilitySlot[]): AvailabilitySlot[] {
  const seen = new Set<string>();
  return slots.filter(s => {
    const k = slotKey(s);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function slotsOverlap(a: AvailabilitySlot, b: AvailabilitySlot): boolean {
  const aStart = new Date(a.start).getTime();
  const aEnd = new Date(a.end).getTime();
  const bStart = new Date(b.start).getTime();
  const bEnd = new Date(b.end).getTime();
  return aStart < bEnd && bStart < aEnd;
}

export function removeOverlaps(slots: AvailabilitySlot[]): AvailabilitySlot[] {
  const result: AvailabilitySlot[] = [];
  for (const slot of slots) {
    const hasOverlap = result.some(existing => slotsOverlap(existing, slot));
    if (!hasOverlap) {
      result.push(slot);
    }
  }
  return result;
}

export function materializeSchedule(
  rules: RecurringRule[],
  blockedDates: string[],
  existingSlots: AvailabilitySlot[],
  fromDate: Date = new Date(),
): AvailabilitySlot[] {
  const generated = expandRecurrence(rules, fromDate);
  const afterBlockout = applyBlockouts(generated, blockedDates);
  const merged = [...existingSlots, ...afterBlockout];
  const deduped = deduplicateSlots(merged);
  const clean = removeOverlaps(deduped);
  return sortAvailabilitySlots(clean);
}

export function isValidTimeRange(
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
): boolean {
  return endHour * 60 + endMinute > startHour * 60 + startMinute;
}

export function formatHourMinute(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export interface SlotGroup {
  dateKey: string;
  dateLabel: string;
  slots: { slot: AvailabilitySlot; originalIndex: number }[];
}

export function groupSlotsByDate(slots: AvailabilitySlot[]): SlotGroup[] {
  const map = new Map<string, SlotGroup>();

  slots.forEach((slot, originalIndex) => {
    const key = toDateKey(slot.start);
    let group = map.get(key);
    if (!group) {
      const d = new Date(slot.start);
      group = {
        dateKey: key,
        dateLabel: d.toLocaleDateString(undefined, {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        slots: [],
      };
      map.set(key, group);
    }
    group.slots.push({ slot, originalIndex });
  });

  return Array.from(map.values()).sort((a, b) =>
    a.dateKey.localeCompare(b.dateKey),
  );
}

export function previewGenerateCount(
  rules: RecurringRule[],
  blockedDates: string[],
  existingSlots: AvailabilitySlot[],
  fromDate: Date = new Date(),
): number {
  const materialized = materializeSchedule(rules, blockedDates, existingSlots, fromDate);
  return Math.max(0, materialized.length - existingSlots.length);
}