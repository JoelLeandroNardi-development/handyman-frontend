import type { components } from "./schema";
import { ApiClient } from "./client";

export type MatchRequest = components["schemas"]["MatchRequest"];
export type MatchResult = components["schemas"]["MatchResult"];

export async function match(api: ApiClient, body: MatchRequest): Promise<MatchResult[]> {
  return api.request<MatchResult[]>("/match", { method: "POST", json: body });
}

// Admin list match logs response schema is still {} in OpenAPI
export async function adminListMatchLogs(
  api: ApiClient,
  params?: { limit?: number; offset?: number; skill?: string | null }
): Promise<unknown> {
  const qs = new URLSearchParams();
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  if (params?.skill != null) qs.set("skill", String(params.skill));
  const suffix = qs.toString() ? `?${qs}` : "";
  return api.request(`/match-logs${suffix}`, { method: "GET" });
}

export async function adminDeleteMatchLog(api: ApiClient, logId: number): Promise<unknown> {
  return api.request(`/match-logs/${logId}`, { method: "DELETE" });
}