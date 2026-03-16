import React, { useMemo, useState } from "react";
import { Alert, ScrollView } from "react-native";
import {
  createBooking,
  getHandyman,
  listHandymanReviews,
  match,
  type HandymanResponse,
  type MatchResult,
  type SkillCatalogFlatResponse,
} from "@smart/api";
import { PAGINATION_DEFAULTS } from "@smart/core";
import { useAsyncOperation } from "../../hooks/useAsyncOperation";
import { createApiClient } from "../../lib/api";
import { useSession } from "../../auth/SessionProvider";
import { PageHeader, Screen } from "../../ui/primitives";
import { SearchFilters } from "./FindScreen/SearchFilters";
import { MapResults } from "./FindScreen/MapResults";
import { HandymenList } from "./FindScreen/HandymenList";
import { SkillSelector } from "./FindScreen/SkillSelector";
import { HandymanDetail } from "./FindScreen/HandymanDetail";
import { combineDateAndTime } from "../../lib/dateTime";
import type { Coords } from "./FindScreen/utils";

export default function FindScreen() {
  const api = useMemo(() => createApiClient(), []);
  const { session } = useSession();

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
  const [selectedSkillKey, setSelectedSkillKey] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [catalog, setCatalog] = useState<SkillCatalogFlatResponse | null>(null);
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const [results, setResults] = useState<MatchResult[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const [selectedHandymanProfile, setSelectedHandymanProfile] = useState<HandymanResponse | null>(null);

  const currentUserEmail = session?.email ?? "";
  const selected = results.find((r) => r.email === selectedEmail) ?? null;

  const desiredStartDate = useMemo(
    () => combineDateAndTime(selectedDate, startTime),
    [selectedDate, startTime]
  );
  const desiredEndDate = useMemo(
    () => combineDateAndTime(selectedDate, endTime),
    [selectedDate, endTime]
  );

  const { execute: handleMatch, loading: loadingMatch } = useAsyncOperation({
    alertTitle: "Search",
  });

  const { execute: handleLocationUpdate, loading: loadingLocation } = useAsyncOperation({
    alertTitle: "Location",
  });

  const { execute: handleOpenHandyman, loading: profileLoading } = useAsyncOperation({
    alertTitle: "Handyman Profile",
  });

  const { execute: handleCreateBooking, loading: creatingBooking } = useAsyncOperation({
    alertTitle: "Create Booking",
  });

  async function performMatch() {
    if (!userCoords) {
      throw new Error('Tap "Use my location" first.');
    }
    if (!selectedSkillKey) {
      throw new Error("Please choose a skill.");
    }
    if (desiredEndDate <= desiredStartDate) {
      throw new Error("End time must be after start time.");
    }

    const res = await match(api, {
      latitude: userCoords.latitude,
      longitude: userCoords.longitude,
      skill: selectedSkillKey,
      job_description: jobDescription.trim() || null,
      desired_start: desiredStartDate.toISOString(),
      desired_end: desiredEndDate.toISOString(),
    });
    
    setResults(res);
    setSelectedEmail(null);
    setSelectedHandymanProfile(null);
  }

  async function performOpenHandyman(email: string) {
    setSelectedEmail(email);
    const [profile] = await Promise.all([
      getHandyman(api, email),
      listHandymanReviews(api, email, { limit: 10, offset: PAGINATION_DEFAULTS.OFFSET }),
    ]);
    setSelectedHandymanProfile(profile);
  }

  async function performCreateBooking() {
    if (!selectedEmail) {
      throw new Error("No handyman selected.");
    }
    if (!currentUserEmail) {
      throw new Error("Could not determine current user from /me.");
    }
    if (desiredEndDate <= desiredStartDate) {
      throw new Error("End time must be after start time.");
    }

    const booking = await createBooking(api, {
      user_email: currentUserEmail,
      handyman_email: selectedEmail,
      desired_start: desiredStartDate.toISOString(),
      desired_end: desiredEndDate.toISOString(),
      job_description: jobDescription.trim() || null,
    });

    setBookingSuccess("Booking created successfully!");
    setSelectedEmail(null);
    setSelectedHandymanProfile(null);
    
    Alert.alert("Booking created", `Status: ${booking.status}\nBooking ID: ${booking.booking_id}`);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28, gap: 14 }}>
        <PageHeader
          title="Find a handyman"
          subtitle="Choose a skill, review profiles, and request a booking."
        />

        <SearchFilters
          api={api}
          catalog={catalog}
          selectedSkillKey={selectedSkillKey}
          selectedDate={selectedDate}
          startTime={startTime}
          endTime={endTime}
          jobDescription={jobDescription}
          userCoords={userCoords}
          loadingLocation={loadingLocation}
          loadingMatch={loadingMatch}
          bookingSuccess={bookingSuccess}
          onCatalogLoaded={setCatalog}
          onSkillKeySelected={setSelectedSkillKey}
          onDateChanged={setSelectedDate}
          onStartTimeChanged={setStartTime}
          onEndTimeChanged={setEndTime}
          onJobDescriptionChanged={setJobDescription}
          onLocationReceived={setUserCoords}
          onMatch={() => handleMatch(performMatch)}
          onSkillModalOpen={() => setSkillModalOpen(true)}
        />

        <MapResults userCoords={userCoords} results={results} />

        <HandymenList
          results={results}
          userCoords={userCoords}
          loadingMatch={loadingMatch}
          selectedEmail={selectedEmail}
          onHandymanSelected={(email) => handleOpenHandyman(() => performOpenHandyman(email))}
        />
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
