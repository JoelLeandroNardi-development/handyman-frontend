import type { JwtClaims } from "../jwt";

export interface BaseSession {
  token: string;
  email: string;
  roles: string[];
}

export interface AdminSession extends BaseSession {
  claims: JwtClaims;
  isAdmin: boolean;
}

export interface MobileSession extends BaseSession {
  me: Record<string, any>;
}

export function isAdminSession(session: BaseSession): session is AdminSession {
  return "claims" in session;
}

export function isMobileSession(session: BaseSession): session is MobileSession {
  return "me" in session;
}

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

export function isHandyman(session: BaseSession): boolean {
  return hasRole(session, "handyman");
}

export function isUser(session: BaseSession): boolean {
  return hasRole(session, "user");
}
