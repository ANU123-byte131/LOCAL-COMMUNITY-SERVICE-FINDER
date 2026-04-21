import { useEffect, useRef } from 'react';
import type { Provider } from './ProviderCard';

interface MapViewProps {
  providers: Provider[];
  userLat?: number | null;
  userLng?: number | null;
  onProviderClick?: (id: number) => void;
}

export default function MapView({ providers, userLat, userLng, onProviderClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default marker icons (Leaflet + Vite issue)
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Center on user location or first provider or NYC default
      const centerLat = userLat ?? (providers[0]?.lat ?? 40.7128);
      const centerLng = userLng ?? (providers[0]?.lng ?? -74.006);

      const map = L.map(mapRef.current!, {
        center: [centerLat, centerLng],
        zoom: 12,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // OpenStreetMap tiles (free, no API key)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // User location marker
      if (userLat && userLng) {
        const userIcon = L.divIcon({
          html: `<div style="
            width:18px;height:18px;
            background:hsl(221,83%,53%);
            border:3px solid white;
            border-radius:50%;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          className: '',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        L.marker([userLat, userLng], { icon: userIcon })
          .addTo(map)
          .bindPopup('<b>Your Location</b>');
      }

      // Provider markers
      markersRef.current = [];
      providers.forEach((p) => {
        if (!p.lat || !p.lng) return;

        const pinIcon = L.divIcon({
          html: `<div style="
            background:hsl(221,83%,53%);
            color:white;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            width:32px;height:32px;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
            border:2px solid white;
            font-size:11px;font-weight:700;
          ">
            <span style="transform:rotate(45deg)">${p.rating?.toFixed(1) ?? '?'}</span>
          </div>`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -34],
        });

        const marker = L.marker([p.lat, p.lng], { icon: pinIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:160px;font-family:sans-serif">
              <strong style="font-size:14px">${p.name}</strong><br/>
              <span style="color:#666;font-size:12px">${p.category}</span><br/>
              <span style="font-size:12px">⭐ ${p.rating?.toFixed(1)} · ${p.available ? '✅ Available' : '❌ Unavailable'}</span><br/>
              ${p.price_range ? `<span style="font-size:12px">💰 ${p.price_range}</span><br/>` : ''}
              <a href="/provider/${p.id}" style="color:hsl(221,83%,53%);font-size:12px;font-weight:600">View Profile →</a>
            </div>
          `);

        if (onProviderClick) {
          marker.on('click', () => onProviderClick(p.id));
        }

        markersRef.current.push(marker);
      });

      // Fit bounds to show all markers
      const allPoints: [number, number][] = [];
      if (userLat && userLng) allPoints.push([userLat, userLng]);
      providers.forEach((p) => { if (p.lat && p.lng) allPoints.push([p.lat, p.lng]); });
      if (allPoints.length > 1) {
        map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40], maxZoom: 14 });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [providers, userLat, userLng]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
