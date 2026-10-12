// Distances for the campus geofence: everything on Curb is a walk or a short
// bike ride away.

const EARTH_RADIUS_MILES = 3958.8;
const rad = (deg) => (deg * Math.PI) / 180;

// Great-circle distance (haversine) between {lat, lng} points, in miles.
export function milesBetween(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function withinCampus(point, campus) {
  return milesBetween(point, campus.center) <= campus.radiusMiles;
}
