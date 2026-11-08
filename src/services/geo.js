// Straight-line distance in km between two [lat, lng] points
export function distanceKm(a, b) {
  if (!a || !b) return 0;
  const R = 6371;
  const t = Math.PI / 180;
  const dLat = (b[0] - a[0]) * t;
  const dLon = (b[1] - a[1]) * t;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * t) * Math.cos(b[0] * t) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Sum of straight-line legs along an ordered list of places
export function routeKm(placesInOrder) {
  let total = 0;
  for (let i = 1; i < placesInOrder.length; i++) {
    total += distanceKm(placesInOrder[i - 1].coords, placesInOrder[i].coords);
  }
  return total;
}

// Roads are rarely straight: a common rule of thumb is ~1.3x the straight-line distance
export const ROAD_FACTOR = 1.3;

export function formatKm(km) {
  return km >= 100 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
}
