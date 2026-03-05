import type { components } from "./schema";
import { ApiClient } from "./client";

export type CreateBookingRequest = components["schemas"]["CreateBookingRequest"];
export type BookingResponse = components["schemas"]["BookingResponse"];
export type CancelBookingRequest = components["schemas"]["CancelBookingRequest"];
export type CancelBookingResponse = components["schemas"]["CancelBookingResponse"];
export type ConfirmBookingResponse = components["schemas"]["ConfirmBookingResponse"];
export type UpdateBookingAdmin = components["schemas"]["UpdateBookingAdmin"];

export async function createBooking(api: ApiClient, body: CreateBookingRequest): Promise<BookingResponse> {
  return api.request<BookingResponse>("/bookings", { method: "POST", json: body });
}

export async function getBooking(api: ApiClient, bookingId: string): Promise<BookingResponse> {
  return api.request<BookingResponse>(`/bookings/${encodeURIComponent(bookingId)}`, { method: "GET" });
}

// Admin list supports filters; OpenAPI response schema is `{}` right now.
// We'll return unknown until you define the response type.
export async function adminListBookings(
  api: ApiClient,
  params?: { limit?: number; offset?: number; status?: string | null; user_email?: string | null; handyman_email?: string | null }
): Promise<unknown> {
  const qs = new URLSearchParams();
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  if (params?.status != null) qs.set("status", String(params.status));
  if (params?.user_email != null) qs.set("user_email", String(params.user_email));
  if (params?.handyman_email != null) qs.set("handyman_email", String(params.handyman_email));
  const suffix = qs.toString() ? `?${qs}` : "";
  return api.request(`/bookings${suffix}`, { method: "GET" });
}

export async function adminUpdateBooking(api: ApiClient, bookingId: string, body: UpdateBookingAdmin): Promise<unknown> {
  return api.request(`/bookings/${encodeURIComponent(bookingId)}`, { method: "PUT", json: body });
}

export async function adminDeleteBooking(api: ApiClient, bookingId: string): Promise<unknown> {
  return api.request(`/bookings/${encodeURIComponent(bookingId)}`, { method: "DELETE" });
}

export async function confirmBooking(api: ApiClient, bookingId: string): Promise<ConfirmBookingResponse> {
  return api.request<ConfirmBookingResponse>(`/bookings/${encodeURIComponent(bookingId)}/confirm`, { method: "POST" });
}

export async function cancelBooking(
  api: ApiClient,
  bookingId: string,
  body?: CancelBookingRequest
): Promise<CancelBookingResponse> {
  return api.request<CancelBookingResponse>(`/bookings/${encodeURIComponent(bookingId)}/cancel`, {
    method: "POST",
    json: body ?? { reason: "user_requested" }
  });
}