import React, { useState } from 'react';
import { X, Check, Camera, Upload, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

export const JPX_LOGO_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="34" fill="%23FC4C02"/><text x="60" y="73" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="46" fill="%23000000" text-anchor="middle" dominant-baseline="middle" letter-spacing="-1">JPX</text></svg>`;

const PRESET_AVATARS = [
  { id: 'jpx_logo', name: 'Logo Oficial JPX (Laranja)', url: JPX_LOGO_AVATAR },
  { id: 'avatar_1', name: 'Foto Atleta Masculino', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { id: 'avatar_2', name: 'Foto Atleta Feminina', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80' },
  { id: 'avatar_3', name: 'Foto Runner Noturno', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' }
];

interface EditProfileModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (updatedProfile: UserProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [badge, setBadge] = useState(profile.badge);
  const [city, setCity] = useState(profile.city);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [customUrl, setCustomUrl] = useState('');
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrl.trim()) {
      setAvatar(customUrl.trim());
      setShowCustomUrlInput(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...profile,
      name: name.trim() || 'Atleta JPX',
      handle: handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim() || 'jpx_runner'}`,
      badge: badge.trim() || 'PRO ATHLETE',
      city: city.trim() || 'Brasil',
      avatar
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-edit-profile-title"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-[#121214] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FC4C02]" />
            <h2 id="modal-edit-profile-title" className="font-display font-black text-lg text-white">
              Editar Perfil do Atleta
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Avatar Selector with Live Preview */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              <img
                src={avatar}
                alt="Foto de perfil"
                className="w-24 h-24 rounded-3xl object-cover border-2 border-[#FC4C02] shadow-[0_0_24px_rgba(252,76,2,0.4)]"
              />
              <label
                htmlFor="avatar-file-input"
                className="absolute inset-0 rounded-3xl bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-xs font-bold"
              >
                <Camera className="w-6 h-6 mb-1 text-[#FC4C02]" />
                <span>Trocar</span>
              </label>
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <span className="text-xs text-zinc-400 mt-2 font-mono-num">
              Toque na foto para carregar do seu dispositivo
            </span>

            {/* Presets Grid, highlighting Logo Oficial JPX (Imagem 2) */}
            <div className="w-full mt-4">
              <label className="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider block mb-2 text-center">
                Ou escolha um avatar:
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {PRESET_AVATARS.map((item) => {
                  const isSelected = avatar === item.url;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAvatar(item.url)}
                      className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all p-0.5 cursor-pointer ${
                        isSelected
                          ? 'border-[#FC4C02] shadow-[0_0_14px_rgba(252,76,2,0.5)] scale-105'
                          : 'border-white/10 hover:border-white/30 opacity-75 hover:opacity-100'
                      }`}
                      title={item.name}
                    >
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                      {isSelected && (
                        <div className="absolute top-1 right-1 p-0.5 rounded-full bg-[#FC4C02] text-black">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom URL Option */}
            <div className="w-full mt-3 text-center">
              {!showCustomUrlInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomUrlInput(true)}
                  className="text-xs text-zinc-400 hover:text-[#FC4C02] transition-colors cursor-pointer underline"
                >
                  Inserir link de foto externo (URL)
                </button>
              ) : (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#09090b] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FC4C02]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3 py-1.5 rounded-xl bg-[#1c1c20] hover:bg-[#27272a] text-white text-xs font-bold border border-white/10 cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields: Nome, @Handle, Badge, Cidade */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div>
              <label className="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider block mb-1">
                Nome do Atleta
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#FC4C02]"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider block mb-1">
                Identificador (@Handle)
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-white/10 text-sm text-white font-mono-num focus:outline-none focus:border-[#FC4C02]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider block mb-1">
                  Selo / Badge
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="ex: PRO ATHLETE"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#FC4C02]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono-num text-zinc-400 uppercase tracking-wider block mb-1">
                  Cidade / Estado
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="ex: São Paulo, Brasil"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#FC4C02]"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-white/5 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#18181B] hover:bg-[#27272a] text-zinc-300 font-display font-bold text-xs uppercase tracking-wider border border-white/10 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FC4C02] to-[#FF4500] text-black font-display font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(252,76,2,0.4)] hover:opacity-95 transition-all cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
