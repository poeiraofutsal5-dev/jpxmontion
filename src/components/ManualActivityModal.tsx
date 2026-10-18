import React, { useState } from 'react';
import { X, Check, Edit3, Award, Footprints, Zap } from 'lucide-react';
import { Activity, SportType } from '../types';
import { calculateCalories } from '../utils/formatters';
import { IBIRAPUERA_CIRCUIT } from '../data/mockData';

interface ManualActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activity: Activity) => void;
}

export const ManualActivityModal: React.FC<ManualActivityModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [sport, setSport] = useState<SportType>('run');
  const [distanceKm, setDistanceKm] = useState('5.0');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('28');
  const [seconds, setSeconds] = useState('30');
  const [elevationM, setElevationM] = useState('35');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const km = parseFloat(distanceKm) || 5.0;
    const distanceMeters = km * 1000;
    const totalDurationSec =
      (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);

    const safeDuration = totalDurationSec > 0 ? totalDurationSec : 1800;
    const pace = safeDuration / km;
    const steps = Math.round(km * 1150);

    const newActivity: Activity = {
      id: `manual-${Date.now()}`,
      title: title.trim() || `${sport === 'run' ? 'Corrida' : sport === 'walk' ? 'Caminhada' : 'HIIT'} Manual`,
      athlete: {
        name: 'Você (Lucas Valério)',
        handle: '@lucasv_jpx',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        city: 'São Paulo, Brasil',
        badge: 'PRO ATHLETE'
      },
      sport,
      date: 'Hoje • Registro Manual',
      distance: distanceMeters,
      steps,
      duration: safeDuration,
      pace,
      elevationGain: parseInt(elevationM) || 35,
      calories: calculateCalories(distanceMeters, sport),
      likes: 1,
      hasLiked: true,
      comments: [],
      coordinates: IBIRAPUERA_CIRCUIT
    };

    onSubmit(newActivity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#121214] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.9)] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-[#FC4C02]" />
            <h2 className="font-display font-black text-lg text-white">Atividade Manual</h2>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-mono-num text-zinc-400 uppercase tracking-wider block mb-1">
              Título do Treino
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="ex: Fartlek noturno ou Esteira 5K"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#FC4C02]"
            />
          </div>

          <div>
            <label className="text-xs font-mono-num text-zinc-400 uppercase tracking-wider block mb-1.5">
              Esporte
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'run' as SportType, label: 'Corrida', icon: Award },
                { id: 'walk' as SportType, label: 'Caminhada', icon: Footprints },
                { id: 'hiit' as SportType, label: 'HIIT', icon: Zap }
              ].map(s => {
                const Icon = s.icon;
                const isSelected = sport === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSport(s.id)}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-display font-bold uppercase transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#18181B] border-[#FC4C02] text-white shadow-[0_0_12px_rgba(252,76,2,0.3)]'
                        : 'bg-[#09090b] border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FC4C02]' : ''}`} />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono-num text-zinc-400 uppercase tracking-wider block mb-1">
                Distância (km)
              </label>
              <input
                type="number"
                step="0.01"
                value={distanceKm}
                onChange={e => setDistanceKm(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-white/10 text-sm text-white font-mono-num font-bold focus:outline-none focus:border-[#FC4C02]"
              />
            </div>

            <div>
              <label className="text-xs font-mono-num text-zinc-400 uppercase tracking-wider block mb-1">
                Elevação (m)
              </label>
              <input
                type="number"
                value={elevationM}
                onChange={e => setElevationM(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-white/10 text-sm text-white font-mono-num font-bold focus:outline-none focus:border-[#FC4C02]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono-num text-zinc-400 uppercase tracking-wider block mb-1">
              Duração (Horas : Minutos : Segundos)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                placeholder="0h"
                value={hours}
                onChange={e => setHours(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#09090b] border border-white/10 text-sm text-white font-mono-num text-center"
              />
              <input
                type="number"
                placeholder="28m"
                value={minutes}
                onChange={e => setMinutes(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#09090b] border border-white/10 text-sm text-white font-mono-num text-center"
              />
              <input
                type="number"
                placeholder="30s"
                value={seconds}
                onChange={e => setSeconds(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#09090b] border border-white/10 text-sm text-white font-mono-num text-center"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FC4C02] to-[#FF4500] text-black font-display font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(252,76,2,0.4)] hover:opacity-95 transition-all cursor-pointer"
            >
              Salvar Atividade no Feed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
