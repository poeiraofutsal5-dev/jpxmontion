import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, Zap, Footprints, Flame, Send, Award, Trash2, X, AlertTriangle } from 'lucide-react';
import { Activity, SportType } from '../types';
import { DarkMap } from './DarkMap';
import { formatDistance, formatDuration, formatPace } from '../utils/formatters';

interface FeedTabProps {
  activities: Activity[];
  streakWeeks: number;
  onOpenShareModal: (activity: Activity) => void;
  onOpenStreakDetails: () => void;
  onToggleLike: (activityId: string) => void;
  onAddComment: (activityId: string, commentText: string) => void;
  onDeleteActivity: (activityId: string) => void;
}

export const FeedTab: React.FC<FeedTabProps> = ({
  activities,
  streakWeeks,
  onOpenShareModal,
  onOpenStreakDetails,
  onToggleLike,
  onAddComment,
  onDeleteActivity
}) => {
  const [activeSportFilter, setActiveSportFilter] = useState<'all' | SportType>('all');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);

  const filteredActivities = activeSportFilter === 'all'
    ? activities
    : activities.filter(a => a.sport === activeSportFilter);

  const toggleComments = (id: string) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendComment = (activityId: string) => {
    const text = commentInputs[activityId]?.trim();
    if (!text) return;
    onAddComment(activityId, text);
    setCommentInputs(prev => ({ ...prev, [activityId]: '' }));
    setExpandedComments(prev => ({ ...prev, [activityId]: true }));
  };

  const handleConfirmDelete = () => {
    if (activityToDelete) {
      onDeleteActivity(activityToDelete.id);
      setActivityToDelete(null);
      setOpenMenuId(null);
    }
  };

  return (
    <div className="space-y-5 pb-28 pt-1">
      {/* Feed Section Title & Strava Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">
            Meus Treinos
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FC4C02]/15 text-[#FC4C02] font-mono-num font-bold border border-[#FC4C02]/30">
            {filteredActivities.length} salvos
          </span>
        </div>

        {/* Strava Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'Todos os treinos' },
            { id: 'run', label: 'Corrida' },
            { id: 'walk', label: 'Caminhada' },
            { id: 'hiit', label: 'Sprint HIIT' }
          ].map(filter => {
            const isActive = activeSportFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveSportFilter(filter.id as typeof activeSportFilter)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-display font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)]'
                    : 'bg-[#121214] text-zinc-400 hover:text-white border border-white/5 hover:border-white/15'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity Cards Feed - Exactly like Strava */}
      <div className="space-y-6">
        {filteredActivities.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#121214] border border-white/10">
            <Flame className="w-10 h-10 text-[#FC4C02] mx-auto mb-3 opacity-60" />
            <h3 className="font-display font-bold text-lg text-white">Nenhum treino nesta categoria</h3>
            <p className="text-xs text-zinc-400 mt-1">Grave um novo treino na aba Gravar para vê-lo aqui.</p>
          </div>
        ) : (
          filteredActivities.map((act) => {
            const isCommentsOpen = !!expandedComments[act.id];
            const isMenuOpen = openMenuId === act.id;

            return (
              <article
                key={act.id}
                className="rounded-3xl bg-[#121214] border border-white/10 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.65)] transition-all hover:border-white/20 relative"
              >
                {/* Strava Athlete Header */}
                <div className="p-4 sm:p-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Circular Avatar */}
                      <img
                        src={act.athlete.avatar}
                        alt={act.athlete.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#FC4C02]/60 shadow-[0_0_12px_rgba(252,76,2,0.3)]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-base text-white hover:text-[#FC4C02] transition-colors cursor-pointer">
                            {act.athlete.name}
                          </span>
                          {act.athlete.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono-num font-semibold">
                              {act.athlete.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 font-mono-num mt-0.5">
                          {act.date}
                        </p>
                      </div>
                    </div>

                    {/* Strava Sport Icon & Action Menu */}
                    <div className="flex items-center gap-2 relative">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-mono-num font-bold">
                        {act.sport === 'hiit' ? (
                          <>
                            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-amber-400">HIIT SPRINT</span>
                          </>
                        ) : act.sport === 'run' ? (
                          <>
                            <Award className="w-3.5 h-3.5 text-[#FC4C02]" />
                            <span className="text-[#FC4C02]">CORRIDA</span>
                          </>
                        ) : (
                          <>
                            <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">CAMINHADA</span>
                          </>
                        )}
                      </div>

                      {/* Botão de Excluir Direto e Mais Opções */}
                      <button
                        onClick={() => setActivityToDelete(act)}
                        className="p-1.5 rounded-full hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Excluir treino"
                        aria-label="Excluir este treino"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Três pontos com menu */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(isMenuOpen ? null : act.id)}
                          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                            isMenuOpen ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-zinc-400 hover:text-white'
                          }`}
                          aria-label="Mais opções"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Menu Dropdown */}
                        {isMenuOpen && (
                          <div className="absolute right-0 top-full mt-1.5 z-30 w-48 rounded-2xl bg-[#1c1c20] border border-white/15 shadow-2xl p-1.5 animate-in fade-in duration-150">
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                onOpenShareModal(act);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-display font-bold text-zinc-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5 text-[#FC4C02]" />
                              <span>Sticker / Stories</span>
                            </button>

                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setActivityToDelete(act);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-display font-bold text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              <span>Excluir Treino</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Activity Title */}
                  <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight mt-3">
                    {act.title}
                  </h3>

                  {/* HIIT Summary Tag */}
                  {act.hiitSummary && (
                    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 font-mono-num font-semibold">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>{act.hiitSummary.sprintsCompleted} Tiros de 30s em Z5 • Vel. Máx: {act.hiitSummary.maxSpeedKmH} km/h</span>
                    </div>
                  )}
                </div>

                {/* Strava 3-Column Key Metrics: Distância | Ritmo Médio | Tempo */}
                <div className="px-4 sm:px-5 py-3 grid grid-cols-3 gap-2 border-y border-white/5 bg-[#0e0e11]/50">
                  <div>
                    <span className="text-[11px] font-mono-num uppercase tracking-wider text-zinc-400 block font-semibold">
                      Distância
                    </span>
                    <div className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mt-0.5">
                      {formatDistance(act.distance)}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono-num uppercase tracking-wider text-zinc-400 block font-semibold">
                      Ritmo Médio
                    </span>
                    <div className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mt-0.5">
                      {formatPace(act.pace)}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono-num uppercase tracking-wider text-zinc-400 block font-semibold">
                      Tempo
                    </span>
                    <div className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight font-mono-num mt-0.5">
                      {formatDuration(act.duration)}
                    </div>
                  </div>
                </div>

                {/* Strava Secondary Metrics Line */}
                <div className="px-4 sm:px-5 py-2.5 flex flex-wrap items-center gap-3 text-xs font-mono-num text-zinc-400">
                  <span>Ganho de elevação: <strong className="text-zinc-200">+{act.elevationGain}m</strong></span>
                  <span className="text-zinc-600">•</span>
                  <span>Passos: <strong className="text-zinc-200">{act.steps.toLocaleString('pt-BR')}</strong></span>
                  <span className="text-zinc-600">•</span>
                  <span>Calorias: <strong className="text-zinc-200">{act.calories} kcal</strong></span>
                </div>

                {/* Dark GPS Map with vibrant Strava orange route */}
                <div className="px-4 sm:px-5 pb-3">
                  <DarkMap coordinates={act.coordinates} heightClass="h-56 sm:h-72" />
                </div>

                {/* Strava Social Proof Row (Kudos athletes avatars & count) */}
                <div className="px-4 sm:px-5 py-2 flex items-center justify-between text-xs font-mono-num text-zinc-400 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    {/* Overlapping Mini Avatars */}
                    <div className="flex -space-x-1.5 overflow-hidden">
                      <img
                        className="inline-block h-5 w-5 rounded-full ring-2 ring-[#121214] object-cover"
                        src={act.athlete.avatar}
                        alt="Atleta"
                      />
                      <img
                        className="inline-block h-5 w-5 rounded-full ring-2 ring-[#121214] object-cover"
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop"
                        alt="Atleta"
                      />
                    </div>
                    <span>
                      {act.hasLiked ? (
                        <>
                          <strong className="text-white">Você</strong> e {Math.max(0, act.likes - 1)} atletas deram kudos
                        </>
                      ) : (
                        <>
                          <strong className="text-zinc-200">{act.likes} atletas</strong> deram kudos
                        </>
                      )}
                    </span>
                  </div>

                  <span className="text-zinc-400">
                    {act.comments.length} {act.comments.length === 1 ? 'comentário' : 'comentários'}
                  </span>
                </div>

                {/* Strava 3-Button Action Bar: Kudos | Comentar | Compartilhar */}
                <div className="px-2 sm:px-4 py-1.5 border-t border-white/5 grid grid-cols-3 gap-1 bg-[#0c0c0e]">
                  {/* Kudos Button */}
                  <button
                    onClick={() => onToggleLike(act.id)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      act.hasLiked
                        ? 'text-[#FC4C02] bg-[#FC4C02]/10 shadow-[0_0_12px_rgba(252,76,2,0.25)]'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                    aria-label={`Dar kudos. Total: ${act.likes}`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${act.hasLiked ? 'fill-[#FC4C02] stroke-[#FC4C02]' : ''}`} />
                    <span>Kudos</span>
                  </button>

                  {/* Comentar Button */}
                  <button
                    onClick={() => toggleComments(act.id)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isCommentsOpen
                        ? 'text-white bg-white/10'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                    aria-label="Comentários"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Comentar</span>
                  </button>

                  {/* Compartilhar Button */}
                  <button
                    onClick={() => onOpenShareModal(act)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                    aria-label="Compartilhar atividade"
                  >
                    <Share2 className="w-4 h-4 text-[#FC4C02]" />
                    <span>Compartilhar</span>
                  </button>
                </div>

                {/* Expandable Strava Comments Drawer */}
                {isCommentsOpen && (
                  <div className="border-t border-white/5 bg-[#0a0a0c] p-4 sm:p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {/* List of comments */}
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {act.comments.length === 0 ? (
                        <p className="text-xs text-zinc-400 text-center py-2">
                          Seja o primeiro a parabenizar este treino!
                        </p>
                      ) : (
                        act.comments.map(c => (
                          <div key={c.id} className="flex items-start gap-2.5 text-xs">
                            <img
                              src={c.avatar}
                              alt={c.athlete}
                              className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                            />
                            <div className="flex-1 bg-[#141417] p-2.5 rounded-2xl border border-white/5">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-display font-bold text-white text-xs">{c.athlete}</span>
                                <span className="text-[10px] font-mono-num text-zinc-400">{c.time}</span>
                              </div>
                              <p className="text-zinc-200">{c.text}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Comment input box */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <input
                        type="text"
                        value={commentInputs[act.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [act.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendComment(act.id);
                        }}
                        placeholder="Adicionar um comentário..."
                        className="flex-1 bg-[#141417] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-[#FC4C02]"
                      />
                      <button
                        onClick={() => handleSendComment(act.id)}
                        className="p-2 rounded-xl bg-[#FC4C02] text-black hover:opacity-90 transition-opacity cursor-pointer"
                        aria-label="Enviar comentário"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Modal de Confirmação de Exclusão de Treino (Imagem 1) */}
      {activityToDelete && (
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
                Tem certeza que deseja excluir o treino <strong className="text-white font-semibold">"{activityToDelete.title}"</strong>? Esta ação é definitiva e removerá todos os dados do feed.
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
                onClick={handleConfirmDelete}
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
