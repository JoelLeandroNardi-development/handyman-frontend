import { ApiClient } from './client';
import type { components } from './schema';
import { buildQueryString } from './utils/queryBuilder';

export type SkillCatalogFlatResponse =
  components['schemas']['SkillCatalogFlatResponse'];
export type SkillCatalogReplaceRequest =
  components['schemas']['SkillCatalogReplaceRequest'];
export type SkillCatalogPatchRequest =
  components['schemas']['SkillCatalogPatchRequest'];
export type InvalidHandymanSkillsResponse =
  components['schemas']['InvalidHandymanSkillsResponse'];

export async function getSkillsCatalogFlat(
  api: ApiClient,
  params?: { active_only?: boolean },
): Promise<SkillCatalogFlatResponse> {
  const suffix = buildQueryString(params || {});
  return api.request<SkillCatalogFlatResponse>(
    `/skills-catalog/flat${suffix}`,
    {
      method: 'GET',
    },
  );
}

export async function getSkillsCatalog(
  api: ApiClient,
  params?: { active_only?: boolean },
): Promise<Record<string, unknown>> {
  const suffix = buildQueryString(params || {});
  return api.request<Record<string, unknown>>(`/skills-catalog${suffix}`, {
    method: 'GET',
  });
}

export async function getInvalidHandymenSkills(
  api: ApiClient,
): Promise<InvalidHandymanSkillsResponse> {
  return api.request<InvalidHandymanSkillsResponse>(
    '/admin/handymen/invalid-skills',
    {
      method: 'GET',
    },
  );
}

export async function replaceSkillsCatalog(
  api: ApiClient,
  body: SkillCatalogReplaceRequest,
): Promise<Record<string, unknown>> {
  return api.request<Record<string, unknown>>('/admin/skills-catalog', {
    method: 'PUT',
    json: body,
  });
}

export async function patchSkillsCatalog(
  api: ApiClient,
  body: SkillCatalogPatchRequest,
): Promise<Record<string, unknown>> {
  return api.request<Record<string, unknown>>('/admin/skills-catalog', {
    method: 'PATCH',
    json: body,
  });
}
