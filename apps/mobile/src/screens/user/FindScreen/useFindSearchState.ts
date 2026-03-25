import { useEffect, useMemo, useState } from 'react';
import { type SkillCatalogFlatResponse } from '@smart/api';
import { combineDateAndTime } from '../../../lib/dateTime';
import { useAppLocation } from '../../../location/AppLocationProvider';
import type { Coords } from './utils';

export interface FindSearchState {
  selectedDate: Date;
  startTime: Date;
  endTime: Date;
  selectedSkillKey: string;
  jobDescription: string;
  userCoords: Coords | null;
  catalog: SkillCatalogFlatResponse | null;
  skillModalOpen: boolean;
  desiredStartDate: Date;
  desiredEndDate: Date;
  setSelectedDate: (date: Date) => void;
  setStartTime: (time: Date) => void;
  setEndTime: (time: Date) => void;
  setSelectedSkillKey: (key: string) => void;
  setJobDescription: (desc: string) => void;
  setUserCoords: (coords: Coords | null) => void;
  setCatalog: (catalog: SkillCatalogFlatResponse | null) => void;
  setSkillModalOpen: (open: boolean) => void;
}

export function useFindSearchState(): FindSearchState {
  const { coords: appCoords } = useAppLocation();

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

  useEffect(() => {
    if (!userCoords && appCoords) {
      setUserCoords(appCoords);
    }
  }, [appCoords, userCoords]);

  const desiredStartDate = useMemo(
    () => combineDateAndTime(selectedDate, startTime),
    [selectedDate, startTime],
  );
  const desiredEndDate = useMemo(
    () => combineDateAndTime(selectedDate, endTime),
    [selectedDate, endTime],
  );

  return {
    selectedDate,
    startTime,
    endTime,
    selectedSkillKey,
    jobDescription,
    userCoords,
    catalog,
    skillModalOpen,
    desiredStartDate,
    desiredEndDate,
    setSelectedDate,
    setStartTime,
    setEndTime,
    setSelectedSkillKey,
    setJobDescription,
    setUserCoords,
    setCatalog,
    setSkillModalOpen,
  };
}
