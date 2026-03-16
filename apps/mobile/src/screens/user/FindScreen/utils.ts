import type { MatchResult, SkillCatalogFlatResponse } from "@smart/api";

export type Coords = { latitude: number; longitude: number };

export type SkillOption = {
  key: string;
  label: string;
  categoryKey: string;
  categoryLabel: string;
};

/**
 * Escape HTML special characters to prevent XSS in WebView
 */
export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Build interactive map HTML for displaying handymen results
 */
export function buildMapHtml(userCoords: Coords | null, results: MatchResult[]) {
  const center = userCoords ?? { latitude: 37.7749, longitude: -122.4194 };

  const markersJs = [
    userCoords
      ? `
        L.marker([${userCoords.latitude}, ${userCoords.longitude}])
          .addTo(map)
          .bindPopup("You");
      `
      : "",
    ...results.map((m) => {
      const popup = escapeHtml(
        `${m.email} • ${m.distance_km.toFixed(1)} km • ${m.years_experience} yrs${
          m.availability_unknown ? " • availability unknown" : ""
        }`
      );

      return `
        L.marker([${m.latitude}, ${m.longitude}])
          .addTo(map)
          .bindPopup("${popup}");
      `;
    }),
  ].join("\n");

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const map = L.map('map').setView([${center.latitude}, ${center.longitude}], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
      ${markersJs}
    </script>
  </body>
</html>
  `;
}

/**
 * Flatten skill catalog into flat array of options
 */
export function flattenSkills(catalog: SkillCatalogFlatResponse | null): SkillOption[] {
  if (!catalog) return [];

  return catalog.categories.flatMap((category) =>
    category.skills
      .filter((skill) => skill.active)
      .map((skill) => ({
        key: skill.key,
        label: skill.label,
        categoryKey: category.key,
        categoryLabel: category.label,
      }))
  );
}

/**
 * Render star rating visually (⭐ repeated count times)
 */
export function renderStars(value: number) {
  return "⭐".repeat(Math.min(value, 5));
}
