import { decodeJwt, type JwtClaims } from "@smart/core";

const TOKEN_KEY = "token";

export type Session = {
  token: string;
  claims: JwtClaims;
  isAdmin: boolean;
};

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getSession(): Session | null {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const claims = decodeJwt(token);
    const roles = (claims.roles ?? []) as string[];
    return {
      token,
      claims,
      isAdmin: roles.includes("admin")
    };
  } catch {
    return null;
  }
}