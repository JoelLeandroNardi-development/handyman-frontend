import type { BookingResponse } from '@smart/api';
import {
  BOOKING_STATUS_NORMALIZED,
  isIncomingLikeBookingStatus,
  isPendingLikeBookingStatus,
  normalizeBookingStatus,
} from '@smart/core';

export type BookingSection = {
  title: string;
  data: BookingResponse[];
};

export function canUserCompleteBooking(booking: BookingResponse) {
  return (
    normalizeBookingStatus(booking.status) ===
      BOOKING_STATUS_NORMALIZED.CONFIRMED && !booking.completed_by_user
  );
}

export function canReviewBooking(booking: BookingResponse) {
  const status = normalizeBookingStatus(booking.status);
  return (
    status === BOOKING_STATUS_NORMALIZED.COMPLETED ||
    (!!booking.completed_by_user && !!booking.completed_by_handyman)
  );
}

export function getUserBookingSections(
  bookings: BookingResponse[],
): BookingSection[] {
  return [
    {
      title: 'Pending',
      data: bookings.filter(booking => isPendingLikeBookingStatus(booking.status)),
    },
    {
      title: 'Confirmed',
      data: bookings.filter(
        booking =>
          normalizeBookingStatus(booking.status) ===
          BOOKING_STATUS_NORMALIZED.CONFIRMED,
      ),
    },
    {
      title: 'Completed',
      data: bookings.filter(
        booking =>
          normalizeBookingStatus(booking.status) ===
          BOOKING_STATUS_NORMALIZED.COMPLETED,
      ),
    },
    {
      title: 'Cancelled',
      data: bookings.filter(
        booking =>
          normalizeBookingStatus(booking.status) ===
          BOOKING_STATUS_NORMALIZED.CANCELLED,
      ),
    },
    {
      title: 'Failed',
      data: bookings.filter(
        booking =>
          normalizeBookingStatus(booking.status) ===
          BOOKING_STATUS_NORMALIZED.FAILED,
      ),
    },
  ];
}

export function canRejectJob(booking: BookingResponse) {
  const status = normalizeBookingStatus(booking.status);
  return (
    (status === BOOKING_STATUS_NORMALIZED.PENDING ||
      status === BOOKING_STATUS_NORMALIZED.RESERVED ||
      status === BOOKING_STATUS_NORMALIZED.CONFIRMED) &&
    !booking.rejected_by_handyman
  );
}

export function canCompleteJob(booking: BookingResponse) {
  return (
    normalizeBookingStatus(booking.status) ===
      BOOKING_STATUS_NORMALIZED.CONFIRMED &&
    !booking.completed_by_handyman &&
    !booking.rejected_by_handyman
  );
}

export function getHandymanJobSections(
  bookings: BookingResponse[],
): BookingSection[] {
  return [
    {
      title: 'Incoming requests',
      data: bookings.filter(booking => isIncomingLikeBookingStatus(booking.status)),
    },
    {
      title: 'Active jobs',
      data: bookings.filter(
        booking =>
          normalizeBookingStatus(booking.status) ===
            BOOKING_STATUS_NORMALIZED.CONFIRMED &&
          !booking.completed_at &&
          !booking.rejected_by_handyman,
      ),
    },
    {
      title: 'Completed jobs',
      data: bookings.filter(booking => !!booking.completed_at),
    },
    {
      title: 'Other',
      data: bookings.filter(booking => {
        const status = normalizeBookingStatus(booking.status);
        if (
          status === BOOKING_STATUS_NORMALIZED.PENDING ||
          status === BOOKING_STATUS_NORMALIZED.RESERVED
        ) {
          return false;
        }
        if (
          status === BOOKING_STATUS_NORMALIZED.CONFIRMED &&
          !booking.completed_at &&
          !booking.rejected_by_handyman
        ) {
          return false;
        }
        if (booking.completed_at) {
          return false;
        }
        return true;
      }),
    },
  ];
}