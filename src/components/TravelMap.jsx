import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CATEGORIES } from '../data/initialPlaces';
import {
  Crosshair,
  Route,
  Search,
  Sparkles,
  X,
  Maximize2,
  LocateFixed
} from 'lucide-react';

const MAP_STYLES = [
  {
    id: 'carto-voyager',
    name: 'Keşif (Açık & Net)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr: '&copy; OpenStreetMap contributors'
  },
  {
    id: 'carto-positron',
    name: 'Minimal Açık',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attr: '&copy; OpenStreetMap &copy; CARTO'
  },
  {
    id: 'google-hybrid',
    name: 'Uydu Görünümü',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=tr',
    attr: '&copy; Google Maps'
  }
];

export default function TravelMap({
  places,
  selectedPlace,
  onSelectPlace,
  mapFocus,
  isPickingLocation,
  onPickLocation,
  pickedCoords,
  showRoute,
  onToggleRoute,
  onQuickAddFromSearch,
  tripPlanIds = []
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const tempMarkerRef = useRef(null);

  const [mapStyle, setMapStyle] = useState('carto-voyager');
  const [geoQuery, setGeoQuery] = useState('');
  const [geoResults, setGeoResults] = useState([]);
  const [isSearchingGeo, setIsSearchingGeo] = useState(false);

  // Initialize Leaflet Map + ResizeObserver so tiles never break or turn grey
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    const map = L.map(container, {
      center: [39.9208, 32.8541],
      zoom: 12,
      zoomControl: false,
      preferCanvas: true
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const styleObj = MAP_STYLES[0];
    const tileLayer = L.tileLayer(styleObj.url, {
      attribution: styleObj.attr,
      subdomains: styleObj.subdomains || 'abc',
      maxZoom: 20
    }).addTo(map);

    // Fallback to OpenStreetMap if any tile server fails
    let errorCount = 0;
    tileLayer.on('tileerror', () => {
      errorCount += 1;
      if (errorCount > 6 && tileLayerRef.current) {
        tileLayerRef.current.setUrl('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
        errorCount = 0;
      }
    });

    const markersLayer = L.layerGroup().addTo(map);
    const routeLayer = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = tileLayer;
    markersLayerRef.current = markersLayer;
    routeLayerRef.current = routeLayer;

    // Invalidate size shortly after mount and whenever container resizes
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ animate: false });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Map Click for Picking Coordinates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e) => {
      if (!isPickingLocation) return;
      const { lat, lng } = e.latlng;
      onPickLocation([Number(lat.toFixed(5)), Number(lng.toFixed(5))]);
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [isPickingLocation, onPickLocation]);

  // Show temporary marker when picking coordinates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }

    if (pickedCoords && pickedCoords.length === 2) {
      const icon = L.divIcon({
        className: 'custom-pin-wrapper',
        html: `
          <div class="pin-marker active-pin" style="background: #f59e0b;">
            <div class="pin-marker-inner">📍</div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38]
      });
      tempMarkerRef.current = L.marker(pickedCoords, { icon }).addTo(map);
    }
  }, [pickedCoords]);

  // Switch Tile Layer Style
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;
    const styleObj = MAP_STYLES.find((s) => s.id === mapStyle) || MAP_STYLES[0];
    if (styleObj.subdomains) {
      tileLayerRef.current.options.subdomains = styleObj.subdomains;
    }
    tileLayerRef.current.setUrl(styleObj.url);
  }, [mapStyle]);

  // Fly to region or selected place
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapFocus) return;
    map.invalidateSize();
    map.flyTo(mapFocus.center, mapFocus.zoom, {
      duration: 1.2,
      easeLinearity: 0.25
    });
  }, [mapFocus]);

  // Fit all currently visible places on screen
  const handleFitAllBounds = () => {
    const map = mapInstanceRef.current;
    if (!map || places.length === 0) return;
    const validCoords = places
      .filter((p) => Array.isArray(p.coords) && p.coords.length === 2)
      .map((p) => p.coords);
    if (validCoords.length === 0) return;
    if (validCoords.length === 1) {
      map.flyTo(validCoords[0], 14, { duration: 1 });
      return;
    }
    const bounds = L.latLngBounds(validCoords);
    map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
  };

  // Render Place Markers & Route Line
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !markersLayer || !routeLayer) return;

    markersLayer.clearLayers();
    routeLayer.clearLayers();

    const coordsList = [];

    places.forEach((place) => {
      if (!place.coords || place.coords.length !== 2) return;
      coordsList.push(place.coords);

      const catObj = CATEGORIES.find((c) => c.id === place.category) || CATEGORIES[0];
      const isSelected = selectedPlace?.id === place.id;
      const pinBg = place.visited ? '#059669' : catObj.color;
      const tripIndex = tripPlanIds.indexOf(place.id);

      const badgeHtml = place.visited
        ? `<div class="pin-visited-badge" title="Gidildi / Keşfedildi">✓</div>`
        : place.favorite
        ? `<div class="pin-Bucket-badge" title="Öncelikli Gidilecek">★</div>`
        : '';

      const tripNumberHtml =
        tripIndex !== -1
          ? `<div class="pin-trip-number" title="Gezi Rotası Sırası">${tripIndex + 1}</div>`
          : '';

      const icon = L.divIcon({
        className: 'custom-pin-wrapper',
        html: `
          <div class="pin-marker ${isSelected ? 'active-pin' : ''}" style="background: ${pinBg};">
            <div class="pin-marker-inner">${catObj.icon}</div>
            ${badgeHtml}
            ${tripNumberHtml}
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -36]
      });

      const marker = L.marker(place.coords, { icon });

      marker.on('click', () => {
        onSelectPlace(place);
      });

      marker.bindTooltip(
        `<div style="font-weight:700;font-size:12px;">${place.visited ? '✓ ' : ''}${place.name}</div>
         <div style="font-size:10px;opacity:0.85;">📍 ${place.city} • ⏱️ ${place.duration}</div>`,
        {
          direction: 'top',
          offset: [0, -36],
          opacity: 0.96
        }
      );

      marker.addTo(markersLayer);
    });

    // Draw Trip Plan Route OR Filtered Places Route
    if (tripPlanIds.length > 1) {
      const tripCoords = tripPlanIds
        .map((id) => places.find((p) => p.id === id)?.coords)
        .filter(Boolean);
      if (tripCoords.length > 1) {
        L.polyline(tripCoords, {
          color: '#ef4444',
          weight: 4,
          dashArray: '10, 6',
          opacity: 0.9
        }).addTo(routeLayer);
      }
    } else if (showRoute && coordsList.length > 1) {
      L.polyline(coordsList, {
        color: '#f59e0b',
        weight: 3.5,
        dashArray: '8, 8',
        opacity: 0.85
      }).addTo(routeLayer);
    }
  }, [places, selectedPlace, showRoute, tripPlanIds, onSelectPlace]);

  // Search Anywhere on Earth using OpenStreetMap Nominatim
  const handleGeoSearch = async (e) => {
    e.preventDefault();
    if (!geoQuery.trim()) return;
    setIsSearchingGeo(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(geoQuery)}&limit=5&accept-language=tr`
      );
      const data = await res.json();
      setGeoResults(data || []);
    } catch (err) {
      console.error('Konum arama hatası:', err);
    } finally {
      setIsSearchingGeo(false);
    }
  };

  const handleSelectGeoResult = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], 15, { duration: 1.3 });
    }
    setGeoResults([]);
  };

  return (
    <div className="relative w-full h-full min-h-[380px] overflow-hidden rounded-2xl border border-slate-800/80 shadow-2xl bg-slate-900">
      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%', minHeight: '380px' }}
        className={isPickingLocation ? 'cursor-crosshair' : ''}
      />

      {/* Picking Location Banner */}
      {isPickingLocation && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[500] bg-amber-500 text-slate-950 px-5 py-2.5 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 animate-bounce">
          <Crosshair className="w-4 h-4" />
          <span>Haritada eklemek istediğin noktaya tıkla!</span>
        </div>
      )}

      {/* Top-Left Live World Location Finder */}
      <div className="absolute top-3 left-3 z-[400] w-64 sm:w-80">
        <form
          onSubmit={handleGeoSearch}
          className="flex items-center bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-md focus-within:border-amber-400 transition"
        >
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={geoQuery}
            onChange={(e) => setGeoQuery(e.target.value)}
            placeholder="Dünyada herhangi bir adres/mekan bul..."
            className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full py-1"
          />
          {geoQuery && (
            <button
              type="button"
              onClick={() => {
                setGeoQuery('');
                setGeoResults([]);
              }}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            className="ml-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold px-2.5 py-1 rounded-lg transition shrink-0 shadow-2xs"
          >
            {isSearchingGeo ? '...' : 'Bul'}
          </button>
        </form>

        {geoResults.length > 0 && (
          <div className="mt-1.5 bg-white/98 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {geoResults.map((item) => (
              <div
                key={item.place_id}
                className="p-2.5 hover:bg-slate-50 transition flex items-start justify-between gap-2"
              >
                <button
                  type="button"
                  onClick={() => handleSelectGeoResult(item)}
                  className="text-left flex-1"
                >
                  <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                    {item.display_name.split(',')[0]}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">
                    {item.display_name}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const lat = Number(parseFloat(item.lat).toFixed(5));
                    const lon = Number(parseFloat(item.lon).toFixed(5));
                    handleSelectGeoResult(item);
                    onQuickAddFromSearch({
                      name: item.display_name.split(',')[0],
                      city: item.display_name.split(',').slice(1, 3).join(',').trim(),
                      coords: [lat, lon]
                    });
                  }}
                  className="shrink-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1 shadow-2xs"
                  title="Bu konumu haritama yeni mekan olarak ekle"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>+ Ekle</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top-Right Controls: Map Style, Fit Bounds & Route Line Toggle */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2 items-end">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-1 flex flex-wrap items-center gap-1 shadow-md">
          {MAP_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setMapStyle(style.id)}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition ${
                mapStyle === style.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {style.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleFitAllBounds}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white/95 border border-slate-200/90 text-slate-700 hover:text-amber-800 hover:bg-slate-50 backdrop-blur-md flex items-center gap-1.5 shadow-md transition"
            title="Listelenen tüm mekanları ekrana sığdır"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Tümünü Sığdır</span>
          </button>

          <button
            onClick={onToggleRoute}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border backdrop-blur-md flex items-center gap-1.5 shadow-md transition ${
              showRoute
                ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                : 'bg-white/95 border-slate-200/90 text-slate-700 hover:bg-slate-50'
            }`}
            title="Ekrandaki noktalar arasında gezi rotası çizgisini göster/gizle"
          >
            <Route className="w-3.5 h-3.5" />
            <span>{showRoute ? 'Rota Açık' : 'Rota Çiz'}</span>
          </button>
        </div>
      </div>

      {/* Bottom-Left Map Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-3 py-2 shadow-md hidden sm:flex items-center gap-3 text-[11px] text-slate-700">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>✓ Gidildi ({places.filter((p) => p.visited).length})</span>
        </span>
        <span className="text-slate-300">|</span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span>★ Gidilecek ({places.filter((p) => !p.visited).length})</span>
        </span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-500">Toplam: {places.length} Nokta</span>
      </div>
    </div>
  );
}
