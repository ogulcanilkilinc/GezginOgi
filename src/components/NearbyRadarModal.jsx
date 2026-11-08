import React, { useState, useEffect } from 'react';
import { X, Navigation, Compass, MapPin, Locate, ExternalLink, ArrowUpRight } from 'lucide-react';

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function calculateBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  const directions = ['Kuzey (K)', 'Kuzeydoğu (KD)', 'Doğu (D)', 'Güneydoğu (GD)', 'Güney (G)', 'Güneybatı (GB)', 'Batı (B)', 'Kuzeybatı (KB)'];
  const index = Math.round(brng / 45) % 8;
  return directions[index];
}

const PRESET_LOCATIONS = [
  { name: '📍 Cihazımın Canlı GPS Konumu', coords: null },
  { name: '🇧🇦 Saraybosna Başçarşı (Bosna)', coords: [43.8598, 18.4312] },
  { name: '🇧🇦 Tarihi Mostar Köprüsü (Bosna)', coords: [43.3372, 17.8150] },
  { name: '🇲🇪 Kotor Körfezi & Eski Şehir (Karadağ)', coords: [42.4247, 18.7712] },
  { name: '🇲🇰 Ohri Kaneo Kilisesi (Makedonya)', coords: [41.1111, 20.7889] },
  { name: '🇦🇱 Berat Bin Pencereli Şehir (Arnavutluk)', coords: [40.7058, 19.9522] },
  { name: '🇹🇷 Ankara Kızılay / Anıtkabir', coords: [39.9208, 32.8541] },
  { name: '🇹🇷 İstanbul Sultanahmet Meydanı', coords: [41.0054, 28.9768] },
  { name: '🇮🇹 Roma Kolezyum (İtalya)', coords: [41.8902, 12.4922] },
];

export default function NearbyRadarModal({ isOpen, onClose, places, onSelectPlace }) {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_LOCATIONS[0].name);
  const [currentCoords, setCurrentCoords] = useState([39.9208, 32.8541]); // Default Ankara
  const [gpsStatus, setGpsStatus] = useState('Hazır');

  const fetchLiveGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Cihazınızda GPS desteklenmiyor.');
      return;
    }
    setGpsStatus('Konum alınıyor...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentCoords([pos.coords.latitude, pos.coords.longitude]);
        setGpsStatus('GPS Konumu Alındı ✓');
      },
      (err) => {
        setGpsStatus('GPS izni verilmedi veya zaman aşımı. Simüle konum kullanabilirsiniz.');
      },
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    if (isOpen) {
      fetchLiveGps();
    }
  }, [isOpen]);

  const handlePresetChange = (presetName) => {
    setSelectedPreset(presetName);
    const found = PRESET_LOCATIONS.find((p) => p.name === presetName);
    if (found && found.coords) {
      setCurrentCoords(found.coords);
      setGpsStatus(`Simüle Konum: ${found.name}`);
    } else {
      fetchLiveGps();
    }
  };

  if (!isOpen) return null;

  // Compute distances for all places
  const [myLat, myLng] = currentCoords || [39.9208, 32.8541];
  const sortedPlaces = (places || [])
    .filter((p) => p?.coords && p.coords.length === 2)
    .map((p) => {
      const dist = calculateDistanceKm(myLat, myLng, p.coords[0], p.coords[1]);
      const bearing = calculateBearing(myLat, myLng, p.coords[0], p.coords[1]);
      return { ...p, distanceKm: dist, bearing };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 20);

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl shadow-inner">
              📍
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>"Bana En Yakın Noktalar" — Canlı GPS Keşif Radarı</span>
              </h2>
              <p className="text-xs text-slate-400">
                Bulunduğun konuma veya seçtiğin şehre en yakın tarihi ve turistik yerleri sırala
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location Picker Bar */}
        <div className="bg-slate-950/80 px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              value={selectedPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none w-full max-w-md"
            >
              {PRESET_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400 italic">{gpsStatus}</span>
            <button
              onClick={fetchLiveGps}
              className="bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
              title="Gerçek GPS Konumumu Güncelle"
            >
              <Locate className="w-3.5 h-3.5" />
              <span>GPS Yenile</span>
            </button>
          </div>
        </div>

        {/* Content Body: Nearest Places List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>En yakın 20 mekan sıralandı (Mesafe ve pusula yönüyle):</span>
            <span className="text-slate-500">Mevcut Koordinat: {myLat.toFixed(3)}, {myLng.toFixed(3)}</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {sortedPlaces.map((place, idx) => (
              <div
                key={place.id}
                onClick={() => {
                  onSelectPlace(place);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900/80 transition flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/40 shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition truncate">
                      {place.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {place.city}, {place.country} • {place.whatAwaits}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-extrabold text-amber-400 block">
                      {place.distanceKm < 1 ? `${Math.round(place.distanceKm * 1000)} m` : `${place.distanceKm} km`}
                    </span>
                    <span className="text-[10px] text-slate-500 block">{place.bearing}</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
