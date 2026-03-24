import type { AppCoords } from '../location/AppLocationProvider';

export function extractDeviceCoordinates(coords: AppCoords | null) {
  return {
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
  };
}

export function parseCoordinate(
  value: string,
  name: 'latitude' | 'longitude',
): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    throw new Error(`${name} must be a valid number.`);
  }

  if (name === 'latitude' && (parsed < -90 || parsed > 90)) {
    throw new Error('Latitude must be between -90 and 90.');
  }
  if (name === 'longitude' && (parsed < -180 || parsed > 180)) {
    throw new Error('Longitude must be between -180 and 180.');
  }

  return parsed;
}

export function hasCoordinates(
  obj: any,
): obj is { latitude: number; longitude: number } {
  return (
    obj &&
    typeof obj.latitude === 'number' &&
    typeof obj.longitude === 'number' &&
    !isNaN(obj.latitude) &&
    !isNaN(obj.longitude)
  );
}
