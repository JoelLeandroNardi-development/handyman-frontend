import type { components } from "./schema";
import { ApiClient } from "./client";

export type CreateBookingRequest = components["schemas"]["CreateBookingRequest"];
export type BookingResponse = components["schemas"]["BookingResponse"];
export type UpdateBookingAdmin = components["schemas"]["UpdateBookingAdmin"];
export type ConfirmBookingResponse = components["schemas"]["ConfirmBookingResponse"];
export type CancelBookingRequest = components["schemas"]["CancelBookingRequest"];
export type CancelBookingResponse = components["schemas"]["CancelBookingResponse"];

export async function createBooking(api: ApiClient, body: CreateBookingRequest): Promise<BookingResponse> {
  return api.request<BookingResponse>("/bookings", {
    method: "POST",
    json: body,
  });
}

export async function adminListBookings(
  api: ApiClient,
  params?: {
    limit?: number;
    offset?: number;
    status?: string;
    user_email?: string;
    handyman_email?: string;
  }
): Promise<BookingResponse[]> {
  const qs = new URLSearchParams();

  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  if (params?.status) qs.set("status", params.status);
  if (params?.user_email) qs.set("user_email", params.user_email);
  if (params?.handyman_email) qs.set("handyman_email", params.handyman_email);

  const suffix = qs.toString() ? `?${qs}` : "";

  return api.request<BookingResponse[]>(`/bookings${suffix}`, {
    method: "GET",
  });
}

export async function getBooking(api: ApiClient, bookingId: string): Promise<BookingResponse> {
  return api.request<BookingResponse>(`/bookings/${encodeURIComponent(bookingId)}`, {
    method: "GET",
  });
}

export async function adminUpdateBooking(
  api: ApiClient,
  bookingId: string,
  body: UpdateBookingAdmin
): Promise<unknown> {
  return api.request(`/bookings/${encodeURIComponent(bookingId)}`, {
    method: "PUT",
    json: body,
  });
}

export async function adminDeleteBooking(api: ApiClient, bookingId: string): Promise<unknown> {
  return api.request(`/bookings/${encodeURIComponent(bookingId)}`, {
    method: "DELETE",
  });
}

export async function confirmBooking(
  api: ApiClient,
  bookingId: string
): Promise<ConfirmBookingResponse> {
  return api.request<ConfirmBookingResponse>(`/bookings/${encodeURIComponent(bookingId)}/confirm`, {
    method: "POST",
  });
}

export async function cancelBooking(
  api: ApiClient,
  bookingId: string,
  body: CancelBookingRequest
): Promise<CancelBookingResponse> {
  return api.request<CancelBookingResponse>(`/bookings/${encodeURIComponent(bookingId)}/cancel`, {
    method: "POST",
    json: body,
  });
}

export async function getMyBookings(
  api: ApiClient,
  params?: { limit?: number; offset?: number; status?: string }
): Promise<BookingResponse[]> {
  const qs = new URLSearchParams();

  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  if (params?.status) qs.set("status", params.status);

  const suffix = qs.toString() ? `?${qs}` : "";

  return api.request<BookingResponse[]>(`/me/bookings${suffix}`, {
    method: "GET",
  });
}

export async function getMyJobs(
  api: ApiClient,
  params?: { limit?: number; offset?: number; status?: string }
): Promise<BookingResponse[]> {
  const qs = new URLSearchParams();

  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  if (params?.status) qs.set("status", params.status);

  const suffix = qs.toString() ? `?${qs}` : "";

  return api.request<BookingResponse[]>(`/me/jobs${suffix}`, {
    method: "GET",
  });
}