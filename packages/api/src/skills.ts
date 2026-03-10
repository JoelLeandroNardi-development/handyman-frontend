import type { components } from "./schema";
import { ApiClient } from "./client";

export type SkillCatalogFlatResponse = components["schemas"]["SkillCatalogFlatResponse"];
export type SkillCatalogReplaceRequest = components["schemas"]["SkillCatalogReplaceRequest"];
export type SkillCatalogPatchRequest = components["schemas"]["SkillCatalogPatchRequest"];
export type InvalidHandymanSkillsResponse = components["schemas"]["InvalidHandymanSkillsResponse"];

export async function getSkillsCatalogFlat(
  api: ApiClient,
  params?: { active_only?: boolean }
): Promise<SkillCatalogFlatResponse> {
  const qs = new URLSearchParams();
  if (params?.active_only != null) qs.set("active_only", String(params.active_only));
  const suffix = qs.toString() ? `?${qs}` : "";
  return api.request<SkillCatalogFlatResponse>(`/skills-catalog/flat${suffix}`, {
    method: "GET",
  });
}

export async function getSkillsCatalog(
  api: ApiClient,
  params?: { active_only?: boolean }
): Promise<unknown> {
  const qs = new URLSearchParams();
  if (params?.active_only != null) qs.set("active_only", String(params.active_only));
  const suffix = qs.toString() ? `?${qs}` : "";
  return api.request(`/skills-catalog${suffix}`, { method: "GET" });
}

export async function adminReplaceSkillsCatalog(
  api: ApiClient,
  body: SkillCatalogReplaceRequest
): Promise<unknown> {
  return api.request("/admin/skills-catalog", {
    method: "PUT",
    json: body,
  });
}

export async function adminPatchSkillsCatalog(
  api: ApiClient,
  body: SkillCatalogPatchRequest
): Promise<unknown> {
  return api.request("/admin/skills-catalog", {
    method: "PATCH",
    json: body,
  });
}

export async function getInvalidHandymenSkills(
  api: ApiClient
): Promise<InvalidHandymanSkillsResponse> {
  return api.request<InvalidHandymanSkillsResponse>("/admin/handymen/invalid-skills", {
    method: "GET",
  });
}

export async function replaceSkillsCatalog(
  api: ApiClient,
  body: SkillCatalogReplaceRequest
): Promise<unknown> {
  return api.request("/admin/skills-catalog", {
    method: "PUT",
    json: body,
  });
}

export async function patchSkillsCatalog(
  api: ApiClient,
  body: SkillCatalogPatchRequest
): Promise<unknown> {
  return api.request("/admin/skills-catalog", {
    method: "PATCH",
    json: body,
  });
}

export async function getInvalidHandymanSkills(
  api: ApiClient
): Promise<InvalidHandymanSkillsResponse> {
  return api.request<InvalidHandymanSkillsResponse>("/admin/handymen/invalid-skills", {
    method: "GET",
  });
}