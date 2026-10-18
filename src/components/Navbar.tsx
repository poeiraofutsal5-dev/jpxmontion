import React from 'react';
import { Flame } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  profile: UserProfile;
  streakWeeks: number;
  onNavigateTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  streakWeeks,
  onNavigateTab
}) => {
  return (
    <header className="sticky top-0 z-[1200] w-full bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* User Profile Avatar in place of JPX logo */}
        <div
          onClick={() => onNavigateTab('voce')}
          className="flex items-center gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          aria-label="Ir para o perfil do atleta"
        >
          {/* Profile photo directly replacing the JPX box */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#FC4C02] ring-2 ring-[#FC4C02]/30 shadow-[0_0_16px_rgba(252,76,2,0.45)] group-hover:scale-105 group-hover:border-[#FF4500] transition-all shrink-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-display font-black text-xl tracking-wider text-white flex items-center gap-1.5 leading-none">
              JPX <span className="text-[#FC4C02]">MOTION</span>
            </span>
          </div>
        </div>

        {/* Right Action: Streak Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('voce')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#121214] border border-white/10 hover:border-[#FC4C02]/40 transition-colors group cursor-pointer"
            aria-label={`Sequência de ${streakWeeks} semanas`}
          >
            <Flame className="w-4 h-4 text-[#FC4C02] animate-bounce" />
            <span className="font-display font-bold text-sm text-white group-hover:text-[#FC4C02] transition-colors">
              {streakWeeks} sem
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
