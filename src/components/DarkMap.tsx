import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LatLng } from '../utils/geo';

interface DarkMapProps {
  coordinates: LatLng[];
  heightClass?: string;
  showKineticBeacon?: boolean;
  interactive?: boolean;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export const DarkMap: React.FC<DarkMapProps> = ({
  coordinates,
  heightClass = 'h-52 sm:h-64',
  showKineticBeacon = true,
  interactive = true,
  center,
  zoom,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center if no coordinates
    const initialCenter: [number, number] = center || (coordinates.length > 0
      ? [coordinates[0].lat, coordinates[0].lng]
      : [-23.5874, -46.6576]);

    const initialZoom = zoom || 14;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: interactive,
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Esri World Dark Gray Canvas Tiles (Public, ultra-clean dark minimalist, no watermarks)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: '&copy; Esri, HERE, Garmin, OpenStreetMap'
    }).addTo(map);

    if (coordinates.length >= 2) {
      const latLngs = coordinates.map(c => [c.lat, c.lng] as [number, number]);

      // Neon Orange Outer Glow
      L.polyline(latLngs, {
        color: '#FC4C02',
        weight: 8,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Core Vibrant Neon Line
      const routeLine = L.polyline(latLngs, {
        color: '#FF4500',
        weight: 3.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Fit bounds with comfortable padding
      map.fitBounds(routeLine.getBounds(), {
        padding: [24, 24],
        maxZoom: 16
      });

      // Start Marker (Green beacon)
      const startCoord = latLngs[0];
      const startIcon = L.divIcon({
        className: 'custom-start-marker',
        html: `<div class="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black shadow-[0_0_10px_#34d399]"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
      L.marker(startCoord, { icon: startIcon }).addTo(map);

      // End Marker (Neon Orange beacon with pulse)
      const endCoord = latLngs[latLngs.length - 1];
      const endIcon = L.divIcon({
        className: 'custom-end-marker',
        html: `<div class="relative flex items-center justify-center w-5 h-5">
          <div class="absolute w-5 h-5 rounded-full bg-[#FC4C02] opacity-75 animate-ping"></div>
          <div class="relative w-3.5 h-3.5 rounded-full bg-[#FC4C02] border-2 border-white shadow-[0_0_12px_#FC4C02]"></div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      L.marker(endCoord, { icon: endIcon }).addTo(map);
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [coordinates, interactive, center, zoom]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-white/10 ${heightClass} ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Visual Overlay Tag */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-mono-num text-zinc-300">
        <span className="w-2 h-2 rounded-full bg-[#FC4C02] animate-pulse" />
        <span>GPS TRACK • DARK KINETIC</span>
      </div>
    </div>
  );
};
