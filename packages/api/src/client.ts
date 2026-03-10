export type TokenProvider = () => Promise<string | null> | string | null;

export class ApiClient {
  constructor(public baseUrl: string, private getToken: TokenProvider) {}

  async request<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
    const token = await this.getToken();
    const { json, ...rest } = init;

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...rest,
      headers: {
        ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(rest.headers ?? {})
      },
      body: json !== undefined ? JSON.stringify(json) : rest.body
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const msg = data?.detail?.[0]?.msg ?? data?.message ?? `HTTP ${res.status}`;
      throw new Error(msg);
    }

    return data as T;
  }
}

export function createApiClient(baseUrl: string, getToken: TokenProvider) {
  return new ApiClient(baseUrl, getToken);
}
