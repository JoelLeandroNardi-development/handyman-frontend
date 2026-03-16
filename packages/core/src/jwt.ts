export type JwtClaims = {
  sub?: string;
  email?: string;
  roles?: string[];
  exp?: number;
  [k: string]: unknown;
};

function b64UrlToUtf8(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  if (typeof atob === "function") return atob(padded);

  const B: any = (globalThis as any).Buffer;
  if (!B) throw new Error("Buffer not available. On React Native, add 'buffer' polyfill.");
  return B.from(padded, "base64").toString("utf-8");
}

export function decodeJwt(token: string): JwtClaims {
  const parts = token.split(".");
  if (parts.length < 2) throw new Error("Invalid JWT");
  return JSON.parse(b64UrlToUtf8(parts[1])) as JwtClaims;
}

export function isExpired(claims: JwtClaims, skewSeconds = 30): boolean {
  if (!claims.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return claims.exp <= now + skewSeconds;
}