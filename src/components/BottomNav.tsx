import React from 'react';
import { Home, Radio, User } from 'lucide-react';

export type NavTab = 'inicio' | 'gravar' | 'voce';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isRecording?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  isRecording = false
}) => {
  return (
    <nav
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[1200] w-[90%] max-w-sm"
      aria-label="Navegação Principal"
    >
      <div className="relative flex items-center justify-around px-4 py-2 rounded-full bg-[#121214]/92 backdrop-blur-2xl border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.85)]">
        {/* Aba Início */}
        <button
          onClick={() => onSelectTab('inicio')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'inicio' ? 'text-[#FC4C02]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="Início"
          aria-current={activeTab === 'inicio' ? 'page' : undefined}
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform ${activeTab === 'inicio' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
            {activeTab === 'inicio' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#FC4C02] shadow-[0_0_8px_#FC4C02]" />
            )}
          </div>
          <span className={`text-[11px] mt-1 tracking-tight ${activeTab === 'inicio' ? 'text-white font-bold' : 'text-zinc-400'}`}>
            Início
          </span>
        </button>

        {/* Botão Central Elevado Gravar */}
        <div className="relative -top-3.5 px-2">
          <button
            onClick={() => onSelectTab('gravar')}
            className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-transform active:scale-95 cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white shadow-[0_0_24px_rgba(225,29,72,0.8)] animate-pulse'
                : 'bg-gradient-to-tr from-[#FC4C02] to-[#FF4500] text-white shadow-[0_0_22px_rgba(252,76,2,0.6)] hover:scale-105'
            }`}
            aria-label="Gravar Treino com GPS e Modo HIIT"
            aria-current={activeTab === 'gravar' ? 'page' : undefined}
          >
            <Radio className={`w-6 h-6 stroke-[2.4] ${isRecording ? 'animate-spin' : ''}`} />
            <span className="text-[9px] font-bold tracking-tight mt-0.5">
              {isRecording ? 'GRAVANDO' : 'GRAVAR'}
            </span>
          </button>
        </div>

        {/* Aba Você */}
        <button
          onClick={() => onSelectTab('voce')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'voce' ? 'text-[#FC4C02]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="Você"
          aria-current={activeTab === 'voce' ? 'page' : undefined}
        >
          <div className="relative">
            <User className={`w-5 h-5 transition-transform ${activeTab === 'voce' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
            {activeTab === 'voce' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#FC4C02] shadow-[0_0_8px_#FC4C02]" />
            )}
          </div>
          <span className={`text-[11px] mt-1 tracking-tight ${activeTab === 'voce' ? 'text-white font-bold' : 'text-zinc-400'}`}>
            Você
          </span>
        </button>
      </div>
    </nav>
  );
};
