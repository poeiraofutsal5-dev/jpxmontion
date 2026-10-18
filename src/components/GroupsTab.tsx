import React, { useState } from 'react';
import { Users, Flame, Trophy, Award, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { MOCK_CHALLENGES } from '../data/mockData';
import { Challenge } from '../types';

export const GroupsTab: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>(MOCK_CHALLENGES);

  const toggleJoin = (id: string) => {
    setChallenges(prev =>
      prev.map(c => (c.id === id ? { ...c, joined: !c.joined, participants: c.joined ? c.participants - 1 : c.participants + 1 } : c))
    );
  };

  const leaderboardAthletes = [
    { rank: 1, name: 'Camila Albuquerque', km: 284.2, streak: 22, badge: 'SPEED CAPTAIN', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80' },
    { rank: 2, name: 'Lucas Valério (Você)', km: 248.5, streak: 14, badge: 'PRO ATHLETE', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
    { rank: 3, name: 'Rafael Rocha', km: 212.0, streak: 9, badge: 'HILL CLIMBER', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
    { rank: 4, name: 'Mariana Duarte', km: 194.8, streak: 12, badge: 'HIIT MASTER', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80' }
  ];

  return (
    <div className="space-y-6 pb-28">
      {/* Club Header */}
      <div className="rounded-3xl bg-[#121214] border border-white/10 p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FC4C02] to-[#FF4500] flex items-center justify-center font-display font-black text-black text-2xl shadow-[0_0_20px_rgba(252,76,2,0.4)]">
              JPX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-xl text-white">JPX Movement Club Brasil</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono-num font-bold">
                  VERIFICADO
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono-num mt-0.5">32.480 membros ativos • Ranking mensal aberto</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-full bg-[#18181B] hover:bg-[#27272a] border border-white/10 text-xs font-display font-bold uppercase tracking-wider text-white transition-all cursor-pointer">
              Convidar Amigos
            </button>
          </div>
        </div>
      </div>

      {/* Desafios Mensais (Challenges) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono-num text-zinc-400 uppercase tracking-wider">
            DESAFIOS EM ANDAMENTO
          </span>
          <span className="text-xs font-mono-num text-[#FC4C02]">
            TROFÉUS DIGITAIS EXCLUSIVOS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {challenges.map(ch => {
            const progressPct = Math.min(100, Math.round((ch.currentKm / ch.targetKm) * 100));

            return (
              <div
                key={ch.id}
                className="p-5 rounded-3xl bg-[#121214] border border-white/10 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono-num mb-2">
                    <span className="px-2 py-0.5 rounded bg-[#FC4C02]/20 text-[#FC4C02] font-bold">
                      {ch.tag}
                    </span>
                    <span className="text-zinc-400">{ch.daysLeft} dias restantes</span>
                  </div>

                  <h2 className="font-display font-bold text-base text-white">
                    {ch.title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{ch.subtitle}</p>

                  {/* Progress bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono-num">
                      <span className="text-zinc-400">{ch.currentKm.toFixed(1)} / {ch.targetKm} km</span>
                      <span className="text-[#FC4C02] font-bold">{progressPct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#09090b] overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-[#FC4C02] to-[#FF4500] rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-mono-num text-zinc-400">
                    {ch.participants.toLocaleString('pt-BR')} atletas
                  </span>

                  <button
                    onClick={() => toggleJoin(ch.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      ch.joined
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-[#FC4C02] text-black hover:bg-[#FF4500]'
                    }`}
                  >
                    {ch.joined ? 'Inscrito' : 'Participar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-3xl bg-[#121214] border border-white/10 p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="font-display font-bold text-base sm:text-lg text-white">
            Leaderboard do Mês (Top Corredores)
          </h2>
        </div>

        <div className="space-y-2">
          {leaderboardAthletes.map(ath => (
            <div
              key={ath.rank}
              className={`p-3 sm:p-4 rounded-2xl flex items-center justify-between transition-all ${
                ath.name.includes('Você')
                  ? 'bg-[#18181B] border border-[#FC4C02]/60 shadow-[0_0_15px_rgba(252,76,2,0.2)]'
                  : 'bg-[#09090b] border border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center font-display font-black text-sm ${
                  ath.rank === 1 ? 'text-amber-400 text-base' : ath.rank === 2 ? 'text-zinc-300' : ath.rank === 3 ? 'text-amber-600' : 'text-zinc-500'
                }`}>
                  #{ath.rank}
                </span>
                <img src={ath.avatar} alt={ath.name} className="w-9 h-9 rounded-full object-cover border border-white/10" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-white">{ath.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono-num">
                      {ath.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono-num flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#FC4C02]" /> {ath.streak} sem seguidas
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-display font-black text-base sm:text-lg text-white font-mono-num">
                  {ath.km.toFixed(1)} <span className="text-xs text-[#FC4C02]">KM</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
