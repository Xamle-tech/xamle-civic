'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Badge, Card } from '@xamle/ui';
import 'leaflet/dist/leaflet.css';
import type { FeatureCollection } from 'geojson';
import type { Layer, PathOptions } from 'leaflet';

// Senegal region data with centroids for positioning
const SENEGAL_REGIONS = [
  'Dakar', 'Thiès', 'Saint-Louis', 'Louga', 'Matam', 'Tambacounda',
  'Kédougou', 'Kolda', 'Ziguinchor', 'Sédhiou', 'Kaolack',
  'Kaffrine', 'Fatick', 'Diourbel',
];

type RegionStat = {
  region: string;
  total: number;
  completed: number;
  rate: number;
};

function getColor(rate: number): string {
  if (rate >= 80) return '#16a34a';
  if (rate >= 60) return '#22c55e';
  if (rate >= 40) return '#f59e0b';
  if (rate >= 20) return '#ef4444';
  return '#dc2626';
}

export function SenegalMap() {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [selected, setSelected] = useState<RegionStat | null>(null);

  const { data: stats } = useQuery<RegionStat[]>({
    queryKey: ['region-stats'],
    queryFn: () => api.get('/policies/region-stats'),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    // Load Senegal GeoJSON from public folder
    fetch('/geojson/senegal-regions.geojson')
      .then((r) => r.json())
      .then(setGeoData)
      .catch(() => setGeoData(null));
  }, []);

  const getRegionRate = (name: string) => {
    const stat = stats?.find((s) => s.region.toLowerCase() === name.toLowerCase());
    return stat?.rate ?? 0;
  };

  const style = (feature?: GeoJSON.Feature): PathOptions => {
    const name = feature?.properties?.name ?? '';
    const rate = getRegionRate(name);
    return {
      fillColor: getColor(rate),
      fillOpacity: 0.7,
      weight: 1.5,
      color: '#1A252F',
      opacity: 1,
    };
  };

  const onEachFeature = (feature: GeoJSON.Feature, layer: Layer) => {
    const name = feature.properties?.name ?? '';
    const rate = getRegionRate(name);
    const stat = stats?.find((s) => s.region.toLowerCase() === name.toLowerCase());

    // @ts-ignore — leaflet Layer does have bindTooltip
    layer.bindTooltip(
      `<strong>${name}</strong><br/>Taux de réalisation : <b>${rate}%</b>`,
      { permanent: false, direction: 'top', className: 'leaflet-tooltip-civic' }
    );

    // @ts-ignore
    layer.on({
      click: () => setSelected(stat ?? { region: name, total: 0, completed: 0, rate: 0 }),
      mouseover: (e: any) => e.target.setStyle({ weight: 3, fillOpacity: 0.9 }),
      mouseout: (e: any) => e.target.setStyle({ weight: 1.5, fillOpacity: 0.7 }),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-xl overflow-hidden border border-border" style={{ height: 560 }}>
        <MapContainer
          center={[14.5, -14.4]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          zoomControl
          aria-label="Carte choroplèthe du Sénégal par région"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {geoData && (
            <GeoJSON
              key={JSON.stringify(stats)}
              data={geoData}
              style={style}
              onEachFeature={onEachFeature}
            />
          )}
          {!geoData && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-[400]">
              <p className="text-muted-foreground text-sm">Chargement de la carte…</p>
            </div>
          )}
        </MapContainer>
      </div>

      <div className="space-y-4">
        {/* Legend */}
        <Card className="p-4">
          <h2 className="font-semibold mb-3 text-sm">Légende — Taux de réalisation</h2>
          <ul className="space-y-2" aria-label="Légende couleurs de la carte">
            {[
              { color: '#16a34a', label: '≥ 80% — Excellent' },
              { color: '#22c55e', label: '60–80% — Bon' },
              { color: '#f59e0b', label: '40–60% — Moyen' },
              { color: '#ef4444', label: '20–40% — Faible' },
              { color: '#dc2626', label: '< 20% — Critique' },
            ].map(({ color, label }) => (
              <li key={color} className="flex items-center gap-2 text-xs">
                <span
                  className="h-3 w-6 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                {label}
              </li>
            ))}
          </ul>
        </Card>

        {/* Selected region */}
        {selected && (
          <Card className="p-4 space-y-2">
            <h2 className="font-semibold">{selected.region}</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-muted p-2 text-center">
                <p className="text-lg font-bold">{selected.total}</p>
                <p className="text-xs text-muted-foreground">Politiques</p>
              </div>
              <div className="rounded-lg bg-muted p-2 text-center">
                <p className="text-lg font-bold">{selected.completed}</p>
                <p className="text-xs text-muted-foreground">Achevées</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Taux de réalisation</span>
              <Badge
                variant="outline"
                className="font-bold"
                style={{ color: getColor(selected.rate) }}
              >
                {selected.rate}%
              </Badge>
            </div>
          </Card>
        )}

        {/* All regions list */}
        <Card className="p-4">
          <h2 className="font-semibold mb-3 text-sm">Toutes les régions</h2>
          <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1" aria-label="Liste des régions">
            {SENEGAL_REGIONS.map((region) => {
              const stat = stats?.find((s) => s.region.toLowerCase() === region.toLowerCase());
              const rate = stat?.rate ?? 0;
              return (
                <li
                  key={region}
                  className="flex items-center justify-between text-xs cursor-pointer hover:bg-muted rounded-md px-2 py-1.5 transition-colors"
                  onClick={() => setSelected(stat ?? { region, total: 0, completed: 0, rate: 0 })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelected(stat ?? { region, total: 0, completed: 0, rate: 0 })}
                  aria-label={`${region} — ${rate}%`}
                >
                  <span className="font-medium">{region}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${rate}%`, backgroundColor: getColor(rate) }}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="w-8 text-right font-medium" style={{ color: getColor(rate) }}>
                      {rate}%
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
