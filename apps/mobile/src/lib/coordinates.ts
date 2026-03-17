import type { AppCoords } from '../location/AppLocationProvider';

/**
 * Extract latitude and longitude from device coordinates
 * Centralizes coordinate handling logic to avoid duplication
 */
export function extractDeviceCoordinates(coords: AppCoords | null) {
  return {
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
  };
}

/**
 * Validate and parse coordinate string input
 * Throws descriptive error if invalid
 */
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

  // Basic geographic bounds validation
  if (name === 'latitude' && (parsed < -90 || parsed > 90)) {
    throw new Error('Latitude must be between -90 and 90.');
  }
  if (name === 'longitude' && (parsed < -180 || parsed > 180)) {
    throw new Error('Longitude must be between -180 and 180.');
  }

  return parsed;
}

/**
 * Parse both latitude and longitude inputs
 */
export function parseOptionalCoordinates(
  latitudeInput: string,
  longitudeInput: string,
): { latitude: number | null; longitude: number | null } {
  return {
    latitude: parseCoordinate(latitudeInput, 'latitude'),
    longitude: parseCoordinate(longitudeInput, 'longitude'),
  };
}

/**
 * Type guard to check if object has valid coordinates
 */
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
