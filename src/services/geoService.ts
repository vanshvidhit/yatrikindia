import { Coordinates } from "../types";

/**
 * Great-circle distance between two coordinates in kilometers (Haversine formula)
 */
export function calculateHaversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Computes bearing (heading in degrees 0-360) from coord1 to coord2
 */
export function calculateBearing(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const lat1 = (coord1.lat * Math.PI) / 180;
  const lat2 = (coord2.lat * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Generate a realistic multi-segment road route polyline between start and end coordinates
 */
export function generateRoutePoints(
  start: Coordinates,
  end: Coordinates,
  segmentsCount = 20
): Coordinates[] {
  const points: Coordinates[] = [];
  points.push({ ...start });

  // Add intermediate curved waypoints mimicking city street grid
  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;
  const lateralOffsetLat = (end.lng - start.lng) * 0.18;
  const lateralOffsetLng = -(end.lat - start.lat) * 0.18;

  const controlPoint1: Coordinates = {
    lat: start.lat + (midLat - start.lat) * 0.7 + lateralOffsetLat,
    lng: start.lng + (midLng - start.lng) * 0.7 + lateralOffsetLng,
  };

  const controlPoint2: Coordinates = {
    lat: midLat + (end.lat - midLat) * 0.6 - lateralOffsetLat * 0.8,
    lng: midLng + (end.lng - midLng) * 0.6 - lateralOffsetLng * 0.8,
  };

  for (let i = 1; i <= segmentsCount; i++) {
    const t = i / segmentsCount;
    // Cubic bezier curve approximation
    const lat =
      Math.pow(1 - t, 3) * start.lat +
      3 * Math.pow(1 - t, 2) * t * controlPoint1.lat +
      3 * (1 - t) * Math.pow(t, 2) * controlPoint2.lat +
      Math.pow(t, 3) * end.lat;

    const lng =
      Math.pow(1 - t, 3) * start.lng +
      3 * Math.pow(1 - t, 2) * t * controlPoint1.lng +
      3 * (1 - t) * Math.pow(t, 2) * controlPoint2.lng +
      Math.pow(t, 3) * end.lng;

    points.push({ lat, lng });
  }

  return points;
}

/**
 * Check if a driver coordinate is outside the safety corridor (> threshold distance from route polyline)
 */
export function checkGeofenceDeviation(
  current: Coordinates,
  routePolyline: Coordinates[],
  thresholdMeters = 250
): { isDeviated: boolean; minDistanceMeters: number } {
  if (!routePolyline || routePolyline.length < 2) {
    return { isDeviated: false, minDistanceMeters: 0 };
  }

  let minDistanceKm = Infinity;

  for (let i = 0; i < routePolyline.length; i++) {
    const d = calculateHaversineDistance(current, routePolyline[i]);
    if (d < minDistanceKm) {
      minDistanceKm = d;
    }
  }

  const minDistanceMeters = minDistanceKm * 1000;
  return {
    isDeviated: minDistanceMeters > thresholdMeters,
    minDistanceMeters: Math.round(minDistanceMeters),
  };
}
