export type TokenProvider = () => Promise<string | null> | string | null;

export type RefreshResult = {
  accessToken: string;
  refreshToken?: string | null;
};

export type UnauthorizedHandler = () => Promise<RefreshResult | null>;

export type ApiRequestInit = RequestInit & {
  json?: unknown;
  skipAuthRefresh?: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClient {
  private refreshInFlight: Promise<RefreshResult | null> | null = null;

  constructor(
    public baseUrl: string,
    private getToken: TokenProvider,
    private onUnauthorized?: UnauthorizedHandler
  ) {}

  private async refreshOnce(): Promise<RefreshResult | null> {
    if (!this.onUnauthorized) return null;

    if (!this.refreshInFlight) {
      this.refreshInFlight = this.onUnauthorized().finally(() => {
        this.refreshInFlight = null;
      });
    }

    return this.refreshInFlight;
  }

  private async doFetch(path: string, init: ApiRequestInit = {}) {
    const token = await this.getToken();
    const { json, skipAuthRefresh: _skipAuthRefresh, ...rest } = init;

    return fetch(`${this.baseUrl}${path}`, {
      ...rest,
      headers: {
        ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(rest.headers ?? {}),
      },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  }

  async request<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
    const res = await this.doFetch(path, init);

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (res.status === 401 && !init.skipAuthRefresh && this.onUnauthorized) {
      const refreshed = await this.refreshOnce();
      if (refreshed?.accessToken) {
        return this.request<T>(path, { ...init, skipAuthRefresh: true });
      }
    }

    if (!res.ok) {
      const obj = data as { detail?: Array<{ msg?: string }> | string; message?: string } | null;
      const msg =
        (Array.isArray(obj?.detail) ? obj?.detail?.[0]?.msg : undefined) ??
        (typeof obj?.detail === "string" ? obj.detail : undefined) ??
        obj?.message ??
        `HTTP ${res.status}`;
      throw new ApiError(msg, res.status, data);
    }

    return data as T;
  }
}

export function createApiClient(baseUrl: string, getToken: TokenProvider, onUnauthorized?: UnauthorizedHandler) {
  return new ApiClient(baseUrl, getToken, onUnauthorized);
}
