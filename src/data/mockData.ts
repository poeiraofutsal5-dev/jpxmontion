import { Activity, Challenge, DotDay, RouteSegment, WeekStat } from '../types';
import { LatLng } from '../utils/geo';

// Real coordinates around Parque Ibirapuera, São Paulo
export const IBIRAPUERA_CIRCUIT: LatLng[] = [
  { lat: -23.5874, lng: -46.6576, elevation: 760 },
  { lat: -23.5862, lng: -46.6565, elevation: 762 },
  { lat: -23.5841, lng: -46.6548, elevation: 765 },
  { lat: -23.5825, lng: -46.6534, elevation: 768 },
  { lat: -23.5808, lng: -46.6521, elevation: 770 },
  { lat: -23.5821, lng: -46.6498, elevation: 767 },
  { lat: -23.5847, lng: -46.6509, elevation: 764 },
  { lat: -23.5879, lng: -46.6524, elevation: 761 },
  { lat: -23.5901, lng: -46.6542, elevation: 759 },
  { lat: -23.5912, lng: -46.6568, elevation: 758 },
  { lat: -23.5898, lng: -46.6588, elevation: 759 },
  { lat: -23.5881, lng: -46.6582, elevation: 760 },
  { lat: -23.5874, lng: -46.6576, elevation: 760 }
];

// Orla Copacabana & Aterro do Flamengo
export const COPACABANA_CIRCUIT: LatLng[] = [
  { lat: -22.9711, lng: -43.1825, elevation: 5 },
  { lat: -22.9734, lng: -43.1852, elevation: 6 },
  { lat: -22.9765, lng: -43.1884, elevation: 5 },
  { lat: -22.9798, lng: -43.1912, elevation: 6 },
  { lat: -22.9832, lng: -43.1945, elevation: 7 },
  { lat: -22.9854, lng: -43.1978, elevation: 6 },
  { lat: -22.9841, lng: -43.2012, elevation: 5 },
  { lat: -22.9811, lng: -43.1970, elevation: 6 },
  { lat: -22.9760, lng: -43.1910, elevation: 5 },
  { lat: -22.9711, lng: -43.1825, elevation: 5 }
];

// Paulista Night Sprint Route
export const PAULISTA_CIRCUIT: LatLng[] = [
  { lat: -23.5615, lng: -46.6559, elevation: 810 },
  { lat: -23.5630, lng: -46.6543, elevation: 812 },
  { lat: -23.5652, lng: -46.6520, elevation: 815 },
  { lat: -23.5678, lng: -46.6493, elevation: 818 },
  { lat: -23.5702, lng: -46.6468, elevation: 820 },
  { lat: -23.5685, lng: -46.6450, elevation: 819 },
  { lat: -23.5658, lng: -46.6478, elevation: 816 },
  { lat: -23.5635, lng: -46.6502, elevation: 814 },
  { lat: -23.5615, lng: -46.6559, elevation: 810 }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    title: 'Caminhada vespertina & Fartlek',
    athlete: {
      name: 'Lucas Valério',
      handle: '@lucasv_jpx',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      city: 'São Paulo, Brasil',
      badge: 'PRO ATHLETE'
    },
    sport: 'walk',
    date: 'Hoje às 17:42 • Parque Ibirapuera',
    distance: 5440, // 5.44 km
    steps: 6256,
    duration: 3551, // 59min 11s (matching user prompt)
    pace: 652, // 10'52" /km
    elevationGain: 42,
    calories: 261,
    likes: 38,
    hasLiked: false,
    comments: [
      {
        id: 'c1',
        athlete: 'Mariana Duarte',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        text: 'Ritmo super constante! Sensação térmica tava boa no parque?',
        time: 'Há 25 min'
      },
      {
        id: 'c2',
        athlete: 'Rafael Rocha',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        text: 'Essa rota do lago é sensacional pra regenerativo 👊🔥',
        time: 'Há 10 min'
      }
    ],
    coordinates: IBIRAPUERA_CIRCUIT
  },
  {
    id: 'act-2',
    title: 'HIIT 25 Tiros 30s/30s — Aceleração em Z5',
    athlete: {
      name: 'Lucas Valério',
      handle: '@lucasv_jpx',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      city: 'São Paulo, Brasil',
      badge: 'PRO ATHLETE'
    },
    sport: 'hiit',
    date: 'Hoje às 06:15 • Orla Copacabana & Pista',
    distance: 6820,
    steps: 7140,
    duration: 2160, // 36m 00s
    pace: 316, // 5'16" /km
    elevationGain: 18,
    calories: 580,
    likes: 52,
    hasLiked: true,
    comments: [
      {
        id: 'c3',
        athlete: 'Thiago Mendes',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        text: '25 tiros de 30s/30s em Z5 é brabo demais! Ritmo absurdo ⚡🔥',
        time: 'Há 2h'
      }
    ],
    coordinates: COPACABANA_CIRCUIT,
    hiitSummary: {
      sprintsCompleted: 25,
      totalSprints: 25,
      maxSpeedKmH: 24.2
    }
  },
  {
    id: 'act-3',
    title: 'Corrida Noturna Paulista Sub-5',
    athlete: {
      name: 'Lucas Valério',
      handle: '@lucasv_jpx',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      city: 'São Paulo, Brasil',
      badge: 'PRO ATHLETE'
    },
    sport: 'run',
    date: 'Ontem às 21:05 • Av. Paulista',
    distance: 10020,
    steps: 10450,
    duration: 2820, // 47m 00s
    pace: 281, // 4'41" /km
    elevationGain: 95,
    calories: 681,
    likes: 64,
    hasLiked: false,
    comments: [],
    coordinates: PAULISTA_CIRCUIT
  }
];

