import React, { useState } from 'react';
import { Map, Navigation, Mountain, Award, Search, Download, Compass, Layers } from 'lucide-react';
import { MOCK_SEGMENTS } from '../data/mockData';
import { DarkMap } from './DarkMap';
import { RouteSegment } from '../types';

export const MapsTab: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<RouteSegment>(MOCK_SEGMENTS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSegments = MOCK_SEGMENTS.filter(seg =>
    seg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seg.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportGpx = (seg: RouteSegment) => {
    // Generate simple GPX XML string
    const gpxData = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="JPX MOTION - https://jpxmotion.app">
  <metadata>
    <name>${seg.title}</name>
  </metadata>
  <trk>
    <name>${seg.title}</name>
    <trkseg>
      ${seg.coordinates.map(c => `<trkpt lat="${c.lat}" lon="${c.lng}"><ele>${c.elevation || 760}</ele></trkpt>`).join('\n      ')}
    </trkseg>
  </trk>
</gpx>`;
    const blob = new Blob([gpxData], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${seg.id}.gpx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Map Explorer Banner */}
      <div className="rounded-3xl bg-[#121214] border border-white/10 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#FC4C02]" />
              <h1 className="font-display font-black text-xl text-white">
                Explorador de Rotas & Segmentos
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Descubra circuitos icônicos, dispute recordes e exporte trajetos GPX
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar segmento ou cidade..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#09090b] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FC4C02]"
            />
          </div>
        </div>

        {/* Selected Segment Map */}
        <div className="space-y-3">
          <DarkMap coordinates={selectedSegment.coordinates} heightClass="h-64 sm:h-80" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <span className="text-[10px] font-mono-num text-[#FC4C02] font-bold uppercase tracking-wider block">
                SEGMENTO SELECIONADO
              </span>
              <h2 className="font-display font-black text-lg text-white">
                {selectedSegment.title}
              </h2>
              <p className="text-xs text-zinc-400 font-mono-num">{selectedSegment.location}</p>
            </div>

            <button
              onClick={() => handleExportGpx(selectedSegment)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272a] border border-white/10 text-xs font-display font-bold uppercase tracking-wider text-white transition-all cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-4 h-4 text-[#FC4C02]" />
              <span>Exportar GPX</span>
            </button>
          </div>
        </div>
      </div>

      {/* Segments List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono-num text-zinc-400 uppercase tracking-wider">
            CIRCUITOS EM DESTAQUE ({filteredSegments.length})
          </span>
          <span className="text-xs font-mono-num text-[#FC4C02]">
            MODO HEATMAP ATIVO
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {filteredSegments.map(seg => {
            const isSelected = selectedSegment.id === seg.id;
            return (
              <div
                key={seg.id}
                onClick={() => setSelectedSegment(seg)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#18181B] border-[#FC4C02] shadow-[0_0_20px_rgba(252,76,2,0.3)]'
                    : 'bg-[#121214] border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono-num text-zinc-400 mb-1">
                  <span>{seg.distanceKm} KM</span>
                  <span className="text-[#FC4C02]">+{seg.elevationM}M ELEV</span>
                </div>

                <div className="font-display font-bold text-sm text-white line-clamp-1">
                  {seg.title}
                </div>
                <div className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{seg.location}</div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-mono-num">
                  <span className="text-zinc-500">Recorde:</span>
                  <span className="text-amber-400 font-bold">{seg.recordHolder.time} ({seg.recordHolder.pace})</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
