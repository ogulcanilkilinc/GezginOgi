import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { TURKEY_PROVINCES } from '../data/turkeyProvinces';
import { getCountryInfo } from '../data/countryNameMapping';
import { Globe, MapPin, CheckCircle2, RotateCcw, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';

export default function ChoroplethMap({
  mode = 'turkey', // 'turkey' | 'world'
  places = [],
  onSelectProvince,
  onSelectCountry,
  selectedProvince,
  selectedCountry
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoLayerRef = useRef(null);

  const [activeMode, setActiveMode] = useState(mode);
  const [geoData, setGeoData] = useState(null);
  const [isLoadingGeo, setIsLoadingGeo] = useState(true);
  const [hoveredEntity, setHoveredEntity] = useState(null);

  // Sync mode changes from parent
  useEffect(() => {
    setActiveMode(mode);
  }, [mode]);

  // Derive visited provinces
  const visitedProvinces = useMemo(() => {
    const visitedSet = new Set();
    places.forEach((p) => {
      if (p.visited && (p.region === 'turkiye' || p.region === 'ankara')) {
        if (p.city) {
          // Normalize city to province
          const match = TURKEY_PROVINCES.find(
            (tp) => tp.name.toLowerCase() === p.city.toLowerCase()
          );
          if (match) {
            visitedSet.add(match.name);
            visitedSet.add(match.plate);
          } else {
            visitedSet.add(p.city);
          }
        }
      }
    });
    return visitedSet;
  }, [places]);

  // Derive visited countries
  const visitedCountries = useMemo(() => {
    const visitedSet = new Set();
    places.forEach((p) => {
      if (p.visited && p.country) {
        const info = getCountryInfo(p.country);
        if (info && info.iso) visitedSet.add(info.iso);
        visitedSet.add(p.country.toLowerCase());
        if (info && info.name) visitedSet.add(info.name.toLowerCase());
      }
    });
    return visitedSet;
  }, [places]);

  // Load appropriate GeoJSON
  useEffect(() => {
    setIsLoadingGeo(true);
    const basePath = import.meta.env.BASE_URL || '/';
    const cleanBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
    const targetUrl =
      activeMode === 'turkey'
        ? `${cleanBase}geojson/turkey-provinces.geojson`
        : `${cleanBase}geojson/world-countries.geojson`;

    fetch(targetUrl)
      .then((res) => {
        if (!res.ok) throw new Error('GeoJSON yüklenemedi');
        return res.json();
      })
      .then((data) => {
        setGeoData(data);
        setIsLoadingGeo(false);
      })
      .catch((err) => {
        console.error('Choropleth geojson fetch error:', err);
        setIsLoadingGeo(false);
      });
  }, [activeMode]);

  // Initialize or reconfigure map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (!mapInstanceRef.current) {
      const map = L.map(container, {
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true,
        minZoom: 1.5,
        maxZoom: 10
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove old layer
    if (geoLayerRef.current) {
      map.removeLayer(geoLayerRef.current);
      geoLayerRef.current = null;
    }

    if (!geoData) return;

    // Build GeoJSON layer with custom styling & interactions
    const geoLayer = L.geoJSON(geoData, {
      style: (feature) => {
        if (activeMode === 'turkey') {
          const plate = feature.properties.number;
          const name = feature.properties.name;
          const isVisited =
            visitedProvinces.has(plate) ||
            visitedProvinces.has(name) ||
            visitedProvinces.has(name.toLowerCase());

          return {
            fillColor: isVisited ? '#10b981' : '#f1f5f9',
            fillOpacity: isVisited ? 0.85 : 0.65,
            weight: 1.2,
            color: isVisited ? '#047857' : '#cbd5e1',
            dashArray: isVisited ? '' : '2',
            transition: 'all 0.3s'
          };
        } else {
          // World mode
          const iso = feature.id;
          const name = feature.properties.name || '';
          const isVisited =
            visitedCountries.has(iso) ||
            visitedCountries.has(name.toLowerCase());

          return {
            fillColor: isVisited ? '#f59e0b' : '#f8fafc',
            fillOpacity: isVisited ? 0.85 : 0.6,
            weight: 1,
            color: isVisited ? '#d97706' : '#cbd5e1',
            dashArray: isVisited ? '' : '2'
          };
        }
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};

        layer.on({
          mouseover: (e) => {
            const target = e.target;
            target.setStyle({
              weight: 2.5,
              color: '#1e293b',
              fillOpacity: 0.95
            });
            target.bringToFront();

            if (activeMode === 'turkey') {
              const plate = props.number;
              const name = props.name;
              const isVisited =
                visitedProvinces.has(plate) ||
                visitedProvinces.has(name) ||
                visitedProvinces.has(name.toLowerCase());

              const provincePlaces = places.filter(
                (p) =>
                  p.city &&
                  p.city.toLowerCase() === name.toLowerCase() &&
                  (p.region === 'turkiye' || p.region === 'ankara')
              );

              setHoveredEntity({
                title: `${props.number?.toString().padStart(2, '0')} — ${name}`,
                isVisited,
                total: provincePlaces.length,
                visitedCount: provincePlaces.filter((p) => p.visited).length,
                type: 'province'
              });
            } else {
              const name = props.name || feature.id;
              const iso = feature.id;
              const isVisited =
                visitedCountries.has(iso) || visitedCountries.has(name.toLowerCase());

              const countryPlaces = places.filter((p) => {
                const info = getCountryInfo(p.country);
                return (
                  p.country?.toLowerCase() === name.toLowerCase() ||
                  (info && info.iso === iso)
                );
              });

              setHoveredEntity({
                title: name,
                isVisited,
                total: countryPlaces.length,
                visitedCount: countryPlaces.filter((p) => p.visited).length,
                type: 'country'
              });
            }
          },
          mouseout: (e) => {
            geoLayer.resetStyle(e.target);
            setHoveredEntity(null);
          },
          click: () => {
            if (activeMode === 'turkey') {
              onSelectProvince && onSelectProvince(props.name, props.number);
            } else {
              onSelectCountry && onSelectCountry(props.name, feature.id);
            }
          }
        });
      }
    }).addTo(map);

    geoLayerRef.current = geoLayer;

    // Fit view
    if (activeMode === 'turkey') {
      map.fitBounds(
        [
          [35.8, 25.5],
          [42.2, 44.8]
        ],
        { padding: [20, 20] }
      );
    } else {
      map.setView([25, 12], 2);
    }
  }, [geoData, activeMode, visitedProvinces, visitedCountries, onSelectProvince, onSelectCountry]);

  const handleResetZoom = () => {
    if (!mapInstanceRef.current) return;
    if (activeMode === 'turkey') {
      mapInstanceRef.current.fitBounds(
        [
          [35.8, 25.5],
          [42.2, 44.8]
        ],
        { padding: [20, 20] }
      );
    } else {
      mapInstanceRef.current.setView([25, 12], 2);
    }
  };

  return (
    <div className="relative w-full h-[360px] sm:h-[460px] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-inner">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 cursor-grab active:cursor-grabbing" />

      {/* Mode Switcher Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-md border border-slate-200 gap-1">
        <button
          onClick={() => setActiveMode('turkey')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeMode === 'turkey'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>🇹🇷</span>
          <span>81 İl Haritası</span>
        </button>

        <button
          onClick={() => setActiveMode('world')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeMode === 'world'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Dünya Fetih Atlası</span>
        </button>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-md border border-slate-200">
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition"
          title="Yakınlaş"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition"
          title="Uzaklaş"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition border-t border-slate-100"
          title="Haritayı Ortalayarak Sıfırla"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Hover Info Card Badge */}
      {hoveredEntity && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 shadow-xl pointer-events-none animate-fadeIn max-w-[280px]">
          <div className="flex items-center gap-2">
            <span className="text-base">
              {hoveredEntity.type === 'province' ? '🇹🇷' : '🌍'}
            </span>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {hoveredEntity.title}
              </h4>
              <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                {hoveredEntity.isVisited ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Ayak Bastın ({hoveredEntity.visitedCount} mekan)
                  </span>
                ) : (
                  <span className="text-slate-600 font-medium">
                    {hoveredEntity.total > 0
                      ? `Atlasında ${hoveredEntity.total} mekan bekliyor`
                      : 'Henüz mekan eklenmedi'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend Badge */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl px-3 py-2 text-[11px] shadow-md flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-3.5 h-3.5 rounded-md ${
              activeMode === 'turkey' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span className="font-semibold text-slate-700">Fethettin / Gittin</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-slate-200 border border-slate-300" />
          <span className="text-slate-600">Keşfedilmeyi Bekliyor</span>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoadingGeo && (
        <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-xs flex items-center justify-center z-20">
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-md border border-slate-200 text-xs font-semibold text-slate-700">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>İl ve Ülke Sınırları Yükleniyor...</span>
          </div>
        </div>
      )}
    </div>
  );
}
