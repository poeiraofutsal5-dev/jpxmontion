import { LatLng } from './utils/geo';

export type SportType = 'run' | 'walk' | 'hiit';

export interface Comment {
  id: string;
  athlete: string;
  avatar: string;
  text: string;
  time: string;
}

export interface UserProfile {
  name: string;
  handle: string;
  avatar: string;
  badge: string;
  city: string;
  workoutsThisYear: number;
  totalKm: number;
  totalKcal: number;
}

export interface Activity {
  id: string;
  title: string;
  athlete: {
    name: string;
    handle: string;
    avatar: string;
    city: string;
    badge?: string;
  };
  sport: SportType;
  date: string;
  distance: number; // meters
  steps: number;
  duration: number; // seconds
  pace: number; // seconds per km
  elevationGain: number; // meters
  calories: number;
  likes: number;
  hasLiked: boolean;
  comments: Comment[];
  coordinates: LatLng[];
  hiitSummary?: {
    sprintsCompleted: number;
    totalSprints: number;
    maxSpeedKmH: number;
  };
}

export interface WeekStat {
  week: string;
  distanceKm: number;
  durationHours: number;
  elevationM: number;
  workouts: number;
}

export interface DotDay {
  date: string;
  dayOfMonth: number;
  intensity: 0 | 1 | 2 | 3; // 0 = rest, 1 = walk/light, 2 = run, 3 = hiit/heavy
  km: number;
  sport?: SportType;
}

export interface Challenge {
  id: string;
  title: string;
  subtitle: string;
  participants: number;
  targetKm: number;
  currentKm: number;
  daysLeft: number;
  icon: string;
  tag: string;
  joined: boolean;
}

export interface RouteSegment {
  id: string;
  title: string;
  location: string;
  distanceKm: number;
  elevationM: number;
  avgGradient: string;
  attempts: number;
  recordHolder: {
    name: string;
    time: string;
    pace: string;
  };
  coordinates: LatLng[];
}
