import { ApiClient } from './client';
import type { components } from './schema';

export type LoginBody = components['schemas']['Login'];
export type RegisterBody = components['schemas']['Register'];
export type TokenPairResponse = components['schemas']['TokenPairResponse'];
export type RefreshBody = components['schemas']['RefreshRequest'];
export type LogoutBody = components['schemas']['LogoutRequest'];
export type OnboardingUserBody = components['schemas']['OnboardingUserRequest'];
export type OnboardingUserResponse =
  components['schemas']['OnboardingUserResponse'];
export type OnboardingHandymanBody =
  components['schemas']['OnboardingHandymanRequest'];
export type OnboardingHandymanResponse =
  components['schemas']['OnboardingHandymanResponse'];
export type MeResponse = components['schemas']['MeResponse'];

export async function login(
  api: ApiClient,
  body: LoginBody,
): Promise<TokenPairResponse> {
  return api.request<TokenPairResponse>('/login', {
    method: 'POST',
    json: body,
    skipAuthRefresh: true,
  });
}

export async function register(
  api: ApiClient,
  body: RegisterBody,
): Promise<TokenPairResponse> {
  return api.request<TokenPairResponse>('/register', {
    method: 'POST',
    json: body,
    skipAuthRefresh: true,
  });
}

export async function onboardingUser(
  api: ApiClient,
  body: OnboardingUserBody,
): Promise<OnboardingUserResponse> {
  return api.request<OnboardingUserResponse>('/onboarding/user', {
    method: 'POST',
    json: body,
    skipAuthRefresh: true,
  });
}

export async function onboardingHandyman(
  api: ApiClient,
  body: OnboardingHandymanBody,
): Promise<OnboardingHandymanResponse> {
  return api.request<OnboardingHandymanResponse>('/onboarding/handyman', {
    method: 'POST',
    json: body,
    skipAuthRefresh: true,
  });
}

export async function refresh(
  api: ApiClient,
  body: RefreshBody,
): Promise<TokenPairResponse> {
  return api.request<TokenPairResponse>('/refresh', {
    method: 'POST',
    json: body,
    skipAuthRefresh: true,
  });
}

export async function logout(
  api: ApiClient,
  body: LogoutBody,
): Promise<{ ok?: boolean }> {
  return api.request<{ ok?: boolean }>('/logout', {
    method: 'POST',
    json: body,
    skipAuthRefresh: true,
  });
}

export async function getMe(api: ApiClient): Promise<MeResponse> {
  return api.request<MeResponse>('/me', { method: 'GET' });
}
