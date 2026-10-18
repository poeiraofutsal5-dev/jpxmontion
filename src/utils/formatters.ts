/**
 * Utility functions for formatting metrics in JPX MOTION
 */

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  return `${km.toFixed(2).replace('.', ',')} km`;
}

export function formatPace(secondsPerKm: number, includeUnit = false): string {
  if (!secondsPerKm || !isFinite(secondsPerKm) || secondsPerKm <= 0 || secondsPerKm > 3600) {
    return "--'--\"";
  }
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.floor(secondsPerKm % 60);
  const formatted = `${mins}'${secs.toString().padStart(2, '0')}"`;
  return includeUnit ? `${formatted} /km` : formatted;
}

export function formatDuration(totalSeconds: number, includeHours = false): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0 || includeHours) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function formatNumberWithDots(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function calculateCalories(distanceMeters: number, sportType: 'run' | 'walk' | 'hiit'): number {
  const km = distanceMeters / 1000;
  switch (sportType) {
    case 'run':
      return Math.round(km * 68);
    case 'walk':
      return Math.round(km * 48);
    case 'hiit':
      return Math.round(km * 85);
    default:
      return Math.round(km * 65);
  }
}
