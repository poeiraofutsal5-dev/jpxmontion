/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav, NavTab } from './components/BottomNav';
import { FeedTab } from './components/FeedTab';
import { RecorderTab } from './components/RecorderTab';
import { ProfileTab } from './components/ProfileTab';
import { ShareModal } from './components/ShareModal';
import { EditProfileModal } from './components/EditProfileModal';
import { Activity, SportType, UserProfile } from './types';
import { INITIAL_ACTIVITIES } from './data/mockData';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Lucas Valério',
  handle: '@lucasv_jpx',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  badge: 'PRO ATHLETE',
  city: 'São Paulo, Brasil',
  workoutsThisYear: 48,
  totalKm: 432.6,
  totalKcal: 32840
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('inicio');
  const [streakWeeks, setStreakWeeks] = useState(14);

  // User profile state with localStorage persistence
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('jpx_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_PROFILE;
  });

  // Activities state: ONLY user's workouts (Somente meus treinos - Imagem 1)
  const [activities, setActivities] = useState<Activity[]>(() => {
    const userInitProfile = (() => {
      try {
        const saved = localStorage.getItem('jpx_user_profile');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
      return DEFAULT_PROFILE;
    })();

    return INITIAL_ACTIVITIES.map(act => ({
      ...act,
      athlete: {
        name: userInitProfile.name,
        handle: userInitProfile.handle,
        avatar: userInitProfile.avatar,
        badge: userInitProfile.badge,
        city: userInitProfile.city
      }
    }));
  });

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Preset configuration when starting from "Treinos" tab
  const [recorderSport, setRecorderSport] = useState<SportType>('run');
  const [presetHiitConfig, setPresetHiitConfig] = useState<{
    rounds: number;
    sprintSec: number;
    restSec: number;
  }>({
    rounds: 25,
    sprintSec: 30,
    restSec: 30
  });

  // Share modal state
  const [shareActivity, setShareActivity] = useState<Activity | null>(null);

  // Toast notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save profile changes
  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    try {
      localStorage.setItem('jpx_user_profile', JSON.stringify(updatedProfile));
    } catch {
      // ignore
    }

    // Update user avatar and name in their activities as well
    setActivities(prev =>
      prev.map(act => {
        if (act.athlete.handle === profile.handle || act.athlete.name.includes('Você') || act.athlete.name === profile.name) {
          return {
            ...act,
            athlete: {
              ...act.athlete,
              name: updatedProfile.name,
              handle: updatedProfile.handle,
              avatar: updatedProfile.avatar,
              badge: updatedProfile.badge,
              city: updatedProfile.city
            }
          };
        }
        return act;
      })
    );

    showToast('Perfil atualizado com sucesso!');
  };

  // Start preset workout from "Treinos" tab
  const handleStartPresetWorkout = (
    sport: SportType,
    rounds = 25,
    sprintSec = 30,
    restSec = 30
  ) => {
    setRecorderSport(sport);
    setPresetHiitConfig({ rounds, sprintSec, restSec });
    setActiveTab('gravar');
    showToast(`Iniciando ${sport === 'hiit' ? `HIIT ${rounds} Tiros (30s/30s)` : sport.toUpperCase()}!`);
  };

  // Like / Kudos toggle
  const handleToggleLike = (activityId: string) => {
    setActivities(prev =>
      prev.map(act => {
        if (act.id === activityId) {
          const nextLiked = !act.hasLiked;
          return {
            ...act,
            hasLiked: nextLiked,
            likes: nextLiked ? act.likes + 1 : Math.max(0, act.likes - 1)
          };
        }
        return act;
      })
    );
  };

  // Add comment
  const handleAddComment = (activityId: string, commentText: string) => {
    setActivities(prev =>
      prev.map(act => {
        if (act.id === activityId) {
          const newComment = {
            id: `cmt-${Date.now()}`,
            athlete: profile.name,
            avatar: profile.avatar,
            text: commentText,
            time: 'Agora mesmo'
          };
          return {
            ...act,
            comments: [...act.comments, newComment]
          };
        }
        return act;
      })
    );
    showToast('Comentário publicado!');
  };

  // Finished GPS Recording
  const handleAddActivity = (newActivity: Activity) => {
    // Attach current athlete profile info
    const fullActivity: Activity = {
      ...newActivity,
      athlete: {
        name: profile.name,
        handle: profile.handle,
        avatar: profile.avatar,
        city: profile.city,
        badge: profile.badge
      }
    };

    setActivities([fullActivity, ...activities]);
    setStreakWeeks(prev => prev + 1);

    // Update profile totals
    setProfile(prev => {
      const updated = {
        ...prev,
        workoutsThisYear: prev.workoutsThisYear + 1,
        totalKm: +(prev.totalKm + (fullActivity.distance / 1000)).toFixed(1),
        totalKcal: prev.totalKcal + fullActivity.calories
      };
      try {
        localStorage.setItem('jpx_user_profile', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setActiveTab('inicio');
    showToast('🔥 Treino salvo e publicado no feed!');
  };

  // Delete activity
  const handleDeleteActivity = (activityId: string) => {
    setActivities(prev => prev.filter(act => act.id !== activityId));
    showToast('Treino excluído com sucesso.');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-[#FC4C02] selection:text-white">
      {/* Top Navbar: User Profile Photo & JPX MOTION */}
      <Navbar
        profile={profile}
        streakWeeks={streakWeeks}
        onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-3">
        {/* Interface Início: Somente os treinos salvos (Imagem 7) */}
        {activeTab === 'inicio' && (
          <FeedTab
            activities={activities}
            streakWeeks={streakWeeks}
            onOpenShareModal={(act) => setShareActivity(act)}
            onOpenStreakDetails={() => setActiveTab('voce')}
            onToggleLike={handleToggleLike}
            onAddComment={handleAddComment}
            onDeleteActivity={handleDeleteActivity}
          />
        )}

        {/* Aba Gravar: Tela de Treino (Imagem 3) + Gravador GPS Real + Motor HIIT 25x 30s/30s */}
        {activeTab === 'gravar' && (
          <div className="pt-2">
            <RecorderTab
              initialSport={recorderSport}
              presetConfig={presetHiitConfig}
              onFinishWorkout={handleAddActivity}
              onCancel={() => setActiveTab('inicio')}
            />
          </div>
        )}

        {/* Aba Você: Perfil Editável + Sub-abas Funcionais (Progresso, Treinos, Atividades) */}
        {activeTab === 'voce' && (
          <div className="pt-2">
            <ProfileTab
              streakWeeks={streakWeeks}
              activities={activities}
              profile={profile}
              onEditProfile={() => setIsEditProfileOpen(true)}
              onOpenShareModal={(act) => setShareActivity(act)}
              onStartPresetWorkout={handleStartPresetWorkout}
              onDeleteActivity={handleDeleteActivity}
            />
          </div>
        )}
      </main>

      {/* Barra de Navegação Inferior Flutuante (Início, Gravar, Você) */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isRecording={activeTab === 'gravar'}
      />

      {/* Modal Editar Perfil (Com suporte à Foto Logo Oficial JPX - Imagem 2) */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        profile={profile}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      {/* Modal Compartilhar Atividade (Sticker Transparente / Stories) */}
      <ShareModal
        activity={shareActivity}
        onClose={() => setShareActivity(null)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#121214] border border-[#FC4C02]/50 text-xs font-mono-num font-bold text-white shadow-[0_0_24px_rgba(252,76,2,0.4)] animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
