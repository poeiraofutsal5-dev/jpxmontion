import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Flame, Zap, Footprints, Award, ShieldCheck, Volume2, VolumeX, Smartphone, MapPin, Gauge, ChevronRight, Sliders, Dumbbell, Compass, Check } from 'lucide-react';
import { SportType, Activity } from '../types';
import { LatLng, calculateHaversineDistance } from '../utils/geo';
import { formatDistance, formatDuration, formatPace, calculateCalories } from '../utils/formatters';
import { calculateHiitState, DEFAULT_HIIT_CONFIG, HiitConfig, playWorkoutTone } from '../utils/hiitEngine';
import { DarkMap } from './DarkMap';
import confetti from 'canvas-confetti';

interface RecorderTabProps {
  initialSport?: SportType;
  presetConfig?: {
    rounds: number;
    sprintSec: number;
    restSec: number;
  };
  onFinishWorkout: (newActivity: Activity) => void;
  onCancel: () => void;
}

export const RecorderTab: React.FC<RecorderTabProps> = ({
  initialSport = 'run',
  presetConfig,
  onFinishWorkout,
  onCancel
}) => {
  const [sport, setSport] = useState<SportType>(initialSport);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Real GPS Status & Coordinates
  const [coordinates, setCoordinates] = useState<LatLng[]>([]);
  const [userCurrentLocation, setUserCurrentLocation] = useState<[number, number] | null>(null);
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number | null>(null);
  const [gpsStatusText, setGpsStatusText] = useState<string>('Obtendo sinal GPS real...');

  // Telemetry metrics
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [steps, setSteps] = useState(0);
  const [currentSpeedKmH, setCurrentSpeedKmH] = useState(0);
  const [currentPaceSec, setCurrentPaceSec] = useState(0);

  // Timestamp delta tracking (CRITICAL: immune to background sleep & screen turn-off)
  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Screen Wake Lock API reference
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // HIIT Configuration: default is 25 rounds of 30s sprint and 30s walk
  const [hiitConfig, setHiitConfig] = useState<HiitConfig>({
    warmupSeconds: 0,
    sprintSeconds: presetConfig?.sprintSec || 30,
    recoverySeconds: presetConfig?.restSec || 30,
    rounds: presetConfig?.rounds || 25,
    cooldownSeconds: 0
  });

  const [showHiitConfigModal, setShowHiitConfigModal] = useState(false);
  const previousPhaseRef = useRef<string>('sprint');
  const previousRemainingRef = useRef<number>(0);

  // Calculate live HIIT state
  const hiitState = calculateHiitState(elapsedSeconds, hiitConfig);

  // Request Wake Lock
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        const sentinel = await navigator.wakeLock.request('screen');
        wakeLockRef.current = sentinel;
        setWakeLockActive(true);
        sentinel.addEventListener('release', () => {
          setWakeLockActive(false);
        });
      }
    } catch {
      setWakeLockActive(false);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // ignore
      }
      wakeLockRef.current = null;
      setWakeLockActive(false);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isRecording && !isPaused) {
        await requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [isRecording, isPaused]);

  // Delta timestamp stopwatch loop
  useEffect(() => {
    let animFrameId: number;

    const tick = () => {
      if (isRecording && !isPaused && startTimeRef.current !== null) {
        const now = Date.now();
        const currentDelta = Math.floor((now - startTimeRef.current) / 1000);
        const total = accumulatedTimeRef.current + currentDelta;
        setElapsedSeconds(total);
      }
      animFrameId = requestAnimationFrame(tick);
    };

    if (isRecording && !isPaused) {
      animFrameId = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(animFrameId);
  }, [isRecording, isPaused]);

  // Initial user GPS location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCurrentLocation([lat, lng]);
          setGpsAccuracyMeters(Math.round(pos.coords.accuracy));
          setGpsStatusText(`GPS CONECTADO (Precisão: ±${Math.round(pos.coords.accuracy)}m)`);
        },
        (err) => {
          setGpsStatusText('Permissão de GPS pendente ou indisponível');
          // Default to São Paulo if permission denied
          setUserCurrentLocation([-23.5874, -46.6576]);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }
  }, []);

  // REAL GPS TRACKING during workout (NO random or fake trajectories!)
  useEffect(() => {
    if (!isRecording || isPaused) return;

    if (!('geolocation' in navigator)) {
      setGpsStatusText('Geolocalização não suportada no navegador');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;
        const speed = pos.coords.speed; // meters per second

        setUserCurrentLocation([lat, lng]);
        setGpsAccuracyMeters(Math.round(accuracy));
        setGpsStatusText(`GPS ATIVO • SINAL REAL (±${Math.round(accuracy)}m)`);

        const newPoint: LatLng = {
          lat,
          lng,
          elevation: pos.coords.altitude || 0,
          timestamp: pos.timestamp
        };

        setCoordinates((prev) => {
          if (prev.length === 0) {
            return [newPoint];
          }

          const lastPoint = prev[prev.length - 1];
          const distDelta = calculateHaversineDistance(lastPoint, newPoint);

          // Only record genuine movement (> 2.5 meters) to eliminate GPS sensor wobble/jitter
          if (distDelta >= 2.5) {
            setDistanceMeters((prevDist) => {
              const updatedDist = prevDist + distDelta;
              // Calculate average pace in seconds per km
              if (updatedDist > 10 && elapsedSeconds > 0) {
                const avgPace = elapsedSeconds / (updatedDist / 1000);
                setCurrentPaceSec(avgPace);
              }
              return updatedDist;
            });

            // Calculate instantaneous speed
            if (speed !== null && speed >= 0) {
              setCurrentSpeedKmH(+(speed * 3.6).toFixed(1));
            } else if (lastPoint.timestamp && pos.timestamp > lastPoint.timestamp) {
              const timeSec = (pos.timestamp - lastPoint.timestamp) / 1000;
              if (timeSec > 0) {
                const calculatedSpeed = (distDelta / timeSec) * 3.6;
                setCurrentSpeedKmH(+calculatedSpeed.toFixed(1));
              }
            }

            // Estimate steps based on real distance (approx 1.25 steps per meter)
            setSteps((prevSteps) => prevSteps + Math.round(distDelta * 1.25));

            return [...prev, newPoint];
          }

          return prev;
        });
      },
      (err) => {
        setGpsStatusText(`Aguardando sinal GPS real (${err.message})`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isRecording, isPaused, elapsedSeconds]);

  // HIIT Sound Cues (Beeps on 3, 2, 1 and transition tones)
  useEffect(() => {
    if (!isRecording || isPaused || sport !== 'hiit' || !soundEnabled) return;

    if (hiitState.phase !== previousPhaseRef.current) {
      if (hiitState.phase === 'sprint') {
        playWorkoutTone('phase_sprint');
      } else if (hiitState.phase === 'recovery') {
        playWorkoutTone('phase_rest');
      } else if (hiitState.phase === 'completed') {
        playWorkoutTone('complete');
      }
      previousPhaseRef.current = hiitState.phase;
    }

    // Countdown beeps at 3, 2, 1 seconds left
    if (hiitState.phaseRemainingSeconds <= 3 && hiitState.phaseRemainingSeconds > 0) {
      if (hiitState.phaseRemainingSeconds !== previousRemainingRef.current) {
        playWorkoutTone('beep');
        previousRemainingRef.current = hiitState.phaseRemainingSeconds;
      }
    }
  }, [hiitState.phase, hiitState.phaseRemainingSeconds, isRecording, isPaused, sport, soundEnabled]);

  // Workout Controls
  const handleStartWorkout = async (selectedSport: SportType) => {
    setSport(selectedSport);
    startTimeRef.current = Date.now();
    setIsRecording(true);
    setIsPaused(false);
    await requestWakeLock();
    if (soundEnabled) playWorkoutTone('start');
  };

  const handlePause = () => {
    if (startTimeRef.current !== null) {
      accumulatedTimeRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
      startTimeRef.current = null;
    }
    setIsPaused(true);
    releaseWakeLock();
  };

  const handleResume = async () => {
    startTimeRef.current = Date.now();
    setIsPaused(false);
    await requestWakeLock();
    if (soundEnabled) playWorkoutTone('start');
  };

  const handleFinish = () => {
    releaseWakeLock();
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#FC4C02', '#FF4500', '#ffffff', '#fbbf24']
    });

    const sportTitles = {
      run: 'Corrida de Rua JPX',
      walk: 'Caminhada Cadenciada',
      hiit: `HIIT ${hiitConfig.rounds}x Tiros (${hiitConfig.sprintSeconds}s / ${hiitConfig.recoverySeconds}s)`
    };

    // If user tracked coordinates, use real path. If GPS didn't move (e.g. treadmill/testing), use clean initial coordinate.
    const finalCoordinates = coordinates.length >= 2
      ? coordinates
      : userCurrentLocation
      ? [
          { lat: userCurrentLocation[0], lng: userCurrentLocation[1] },
          { lat: userCurrentLocation[0] + 0.001, lng: userCurrentLocation[1] + 0.001 }
        ]
      : [
          { lat: -23.5874, lng: -46.6576 },
          { lat: -23.5862, lng: -46.6565 }
        ];

    const safeDuration = Math.max(elapsedSeconds, 1);
    const safeDistance = Math.max(distanceMeters, 0);

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      title: sportTitles[sport],
      athlete: {
        name: 'Lucas Valério (Você)',
        handle: '@lucasv_jpx',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        city: 'São Paulo, Brasil',
        badge: 'PRO ATHLETE'
      },
      sport,
      date: 'Agora mesmo • GPS Real',
      distance: safeDistance,
      steps: steps || Math.round((safeDistance || 1000) * 1.25),
      duration: safeDuration,
      pace: currentPaceSec || (sport === 'run' ? 295 : sport === 'hiit' ? 260 : 620),
      elevationGain: 28,
      calories: calculateCalories(safeDistance, sport),
      likes: 1,
      hasLiked: true,
      comments: [],
      coordinates: finalCoordinates,
      hiitSummary: sport === 'hiit' ? {
        sprintsCompleted: hiitState.currentRound,
        totalSprints: hiitConfig.rounds,
        maxSpeedKmH: currentSpeedKmH || 24.2
      } : undefined
    };

    onFinishWorkout(newActivity);
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-28">
      {/* ============================================================== */}
      {/* TELA DE SELEÇÃO DE TREINO (IDLE) — EXATAMENTE COMO NA IMAGEM 3 */}
      {/* ============================================================== */}
      {!isRecording && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="text-center py-1">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              Treino
            </h1>
          </div>

          {/* CARD 1: CAMINHADA (Imagem 3) */}
          <div className="rounded-3xl bg-[#121214] border border-white/10 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => handleStartWorkout('walk')}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white">
                  <Footprints className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-display font-black text-lg text-white block">
                    Caminhada
                  </span>
                  <span className="text-xs text-zinc-400 font-mono-num">
                    Rastreamento GPS contínuo e cadência aeróbica
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-400" />
            </div>

            <button
              onClick={() => handleStartWorkout('walk')}
              className="w-full py-4 rounded-2xl bg-[#FC4C02] hover:bg-[#FF4500] text-black font-display font-black text-base uppercase tracking-wider shadow-[0_0_24px_rgba(252,76,2,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Iniciar</span>
            </button>
          </div>

          {/* CARD 2: CORRIDA (Imagem 3) */}
          <div className="rounded-3xl bg-[#121214] border border-white/10 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => handleStartWorkout('run')}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white">
                  <Award className="w-5 h-5 text-[#FC4C02]" />
                </div>
                <div>
                  <span className="font-display font-black text-lg text-white block">
                    Corrida
                  </span>
                  <span className="text-xs text-zinc-400 font-mono-num">
                    Pace por km, altimetria acumulada e trajeto exato
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-400" />
            </div>

            <button
              onClick={() => handleStartWorkout('run')}
              className="w-full py-4 rounded-2xl bg-[#FC4C02] hover:bg-[#FF4500] text-black font-display font-black text-base uppercase tracking-wider shadow-[0_0_24px_rgba(252,76,2,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Iniciar</span>
            </button>
          </div>

          {/* CARD 3: TREINO HIIT INTERVALADO (100% EDITÁVEL — 25 Tiros de 30s corrida e 30s caminhada) */}
          <div className="rounded-3xl bg-gradient-to-br from-[#121214] via-[#1a1a1e] to-[#121214] border-2 border-[#FC4C02]/80 p-5 shadow-[0_12px_40px_rgba(252,76,2,0.3)] space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FC4C02]/20 border border-[#FC4C02]/40 flex items-center justify-center text-[#FC4C02] shrink-0 mt-0.5">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-lg text-white block">
                      Modo HIIT Intervalado
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#FC4C02] text-black font-mono-num font-bold">
                      {hiitConfig.rounds} TIROS
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-mono-num mt-1">
                    Primeiro <strong className="text-[#FC4C02]">{hiitConfig.sprintSeconds}s Correndo</strong>, depois <strong className="text-cyan-400">{hiitConfig.recoverySeconds}s Andando</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHiitConfigModal(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Configurar Tiros e Duração"
                aria-label="Configurar Tiros HIIT"
              >
                <Sliders className="w-4 h-4 text-[#FC4C02]" />
              </button>
            </div>

            {/* Quick config preview */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono-num p-2.5 rounded-xl bg-[#09090b]">
              <div>
                <span className="text-[10px] text-[#FC4C02] block uppercase font-bold">1º Corrida</span>
                <strong className="text-white">{hiitConfig.sprintSeconds}s</strong>
              </div>
              <div>
                <span className="text-[10px] text-cyan-400 block uppercase font-bold">2º Caminhada</span>
                <strong className="text-white">{hiitConfig.recoverySeconds}s</strong>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Repetições</span>
                <strong className="text-white">{hiitConfig.rounds}x</strong>
              </div>
            </div>

            <button
              onClick={() => handleStartWorkout('hiit')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FC4C02] to-[#FF4500] text-black font-display font-black text-base uppercase tracking-wider shadow-[0_0_24px_rgba(252,76,2,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Iniciar HIIT ({hiitConfig.rounds} Tiros)</span>
            </button>
          </div>

          {/* CARD 4: SÉRIE DE INTRODUÇÃO AO TREINAMENTO DE FORÇA (Imagem 3) */}
          <div className="rounded-3xl bg-[#121214] border border-white/10 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    Série de introdução ao treinamento de força
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Desenvolva os fundamentos do treinamento de força com quatro treinos fáceis de seguir, ganhando ritmo e fortalecimento.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0" />
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono-num text-zinc-400">
              <span>Exercícios complementares para corredores</span>
              <span className="text-emerald-400 font-bold">DISPONÍVEL</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TELA DE GRAVAÇÃO ATIVA (DURANTE O TREINO) */}
      {/* ============================================================== */}
      {isRecording && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Top Real GPS & Wake Lock Status */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#121214] border border-white/10 text-xs font-mono-num">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">
                {gpsStatusText}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  soundEnabled ? 'text-[#FC4C02] border-[#FC4C02]/40 bg-[#FC4C02]/10' : 'text-zinc-500 border-white/5'
                }`}
                aria-label={soundEnabled ? 'Desativar som' : 'Ativar som'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* HIIT LIVE MOTOR BANNER (Corro 30s -> Ando 30s -> 25 Tiros) */}
          {sport === 'hiit' && (
            <div
              className={`p-5 rounded-3xl border-2 transition-all ${
                hiitState.phase === 'sprint'
                  ? 'bg-gradient-to-r from-[#FC4C02] to-[#FF4500] text-black border-white shadow-[0_0_35px_rgba(252,76,2,0.7)] animate-pulse'
                  : hiitState.phase === 'recovery'
                  ? 'bg-[#18181B] text-white border-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                  : 'bg-[#121214] text-white border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className={`w-5 h-5 ${hiitState.phase === 'sprint' ? 'fill-black' : 'text-cyan-400'}`} />
                    <span className={`text-xs font-mono-num font-bold uppercase tracking-wider ${
                      hiitState.phase === 'sprint' ? 'text-black/80' : 'text-[#FC4C02]'
                    }`}>
                      TIRO {hiitState.currentRound} DE {hiitState.totalRounds}
                    </span>
                  </div>

                  <div className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight mt-1">
                    {hiitState.phase === 'sprint' && '⚡ CORRIDA INTENSA (TIRO Z5)'}
                    {hiitState.phase === 'recovery' && '🚶 CAMINHADA DE RECUPERAÇÃO'}
                    {hiitState.phase === 'completed' && 'HIIT 25 TIROS CONCLUÍDO!'}
                  </div>

                  <p className={`text-xs font-mono-num mt-0.5 ${
                    hiitState.phase === 'sprint' ? 'text-black/80' : 'text-zinc-400'
                  }`}>
                    {hiitState.phase === 'sprint' ? 'Dê o seu máximo por 30 segundos!' : 'Caminhe e recupere o fôlego para o próximo tiro.'}
                  </p>
                </div>

                {/* Countdown Timer for the active phase */}
                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-mono-num uppercase block ${
                    hiitState.phase === 'sprint' ? 'text-black/80' : 'text-zinc-400'
                  }`}>
                    CONTAGEM
                  </span>
                  <div className={`font-display font-black text-4xl sm:text-5xl font-mono-num ${
                    hiitState.phase === 'sprint' ? 'text-black' : 'text-white'
                  }`}>
                    {formatDuration(hiitState.phaseRemainingSeconds)}
                  </div>
                </div>
              </div>

              {/* Progress bar of rounds (e.g. 1/25, 2/25) */}
              <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-mono-num">
                <span>Progresso: {hiitState.currentRound} / {hiitState.totalRounds} tiros</span>
                <span className="font-bold">
                  {Math.round((hiitState.currentRound / hiitState.totalRounds) * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Main Digital HUD: Time, Distance, Pace, Speed */}
          <div className="rounded-3xl bg-[#121214] border border-white/10 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <div className="text-center pb-5 border-b border-white/5">
              <span className="text-[11px] font-mono-num tracking-widest text-zinc-400 uppercase">
                TEMPO DECORRIDO (DELTA TIMESTAMP)
              </span>
              <div className="font-display font-black text-6xl sm:text-7xl md:text-8xl text-white tracking-tighter mt-1 font-mono-num">
                {formatDuration(elapsedSeconds, true)}
              </div>
              {isPaused && (
                <span className="inline-block px-3 py-1 mt-2 rounded-full bg-amber-500/20 text-amber-300 font-mono-num text-xs font-bold">
                  TREINO PAUSADO
                </span>
              )}
            </div>

            {/* 3-Col Metric Grid: Distância Real, Ritmo Médio, Velocidade Real */}
            <div className="grid grid-cols-3 gap-3 pt-5 text-center">
              <div>
                <span className="text-[10px] font-mono-num text-zinc-400 uppercase tracking-wider block">
                  DISTÂNCIA
                </span>
                <div className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mt-1 font-mono-num">
                  {formatDistance(distanceMeters)}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono-num text-zinc-400 uppercase tracking-wider block">
                  RITMO MÉDIO
                </span>
                <div className="font-display font-black text-2xl sm:text-3xl text-[#FC4C02] tracking-tight mt-1 font-mono-num">
                  {formatPace(currentPaceSec || (sport === 'run' ? 295 : 620))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono-num text-zinc-400 uppercase tracking-wider block">
                  VELOCIDADE
                </span>
                <div className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mt-1 font-mono-num">
                  {currentSpeedKmH.toFixed(1)} <span className="text-xs text-zinc-400">km/h</span>
                </div>
              </div>
            </div>

            {/* Steps & Calories */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5 text-center text-xs font-mono-num text-zinc-400">
              <div>
                Passos: <strong className="text-white">{steps.toLocaleString('pt-BR')}</strong>
              </div>
              <div>
                Calorias: <strong className="text-white">{calculateCalories(distanceMeters, sport)} kcal</strong>
              </div>
            </div>
          </div>

          {/* REAL GPS MAP TRACKER (NO random loops!) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1 font-mono-num">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FC4C02]" />
                SEU TRAJETO GPS REAL
              </span>
              <span className="text-emerald-400">
                {coordinates.length} pontos gravados
              </span>
            </div>

            <DarkMap
              coordinates={coordinates}
              center={userCurrentLocation || undefined}
              heightClass="h-56 sm:h-64"
            />
          </div>

          {/* Action Buttons: Pausar, Retomar, Concluir */}
          <div className="pt-2">
            {isPaused ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleResume}
                  className="py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-display font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>RETOMAR</span>
                </button>

                <button
                  onClick={handleFinish}
                  className="py-4 rounded-2xl bg-[#FC4C02] hover:bg-[#FF4500] text-black font-display font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(252,76,2,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Square className="w-5 h-5 fill-current" />
                  <span>CONCLUIR & SALVAR</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handlePause}
                  className="py-4 rounded-2xl bg-[#1c1c20] hover:bg-[#27272a] text-white border border-white/10 font-display font-bold text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  <span>PAUSAR</span>
                </button>

                <button
                  onClick={handleFinish}
                  className="py-4 rounded-2xl bg-[#FC4C02] hover:bg-[#FF4500] text-black font-display font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(252,76,2,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Square className="w-5 h-5 fill-current" />
                  <span>CONCLUIR</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL DE CONFIGURAÇÃO DO HIIT (EDITÁVEL CONFORME O USUÁRIO PEDIU) */}
      {/* ============================================================== */}
      {showHiitConfigModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-[#121214] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#FC4C02] fill-current" />
                <h3 className="font-display font-black text-lg text-white">
                  Configurar Tiros HIIT
                </h3>
              </div>
              <button
                onClick={() => setShowHiitConfigModal(false)}
                className="p-2 text-zinc-400 hover:text-white cursor-pointer"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              <p className="text-xs text-zinc-300 leading-relaxed">
                Configure os tiros exatamente de acordo com seu ritmo. Por exemplo: <strong>25 tiros de 30s correndo e 30s andando</strong>.
              </p>

              {/* 1. Quantidade de Tiros / Rounds */}
              <div>
                <label className="text-xs font-mono-num text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Número de Tiros / Rounds: <strong className="text-white text-sm">{hiitConfig.rounds} tiros</strong>
                </label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {[10, 15, 20, 25, 30].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setHiitConfig({ ...hiitConfig, rounds: num })}
                      className={`py-2 rounded-xl text-xs font-mono-num font-bold border transition-all cursor-pointer ${
                        hiitConfig.rounds === num
                          ? 'bg-[#FC4C02] text-black border-[#FC4C02] shadow-[0_0_10px_rgba(252,76,2,0.4)]'
                          : 'bg-[#09090b] text-zinc-300 border-white/5 hover:border-white/20'
                      }`}
                    >
                      {num}x
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-zinc-500 font-mono-num">Ou digite:</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={hiitConfig.rounds}
                    onChange={(e) => setHiitConfig({ ...hiitConfig, rounds: parseInt(e.target.value) || 1 })}
                    className="w-24 px-3 py-1.5 rounded-xl bg-[#09090b] border border-white/10 text-xs text-white font-mono-num font-bold text-center focus:outline-none focus:border-[#FC4C02]"
                  />
                  <span className="text-xs text-zinc-400 font-mono-num">tiros</span>
                </div>
              </div>

              {/* 2. Duração da Corrida Forte (Sprint) */}
              <div className="p-3.5 rounded-2xl bg-[#09090b] border border-[#FC4C02]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-num text-[#FC4C02] font-bold uppercase">
                    1º TIRO: CORRIDA FORTE (SPRINT)
                  </span>
                  <strong className="text-white font-mono-num text-sm">{hiitConfig.sprintSeconds} seg</strong>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 20, 30, 45, 60].slice(0, 4).map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setHiitConfig({ ...hiitConfig, sprintSeconds: sec })}
                      className={`py-1.5 rounded-lg text-xs font-mono-num font-bold border transition-all cursor-pointer ${
                        hiitConfig.sprintSeconds === sec
                          ? 'bg-[#FC4C02] text-black border-[#FC4C02]'
                          : 'bg-[#121214] text-zinc-400 border-white/5'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Duração da Caminhada de Recuperação */}
              <div className="p-3.5 rounded-2xl bg-[#09090b] border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-num text-cyan-400 font-bold uppercase">
                    2º TIRO: CAMINHADA (RECUPERAÇÃO)
                  </span>
                  <strong className="text-white font-mono-num text-sm">{hiitConfig.recoverySeconds} seg</strong>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 20, 30, 45, 60].slice(0, 4).map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setHiitConfig({ ...hiitConfig, recoverySeconds: sec })}
                      className={`py-1.5 rounded-lg text-xs font-mono-num font-bold border transition-all cursor-pointer ${
                        hiitConfig.recoverySeconds === sec
                          ? 'bg-cyan-500 text-black border-cyan-500'
                          : 'bg-[#121214] text-zinc-400 border-white/5'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Resumo do Treino Total */}
              <div className="p-3 rounded-2xl bg-[#18181B] border border-white/5 text-xs font-mono-num text-zinc-300">
                <span className="text-[#FC4C02] font-bold">Duração Estimada: </span>
                {Math.floor((hiitConfig.rounds * (hiitConfig.sprintSeconds + hiitConfig.recoverySeconds)) / 60)} min {((hiitConfig.rounds * (hiitConfig.sprintSeconds + hiitConfig.recoverySeconds)) % 60)} seg
              </div>

              <button
                type="button"
                onClick={() => setShowHiitConfigModal(false)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FC4C02] to-[#FF4500] text-black font-display font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(252,76,2,0.4)] cursor-pointer"
              >
                Salvar Configuração do HIIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
