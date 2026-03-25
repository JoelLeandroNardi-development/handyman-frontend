import { useState } from 'react';
import { Alert } from 'react-native';
import {
  createBooking,
  getHandyman,
  listHandymanReviews,
  type HandymanResponse,
} from '@smart/api';
import { PAGINATION_DEFAULTS } from '@smart/core';
import { useAsyncOperation } from '../../../hooks/useAsyncOperation';
import { useApi } from '../../../lib/ApiProvider';
import { useSession } from '../../../auth/SessionProvider';

interface UseSelectedHandymanOptions {
  jobDescription: string;
  desiredStartDate: Date;
  desiredEndDate: Date;
}

export interface SelectedHandymanFlow {
  selectedEmail: string | null;
  selectedHandymanProfile: HandymanResponse | null;
  profileLoading: boolean;
  creatingBooking: boolean;
  openHandyman: (email: string) => void;
  closeHandyman: () => void;
  requestBooking: () => void;
  clearSelection: () => void;
}

export function useSelectedHandyman({
  jobDescription,
  desiredStartDate,
  desiredEndDate,
}: UseSelectedHandymanOptions): SelectedHandymanFlow {
  const api = useApi();
  const { session } = useSession();

  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [selectedHandymanProfile, setSelectedHandymanProfile] =
    useState<HandymanResponse | null>(null);

  const currentUserEmail = session?.email ?? '';

  const { execute: handleOpenHandyman, loading: profileLoading } =
    useAsyncOperation({ alertTitle: 'Handyman Profile' });

  const { execute: handleCreateBooking, loading: creatingBooking } =
    useAsyncOperation({ alertTitle: 'Create Booking' });

  async function performOpenHandyman(email: string) {
    setSelectedEmail(email);
    const [profile] = await Promise.all([
      getHandyman(api, email),
      listHandymanReviews(api, email, {
        limit: 10,
        offset: PAGINATION_DEFAULTS.OFFSET,
      }),
    ]);
    setSelectedHandymanProfile(profile);
  }

  async function performCreateBooking() {
    if (!selectedEmail) {
      throw new Error('No handyman selected.');
    }
    if (!currentUserEmail) {
      throw new Error('Could not determine current user from /me.');
    }
    if (desiredEndDate <= desiredStartDate) {
      throw new Error('End time must be after start time.');
    }

    const booking = await createBooking(api, {
      user_email: currentUserEmail,
      handyman_email: selectedEmail,
      desired_start: desiredStartDate.toISOString(),
      desired_end: desiredEndDate.toISOString(),
      job_description: jobDescription.trim() || null,
    });

    clearSelection();

    Alert.alert(
      'Booking created',
      `Status: ${booking.status}\nBooking ID: ${booking.booking_id}`,
    );
  }

  function openHandyman(email: string) {
    handleOpenHandyman(() => performOpenHandyman(email));
  }

  function closeHandyman() {
    setSelectedEmail(null);
  }

  function requestBooking() {
    handleCreateBooking(performCreateBooking);
  }

  function clearSelection() {
    setSelectedEmail(null);
    setSelectedHandymanProfile(null);
  }

  return {
    selectedEmail,
    selectedHandymanProfile,
    profileLoading,
    creatingBooking,
    openHandyman,
    closeHandyman,
    requestBooking,
    clearSelection,
  };
}
