export const STORAGE_KEYS = {
  TOKEN: "token",
  ROLE_MODE: "mobile_role_mode",
} as const;

export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export const BOOKING_STATUS_NORMALIZED = {
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  FAILED: "failed",
  PENDING: "pending",
  RESERVED: "reserved",
} as const;

export type NormalizedBookingStatus = typeof BOOKING_STATUS_NORMALIZED[keyof typeof BOOKING_STATUS_NORMALIZED];

export const SYSTEM_STATUS = {
  UP: "up",
  DOWN: "down",
} as const;

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  HANDYMAN: "handyman",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const DEMO_CREDENTIALS = {
  EMAIL: "admin@example.com",
  PASSWORD: "password",
} as const;

export const ROLE_MODES = {
  USER: "user",
  HANDYMAN: "handyman",
} as const;

export type RoleMode = typeof ROLE_MODES[keyof typeof ROLE_MODES];

export const PAGINATION_DEFAULTS = {
  LIMIT_SMALL: 50,
  LIMIT_MEDIUM: 100,
  LIMIT_LARGE: 200,
  OFFSET: 0,
} as const;

export const QUERY_PARAMS = {
  LIMIT: "limit",
  OFFSET: "offset",
  CURSOR: "cursor",
  STATUS: "status",
  USER_EMAIL: "user_email",
  HANDYMAN_EMAIL: "handyman_email",
  SKILL: "skill",
  ACTIVE_ONLY: "active_only",
} as const;
