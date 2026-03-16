import { decodeJwt } from "../jwt";
import type { AdminSession, MobileSession } from "./types";

/**
 * Build an admin session from token
 */
export function buildAdminSession(token: string): AdminSession | null {
  try {
    const claims = decodeJwt(token);
    const roles = (claims.roles ?? []) as string[];
    return {
      token,
      email: claims.email ?? "",
      roles,
      claims,
      isAdmin: roles.includes("admin"),
    };
  } catch {
    return null;
  }
}

/**
 * Build a mobile session from token and user response
 */
export function buildMobileSession(token: string, me: Record<string, any>): MobileSession {
  return {
    token,
    email: me.email,
    roles: me.roles ?? [],
    me,
  };
}

/**
 * Storage provider interface for abstracting token storage
 * Allows both sync (localStorage) and async (SecureStore) implementations
 */
export interface TokenStorageProvider {
  getToken(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  removeToken(): Promise<void>;
}

/**
 * LocalStorage-based token storage (for web)
 */
export class LocalStorageTokenProvider implements TokenStorageProvider {
  private key: string;

  constructor(key: string = "token") {
    this.key = key;
  }

  async getToken(): Promise<string | null> {
    return typeof window !== "undefined" ? localStorage.getItem(this.key) : null;
  }

  async setToken(token: string): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.key, token);
    }
  }

  async removeToken(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.key);
    }
  }
}
