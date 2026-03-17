import { ApiClient } from './client';
import type { components } from './schema';
import { buildQueryString } from './utils/queryBuilder';

export type CreateHandyman = components['schemas']['CreateHandyman'];
export type UpdateHandyman = components['schemas']['UpdateHandyman'];
export type UpdateHandymanLocation =
  components['schemas']['UpdateLocation'];
export type HandymanResponse = components['schemas']['HandymanResponse'];

export type SkillCatalogFlatResponse =
  components['schemas']['SkillCatalogFlatResponse'];
export type InvalidHandymanSkillsResponse =
  components['schemas']['InvalidHandymanSkillsResponse'];
export type HandymanReviewResponse =
  components['schemas']['HandymanReviewResponse'];

export async function listHandymen(
  api: ApiClient,
  params?: { limit?: number; offset?: number },
): Promise<unknown> {
  const suffix = buildQueryString(params || {});
  return api.request(`/handymen${suffix}`, { method: 'GET' });
}

export async function createHandyman(
  api: ApiClient,
  body: CreateHandyman,
): Promise<unknown> {
  return api.request('/handymen', {
    method: 'POST',
    json: body,
  });
}

export async function getHandyman(
  api: ApiClient,
  email: string,
): Promise<HandymanResponse> {
  return api.request<HandymanResponse>(
    `/handymen/${encodeURIComponent(email)}`,
    { method: 'GET' },
  );
}

export async function adminUpdateHandyman(
  api: ApiClient,
  email: string,
  body: UpdateHandyman,
): Promise<HandymanResponse> {
  return api.request<HandymanResponse>(
    `/handymen/${encodeURIComponent(email)}`,
    {
      method: 'PUT',
      json: body,
    },
  );
}

export async function adminDeleteHandyman(
  api: ApiClient,
  email: string,
): Promise<unknown> {
  return api.request(`/handymen/${encodeURIComponent(email)}`, {
    method: 'DELETE',
  });
}

export async function updateHandymanLocation(
  api: ApiClient,
  email: string,
  body: UpdateHandymanLocation,
): Promise<unknown> {
  return api.request(`/handymen/${encodeURIComponent(email)}/location`, {
    method: 'PUT',
    json: body,
  });
}

export async function getMeHandyman(api: ApiClient): Promise<HandymanResponse> {
  return api.request<HandymanResponse>('/me/handyman', {
    method: 'GET',
  });
}

export async function updateMeHandyman(
  api: ApiClient,
  body: UpdateHandyman,
): Promise<HandymanResponse> {
  return api.request<HandymanResponse>('/me/handyman', {
    method: 'PUT',
    json: body,
  });
}

export async function getSkillsCatalogFlat(
  api: ApiClient,
  params?: { active_only?: boolean },
): Promise<SkillCatalogFlatResponse> {
  const qs = new URLSearchParams();
  if (params?.active_only != null) {
    qs.set('active_only', String(params.active_only));
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : '';

  return api.request<SkillCatalogFlatResponse>(
    `/skills-catalog/flat${suffix}`,
    {
      method: 'GET',
    },
  );
}

export async function invalidHandymenSkills(
  api: ApiClient,
): Promise<InvalidHandymanSkillsResponse> {
  return api.request<InvalidHandymanSkillsResponse>(
    '/admin/handymen/invalid-skills',
    { method: 'GET' },
  );
}

export async function listHandymanReviews(
  api: ApiClient,
  email: string,
  params?: { limit?: number; offset?: number },
): Promise<HandymanReviewResponse[]> {
  const qs = new URLSearchParams();
  if (params?.limit != null) qs.set('limit', String(params.limit));
  if (params?.offset != null) qs.set('offset', String(params.offset));
  const suffix = qs.toString() ? `?${qs.toString()}` : '';

  return api.request<HandymanReviewResponse[]>(
    `/handymen/${encodeURIComponent(email)}/reviews${suffix}`,
    { method: 'GET' },
  );
}
