import React, { useState, useRef } from 'react';
import { X, Download, Share2, Copy, Check, Sparkles, MessageCircle, Instagram, Flame, Layers, Eye } from 'lucide-react';
import { Activity } from '../types';
import { formatDistance, formatDuration, formatPace } from '../utils/formatters';
import { coordinatesToSvgPath } from '../utils/geo';

interface ShareModalProps {
  activity: Activity | null;
  onClose: () => void;
}

export type StoryTemplate = 'transparent_sticker' | 'neon_hud' | 'minimalist_route' | 'strava_split';

export const ShareModal: React.FC<ShareModalProps> = ({ activity, onClose }) => {
  if (!activity) return null;

  const [template, setTemplate] = useState<StoryTemplate>('transparent_sticker');
  const [copied, setCopied] = useState(false);
  const [copyingImage, setCopyingImage] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Dynamic SVG path of the workout GPS route for different aspect ratios
  const svgPathSticker = coordinatesToSvgPath(activity.coordinates, 320, 150, 16);
  const svgPathStoryBox = coordinatesToSvgPath(activity.coordinates, 360, 220, 20);
  const svgPathMinimalist = coordinatesToSvgPath(activity.coordinates, 360, 280, 22);
  const svgPathSplitMap = coordinatesToSvgPath(activity.coordinates, 380, 240, 20);

  // Draw template onto canvas for export
  const renderCanvas = (tpl: StoryTemplate): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const isSticker = tpl === 'transparent_sticker';
    const width = 1080;
    const height = isSticker ? 1080 : 1920;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    if (tpl === 'transparent_sticker') {
      // -------------------------------------------------------------
      // 1. STICKER TRANSPARENTE (Exatamente igual imagem 3)
      // - 100% fundo transparente
      // - Caminho laranja em cima
      // - Métricas em FILA (Distância | Ritmo | Tempo)
      // - JPX MOTION embaixo (sem nada embaixo)
      // -------------------------------------------------------------
      ctx.clearRect(0, 0, width, height);

      // Trajeto Laranja no topo
      ctx.save();
      ctx.strokeStyle = '#FC4C02';
      ctx.lineWidth = 24;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(252, 76, 2, 0.95)';
      ctx.shadowBlur = 38;

      const routeW = width * 0.78;
      const routeH = 340;
      const stickerPath = new Path2D(coordinatesToSvgPath(activity.coordinates, routeW, routeH, 30));
      ctx.translate(width * 0.11, 110);
      ctx.stroke(stickerPath);
      ctx.restore();

      // Métricas em FILA HORIZONTAL (Distância | Ritmo | Tempo)
      const filaY = 640;
      const col1X = width * 0.22;
      const col2X = width * 0.5;
      const col3X = width * 0.78;

      ctx.save();
      ctx.textAlign = 'center';

      // Labels em fila
      ctx.font = '800 32px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#A1A1AA';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText('DISTÂNCIA', col1X, filaY);
      ctx.fillText('RITMO', col2X, filaY);
      ctx.fillText('TEMPO', col3X, filaY);

      // Valores em fila
      ctx.font = '900 82px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 16;
      ctx.fillText(formatDistance(activity.distance), col1X, filaY + 95);

      // Ritmo SEM /km
      ctx.fillStyle = '#FC4C02';
      ctx.fillText(formatPace(activity.pace), col2X, filaY + 95);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(formatDuration(activity.duration), col3X, filaY + 95);

      // Base: JPX MOTION (Sem absolutamente nada embaixo)
      ctx.font = '900 70px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('JPX ', width / 2 - 110, 920);
      ctx.fillStyle = '#FC4C02';
      ctx.fillText('MOTION', width / 2 + 75, 920);

      ctx.restore();

    } else if (tpl === 'neon_hud') {
      // -------------------------------------------------------------
      // 2. STORY NEON HUD (9:16)
      // -------------------------------------------------------------
      ctx.fillStyle = '#070709';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Orange Radial Glow
      const glow = ctx.createRadialGradient(width / 2, 720, 40, width / 2, 720, 600);
      glow.addColorStop(0, 'rgba(252, 76, 2, 0.25)');
      glow.addColorStop(1, 'rgba(7, 7, 9, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Header Brand
      ctx.textAlign = 'center';
      ctx.font = '900 56px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('JPX ', width / 2 - 95, 180);
      ctx.fillStyle = '#FC4C02';
      ctx.fillText('MOTION', width / 2 + 65, 180);

      // Title
      ctx.font = '800 34px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#D4D4D8';
      ctx.fillText(activity.title.toUpperCase(), width / 2, 280);

      // Map container box
      const mapY = 360;
      const mapH = 650;
      ctx.fillStyle = '#0E0E12';
      ctx.roundRect ? ctx.roundRect(80, mapY, width - 160, mapH, 36) : ctx.rect(80, mapY, width - 160, mapH);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // GPS Route
      ctx.save();
      ctx.strokeStyle = '#FC4C02';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#FC4C02';
      ctx.shadowBlur = 34;

      const path2d = new Path2D(coordinatesToSvgPath(activity.coordinates, width - 260, mapH - 140, 50));
      ctx.translate(130, mapY + 70);
      ctx.stroke(path2d);
      ctx.restore();

      // Distance
      ctx.textAlign = 'center';
      ctx.font = '900 150px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(formatDistance(activity.distance), width / 2, 1200);

      // Métricas em fila (Ritmo Médio | Tempo Total | Passos)
      const colY = 1380;
      ctx.font = '700 24px monospace';
      ctx.fillStyle = '#71717A';
      ctx.fillText('RITMO MÉDIO', width * 0.22, colY);
      ctx.fillText('TEMPO TOTAL', width * 0.5, colY);
      ctx.fillText('PASSOS', width * 0.78, colY);

      ctx.font = '900 52px monospace';
      ctx.fillStyle = '#FC4C02';
      ctx.fillText(formatPace(activity.pace), width * 0.22, colY + 65); // sem /km

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(formatDuration(activity.duration), width * 0.5, colY + 65);
      ctx.fillText(activity.steps.toLocaleString('pt-BR'), width * 0.78, colY + 65);

      // Footer
      ctx.font = '600 28px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#52525B';
      ctx.fillText(`${activity.date}  •  ${activity.athlete.city || 'São Paulo, Brasil'}`, width / 2, 1780);

    } else if (tpl === 'minimalist_route') {
      // -------------------------------------------------------------
      // 3. STORY MINIMALISTA ROTA PRO (Modelo 1 da Imagem 4)
      // Visual cinematográfico preto fosco com trajeto imponente
      // -------------------------------------------------------------
      ctx.fillStyle = '#020202';
      ctx.fillRect(0, 0, width, height);

      // Subtle gradient highlight
      const centerGrad = ctx.createRadialGradient(width / 2, height / 2 - 100, 50, width / 2, height / 2 - 100, 700);
      centerGrad.addColorStop(0, 'rgba(252, 76, 2, 0.18)');
      centerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centerGrad;
      ctx.fillRect(0, 0, width, height);

      // Top minimalist logo
      ctx.textAlign = 'center';
      ctx.font = '900 46px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('JPX ', width / 2 - 80, 160);
      ctx.fillStyle = '#FC4C02';
      ctx.fillText('MOTION', width / 2 + 55, 160);

      // Large Central GPS Route
      ctx.save();
      ctx.strokeStyle = '#FC4C02';
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(252, 76, 2, 0.9)';
      ctx.shadowBlur = 45;

      const minW = width * 0.82;
      const minH = 750;
      const minPath = new Path2D(coordinatesToSvgPath(activity.coordinates, minW, minH, 40));
      ctx.translate(width * 0.09, 320);
      ctx.stroke(minPath);
      ctx.restore();

      // Lower Card with Stats in Fila
      const statCardY = 1240;
      ctx.fillStyle = '#0c0c0e';
      ctx.roundRect ? ctx.roundRect(80, statCardY, width - 160, 420, 32) : ctx.rect(80, statCardY, width - 160, 420);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Activity Title
      ctx.textAlign = 'center';
      ctx.font = '800 36px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(activity.title, width / 2, statCardY + 80);

      // Divider line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(120, statCardY + 120);
      ctx.lineTo(width - 120, statCardY + 120);
      ctx.stroke();

      // 3 Metrics in FILA
      const metricY = statCardY + 200;
      const c1 = width * 0.25;
      const c2 = width * 0.5;
      const c3 = width * 0.75;

      ctx.font = '700 24px monospace';
      ctx.fillStyle = '#71717A';
      ctx.fillText('DISTÂNCIA', c1, metricY);
      ctx.fillText('RITMO', c2, metricY);
      ctx.fillText('TEMPO', c3, metricY);

      ctx.font = '900 64px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(formatDistance(activity.distance), c1, metricY + 80);

      ctx.fillStyle = '#FC4C02';
      ctx.fillText(formatPace(activity.pace), c2, metricY + 80); // sem /km

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(formatDuration(activity.duration), c3, metricY + 80);

      // Clean footer
      ctx.font = '600 26px monospace';
      ctx.fillStyle = '#52525B';
      ctx.fillText(`${activity.date}  •  JPX MOTION`, width / 2, 1780);

    } else if (tpl === 'strava_split') {
      // -------------------------------------------------------------
      // 4. STORY STRAVA PRO SPLIT CARD (Modelo 2 da Imagem 4)
      // Visual clássico do Strava com cartão dividido e telemetria 2x2
      // -------------------------------------------------------------
      ctx.fillStyle = '#0D0E12';
      ctx.fillRect(0, 0, width, height);

      // Upper Map Zone (0 to 1050)
      ctx.fillStyle = '#08080A';
      ctx.fillRect(0, 0, width, 1050);

      // Top brand in map
      ctx.save();
      ctx.textAlign = 'left';
      ctx.font = '900 48px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('JPX ', 80, 130);
      ctx.fillStyle = '#FC4C02';
      ctx.fillText('MOTION', 170, 130);
      ctx.restore();

      // GPS Route in Upper Zone
      ctx.save();
      ctx.strokeStyle = '#FC4C02';
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(252, 76, 2, 0.9)';
      ctx.shadowBlur = 32;

      const splitW = width * 0.82;
      const splitH = 650;
      const splitPath = new Path2D(coordinatesToSvgPath(activity.coordinates, splitW, splitH, 40));
      ctx.translate(width * 0.09, 230);
      ctx.stroke(splitPath);
      ctx.restore();

      // Lower Split Card (1050 to 1840)
      const splitCardY = 1080;
      ctx.fillStyle = '#141418';
      ctx.roundRect ? ctx.roundRect(60, splitCardY, width - 120, 720, 36) : ctx.rect(60, splitCardY, width - 120, 720);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Athlete Header inside card
      ctx.textAlign = 'left';
      ctx.font = '800 36px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(activity.athlete.name, 120, splitCardY + 90);

      ctx.font = '600 24px monospace';
      ctx.fillStyle = '#A1A1AA';
      ctx.fillText(`${activity.date}  •  ${activity.athlete.city || 'São Paulo'}`, 120, splitCardY + 130);

      // Title
      ctx.font = '900 48px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#FC4C02';
      ctx.fillText(activity.title, 120, splitCardY + 220);

      // Divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(120, splitCardY + 260);
      ctx.lineTo(width - 120, splitCardY + 260);
      ctx.stroke();

      // 4-Quadrant Telemetry:
      // Distância | Tempo
      // Ritmo Médio | Ganho de Elevação
      const qCol1 = 120;
      const qCol2 = width * 0.55;

      // Row 1
      const qRow1 = splitCardY + 340;
      ctx.font = '700 24px monospace';
      ctx.fillStyle = '#71717A';
      ctx.fillText('DISTÂNCIA', qCol1, qRow1);
      ctx.fillText('TEMPO TOTAL', qCol2, qRow1);

      ctx.font = '900 68px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(formatDistance(activity.distance), qCol1, qRow1 + 75);
      ctx.fillText(formatDuration(activity.duration), qCol2, qRow1 + 75);

      // Row 2
      const qRow2 = splitCardY + 510;
      ctx.font = '700 24px monospace';
      ctx.fillStyle = '#71717A';
      ctx.fillText('RITMO MÉDIO', qCol1, qRow2);
      ctx.fillText('GANHO ELEVAÇÃO', qCol2, qRow2);

      ctx.font = '900 68px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#FC4C02';
      ctx.fillText(formatPace(activity.pace), qCol1, qRow2 + 75); // sem /km

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`+${activity.elevationGain}m`, qCol2, qRow2 + 75);

      // Base badge
      ctx.textAlign = 'center';
      ctx.font = '900 30px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('JPX ', width / 2 - 50, splitCardY + 670);
      ctx.fillStyle = '#FC4C02';
      ctx.fillText('MOTION', width / 2 + 35, splitCardY + 670);
    }

    return canvas;
  };

  // Download high-resolution PNG using HTML5 Canvas
  const handleDownloadPng = async () => {
    setDownloading(true);
    try {
      const canvas = renderCanvas(template);
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `jpx-motion-${template}-${activity.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Error generating image:', e);
    } finally {
      setDownloading(false);
    }
  };

  // Copy PNG image to clipboard for instant pasting on Instagram Stories
  const handleCopyImage = async () => {
    setCopyingImage(true);
    try {
      const canvas = renderCanvas(template);
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setCopyingImage(false);
          return;
        }
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (navigator.clipboard as any).write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          // Fallback to downloading
          handleDownloadPng();
        } finally {
          setCopyingImage(false);
        }
      }, 'image/png');
    } catch (e) {
      console.error('Error copying image:', e);
      setCopyingImage(false);
    }
  };

  // Web Share API
  const handleNativeShare = async () => {
    const shareText = `Treino JPX MOTION 🔥 ${formatDistance(activity.distance)} em ${formatDuration(activity.duration)} com ritmo ${formatPace(activity.pace)}.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `JPX MOTION — ${activity.title}`,
          text: shareText,
          url: window.location.href
        });
      } catch {
        // share cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  // Copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // WhatsApp shortcut
  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Treino no JPX MOTION! 🔥\n${activity.title}\nDistância: ${formatDistance(activity.distance)}\nTempo: ${formatDuration(activity.duration)}\nRitmo: ${formatPace(activity.pace)}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const templatesList: { id: StoryTemplate; name: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      id: 'transparent_sticker',
      name: '1. Sticker Transparente',
      subtitle: 'Rota laranja + métricas em fila',
      icon: <Flame className="w-4 h-4 text-[#FC4C02]" />
    },
    {
      id: 'neon_hud',
      name: '2. Story Neon HUD',
      subtitle: '9:16 com grade tech e glow',
      icon: <Instagram className="w-4 h-4 text-pink-500" />
    },
    {
      id: 'minimalist_route',
      name: '3. Story Minimalista Pro',
      subtitle: '9:16 foco total na rota',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />
    },
    {
      id: 'strava_split',
      name: '4. Story Strava Split',
      subtitle: '9:16 clássico com card 2x2',
      icon: <Layers className="w-4 h-4 text-[#FC4C02]" />
    }
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-share-title"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-[#121214] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[96vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FC4C02]" />
            <div>
              <h2 id="modal-share-title" className="font-display font-black text-lg text-white">
                Compartilhar no Story
              </h2>
              <p className="text-[11px] text-zinc-400 font-mono-num">
                4 modelos de compartilhamento e sticker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Models Selector (Grid / Tabs) */}
        <div className="p-2 sm:p-3 bg-[#0a0a0c] border-b border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {templatesList.map(t => {
              const active = template === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${
                    active
                      ? 'bg-[#18181B] border-[#FC4C02] shadow-[0_0_12px_rgba(252,76,2,0.3)]'
                      : 'bg-black/30 border-white/5 hover:border-white/15 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {t.icon}
                    <span className="font-display font-black text-[11px] text-white truncate">
                      {t.name.split('. ')[1]}
                    </span>
                  </div>
                  <span className="text-[9px] text-zinc-400 line-clamp-1 block">
                    {t.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Live Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col items-center justify-center">
          {/* MODELO 1: STICKER TRANSPARENTE (IMAGEM 3) */}
          {template === 'transparent_sticker' && (
            <div className="flex flex-col items-center animate-in fade-in duration-200">
              <div
                ref={previewRef}
                className="relative w-72 sm:w-80 h-96 rounded-2xl flex flex-col items-center justify-between p-5 shadow-2xl border border-white/10 overflow-hidden"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #18181b 25%, transparent 25%), 
                    linear-gradient(-45deg, #18181b 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #18181b 75%), 
                    linear-gradient(-45deg, transparent 75%, #18181b 75%)
                  `,
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                  backgroundColor: '#0c0c0e'
                }}
              >
                {/* Badge Fundo Transparente */}
                <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/85 border border-white/10 text-[9px] font-mono-num text-[#FC4C02] font-bold">
                  FUNDO TRANSPARENTE
                </div>

                {/* 1. CAMINHO LARANJA EM CIMA */}
                <div className="w-full flex items-center justify-center pt-3 pb-1">
                  <svg className="w-56 h-28" viewBox="0 0 320 150" fill="none">
                    <path
                      d={svgPathSticker}
                      stroke="#FC4C02"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="drop-shadow(0px 0px 10px rgba(252,76,2,0.95))"
                    />
                  </svg>
                </div>

                {/* 2. INFORMAÇÕES EM FILA (DISTÂNCIA | RITMO | TEMPO) */}
                <div className="w-full my-auto px-1 py-2">
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div>
                      <span className="text-[10px] font-mono-num text-zinc-300 font-bold uppercase tracking-wider block">
                        DISTÂNCIA
                      </span>
                      <div className="font-display font-black text-xl sm:text-2xl text-white tracking-tight mt-0.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                        {formatDistance(activity.distance)}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono-num text-zinc-300 font-bold uppercase tracking-wider block">
                        RITMO
                      </span>
                      {/* SEM /km embaixo de ritmo */}
                      <div className="font-display font-black text-xl sm:text-2xl text-[#FC4C02] tracking-tight mt-0.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-mono-num">
                        {formatPace(activity.pace)}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono-num text-zinc-300 font-bold uppercase tracking-wider block">
                        TEMPO
                      </span>
                      <div className="font-display font-black text-xl sm:text-2xl text-white tracking-tight mt-0.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-mono-num">
                        {formatDuration(activity.duration)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. JPX MOTION (SEM NADA EMBAIXO) */}
                <div className="text-center pb-2">
                  <div className="font-display font-black text-lg tracking-wider text-white">
                    JPX <span className="text-[#FC4C02]">MOTION</span>
                  </div>
                </div>
              </div>

              <span className="text-[11px] text-zinc-400 font-mono-num mt-2 text-center">
                Sticker com fundo transparente: dados em fila e trajeto laranja para colar em fotos
              </span>
            </div>
          )}

          {/* MODELO 2: STORY NEON HUD (9:16) */}
          {template === 'neon_hud' && (
            <div className="flex flex-col items-center animate-in fade-in duration-200">
              <div className="relative w-64 h-[440px] rounded-3xl bg-[#070709] border border-white/15 p-4 flex flex-col justify-between shadow-[0_0_40px_rgba(252,76,2,0.3)] overflow-hidden">
                {/* Tech grid overlay */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #FC4C02 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                />

                {/* Top Story Header */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={activity.athlete.avatar}
                      alt={activity.athlete.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#FC4C02]"
                    />
                    <div className="flex items-center">
                      <span className="font-display font-black text-xs text-white leading-tight">
                        JPX <span className="text-[#FC4C02]">MOTION</span>
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono-num px-2 py-0.5 rounded-full bg-[#FC4C02]/20 text-[#FC4C02] font-bold border border-[#FC4C02]/30">
                    STORY 9:16
                  </span>
                </div>

                {/* GPS Route Map Box */}
                <div className="relative z-10 my-auto py-2">
                  <div className="relative w-full h-40 rounded-2xl bg-[#0e0e12] border border-white/10 flex items-center justify-center overflow-hidden">
                    <svg className="w-48 h-32" viewBox="0 0 360 220" fill="none">
                      <path
                        d={svgPathStoryBox}
                        stroke="#FC4C02"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="drop-shadow(0px 0px 12px rgba(252,76,2,0.9))"
                      />
                    </svg>
                    <span className="absolute bottom-2 left-2 text-[8px] font-mono-num text-zinc-400">
                      GPS TELEMETRY
                    </span>
                  </div>
                </div>

                {/* Strava / Story Metrics HUD */}
                <div className="relative z-10 bg-black/60 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <p className="text-[11px] font-display font-bold text-zinc-300 truncate">
                    {activity.title}
                  </p>
                  <div className="font-display font-black text-3xl text-white tracking-tight mt-0.5">
                    {formatDistance(activity.distance)}
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-white/10 text-center font-mono-num">
                    <div>
                      <span className="text-[8px] text-zinc-400 block uppercase">Ritmo</span>
                      <span className="text-xs font-bold text-[#FC4C02]">{formatPace(activity.pace)}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-zinc-400 block uppercase">Tempo</span>
                      <span className="text-xs font-bold text-white">{formatDuration(activity.duration)}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-zinc-400 block uppercase">Passos</span>
                      <span className="text-xs font-bold text-white">{activity.steps.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <span className="text-[11px] text-zinc-400 font-mono-num mt-2">
                Modelo HUD com glow neon e telemetria
              </span>
            </div>
          )}

          {/* MODELO 3: STORY MINIMALISTA ROTA PRO (IMAGEM 4 - MODELO 1) */}
          {template === 'minimalist_route' && (
            <div className="flex flex-col items-center animate-in fade-in duration-200">
              <div className="relative w-64 h-[440px] rounded-3xl bg-[#020202] border border-white/15 p-4 flex flex-col justify-between shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden">
                {/* Subtle Orange Glow in Center */}
                <div className="absolute inset-0 bg-radial from-[#FC4C02]/15 via-transparent to-transparent pointer-events-none" />

                {/* Minimal Header */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-display font-black text-xs text-white">
                    JPX <span className="text-[#FC4C02]">MOTION</span>
                  </span>
                  <span className="text-[8px] font-mono-num text-zinc-400 tracking-wider">
                    PRO ROUTE
                  </span>
                </div>

                {/* Huge GPS Route in Center */}
                <div className="relative z-10 my-auto flex items-center justify-center py-2">
                  <svg className="w-52 h-44" viewBox="0 0 360 280" fill="none">
                    <path
                      d={svgPathMinimalist}
                      stroke="#FC4C02"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="drop-shadow(0px 0px 14px rgba(252,76,2,0.95))"
                    />
                  </svg>
                </div>

                {/* Minimalist Stats Card in Fila */}
                <div className="relative z-10 bg-[#0c0c0e]/90 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <p className="text-[10px] font-mono-num text-zinc-400 text-center truncate">
                    {activity.title}
                  </p>
                  <div className="grid grid-cols-3 gap-1 mt-1.5 pt-1.5 border-t border-white/10 text-center">
                    <div>
                      <span className="text-[8px] font-mono-num text-zinc-400 block uppercase">Distância</span>
                      <span className="font-display font-black text-sm text-white">{formatDistance(activity.distance)}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-mono-num text-zinc-400 block uppercase">Ritmo</span>
                      <span className="font-display font-black text-sm text-[#FC4C02] font-mono-num">{formatPace(activity.pace)}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-mono-num text-zinc-400 block uppercase">Tempo</span>
                      <span className="font-display font-black text-sm text-white font-mono-num">{formatDuration(activity.duration)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <span className="text-[11px] text-zinc-400 font-mono-num mt-2">
                Foco visual cinematográfico na rota GPS em alta resolução
              </span>
            </div>
          )}

          {/* MODELO 4: STORY STRAVA PRO SPLIT (IMAGEM 4 - MODELO 2) */}
          {template === 'strava_split' && (
            <div className="flex flex-col items-center animate-in fade-in duration-200">
              <div className="relative w-64 h-[440px] rounded-3xl bg-[#0D0E12] border border-white/15 flex flex-col justify-between shadow-[0_0_40px_rgba(252,76,2,0.2)] overflow-hidden">
                {/* Upper Map Half */}
                <div className="relative w-full h-[52%] bg-[#08080A] flex flex-col items-center justify-center p-3 border-b border-white/10">
                  <div className="absolute top-3 left-3 flex items-center gap-1">
                    <span className="font-display font-black text-[11px] text-white">
                      JPX <span className="text-[#FC4C02]">MOTION</span>
                    </span>
                  </div>
                  <svg className="w-48 h-32" viewBox="0 0 380 240" fill="none">
                    <path
                      d={svgPathSplitMap}
                      stroke="#FC4C02"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="drop-shadow(0px 0px 10px rgba(252,76,2,0.9))"
                    />
                  </svg>
                </div>

                {/* Lower Split Card Half */}
                <div className="p-3 bg-[#141418] flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-xs text-white truncate">
                        {activity.athlete.name}
                      </span>
                      <span className="text-[8px] font-mono-num text-zinc-400">
                        {activity.date}
                      </span>
                    </div>
                    <p className="font-display font-black text-sm text-[#FC4C02] mt-0.5 truncate">
                      {activity.title}
                    </p>
                  </div>

                  {/* 2x2 Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/10">
                    <div>
                      <span className="text-[7px] font-mono-num uppercase text-zinc-400 block">Distância</span>
                      <span className="font-display font-black text-sm text-white">{formatDistance(activity.distance)}</span>
                    </div>
                    <div>
                      <span className="text-[7px] font-mono-num uppercase text-zinc-400 block">Tempo</span>
                      <span className="font-display font-black text-sm text-white font-mono-num">{formatDuration(activity.duration)}</span>
                    </div>
                    <div>
                      <span className="text-[7px] font-mono-num uppercase text-zinc-400 block">Ritmo Médio</span>
                      <span className="font-display font-black text-sm text-[#FC4C02] font-mono-num">{formatPace(activity.pace)}</span>
                    </div>
                    <div>
                      <span className="text-[7px] font-mono-num uppercase text-zinc-400 block">Elevação</span>
                      <span className="font-display font-black text-sm text-white font-mono-num">+{activity.elevationGain}m</span>
                    </div>
                  </div>
                </div>
              </div>

              <span className="text-[11px] text-zinc-400 font-mono-num mt-2">
                Layout clássico Strava com mapa dividido e cartão completo
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-white/5 bg-[#0e0e10] space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Download PNG */}
            <button
              onClick={handleDownloadPng}
              disabled={downloading}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FC4C02] to-[#FF4500] text-black font-display font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(252,76,2,0.4)] hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>
                {downloading ? 'RENDERIZANDO...' : template === 'transparent_sticker' ? 'BAIXAR STICKER' : 'BAIXAR STORY (9:16)'}
              </span>
            </button>

            {/* Copy PNG Image to Clipboard */}
            <button
              onClick={handleCopyImage}
              disabled={copyingImage}
              className="py-3 px-4 rounded-2xl bg-[#18181B] hover:bg-[#27272a] text-white font-display font-bold text-xs uppercase tracking-wider border border-white/10 hover:border-[#FC4C02]/50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">COPIADO!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#FC4C02]" />
                  <span>{copyingImage ? 'COPIANDO...' : 'COPIAR IMAGEM'}</span>
                </>
              )}
            </button>
          </div>

          {/* Social and Native Share */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNativeShare}
              className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-mono-num font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartilhar</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-mono-num font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-500/30"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
