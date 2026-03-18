import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import {
  createBooking,
  getHandyman,
  listHandymanReviews,
  match,
  type HandymanResponse,
  type MatchResult,
  type SkillCatalogFlatResponse,
} from '@smart/api';
import { PAGINATION_DEFAULTS } from '@smart/core';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import { createApiClient } from '../../lib/api';
import { useSession } from '../../auth/SessionProvider';
import { useNotifications } from '../../notifications/NotificationsProvider';
import { useTheme } from '../../theme';
import { AppButton, ButtonRow, Card, CardTitle, Screen } from '../../ui/primitives';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { SearchFilters } from './FindScreen/SearchFilters';
import { MapResults } from './FindScreen/MapResults';
import { HandymenList } from './FindScreen/HandymenList';
import { SkillSelector } from './FindScreen/SkillSelector';
import { HandymanDetail } from './FindScreen/HandymanDetail';
import { combineDateAndTime } from '../../lib/dateTime';
import type { Coords } from './FindScreen/utils';
import { useAppLocation } from '../../location/AppLocationProvider';

export default function FindScreen() {
  const api = useMemo(() => createApiClient(), []);
  const { session } = useSession();
  const { coords: appCoords } = useAppLocation();
  const { unreadCount } = useNotifications();
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2, 0, 0, 0);
    return d;
  });
  const [selectedSkillKey, setSelectedSkillKey] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [userCoords, setUserCoords] = useState<Coords | null>(appCoords);
  const [catalog, setCatalog] = useState<SkillCatalogFlatResponse | null>(null);
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const [results, setResults] = useState<MatchResult[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const [selectedHandymanProfile, setSelectedHandymanProfile] =
    useState<HandymanResponse | null>(null);

  const currentUserEmail = session?.email ?? '';
  const selected = results.find(r => r.email === selectedEmail) ?? null;
  const hasResults = results.length > 0;

  const desiredStartDate = useMemo(
    () => combineDateAndTime(selectedDate, startTime),
    [selectedDate, startTime],
  );
  const desiredEndDate = useMemo(
    () => combineDateAndTime(selectedDate, endTime),
    [selectedDate, endTime],
  );

  React.useEffect(() => {
    if (!userCoords && appCoords) {
      setUserCoords(appCoords);
    }
  }, [appCoords, userCoords]);

  const { execute: handleMatch, loading: loadingMatch } = useAsyncOperation({
    alertTitle: 'Search',
  });

  const { execute: handleOpenHandyman, loading: profileLoading } =
    useAsyncOperation({
      alertTitle: 'Handyman Profile',
    });

  const { execute: handleCreateBooking, loading: creatingBooking } =
    useAsyncOperation({
      alertTitle: 'Create Booking',
    });

  async function performMatch() {
    if (!userCoords) {
      throw new Error('Tap "Use my location" first.');
    }
    if (!selectedSkillKey) {
      throw new Error('Please choose a skill.');
    }
    if (desiredEndDate <= desiredStartDate) {
      throw new Error('End time must be after start time.');
    }

    const res = await match(api, {
      latitude: userCoords.latitude,
      longitude: userCoords.longitude,
      skill: selectedSkillKey,
      job_description: jobDescription.trim() || null,
      desired_start: desiredStartDate.toISOString(),
      desired_end: desiredEndDate.toISOString(),
    });

    if (res.length === 0) {
      setResults([]);
      setSelectedEmail(null);
      setSelectedHandymanProfile(null);
      Alert.alert(
        'No handyman available',
        'No handyman available for the specified skill and time window.',
      );
      return;
    }

    setResults(res);
    setSelectedEmail(null);
    setSelectedHandymanProfile(null);
  }

  function resetSearchView() {
    setSelectedEmail(null);
    setSelectedHandymanProfile(null);
    setResults([]);
  }

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

    setBookingSuccess('Booking created successfully!');
    setSelectedEmail(null);
    setSelectedHandymanProfile(null);

    Alert.alert(
      'Booking created',
      `Status: ${booking.status}\nBooking ID: ${booking.booking_id}`,
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title="Find a handyman"
        subtitle="Choose a skill, review profiles, and request a booking."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        notificationBadgeCount={unreadCount}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 28,
          gap: 14,
        }}>
        {hasResults ? (
          <>
            <Card>
              <CardTitle
                title="Current search"
                action={
                  <Text style={{ color: colors.textFaint, fontWeight: '700' }}>
                    {results.length} found
                  </Text>
                }
              />

              <View style={{ gap: 12 }}>
                <Text style={{ color: colors.textSoft }}>
                  These results match your selected skill and requested time
                  window. Review the search summary below or edit it before
                  choosing a handyman.
                </Text>

                <View
                  style={{
                    backgroundColor: colors.surfaceMuted,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: 12,
                    gap: 6,
                  }}>
                  <Text style={{ color: colors.textFaint, fontSize: 12, fontWeight: '700' }}>
                    CURRENT SEARCH
                  </Text>
                  <Text style={{ color: colors.text, fontWeight: '800' }}>
                    {catalog?.categories
                      .flatMap(category => category.skills)
                      .find(skill => skill.key === selectedSkillKey)?.label ?? 'Selected skill'}
                  </Text>
                  <Text style={{ color: colors.textSoft }}>
                    {desiredStartDate.toLocaleString()} → {desiredEndDate.toLocaleString()}
                  </Text>
                </View>

                <ButtonRow>
                  <AppButton
                    label="Edit search"
                    onPress={resetSearchView}
                    tone="secondary"
                    style={{ flex: 1 }}
                  />
                </ButtonRow>
              </View>
            </Card>

            <HandymenList
              results={results}
              userCoords={userCoords}
              loadingMatch={loadingMatch}
              selectedEmail={selectedEmail}
              onHandymanSelected={email =>
                handleOpenHandyman(() => performOpenHandyman(email))
              }
            />
          </>
        ) : (
          <SearchFilters
            api={api}
            catalog={catalog}
            selectedSkillKey={selectedSkillKey}
            selectedDate={selectedDate}
            startTime={startTime}
            endTime={endTime}
            jobDescription={jobDescription}
            userCoords={userCoords}
            loadingMatch={loadingMatch}
            bookingSuccess={bookingSuccess}
            onCatalogLoaded={setCatalog}
            onSkillKeySelected={setSelectedSkillKey}
            onDateChanged={setSelectedDate}
            onStartTimeChanged={setStartTime}
            onEndTimeChanged={setEndTime}
            onJobDescriptionChanged={setJobDescription}
            onMatch={() => handleMatch(performMatch)}
            onSkillModalOpen={() => setSkillModalOpen(true)}
          />
        )}

        <MapResults userCoords={userCoords} results={results} />
      </ScrollView>

      <SkillSelector
        open={skillModalOpen}
        catalog={catalog}
        selectedSkillKey={selectedSkillKey}
        onSkillSelected={setSelectedSkillKey}
        onClose={() => setSkillModalOpen(false)}
      />

      <HandymanDetail
        open={!!selected}
        selected={selected}
        handymanProfile={selectedHandymanProfile}
        profileLoading={profileLoading}
        bookingLoading={creatingBooking}
        onClose={() => setSelectedEmail(null)}
        onBookingRequested={() => handleCreateBooking(performCreateBooking)}
      />
    </Screen>
  );
}
