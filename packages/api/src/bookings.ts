import { ApiClient } from './client';
import type { components } from './schema';
import { buildQueryString } from './utils/queryBuilder';

export type BookingResponse = components['schemas']['BookingResponse'];
export type CreateBookingRequest = components['schemas']['CreateBooking'];
export type UpdateBookingAdmin = components['schemas']['UpdateBookingAdmin'];

export type ConfirmBookingResponse =
  components['schemas']['ConfirmBookingResponse'];
export type CancelBookingRequest = components['schemas']['CancelBooking'];
export type CancelBookingResponse =
  components['schemas']['CancelBookingResponse'];

export type CompleteBookingResponse =
  components['schemas']['CompleteBookingResponse'];
export type RejectBookingRequest =
  components['schemas']['RejectBookingRequest'];
export type RejectBookingResponse =
  components['schemas']['RejectBookingResponse'];

export type CreateHandymanReviewRequest =
  components['schemas']['CreateHandymanReviewRequest'];
export type HandymanReviewResponse =
  components['schemas']['HandymanReviewResponse'];

export async function createBooking(
  api: ApiClient,
  body: CreateBookingRequest,
): Promise<BookingResponse> {
  return api.request<BookingResponse>('/bookings', {
    method: 'POST',
    json: body,
  });
}

export async function adminListBookings(
  api: ApiClient,
  params?: {
    limit?: number;
    offset?: number;
    status?: string | null;
    user_email?: string | null;
    handyman_email?: string | null;
  },
): Promise<BookingResponse[]> {
  const suffix = buildQueryString(params || {});
  return api.request<BookingResponse[]>(`/bookings${suffix}`, {
    method: 'GET',
  });
}

export async function getBooking(
  api: ApiClient,
  bookingId: string,
): Promise<BookingResponse> {
  return api.request<BookingResponse>(
    `/bookings/${encodeURIComponent(bookingId)}`,
    { method: 'GET' },
  );
}

export async function adminUpdateBooking(
  api: ApiClient,
  bookingId: string,
  body: UpdateBookingAdmin,
): Promise<BookingResponse> {
  return api.request<BookingResponse>(
    `/bookings/${encodeURIComponent(bookingId)}`,
    {
      method: 'PUT',
      json: body,
    },
  );
}

export async function adminDeleteBooking(
  api: ApiClient,
  bookingId: string,
): Promise<void> {
  await api.request(`/bookings/${encodeURIComponent(bookingId)}`, {
    method: 'DELETE',
  });
}

export async function confirmBooking(
  api: ApiClient,
  bookingId: string,
): Promise<ConfirmBookingResponse> {
  return api.request<ConfirmBookingResponse>(
    `/bookings/${encodeURIComponent(bookingId)}/confirm`,
    { method: 'POST' },
  );
}

export async function cancelBooking(
  api: ApiClient,
  bookingId: string,
  body: CancelBookingRequest,
): Promise<CancelBookingResponse> {
  return api.request<CancelBookingResponse>(
    `/bookings/${encodeURIComponent(bookingId)}/cancel`,
    {
      method: 'POST',
      json: body,
    },
  );
}

export async function completeBookingUser(
  api: ApiClient,
  bookingId: string,
): Promise<CompleteBookingResponse> {
  return api.request<CompleteBookingResponse>(
    `/bookings/${encodeURIComponent(bookingId)}/complete/user`,
    { method: 'POST' },
  );
}

export async function completeBookingHandyman(
  api: ApiClient,
  bookingId: string,
): Promise<CompleteBookingResponse> {
  return api.request<CompleteBookingResponse>(
    `/bookings/${encodeURIComponent(bookingId)}/complete/handyman`,
    { method: 'POST' },
  );
}

export async function rejectBookingCompletion(
  api: ApiClient,
  bookingId: string,
  body: RejectBookingRequest,
): Promise<RejectBookingResponse> {
  return api.request<RejectBookingResponse>(
    `/bookings/${encodeURIComponent(bookingId)}/reject`,
    {
      method: 'POST',
      json: body,
    },
  );
}

export async function createBookingReview(
  api: ApiClient,
  bookingId: string,
  body: CreateHandymanReviewRequest,
): Promise<HandymanReviewResponse> {
  return api.request<HandymanReviewResponse>(
    `/bookings/${encodeURIComponent(bookingId)}/review`,
    {
      method: 'POST',
      json: body,
    },
  );
}

export async function getMyBookings(
  api: ApiClient,
  params?: { limit?: number; offset?: number; status?: string | null },
): Promise<BookingResponse[]> {
  const qs = new URLSearchParams();
  if (params?.limit != null) qs.set('limit', String(params.limit));
  if (params?.offset != null) qs.set('offset', String(params.offset));
  if (params?.status) qs.set('status', params.status);

  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return api.request<BookingResponse[]>(`/me/bookings${suffix}`, {
    method: 'GET',
  });
}

export async function getMyJobs(
  api: ApiClient,
  params?: { limit?: number; offset?: number; status?: string | null },
): Promise<BookingResponse[]> {
  const qs = new URLSearchParams();
  if (params?.limit != null) qs.set('limit', String(params.limit));
  if (params?.offset != null) qs.set('offset', String(params.offset));
  if (params?.status) qs.set('status', params.status);

  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return api.request<BookingResponse[]>(`/me/jobs${suffix}`, {
    method: 'GET',
  });
}
