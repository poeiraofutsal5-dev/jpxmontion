import React, { useState } from 'react';
import { X, UploadCloud, Image, Check } from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  type: 'post' | 'photos';
  onClose: () => void;
  onPublish: (text: string, photoUrl?: string) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  type,
  onClose,
  onPublish
}) => {
  if (!isOpen) return null;

  const [text, setText] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(
    type === 'photos'
      ? 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&auto=format&fit=crop&q=80'
      : ''
  );

  const samplePhotos = [
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=600&auto=format&fit=crop&q=80'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPublish(text || (type === 'photos' ? 'Momento capturado pós-treino!' : 'Foco total no processo!'), selectedPhoto || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#121214] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.9)] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            {type === 'photos' ? <Image className="w-5 h-5 text-amber-400" /> : <UploadCloud className="w-5 h-5 text-[#FC4C02]" />}
            <h2 className="font-display font-black text-lg text-white">
              {type === 'photos' ? 'Adicionar Fotos ao Feed' : 'Publicar no JPX Feed'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <textarea
              rows={3}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Compartilhe suas sensações, ritmo ou fotos do treino..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FC4C02] resize-none"
            />
          </div>

          {type === 'photos' && (
            <div>
              <label className="text-xs font-mono-num text-zinc-400 uppercase tracking-wider block mb-2">
                Escolha uma foto de treino
              </label>
              <div className="grid grid-cols-3 gap-2">
                {samplePhotos.map((photo, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedPhoto(photo)}
                    className={`relative rounded-xl overflow-hidden aspect-video border-2 cursor-pointer transition-all ${
                      selectedPhoto === photo ? 'border-[#FC4C02] shadow-[0_0_12px_#FC4C02]' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt="Treino" className="w-full h-full object-cover" />
                    {selectedPhoto === photo && (
                      <div className="absolute top-1 right-1 p-0.5 rounded-full bg-[#FC4C02] text-black">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FC4C02] to-[#FF4500] text-black font-display font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(252,76,2,0.4)] hover:opacity-95 transition-all cursor-pointer"
            >
              Publicar Agora
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
