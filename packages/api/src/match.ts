import type { components } from "./schema";
import { ApiClient } from "./client";
import { buildQueryString } from "./utils/queryBuilder";

export type MatchRequest = components["schemas"]["MatchRequest"];
export type MatchResult = components["schemas"]["MatchResult"];

export async function match(api: ApiClient, body: MatchRequest): Promise<MatchResult[]> {
  return api.request<MatchResult[]>("/match", {
    method: "POST",
    json: body,
  });
}

export async function adminListMatchLogs(
  api: ApiClient,
  params?: { limit?: number; offset?: number; skill?: string }
): Promise<unknown> {
  const suffix = buildQueryString(params || {});
  return api.request(`/match-logs${suffix}`, {
    method: "GET",
  });
}

export async function adminDeleteMatchLog(api: ApiClient, logId: number): Promise<unknown> {
  return api.request(`/match-logs/${encodeURIComponent(String(logId))}`, {
    method: "DELETE",
  });
}