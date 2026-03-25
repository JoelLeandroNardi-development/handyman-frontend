import React, { useRef, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { match, type MatchResult } from '@smart/api';
import { useAsyncOperation } from '../../../hooks/useAsyncOperation';
import { useApi } from '../../../lib/ApiProvider';
import type { Coords } from './utils';

interface UseFindMatchFlowOptions {
  userCoords: Coords | null;
  selectedSkillKey: string;
  jobDescription: string;
  desiredStartDate: Date;
  desiredEndDate: Date;
  /** Called after a successful match so callers can reset selection state. */
  onMatchComplete?: () => void;
}

export interface FindMatchFlow {
  results: MatchResult[];
  hasResults: boolean;
  loadingMatch: boolean;
  scrollViewRef: React.RefObject<ScrollView | null>;
  runMatch: () => void;
  resetSearchView: () => void;
}

export function useFindMatchFlow({
  userCoords,
  selectedSkillKey,
  jobDescription,
  desiredStartDate,
  desiredEndDate,
  onMatchComplete,
}: UseFindMatchFlowOptions): FindMatchFlow {
  const api = useApi();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [results, setResults] = useState<MatchResult[]>([]);
  const hasResults = results.length > 0;

  const { execute: handleMatch, loading: loadingMatch } = useAsyncOperation({
    alertTitle: 'Search',
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

    onMatchComplete?.();

    if (res.length === 0) {
      setResults([]);
      Alert.alert(
        'No handyman available',
        'No handyman available for the specified skill and time window.',
      );
      return;
    }

    setResults(res);
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
  }

  function runMatch() {
    handleMatch(performMatch);
  }

  function resetSearchView() {
    setResults([]);
  }

  return {
    results,
    hasResults,
    loadingMatch,
    scrollViewRef,
    runMatch,
    resetSearchView,
  };
}