export const MOCK_12_WEEKS: WeekStat[] = [
  { week: 'Sem 01', distanceKm: 28.4, durationHours: 3.2, elevationM: 180, workouts: 4 },
  { week: 'Sem 02', distanceKm: 32.1, durationHours: 3.6, elevationM: 210, workouts: 4 },
  { week: 'Sem 03', distanceKm: 30.5, durationHours: 3.4, elevationM: 195, workouts: 3 },
  { week: 'Sem 04', distanceKm: 36.8, durationHours: 4.1, elevationM: 260, workouts: 5 },
  { week: 'Sem 05', distanceKm: 41.2, durationHours: 4.5, elevationM: 310, workouts: 5 },
  { week: 'Sem 06', distanceKm: 38.0, durationHours: 4.0, elevationM: 275, workouts: 4 },
  { week: 'Sem 07', distanceKm: 44.5, durationHours: 4.8, elevationM: 340, workouts: 5 },
  { week: 'Sem 08', distanceKm: 42.0, durationHours: 4.4, elevationM: 290, workouts: 4 },
  { week: 'Sem 09', distanceKm: 48.6, durationHours: 5.2, elevationM: 385, workouts: 6 },
  { week: 'Sem 10', distanceKm: 46.2, durationHours: 4.9, elevationM: 350, workouts: 5 },
  { week: 'Sem 11', distanceKm: 52.4, durationHours: 5.6, elevationM: 420, workouts: 6 },
  { week: 'Sem 12 (Atual)', distanceKm: 58.8, durationHours: 6.1, elevationM: 465, workouts: 6 }
];

export const MOCK_DOT_DAYS: DotDay[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const isRest = [2, 7, 13, 19, 24, 29].includes(day);
  const isHiit = [4, 10, 16, 22, 28].includes(day);
  const isHeavy = [6, 12, 18, 26].includes(day);

  let intensity: 0 | 1 | 2 | 3 = 1;
  let km = 5.4;
  let sport: 'run' | 'walk' | 'hiit' = 'walk';

  if (isRest) {
    intensity = 0;
    km = 0;
  } else if (isHiit) {
    intensity = 3;
    km = 7.2;
    sport = 'hiit';
  } else if (isHeavy) {
    intensity = 2;
    km = 12.5;
    sport = 'run';
  }

  return {
    date: `2026-10-${day.toString().padStart(2, '0')}`,
    dayOfMonth: day,
    intensity,
    km,
    sport: isRest ? undefined : sport
  };
});

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'ch-1',
    title: 'Desafio 100K Outubro JPX',
    subtitle: 'Corra ou caminhe 100 km durante o mês de Outubro',
    participants: 14280,
    targetKm: 100,
    currentKm: 76.4,
    daysLeft: 12,
    icon: 'Flame',
    tag: 'OFICIAL JPX',
    joined: true
  },
  {
    id: 'ch-2',
    title: 'Semana do Fogo HIIT 5x',
    subtitle: 'Complete 5 sessões de tiros de alta intensidade em 7 dias',
    participants: 6150,
    targetKm: 30,
    currentKm: 18.2,
    daysLeft: 4,
    icon: 'Zap',
    tag: 'VELOCIDADE',
    joined: true
  },
  {
    id: 'ch-3',
    title: 'Subida da Serra Ultra Climb',
    subtitle: 'Alcance 1.500m de altimetria acumulada',
    participants: 3820,
    targetKm: 50,
    currentKm: 12.0,
    daysLeft: 18,
    icon: 'Mountain',
    tag: 'ELEVATION',
    joined: false
  }
];

export const MOCK_SEGMENTS: RouteSegment[] = [
  {
    id: 'seg-1',
    title: 'Circuito Parque Ibirapuera Volta Completa',
    location: 'São Paulo, SP',
    distanceKm: 5.44,
    elevationM: 42,
    avgGradient: '1.2%',
    attempts: 18450,
    recordHolder: {
      name: 'Lucas Valério',
      time: '18m 42s',
      pace: '3\'26" /km'
    },
    coordinates: IBIRAPUERA_CIRCUIT
  },
  {
    id: 'seg-2',
    title: 'Sprint Retão Copacabana Posto 4 ao 6',
    location: 'Rio de Janeiro, RJ',
    distanceKm: 2.15,
    elevationM: 8,
    avgGradient: '0.4%',
    attempts: 9820,
    recordHolder: {
      name: 'Camila Albuquerque',
      time: '6m 12s',
      pace: '2\'53" /km'
    },
    coordinates: COPACABANA_CIRCUIT
  },
  {
    id: 'seg-3',
    title: 'Subida Consolação até Av. Paulista',
    location: 'São Paulo, SP',
    distanceKm: 1.80,
    elevationM: 78,
    avgGradient: '4.8%',
    attempts: 7340,
    recordHolder: {
      name: 'Eduardo Silveira',
      time: '6m 55s',
      pace: '3\'50" /km'
    },
    coordinates: PAULISTA_CIRCUIT
  }
];
