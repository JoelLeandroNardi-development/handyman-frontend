/**
 * Shared constants across applications
 * Centralized to avoid magic strings and enable easy updates
 */

// Storage keys
export const STORAGE_KEYS = {
  /** JWT token storage key */
  TOKEN: "token",
  /** Mobile role mode storage key */
  ROLE_MODE: "mobile_role_mode",
} as const;

// Booking statuses - from OpenAPI spec
export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

// Normalized booking statuses (lowercase, as used in code)
export const BOOKING_STATUS_NORMALIZED = {
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  FAILED: "failed",
  PENDING: "pending",
  RESERVED: "reserved",
} as const;

export type NormalizedBookingStatus = typeof BOOKING_STATUS_NORMALIZED[keyof typeof BOOKING_STATUS_NORMALIZED];

// System health status values
export const SYSTEM_STATUS = {
  UP: "up",
  DOWN: "down",
} as const;

// User roles
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  HANDYMAN: "handyman",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Test/Demo credentials
export const DEMO_CREDENTIALS = {
  EMAIL: "admin@example.com",
  PASSWORD: "password",
} as const;

// Mobile app role modes
export const ROLE_MODES = {
  USER: "user",
  HANDYMAN: "handyman",
} as const;

export type RoleMode = typeof ROLE_MODES[keyof typeof ROLE_MODES];

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  LIMIT_SMALL: 50,
  LIMIT_MEDIUM: 100,
  LIMIT_LARGE: 200,
  OFFSET: 0,
} as const;

// Query parameter names (for consistency across API calls)
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
