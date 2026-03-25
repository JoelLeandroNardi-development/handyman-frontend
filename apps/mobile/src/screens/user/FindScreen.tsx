import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useNotifications } from '../../notifications/NotificationsProvider';
import { APP_BACKGROUND_IMAGE } from '../../theme/appChrome';
import { useTheme } from '../../theme';
import { AppButton, ButtonRow, Card, CardTitle, Screen } from '../../ui/primitives';
import { ScreenHeader } from '../../ui/ScreenHeader';
import { SearchFilters } from './FindScreen/SearchFilters';
import { MapResults } from './FindScreen/MapResults';
import { HandymenList } from './FindScreen/HandymenList';
import { SkillSelector } from './FindScreen/SkillSelector';
import { HandymanDetail } from './FindScreen/HandymanDetail';
import { useApi } from '../../lib/ApiProvider';
import { useFindSearchState } from './FindScreen/useFindSearchState';
import { useFindMatchFlow } from './FindScreen/useFindMatchFlow';
import { useSelectedHandyman } from './FindScreen/useSelectedHandyman';

export default function FindScreen() {
  const api = useApi();
  const { unreadCount } = useNotifications();
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');

  const search = useFindSearchState();

  const handyman = useSelectedHandyman({
    jobDescription: search.jobDescription,
    desiredStartDate: search.desiredStartDate,
    desiredEndDate: search.desiredEndDate,
  });

  const matchFlow = useFindMatchFlow({
    userCoords: search.userCoords,
    selectedSkillKey: search.selectedSkillKey,
    jobDescription: search.jobDescription,
    desiredStartDate: search.desiredStartDate,
    desiredEndDate: search.desiredEndDate,
    onMatchComplete: handyman.clearSelection,
  });

  const selected = matchFlow.results.find(r => r.email === handyman.selectedEmail) ?? null;

  return (
    <Screen backgroundImage={APP_BACKGROUND_IMAGE}>
      <ScreenHeader
        title="Find a handyman"
        subtitle="Choose a skill, review profiles, and request a booking."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        notificationBadgeCount={unreadCount}
      />

      <ScrollView
        ref={matchFlow.scrollViewRef}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 28,
          gap: 14,
        }}>
        {matchFlow.hasResults ? (
          <>
            <Card>
              <CardTitle
                title="Current search"
                action={
                  <Text style={{ color: colors.textFaint, fontWeight: '700' }}>
                    {matchFlow.results.length} found
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
                    {search.catalog?.categories
                      .flatMap(category => category.skills)
                      .find(skill => skill.key === search.selectedSkillKey)?.label ?? 'Selected skill'}
                  </Text>
                  <Text style={{ color: colors.textSoft }}>
                    {search.desiredStartDate.toLocaleString()} → {search.desiredEndDate.toLocaleString()}
                  </Text>
                </View>

                <ButtonRow>
                  <AppButton
                    label="Edit search"
                    onPress={() => {
                      handyman.clearSelection();
                      matchFlow.resetSearchView();
                    }}
                    tone="secondary"
                    style={{ flex: 1 }}
                  />
                </ButtonRow>
              </View>
            </Card>

            <HandymenList
              results={matchFlow.results}
              userCoords={search.userCoords}
              loadingMatch={matchFlow.loadingMatch}
              selectedEmail={handyman.selectedEmail}
              onHandymanSelected={handyman.openHandyman}
            />
          </>
        ) : (
          <SearchFilters
            api={api}
            catalog={search.catalog}
            selectedSkillKey={search.selectedSkillKey}
            selectedDate={search.selectedDate}
            startTime={search.startTime}
            endTime={search.endTime}
            jobDescription={search.jobDescription}
            userCoords={search.userCoords}
            loadingMatch={matchFlow.loadingMatch}
            onCatalogLoaded={search.setCatalog}
            onSkillKeySelected={search.setSelectedSkillKey}
            onDateChanged={search.setSelectedDate}
            onStartTimeChanged={search.setStartTime}
            onEndTimeChanged={search.setEndTime}
            onJobDescriptionChanged={search.setJobDescription}
            onMatch={matchFlow.runMatch}
            onSkillModalOpen={() => search.setSkillModalOpen(true)}
          />
        )}

        <MapResults userCoords={search.userCoords} results={matchFlow.results} />
      </ScrollView>

      <SkillSelector
        open={search.skillModalOpen}
        catalog={search.catalog}
        selectedSkillKey={search.selectedSkillKey}
        onSkillSelected={search.setSelectedSkillKey}
        onClose={() => search.setSkillModalOpen(false)}
      />

      <HandymanDetail
        open={!!selected}
        selected={selected}
        handymanProfile={handyman.selectedHandymanProfile}
        profileLoading={handyman.profileLoading}
        bookingLoading={handyman.creatingBooking}
        onClose={handyman.closeHandyman}
        onBookingRequested={handyman.requestBooking}
      />
    </Screen>
  );
}
