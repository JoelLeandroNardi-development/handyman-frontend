export function toNullableString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseOptionalCoordinates(
  latitudeInput: string,
  longitudeInput: string,
): { latitude: number | null; longitude: number | null } {
  let latitude: number | null = null;
  let longitude: number | null = null;

  if (latitudeInput.trim() !== "") {
    latitude = Number.parseFloat(latitudeInput);
    if (Number.isNaN(latitude)) {
      throw new Error("Latitude must be a valid number.");
    }
  }

  if (longitudeInput.trim() !== "") {
    longitude = Number.parseFloat(longitudeInput);
    if (Number.isNaN(longitude)) {
      throw new Error("Longitude must be a valid number.");
    }
  }

  if ((latitude === null) !== (longitude === null)) {
    throw new Error("Latitude and longitude must both be set or both be empty.");
  }

  return { latitude, longitude };
}