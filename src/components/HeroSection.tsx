import React, { useState, useEffect } from 'react';
import { Play, Flame, Zap, Navigation, ArrowRight, Gauge, Activity } from 'lucide-react';
import { SportType } from '../types';

interface HeroSectionProps {
  onStartWorkout: (sport: SportType) => void;
  onExploreFeed: () => void;
}

type SimulationPace = 'walk' | 'run' | 'hiit';

interface PaceDetails {
  label: string;
  speed: string;
  pace: string;
  cadence: string;
  heartRate: string;
  animationSpeedSec: number;
  caloriesPerHour: number;
  tagline: string;
}

const PACE_MODES: Record<SimulationPace, PaceDetails> = {
  walk: {
    label: 'Caminhada',
    speed: '5.4 km/h',
    pace: '11\'06" /km',
    cadence: '115 ppm',
    heartRate: '108 bpm (Z1)',
    animationSpeedSec: 8,
    caloriesPerHour: 280,
    tagline: 'Constância aeróbica e queima contínua'
  },
  run: {
    label: 'Corrida',
    speed: '12.2 km/h',
    pace: '4\'55" /km',
    cadence: '172 ppm',
    heartRate: '154 bpm (Z3)',
    animationSpeedSec: 4,
    caloriesPerHour: 710,
    tagline: 'Cadência elástica e resistência de alta performance'
  },
  hiit: {
    label: 'Sprint HIIT',
    speed: '23.8 km/h',
    pace: '2\'31" /km',
    cadence: '198 ppm',
    heartRate: '182 bpm (Z5)',
    animationSpeedSec: 1.8,
    caloriesPerHour: 980,
    tagline: 'Tiros anaeróbicos extremos de 1 minuto em Z5'
  }
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartWorkout,
  onExploreFeed
}) => {
  const [selectedPace, setSelectedPace] = useState<SimulationPace>('run');
  const details = PACE_MODES[selectedPace];

  // Dynamic simulated metrics odometer
  const [odometerKm, setOdometerKm] = useState(5.44);
  const [odometerSteps, setOdometerSteps] = useState(6256);
  const [odometerTime, setOdometerTime] = useState(1742);

  // Count-up tick effect based on simulated speed
  useEffect(() => {
    const multiplier = selectedPace === 'hiit' ? 3 : selectedPace === 'run' ? 1.8 : 1;
    const interval = setInterval(() => {
      setOdometerKm(prev => +(prev + 0.01 * multiplier).toFixed(2));
      setOdometerSteps(prev => prev + Math.round(12 * multiplier));
      setOdometerTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedPace]);

  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-white/5">
      {/* Background Topographic / Radial Glow Mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#FC4C02_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#FC4C02]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-[#FF4500]/10 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Strava Kinetic Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121214] border border-[#FC4C02]/30 text-xs font-mono-num mb-6">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FC4C02] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FC4C02]"></span>
          </span>
          <span className="text-[#FC4C02] font-semibold tracking-wide uppercase">KINETIC DARK MINIMALISM</span>
          <span className="text-zinc-400">•</span>
          <span className="text-zinc-300">ESTÉTICA STRAVA NOTURNO</span>
        </div>

        {/* Monumental Headline */}
        <div className="mb-8">
          <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl tracking-tighter uppercase leading-[0.92] text-white">
            SEU RITMO.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
              SEM LIMITES.
            </span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FC4C02] via-[#FF4500] to-amber-500">
              JPX MOTION.
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-xl font-normal leading-relaxed">
            Plataforma ultrarrápida para corrida de rua, caminhadas cadenciadas e tiros HIIT. 
            Rastreamento GPS contínuo mesmo com a tela desligada e gerador instantâneo de stickers para stories.
          </p>
        </div>

        {/* Interactive Live Rhythm Simulator (As specified in requirement A) */}
        <div className="rounded-3xl bg-[#121214]/90 border border-white/10 p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#FC4C02]" />
                <span className="text-xs font-mono-num font-semibold text-zinc-300 uppercase tracking-widest">
                  SIMULE SEU RITMO EM TEMPO REAL
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{details.tagline}</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono-num text-zinc-400">
              <span className="text-[#FC4C02] font-bold">{details.speed}</span>
              <span>•</span>
              <span className="text-zinc-200 font-bold">{details.pace}</span>
            </div>
          </div>

          {/* Rhythm Selector Buttons */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6" role="tablist" aria-label="Seletor de Ritmo">
            {(['walk', 'run', 'hiit'] as SimulationPace[]).map(mode => {
              const active = selectedPace === mode;
              const modeInfo = PACE_MODES[mode];
              return (
                <button
                  key={mode}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedPace(mode)}
                  className={`relative p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-[#1a1a1e] border-[#FC4C02] shadow-[0_0_20px_rgba(252,76,2,0.25)]'
                      : 'bg-[#0a0a0c] border-white/5 hover:border-white/15 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {active && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FC4C02] shadow-[0_0_8px_#FC4C02]" />
                  )}
                  <div className="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider mb-1">
                    {mode === 'walk' ? 'AERÓBICO' : mode === 'run' ? 'RESISTÊNCIA' : 'ANAERÓBICO Z5'}
                  </div>
                  <div className="font-display font-black text-sm sm:text-base text-white">
                    {modeInfo.label}
                  </div>
                  <div className="text-xs font-mono-num mt-1 font-bold text-[#FC4C02]">
                    {modeInfo.pace}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Kinetic SVG Animated Route Beam + Dynamic Odometer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Dynamic Neon Vector Route */}
            <div className="md:col-span-7 relative h-40 sm:h-48 rounded-2xl bg-[#09090b] border border-white/10 p-3 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between text-[11px] font-mono-num text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#FC4C02]" />
                  CIRCUITO VETORIAL KINETIC
                </span>
                <span className="text-[#FC4C02] font-bold">
                  VELOCIDADE: {details.speed}
                </span>
              </div>

              {/* Animated SVG Path with neon glow beam */}
              <svg className="w-full h-28 my-auto" viewBox="0 0 400 120" fill="none">
                {/* Background static faint path */}
                <path
                  d="M 20 60 C 80 15, 120 100, 190 40 C 260 -15, 300 95, 380 45"
                  stroke="#27272a"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Neon Orange Kinetic Trail */}
                <path
                  d="M 20 60 C 80 15, 120 100, 190 40 C 260 -15, 300 95, 380 45"
                  stroke="#FC4C02"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="180 80"
                  style={{
                    animation: `dashOffset ${details.animationSpeedSec}s linear infinite`
                  }}
                  filter="drop-shadow(0px 0px 8px rgba(252, 76, 2, 0.8))"
                />
                {/* Start & End points */}
                <circle cx="20" cy="60" r="5" fill="#10b981" />
                <circle cx="380" cy="45" r="5" fill="#FC4C02" stroke="#ffffff" strokeWidth="2" />
              </svg>

              <div className="flex items-center justify-between text-[10px] font-mono-num text-zinc-400">
                <span>0.00 KM • LARGADA</span>
                <span className="text-emerald-400 font-semibold">{details.cadence}</span>
                <span>CHEGADA META</span>
              </div>

              <style>{`
                @keyframes dashOffset {
                  to {
                    stroke-dashoffset: -260;
                  }
                }
              `}</style>
            </div>

            {/* Odometer Metrics Grid (Monumental numbers with count-up animation) */}
            <div className="md:col-span-5 grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#09090b] border border-white/5">
                <span className="text-[10px] font-mono-num tracking-wider text-zinc-400 uppercase block">DISTÂNCIA</span>
                <div className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mt-0.5">
                  {odometerKm.toFixed(2).replace('.', ',')} <span className="text-xs text-[#FC4C02] font-bold">KM</span>
                </div>
                <span className="text-[10px] font-mono-num text-emerald-400 flex items-center gap-1 mt-1">
                  ↑ +{(selectedPace === 'hiit' ? 0.35 : 0.15).toFixed(2)} km/min
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#09090b] border border-white/5">
                <span className="text-[10px] font-mono-num tracking-wider text-zinc-400 uppercase block">PASSOS</span>
                <div className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mt-0.5 font-mono-num">
                  {odometerSteps.toLocaleString('pt-BR')}
                </div>
                <span className="text-[10px] font-mono-num text-zinc-400 mt-1 block">
                  Cadência {details.cadence}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#09090b] border border-white/5">
                <span className="text-[10px] font-mono-num tracking-wider text-zinc-400 uppercase block">TEMPO DECORRIDO</span>
                <div className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mt-0.5 font-mono-num">
                  {Math.floor(odometerTime / 60)}:{(odometerTime % 60).toString().padStart(2, '0')}
                </div>
                <span className="text-[10px] font-mono-num text-amber-400 mt-1 block">
                  {details.caloriesPerHour} kcal/hora
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#09090b] border border-white/5">
                <span className="text-[10px] font-mono-num tracking-wider text-zinc-400 uppercase block">ZONA CARDÍACA</span>
                <div className="font-display font-black text-xl sm:text-2xl text-[#FC4C02] tracking-tight mt-0.5">
                  {details.heartRate}
                </div>
                <span className="text-[10px] font-mono-num text-zinc-400 mt-1 block">
                  Sensor Bluetooth Ativo
                </span>
              </div>
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-5 border-t border-white/5">
            <button
              onClick={() => onStartWorkout(selectedPace as SportType)}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FC4C02] to-[#FF4500] text-black font-display font-black text-sm tracking-wider uppercase hover:opacity-95 shadow-[0_0_24px_rgba(252,76,2,0.4)] transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>GRAVAR {details.label.toUpperCase()} COM GPS & HIIT</span>
            </button>

            <button
              onClick={onExploreFeed}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-[#18181B] border border-white/10 hover:border-white/20 text-white font-display font-bold text-sm tracking-wider uppercase hover:bg-white/5 transition-all cursor-pointer"
            >
              <span>VER FEED DE ATIVIDADES</span>
              <ArrowRight className="w-4 h-4 text-[#FC4C02]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
