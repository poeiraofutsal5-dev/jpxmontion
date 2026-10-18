import React, { useState } from 'react';
import { Flame, Award, Calendar, TrendingUp, Zap, Footprints, Shield, ChevronRight, Edit3, Play, Clock, Share2, Trash2, AlertTriangle } from 'lucide-react';
import { Activity, DotDay, SportType, WeekStat, UserProfile } from '../types';
import { MOCK_12_WEEKS, MOCK_DOT_DAYS } from '../data/mockData';
import { formatDistance, formatDuration, formatPace } from '../utils/formatters';
import { DarkMap } from './DarkMap';

interface ProfileTabProps {
  streakWeeks: number;
  activities: Activity[];
  profile: UserProfile;
  onEditProfile: () => void;
  onOpenShareModal: (activity: Activity) => void;
  onStartPresetWorkout: (sport: SportType, rounds?: number, sprintSec?: number, restSec?: number) => void;
  onDeleteActivity?: (activityId: string) => void;
}

type ProfileSubTab = 'progresso' | 'treinos' | 'atividades';
type MetricFilter = 'distance' | 'time' | 'elevation';

export const ProfileTab: React.FC<ProfileTabProps> = ({
  streakWeeks,
  activities,
  profile,
  onEditProfile,
  onOpenShareModal,
  onStartPresetWorkout,
  onDeleteActivity
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>('progresso');
  const [activeSportFilter, setActiveSportFilter] = useState<'all' | SportType>('all');
  const [chartMetric, setChartMetric] = useState<MetricFilter>('distance');
  const [hoveredWeek, setHoveredWeek] = useState<WeekStat | null>(MOCK_12_WEEKS[MOCK_12_WEEKS.length - 1]);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);

  // Strava 12-Bar Chart calculation
  const currentWeek = MOCK_12_WEEKS[MOCK_12_WEEKS.length - 1];

  const maxVal = Math.max(
    ...MOCK_12_WEEKS.map(w =>
      chartMetric === 'distance' ? w.distanceKm : chartMetric === 'time' ? w.durationHours : w.elevationM
    )
  );

  const avgVal =
    MOCK_12_WEEKS.reduce((acc, w) => {
      const v = chartMetric === 'distance' ? w.distanceKm : chartMetric === 'time' ? w.durationHours : w.elevationM;
      return acc + v;
    }, 0) / MOCK_12_WEEKS.length;

  const chartWidth = 560;
  const chartHeight = 210;
  const chartPaddingLeft = 24;
  const chartPaddingRight = 55;
  const chartPaddingTop = 25;
  const chartPaddingBottom = 35;

  const innerWidth = chartWidth - chartPaddingLeft - chartPaddingRight;
  const innerHeight = chartHeight - chartPaddingTop - chartPaddingBottom;

  const barCount = MOCK_12_WEEKS.length;
  const barSlot = innerWidth / barCount;
  const barWidth = 24;

  // Filter activities for the "ATIVIDADES" tab
  const userActivities = activities.filter(a =>
    activeSportFilter === 'all' ? true : a.sport === activeSportFilter
  );

  return (
    <div className="space-y-6 pb-28">
      {/* Athlete Header Card (Editable - Imagem 1) */}
      <div className="rounded-3xl bg-[#121214] border border-white/10 p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar with flame indicator - Clickable to edit */}
            <div
              onClick={onEditProfile}
              className="relative cursor-pointer group shrink-0"
              role="button"
              tabIndex={0}
              aria-label="Editar foto de perfil"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl overflow-hidden border-2 border-[#FC4C02] shadow-[0_0_20px_rgba(252,76,2,0.4)] group-hover:scale-105 transition-all">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#FC4C02] text-black shadow-md group-hover:scale-110 transition-transform">
                <Flame className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>

            {/* Profile Information */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-xl sm:text-2xl text-white">
                  {profile.name}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FC4C02]/20 border border-[#FC4C02]/40 text-[#FC4C02] font-mono-num font-bold uppercase tracking-wider">
                  {profile.badge}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono-num mt-0.5">
                {profile.handle} • {profile.city}
              </p>

              {/* Stats Row (48 treinos em 2026 • 432,6 km totais • 32.840 kcal) */}
              <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs font-mono-num text-zinc-300">
                <span><strong className="text-white">{profile.workoutsThisYear}</strong> treinos em 2026</span>
                <span className="text-zinc-600">•</span>
                <span><strong className="text-white">{profile.totalKm.toFixed(1).replace('.', ',')}</strong> km totais</span>
                <span className="text-zinc-600">•</span>
                <span><strong className="text-white">{profile.totalKcal.toLocaleString('pt-BR')}</strong> kcal</span>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={onEditProfile}
            className="self-end sm:self-center flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18181B] hover:bg-[#27272a] text-zinc-200 hover:text-white border border-white/10 text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#FC4C02]" />
            <span>Editar Perfil</span>
          </button>
        </div>
      </div>

      {/* Sub-navegação: PROGRESSO, TREINOS, ATIVIDADES (Now fully functional - Imagem 5) */}
      <div className="border-b border-white/10 flex items-center justify-around">
        {[
          { id: 'progresso' as ProfileSubTab, label: 'Progresso' },
          { id: 'treinos' as ProfileSubTab, label: 'Treinos' },
          { id: 'atividades' as ProfileSubTab, label: 'Atividades' }
        ].map(tab => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`relative py-3 px-6 text-xs sm:text-sm font-display font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FC4C02] shadow-[0_0_10px_#FC4C02]" />
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* ABA 1: PROGRESSO */}
      {/* ============================================================== */}
      {activeSubTab === 'progresso' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Card de Sequência e Calendário Matricial */}
          <div className="rounded-3xl bg-[#121214] border border-white/10 p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
            <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
              {/* Lado Esquerdo: Grande ícone de chama + Semanas consecutivas */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#FC4C02] to-[#FF4500] p-0.5 shadow-[0_0_28px_rgba(252,76,2,0.45)] shrink-0 flex items-center justify-center">
                  <div className="w-full h-full rounded-[22px] bg-black/60 flex items-center justify-center">
                    <Flame className="w-9 h-9 sm:w-11 sm:h-11 text-[#FC4C02] animate-bounce" />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono-num font-bold text-[#FC4C02] uppercase tracking-widest block">
                    CONSTÂNCIA ATIVA
                  </span>
                  <div className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight mt-0.5">
                    {streakWeeks} SEMANAS
                  </div>
                  <p className="text-xs text-zinc-400 font-mono-num mt-0.5">
                    Semanas ininterruptas de treinos registrados
                  </p>
                </div>
              </div>

              {/* Lado Direito: Matriz Minimalista de Pontos (30 dias) */}
              <div className="w-full md:w-auto">
                <div className="flex items-center justify-between text-[11px] font-mono-num text-zinc-400 mb-2">
                  <span>ÚLTIMOS 30 DIAS</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px]">MENOS</span>
                    <span className="w-2 h-2 rounded bg-zinc-800" />
                    <span className="w-2 h-2 rounded bg-amber-900/60" />
                    <span className="w-2 h-2 rounded bg-[#FC4C02]/60" />
                    <span className="w-2 h-2 rounded bg-[#FC4C02] shadow-[0_0_6px_#FC4C02]" />
                    <span className="text-[9px]">MAIS</span>
                  </div>
                </div>

                <div className="grid grid-cols-10 gap-1.5 sm:gap-2 p-3 rounded-2xl bg-[#09090b] border border-white/5">
                  {MOCK_DOT_DAYS.map((dot) => {
                    let bgClass = 'bg-zinc-800/80';
                    if (dot.intensity === 1) bgClass = 'bg-amber-900/60';
                    if (dot.intensity === 2) bgClass = 'bg-[#FC4C02]/70';
                    if (dot.intensity === 3) bgClass = 'bg-[#FC4C02] shadow-[0_0_8px_#FC4C02]';

                    return (
                      <div
                        key={dot.date}
                        title={`${dot.date}: ${dot.km > 0 ? `${dot.km}km (${dot.sport})` : 'Descanso'}`}
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md ${bgClass} transition-transform hover:scale-125 cursor-pointer`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de Barras Idêntico ao Strava (Imagem 6): Esta semana + Últimas 12 semanas */}
          <div className="rounded-3xl bg-[#121214] border border-white/10 p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
            {/* Header: Esta semana com seletor de métrica */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-mono-num font-bold text-[#FC4C02] uppercase tracking-widest block">
                  ESTATÍSTICAS SEMANAIS
                </span>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                  Esta semana
                </h2>
              </div>

              {/* Metric Selector: Distância | Tempo | Elevação */}
              <div className="flex items-center gap-1.5 bg-[#09090b] p-1 rounded-xl border border-white/5 self-start sm:self-auto">
                {[
                  { id: 'distance', label: 'Distância' },
                  { id: 'time', label: 'Tempo' },
                  { id: 'elevation', label: 'Elevação' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setChartMetric(m.id as MetricFilter)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono-num font-bold transition-all cursor-pointer ${
                      chartMetric === m.id
                        ? 'bg-[#FC4C02] text-black shadow-[0_0_10px_rgba(252,76,2,0.4)]'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Três Métricas Principais da Semana (Strava) */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#09090b] border border-white/5 mb-6">
              <div>
                <span className="text-[10px] font-mono-num text-zinc-400 uppercase tracking-wider block font-semibold">
                  Distância
                </span>
                <div className="font-display font-black text-xl sm:text-2xl text-white tracking-tight mt-0.5">
                  {currentWeek.distanceKm.toFixed(1).replace('.', ',')} <span className="text-xs text-zinc-400 font-normal">km</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono-num text-zinc-400 uppercase tracking-wider block font-semibold">
                  Tempo
                </span>
                <div className="font-display font-black text-xl sm:text-2xl text-white tracking-tight mt-0.5">
                  6h 06m
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono-num text-zinc-400 uppercase tracking-wider block font-semibold">
                  Elevação
                </span>
                <div className="font-display font-black text-xl sm:text-2xl text-white tracking-tight mt-0.5">
                  +{currentWeek.elevationM} <span className="text-xs text-zinc-400 font-normal">m</span>
                </div>
              </div>
            </div>

            {/* Sub-header: Últimas 12 semanas + Banner da semana inspecionada */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#FC4C02]" />
                <h3 className="font-display font-bold text-sm text-zinc-200">
                  Últimas 12 semanas
                </h3>
              </div>

              {hoveredWeek && (
                <div className="text-xs font-mono-num text-zinc-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FC4C02] animate-pulse" />
                  <span className="font-bold text-white">{hoveredWeek.week}</span>:
                  <span className="text-[#FC4C02] font-bold">
                    {chartMetric === 'distance'
                      ? `${hoveredWeek.distanceKm} km`
                      : chartMetric === 'time'
                      ? `${hoveredWeek.durationHours}h`
                      : `+${hoveredWeek.elevationM}m`}
                  </span>
                  <span className="text-zinc-500">({hoveredWeek.workouts} treinos)</span>
                </div>
              )}
            </div>

            {/* Gráfico de 12 Barras Verticais Idêntico ao Strava */}
            <div className="relative w-full rounded-2xl bg-[#09090b] border border-white/5 p-3 sm:p-4">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-48 sm:h-56 overflow-visible"
              >
                <defs>
                  {/* Gradiente da Barra Ativa */}
                  <linearGradient id="activeBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FC4C02" />
                    <stop offset="100%" stopColor="#FF5722" />
                  </linearGradient>

                  {/* Gradiente das Barras Padrão */}
                  <linearGradient id="defaultBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FC4C02" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#FC4C02" stopOpacity="0.35" />
                  </linearGradient>
                </defs>

                {/* Linhas de Grade Horizontais e Eixo Y na Direita (Padrão Strava) */}
                {[1.0, 0.66, 0.33, 0.0].map((pct, idx) => {
                  const y = chartPaddingTop + (1 - pct) * innerHeight;
                  const labelVal = Math.round(maxVal * pct);
                  const labelUnit = chartMetric === 'distance' ? 'km' : chartMetric === 'time' ? 'h' : 'm';

                  return (
                    <g key={idx}>
                      <line
                        x1={chartPaddingLeft}
                        y1={y}
                        x2={chartWidth - chartPaddingRight}
                        y2={y}
                        stroke="#222226"
                        strokeDasharray={pct === 0 ? undefined : '3 3'}
                        strokeWidth="1"
                      />
                      {/* Eixo Y na direita (igual ao Strava) */}
                      <text
                        x={chartWidth - chartPaddingRight + 8}
                        y={y + 3}
                        fill="#71717A"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="start"
                      >
                        {labelVal} {labelUnit}
                      </text>
                    </g>
                  );
                })}

                {/* Linha Dotted de Média Semanal */}
                {(() => {
                  const avgY = chartPaddingTop + (1 - avgVal / maxVal) * innerHeight;
                  return (
                    <g>
                      <line
                        x1={chartPaddingLeft}
                        y1={avgY}
                        x2={chartWidth - chartPaddingRight}
                        y2={avgY}
                        stroke="#FC4C02"
                        strokeDasharray="4 4"
                        strokeWidth="1.2"
                        strokeOpacity="0.7"
                      />
                      <text
                        x={chartPaddingLeft + 4}
                        y={avgY - 4}
                        fill="#FC4C02"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        opacity="0.8"
                      >
                        MÉDIA: {chartMetric === 'distance' ? `${avgVal.toFixed(1)} km` : chartMetric === 'time' ? `${avgVal.toFixed(1)}h` : `${Math.round(avgVal)}m`}
                      </text>
                    </g>
                  );
                })()}

                {/* 12 Barras Verticais */}
                {MOCK_12_WEEKS.map((stat, idx) => {
                  const val =
                    chartMetric === 'distance'
                      ? stat.distanceKm
                      : chartMetric === 'time'
                      ? stat.durationHours
                      : stat.elevationM;

                  const barHeight = Math.max(8, (val / maxVal) * innerHeight);
                  const x = chartPaddingLeft + idx * barSlot + (barSlot - barWidth) / 2;
                  const y = chartPaddingTop + innerHeight - barHeight;

                  const isCurrent = idx === MOCK_12_WEEKS.length - 1;
                  const isHovered = hoveredWeek?.week === stat.week;

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredWeek(stat)}
                      onClick={() => setHoveredWeek(stat)}
                    >
                      {/* Barra Vertical com Cantos Arredondados no Topo */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="5"
                        ry="5"
                        fill={isCurrent || isHovered ? 'url(#activeBarGrad)' : 'url(#defaultBarGrad)'}
                        filter={
                          isCurrent || isHovered
                            ? 'drop-shadow(0px 0px 8px rgba(252,76,2,0.85))'
                            : undefined
                        }
                        className="transition-all duration-200"
                      />

                      {/* Indicador de Barra Atual (Ponto ou Linha no Topo) */}
                      {isCurrent && (
                        <circle
                          cx={x + barWidth / 2}
                          cy={y - 6}
                          r="3"
                          fill="#FC4C02"
                          className="animate-ping"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Eixo X: Meses ao Longo das 12 Semanas (Jul, Ago, Set, Out) */}
                <g>
                  <text
                    x={chartPaddingLeft + barSlot * 1.5}
                    y={chartHeight - 8}
                    fill="#71717A"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    Jul
                  </text>
                  <text
                    x={chartPaddingLeft + barSlot * 4.5}
                    y={chartHeight - 8}
                    fill="#71717A"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    Ago
                  </text>
                  <text
                    x={chartPaddingLeft + barSlot * 7.5}
                    y={chartHeight - 8}
                    fill="#71717A"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    Set
                  </text>
                  <text
                    x={chartPaddingLeft + barSlot * 10.5}
                    y={chartHeight - 8}
                    fill="#FC4C02"
                    fontWeight="bold"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    Out (Hoje)
                  </text>
                </g>
              </svg>

              {/* Rodapé Resumo do Gráfico */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-3 border-t border-white/5 text-[11px] font-mono-num text-zinc-400">
                <span>
                  Média semanal: <strong className="text-zinc-200">{avgVal.toFixed(1)} {chartMetric === 'distance' ? 'km' : chartMetric === 'time' ? 'h' : 'm'}</strong>
                </span>
                <span>
                  Maior volume: <strong className="text-[#FC4C02]">{maxVal.toFixed(1)} {chartMetric === 'distance' ? 'km' : chartMetric === 'time' ? 'h' : 'm'}</strong>
                </span>
                <span className="text-emerald-400 font-semibold">
                  12 sem. seguidas de treinos 🔥
                </span>
              </div>
            </div>
          </div>

          {/* Recordes Pessoais */}
          <div className="rounded-3xl bg-[#121214] border border-white/10 p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-[#FC4C02]" />
              <h2 className="font-display font-bold text-base sm:text-lg text-white">
                Recordes Pessoais (Melhores Marcas)
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { dist: '1 KM', time: '3m 18s', pace: '3\'18"', date: '12 Out 2026' },
                { dist: '5 KM', time: '18m 42s', pace: '3\'44"', date: '04 Out 2026' },
                { dist: '10 KM', time: '41m 15s', pace: '4\'07"', date: '18 Set 2026' },
                { dist: 'MEIA MARATONA', time: '1h 32m', pace: '4\'22"', date: '28 Ago 2026' }
              ].map((pb, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#09090b] border border-white/5">
                  <span className="text-[10px] font-mono-num text-[#FC4C02] font-bold block uppercase tracking-wider">
                    {pb.dist}
                  </span>
                  <div className="font-display font-black text-xl text-white mt-1">
                    {pb.time}
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono-num block mt-0.5">{pb.pace}</span>
                  <span className="text-[10px] text-zinc-500 font-mono-num block mt-1">{pb.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 2: TREINOS (Planos, Rotinas & HIIT 25 Tiros) */}
      {/* ============================================================== */}
      {activeSubTab === 'treinos' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono-num text-zinc-400 uppercase tracking-wider">
              SEUS PLANOS E PROTOCOLOS DE TREINO
            </span>
          </div>

          {/* Destaque: Protocolo do Usuário - 25 Tiros de 30s Sprint / 30s Caminhada */}
          <div className="rounded-3xl bg-gradient-to-br from-[#18181B] via-[#121214] to-[#18181B] border-2 border-[#FC4C02] p-6 shadow-[0_12px_40px_rgba(252,76,2,0.25)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FC4C02]/20 text-[#FC4C02] font-mono-num text-[11px] font-bold mb-2">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>SEU PROTOCOLO FAVORITO</span>
                </div>
                <h3 className="font-display font-black text-xl sm:text-2xl text-white">
                  HIIT 25 Tiros Alternados
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                  Primeiro você corre 30s em velocidade máxima (Z5), depois caminha 30s de recuperação. Total de 25 repetições ininterruptas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 my-4 py-3 border-y border-white/10 text-center font-mono-num text-xs">
              <div className="p-2.5 rounded-xl bg-[#09090b]">
                <span className="text-[10px] text-[#FC4C02] block uppercase font-bold">Tiro Sprint</span>
                <strong className="text-white text-base">30 seg</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#09090b]">
                <span className="text-[10px] text-zinc-400 block uppercase">Caminhada</span>
                <strong className="text-white text-base">30 seg</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#09090b]">
                <span className="text-[10px] text-zinc-400 block uppercase">Total Tiros</span>
                <strong className="text-[#FC4C02] text-base">25 rounds</strong>
              </div>
            </div>

            <button
              onClick={() => onStartPresetWorkout('hiit', 25, 30, 30)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FC4C02] to-[#FF4500] text-black font-display font-black text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(252,76,2,0.4)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>INICIAR ESTE TREINO AGORA (25 TIROS)</span>
            </button>
          </div>

          {/* Outros Treinos Estruturados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              {
                title: 'Fartlek Piramidal Livre',
                sport: 'run' as SportType,
                desc: '1k leve, 2k ritmo moderado, 4x tiros de 200m e 1k desaquecimento',
                duration: '45 min',
                type: 'Resistência aeróbica'
              },
              {
                title: 'Caminhada Regenerativa',
                sport: 'walk' as SportType,
                desc: 'Cadência contínua de 115 ppm para recuperação muscular ativa e queima',
                duration: '50 min',
                type: 'Recuperação ativa'
              },
              {
                title: 'HIIT Curto 10x 30s/30s',
                sport: 'hiit' as SportType,
                rounds: 10,
                desc: '10 tiros rápidos de 30s corrida e 30s caminhada para dias de pouco tempo',
                duration: '10 min',
                type: 'Sprint Express'
              },
              {
                title: 'Longão Progressivo 12K',
                sport: 'run' as SportType,
                desc: 'Corrida contínua iniciando em ritmo confortável e acelerando nos 3km finais',
                duration: '1h 05m',
                type: 'Endurance'
              }
            ].map((workout, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#121214] border border-white/5 hover:border-white/15 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono-num text-zinc-400 mb-1">
                    <span className="text-[#FC4C02] uppercase font-bold">{workout.type}</span>
                    <span>{workout.duration}</span>
                  </div>
                  <h4 className="font-display font-bold text-base text-white">{workout.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{workout.desc}</p>
                </div>

                <button
                  onClick={() => onStartPresetWorkout(workout.sport, workout.rounds || 25, 30, 30)}
                  className="mt-4 py-2 px-3 rounded-xl bg-[#18181B] hover:bg-[#27272a] text-zinc-200 hover:text-white border border-white/10 text-xs font-display font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-[#FC4C02] fill-current" />
                  <span>Gravar</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 3: ATIVIDADES (Histórico Completo do Atleta) */}
      {/* ============================================================== */}
      {activeSubTab === 'atividades' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono-num text-zinc-400 uppercase tracking-wider">
              HISTÓRICO DE ATIVIDADES ({userActivities.length})
            </span>
          </div>

          {/* Sport filter pills inside Atividades */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'run', label: 'Corrida' },
              { id: 'walk', label: 'Caminhada' },
              { id: 'hiit', label: 'HIIT' }
            ].map(filter => {
              const isActive = activeSportFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveSportFilter(filter.id as typeof activeSportFilter)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-display font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#18181B] text-white border border-[#FC4C02]'
                      : 'bg-[#121214] text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Activities list - Strava Card Style */}
          <div className="space-y-4">
            {userActivities.map(act => (
              <div
                key={act.id}
                className="rounded-3xl bg-[#121214] border border-white/10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all hover:border-white/20"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono-num font-bold tracking-wider ${
                        act.sport === 'hiit'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : act.sport === 'run'
                          ? 'bg-[#FC4C02]/15 text-[#FC4C02] border border-[#FC4C02]/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {act.sport === 'hiit' ? 'HIIT SPRINT' : act.sport === 'run' ? 'CORRIDA' : 'CAMINHADA'}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono-num">{act.date}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenShareModal(act)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181B] hover:bg-[#27272a] text-zinc-200 hover:text-white border border-white/10 text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#FC4C02]" />
                        <span>Sticker</span>
                      </button>

                      {onDeleteActivity && (
                        <button
                          onClick={() => setActivityToDelete(act)}
                          className="p-1.5 rounded-full hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Excluir treino"
                          aria-label="Excluir este treino"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="font-display font-black text-lg sm:text-xl text-white tracking-tight mt-2">{act.title}</h4>
                </div>

                {/* Strava 3-Column Metrics Grid */}
                <div className="px-4 sm:px-5 py-2.5 grid grid-cols-3 gap-2 border-y border-white/5 bg-[#0e0e11]/60">
                  <div>
                    <span className="text-[10px] font-mono-num uppercase tracking-wider text-zinc-400 block font-semibold">
                      Distância
                    </span>
                    <div className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">
                      {formatDistance(act.distance)}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono-num uppercase tracking-wider text-zinc-400 block font-semibold">
                      Ritmo Médio
                    </span>
                    <div className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">
                      {formatPace(act.pace)}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono-num uppercase tracking-wider text-zinc-400 block font-semibold">
                      Tempo
                    </span>
                    <div className="font-display font-black text-xl sm:text-2xl text-white tracking-tight font-mono-num">
                      {formatDuration(act.duration)}
                    </div>
                  </div>
                </div>

                {/* Map Preview */}
                <div className="px-4 sm:px-5 py-3">
                  <DarkMap coordinates={act.coordinates} heightClass="h-44 sm:h-56" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Treino no Perfil */}
      {activityToDelete && onDeleteActivity && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-3xl bg-[#141417] border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-display font-black text-xl text-white">
                Excluir Treino?
              </h3>
              <p className="text-xs text-zinc-400 mt-2">
                Tem certeza que deseja excluir o treino <strong className="text-white font-semibold">"{activityToDelete.title}"</strong>? Esta ação é definitiva.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setActivityToDelete(null)}
                className="py-2.5 px-4 rounded-xl bg-[#1f1f23] text-zinc-300 hover:text-white font-display font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteActivity(activityToDelete.id);
                  setActivityToDelete(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
