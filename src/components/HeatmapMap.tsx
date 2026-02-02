import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

type HeatmapMapProps = {
  cases: Array<{
    id: string;
    lastSeenLocation: string;
    province: string;
    municipality?: string;
    lastSignalLat?: number;
    lastSignalLng?: number;
  }>;
  provinceStats?: Array<{
    province: string;
    count: number;
    lat: number;
    lng: number;
  }>;
};

export function HeatmapMap({ cases, provinceStats }: HeatmapMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Carregar Leaflet
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    
    script.onload = () => {
      // @ts-ignore
      const L = window.L;
      if (!L || !mapRef.current) return;

      // Limpar mapa anterior se existir
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Criar novo mapa
      const map = L.map(mapRef.current).setView([-12.3500, 17.3500], 6); // Centro de Angola
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Se temos estatísticas por província, usar para criar heatmap baseado em densidade
      if (provinceStats && provinceStats.length > 0) {
        // Criar heatmap baseado na quantidade de casos por província
        const heatData = provinceStats.map((stat) => [
          stat.lat,
          stat.lng,
          stat.count, // Intensidade baseada no número de casos
        ]);

        // Adicionar marcadores com popup mostrando quantidade
        provinceStats.forEach((stat) => {
          L.marker([stat.lat, stat.lng])
            .addTo(map)
            .bindPopup(
              `<strong>${stat.province}</strong><br>` +
              `${stat.count} ${stat.count === 1 ? 'caso reportado' : 'casos reportados'}`
            );
        });

        // Tentar adicionar heatmap se o plugin estiver disponível
        // @ts-ignore
        if (window.L.heatLayer) {
          // @ts-ignore
          L.heatLayer(heatData, {
            radius: 30,
            blur: 20,
            maxZoom: 17,
            max: Math.max(...provinceStats.map(s => s.count)),
            gradient: {
              0.0: 'blue',
              0.5: 'yellow',
              1.0: 'red'
            }
          }).addTo(map);
        } else {
          // Se não tiver plugin de heatmap, usar círculos coloridos por intensidade
          const maxCount = Math.max(...provinceStats.map(s => s.count));
          provinceStats.forEach((stat) => {
            const intensity = stat.count / maxCount;
            const radius = 15 + (intensity * 25); // Raio baseado na intensidade
            
            L.circle([stat.lat, stat.lng], {
              radius: radius * 1000, // Converter para metros
              fillColor: intensity > 0.7 ? '#ff0000' : intensity > 0.4 ? '#ffaa00' : '#00aaff',
              fillOpacity: 0.6,
              color: '#fff',
              weight: 2,
            }).addTo(map);
          });
        }
      } else {
        // Fallback: usar casos individuais se não tiver estatísticas por província
        cases.forEach((caseItem) => {
          if (caseItem.lastSignalLat && caseItem.lastSignalLng) {
            L.marker([caseItem.lastSignalLat, caseItem.lastSignalLng])
              .addTo(map)
              .bindPopup(`<strong>${caseItem.lastSeenLocation}</strong><br>${caseItem.province}`);
          }
        });
      }

      setMapLoaded(true);
    };

    // Verificar se já foi carregado
    // @ts-ignore
    if (window.L) {
      script.onload();
    } else {
      document.head.appendChild(script);
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      document.head.appendChild(link);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [cases, provinceStats]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-slate-900">Mapa de Calor</h3>
      </div>
      <div ref={mapRef} className="w-full h-96 rounded-lg bg-slate-100" />
      <p className="mt-2 text-xs text-slate-500">
        {provinceStats && provinceStats.length > 0
          ? `Mapa de calor baseado em ${provinceStats.length} províncias com casos reportados`
          : `Mostrando ${cases.filter(c => c.lastSignalLat && c.lastSignalLng).length} casos com localização`
        }
      </p>
    </div>
  );
}

