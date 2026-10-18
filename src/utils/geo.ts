/**
 * Geographic calculations and coordinates for JPX MOTION
 */

export interface LatLng {
  lat: number;
  lng: number;
  elevation?: number;
  timestamp?: number;
}

/**
 * Calculates distance in meters between two lat/lng points using Haversine formula
 */
export function calculateHaversineDistance(p1: LatLng, p2: LatLng): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (p1.lat * Math.PI) / 180;
  const phi2 = (p2.lat * Math.PI) / 180;
  const deltaPhi = ((p2.lat - p1.lat) * Math.PI) / 180;
  const deltaLambda = ((p2.lng - p1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculates total distance of a route path in meters
 */
export function calculateRouteDistance(points: LatLng[]): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += calculateHaversineDistance(points[i], points[i + 1]);
  }
  return total;
}

/**
 * Convert lat/lng array to normalized SVG path coordinates inside a given viewBox
 */
export function coordinatesToSvgPath(points: LatLng[], width = 300, height = 180, padding = 20): string {
  if (!points || points.length < 2) {
    return 'M 20 90 Q 150 20 280 90';
  }

  const lats = points.map(p => p.lat);
  const lngs = points.map(p => p.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latSpan = maxLat - minLat || 0.0001;
  const lngSpan = maxLng - minLng || 0.0001;

  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const pathCommands = points.map((p, idx) => {
    // lng -> x (horizontal), lat -> y (inverted, top is higher latitude)
    const x = padding + ((p.lng - minLng) / lngSpan) * innerW;
    const y = height - padding - ((p.lat - minLat) / latSpan) * innerH;
    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  });

  return pathCommands.join(' ');
}
