import type { JwtClaims } from "../jwt";

/**
 * Universal session type used across all applications.
 * Can be extended with app-specific properties as needed.
 */
export interface BaseSession {
  token: string;
  email: string;
  roles: string[];
}

/**
 * Admin-specific session with decoded JWT claims
 */
export interface AdminSession extends BaseSession {
  claims: JwtClaims;
  isAdmin: boolean;
}

/**
 * Mobile-specific session with full user response data
 */
export interface MobileSession extends BaseSession {
  me: Record<string, any>;
}

/**
 * Type guard to check if session is an AdminSession
 */
export function isAdminSession(session: BaseSession): session is AdminSession {
  return "claims" in session;
}

/**
 * Type guard to check if session is a MobileSession
 */
export function isMobileSession(session: BaseSession): session is MobileSession {
  return "me" in session;
}

/**
 * Extract roles from various session types
 */
export function getRoles(session: BaseSession): string[] {
  return session.roles ?? [];
}

/**
 * Check if a session has a specific role
 */
export function hasRole(session: BaseSession, role: string): boolean {
  return getRoles(session).includes(role);
}

/**
 * Check if session belongs to an admin
 */
export function isAdmin(session: BaseSession): boolean {
  if (isAdminSession(session)) {
    return session.isAdmin;
  }
  return hasRole(session, "admin");
}

/**
 * Check if session belongs to a handyman
 */
export function isHandyman(session: BaseSession): boolean {
  return hasRole(session, "handyman");
}

/**
 * Check if session belongs to a user
 */
export function isUser(session: BaseSession): boolean {
  return hasRole(session, "user");
}
