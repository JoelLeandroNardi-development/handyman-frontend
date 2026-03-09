import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import MapView, { Marker, UrlTile, Region } from 'react-native-maps';
import * as Location from 'expo-location';

import { createBooking, match, type MatchResult } from '@smart/api';
import { createApiClient } from '../../lib/api';
import { useSession } from '../../auth/SessionProvider';

type Coords = { latitude: number; longitude: number };

export default function FindScreen() {
  const api = useMemo(() => createApiClient(), []);
  const { session } = useSession();

  const [skill, setSkill] = useState('plumbing');
  const [desiredStart, setDesiredStart] = useState(
    new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  );
  const [desiredEnd, setDesiredEnd] = useState(
    new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  );

  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [loadingMatch, setLoadingMatch] = useState(false);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const currentUserEmail = session?.email ?? '';

  const region: Region = useMemo(() => {
    if (selectedEmail) {
      const selected = results.find(r => r.email === selectedEmail);
      if (selected) {
        return {
          latitude: selected.latitude,
          longitude: selected.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        };
      }
    }

    const base = userCoords ?? {
      latitude: 40.413327566732484,
      longitude: -3.7121746088202343,
    };
    return {
      latitude: base.latitude,
      longitude: base.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [userCoords, results, selectedEmail]);

  async function getLocation() {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission', 'Permission denied.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch (e) {
      Alert.alert('Location error', (e as Error).message);
    } finally {
      setLoadingLocation(false);
    }
  }

  async function runMatch() {
    if (!userCoords) {
      Alert.alert('Location required', 'Tap “Use my location” first.');
      return;
    }
    if (!skill.trim()) {
      Alert.alert('Missing skill', 'Please enter a skill.');
      return;
    }

    setLoadingMatch(true);
    setSelectedEmail(null);
    setBookingSuccess(null);

    try {
      const res = await match(api, {
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        skill: skill.trim(),
        desired_start: desiredStart,
        desired_end: desiredEnd,
      });
      setResults(res);
    } catch (e) {
      Alert.alert('Match failed', (e as Error).message);
    } finally {
      setLoadingMatch(false);
    }
  }

  async function onConfirmBooking() {
    if (!selectedEmail) return;
    if (!currentUserEmail) {
      Alert.alert(
        'Missing user email',
        'Could not determine current user from /me.',
      );
      return;
    }

    setCreatingBooking(true);
    try {
      const booking = await createBooking(api, {
        user_email: currentUserEmail,
        handyman_email: selectedEmail,
        desired_start: desiredStart,
        desired_end: desiredEnd,
      });

      setBookingSuccess(`Booking created: ${booking.booking_id}`);
      setSelectedEmail(null);
      Alert.alert(
        'Booking created',
        `Status: ${booking.status}\nBooking ID: ${booking.booking_id}`,
      );
    } catch (e) {
      Alert.alert('Booking failed', (e as Error).message);
    } finally {
      setCreatingBooking(false);
    }
  }

  const selected = results.find(r => r.email === selectedEmail) ?? null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7fb' }}>
      <View style={{ padding: 12, gap: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>Find a handyman</Text>
        <Text style={{ opacity: 0.7 }}>
          Map-first discovery (OpenStreetMap tiles)
        </Text>

        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#e6e8ef',
            padding: 12,
            gap: 10,
          }}>
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: '600' }}>Skill</Text>
            <TextInput
              value={skill}
              onChangeText={setSkill}
              autoCapitalize="none"
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 10,
                padding: 10,
              }}
              placeholder="e.g. plumbing"
            />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: '600' }}>Desired start (ISO)</Text>
            <TextInput
              value={desiredStart}
              onChangeText={setDesiredStart}
              autoCapitalize="none"
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 10,
                padding: 10,
              }}
            />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: '600' }}>Desired end (ISO)</Text>
            <TextInput
              value={desiredEnd}
              onChangeText={setDesiredEnd}
              autoCapitalize="none"
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 10,
                padding: 10,
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={getLocation}
              style={{
                flex: 1,
                backgroundColor: '#111827',
                padding: 12,
                borderRadius: 12,
                alignItems: 'center',
              }}>
              {loadingLocation ? (
                <ActivityIndicator />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '700' }}>
                  {userCoords ? 'Update location' : 'Use my location'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={runMatch}
              style={{
                flex: 1,
                backgroundColor: userCoords ? '#2563eb' : '#93c5fd',
                padding: 12,
                borderRadius: 12,
                alignItems: 'center',
              }}
              disabled={!userCoords || loadingMatch}>
              {loadingMatch ? (
                <ActivityIndicator />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '700' }}>Match</Text>
              )}
            </TouchableOpacity>
          </View>

          {bookingSuccess ? (
            <View
              style={{
                backgroundColor: '#ecfdf5',
                borderWidth: 1,
                borderColor: '#a7f3d0',
                borderRadius: 10,
                padding: 10,
              }}>
              <Text style={{ color: '#065f46', fontWeight: '600' }}>
                {bookingSuccess}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <MapView style={{ flex: 1 }} initialRegion={region} region={region}>
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
          />

          {userCoords ? (
            <Marker
              coordinate={userCoords}
              title="You"
              description="Your location"
              pinColor="blue"
            />
          ) : null}

          {results.map(m => (
            <Marker
              key={m.email}
              coordinate={{ latitude: m.latitude, longitude: m.longitude }}
              title={m.email}
              description={`${m.distance_km.toFixed(1)} km • ${m.years_experience} yrs`}
              onPress={() => setSelectedEmail(m.email)}
            />
          ))}
        </MapView>

        <View
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 12,
            backgroundColor: '#fff',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#e6e8ef',
            padding: 12,
            maxHeight: 260,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}>
            <Text style={{ fontWeight: '800' }}>Top matches</Text>
            <Text style={{ opacity: 0.6, fontSize: 12 }}>
              {results.length} results
            </Text>
          </View>

          {!userCoords ? (
            <Text style={{ marginTop: 10, opacity: 0.7 }}>
              Tap “Use my location” to start.
            </Text>
          ) : loadingMatch ? (
            <View style={{ marginTop: 12 }}>
              <ActivityIndicator />
            </View>
          ) : results.length === 0 ? (
            <Text style={{ marginTop: 10, opacity: 0.7 }}>
              No results yet. Tap Match.
            </Text>
          ) : (
            <FlatList
              style={{ marginTop: 10 }}
              data={results}
              keyExtractor={item => item.email}
              renderItem={({ item }) => {
                const isSelected = item.email === selectedEmail;
                return (
                  <TouchableOpacity
                    onPress={() => setSelectedEmail(item.email)}
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isSelected ? '#2563eb' : '#eef0f6',
                      backgroundColor: isSelected ? '#eff6ff' : '#fff',
                      marginBottom: 8,
                    }}>
                    <Text style={{ fontWeight: '700' }}>{item.email}</Text>
                    <Text style={{ opacity: 0.75, marginTop: 2 }}>
                      {item.distance_km.toFixed(1)} km • {item.years_experience}{' '}
                      yrs
                      {item.availability_unknown
                        ? ' • availability unknown'
                        : ''}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>

      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedEmail(null)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.25)',
          }}>
          <View
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 16,
              gap: 10,
            }}>
            <Text style={{ fontSize: 18, fontWeight: '800' }}>
              Confirm booking
            </Text>

            {selected ? (
              <>
                <Text style={{ opacity: 0.8 }}>Handyman: {selected.email}</Text>
                <Text style={{ opacity: 0.8 }}>
                  Distance: {selected.distance_km.toFixed(1)} km
                </Text>
                <Text style={{ opacity: 0.8 }}>
                  Experience: {selected.years_experience} yrs
                </Text>
                <Text style={{ opacity: 0.8 }}>
                  Availability:{' '}
                  {selected.availability_unknown ? 'Unknown' : 'Known'}
                </Text>

                <View
                  style={{
                    backgroundColor: '#f8fafc',
                    borderWidth: 1,
                    borderColor: '#e6e8ef',
                    borderRadius: 12,
                    padding: 12,
                  }}>
                  <Text style={{ fontWeight: '700', marginBottom: 6 }}>
                    Requested window
                  </Text>
                  <Text>{desiredStart}</Text>
                  <Text>{desiredEnd}</Text>
                </View>
              </>
            ) : null}

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setSelectedEmail(null)}
                style={{
                  flex: 1,
                  backgroundColor: '#e5e7eb',
                  padding: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                }}>
                <Text style={{ fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onConfirmBooking}
                disabled={creatingBooking}
                style={{
                  flex: 1,
                  backgroundColor: '#111827',
                  padding: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                }}>
                {creatingBooking ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '800' }}>
                    Confirm request
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
