import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, FastForward, Car, MapPin, Compass, ArrowRight, Sparkles, Navigation } from 'lucide-react';

function calculateDistanceKm(coord1, coord2) {
  if (!coord1 || !coord2) return 0;
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function RouteSimulatorModal({
  isOpen,
  onClose,
  places,
  tripPlanIds,
  onSelectPlace
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 4x
  const timerRef = useRef(null);

  const tripPlaces = tripPlanIds
    .map((id) => places.find((p) => p.id === id))
    .filter(Boolean);

  useEffect(() => {
    if (isPlaying && tripPlaces.length > 1) {
      const intervalMs = Math.max(800, 3000 / speed);
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= tripPlaces.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, tripPlaces.length]);

  if (!isOpen) return null;

  const currentPlace = tripPlaces[currentIndex] || tripPlaces[0] || null;
  const nextPlace = tripPlaces[currentIndex + 1] || null;

  // Calculate total distance
  let totalKm = 0;
  for (let i = 0; i < tripPlaces.length - 1; i++) {
    if (tripPlaces[i]?.coords && tripPlaces[i + 1]?.coords) {
      totalKm += calculateDistanceKm(tripPlaces[i].coords, tripPlaces[i + 1].coords);
    }
  }

  const segmentKm =
    nextPlace && currentPlace && currentPlace.coords && nextPlace.coords
      ? calculateDistanceKm(currentPlace.coords, nextPlace.coords)
      : 0;
  const progressPercent = tripPlaces.length > 1 ? Math.round((currentIndex / (tripPlaces.length - 1)) * 100) : 0;

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl shadow-inner">
              🗺️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>İnteraktif Rota Simülatörü & Yol Canlandırması</span>
              </h2>
              <p className="text-xs text-slate-400">
                Rotandaki duraklar arasında sanal seyahat simülasyonu ve sürüş mesafeleri
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsPlaying(false);
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {tripPlaces.length < 2 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Compass className="w-12 h-12 mx-auto text-slate-600" />
            <p className="text-sm font-bold text-slate-200">
              Rotayı simüle edebilmek için sepetinde en az 2 mekan olmalıdır.
            </p>
            <p className="text-xs text-slate-400">
              Haritadaki mekanların yanındaki <strong>'+ Rota'</strong> butonuna tıklayarak seyahat planına ekleyebilirsin.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Simulation Dashboard Top Card */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                    Canlı Sürüş Simülasyonu
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                    <span className="text-amber-400">#{currentIndex + 1}</span>
                    <span>{currentPlace?.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{currentPlace?.whatAwaits}</p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Toplam Rota Uzunluğu</span>
                  <strong className="text-xl font-black text-emerald-400">{totalKm} KM</strong>
                  <span className="text-[10px] text-slate-500 block">≈ {Math.round(totalKm / 75)} Saat Sürüş</span>
                </div>
              </div>

              {/* Next Stop Alert */}
              {nextPlace ? (
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Navigation className="w-4 h-4 text-cyan-400 animate-spin" />
                    <div>
                      <span className="text-slate-400">Sıradaki Durak:</span>{' '}
                      <strong className="text-slate-100">{nextPlace.name}</strong>
                    </div>
                  </div>
                  <span className="bg-slate-950 border border-slate-700 text-amber-300 px-2.5 py-1 rounded-lg font-bold">
                    {segmentKm} KM
                  </span>
                </div>
              ) : (
                <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-3 text-xs text-emerald-300 font-bold text-center">
                  🎉 Tebrikler! Seyahat rotanın son durağına ulaştın.
                </div>
              )}

              {/* Progress Bar with Moving Car Icon */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                  <span>Başlangıç</span>
                  <span>%{progressPercent} Tamamlandı</span>
                  <span>Varış</span>
                </div>
                <div className="relative w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Duraklat' : 'Simülasyonu Başlat'}</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl transition"
                    title="Başa Dön"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed Switcher */}
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                  <span className="text-[11px] text-slate-400 px-2">Hız:</span>
                  {[1, 2, 4].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`px-2 py-0.5 rounded-lg font-bold transition ${
                        speed === s ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stops Timeline */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Rota Durakları ({tripPlaces.length}):
              </h4>
              <div className="space-y-2">
                {tripPlaces.map((place, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isPast = idx < currentIndex;

                  return (
                    <div
                      key={place.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsPlaying(false);
                      }}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                        isCurrent
                          ? 'bg-cyan-500/15 border-cyan-500/50 shadow-md text-white'
                          : isPast
                          ? 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                          : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isCurrent
                              ? 'bg-cyan-500 text-slate-950 shadow'
                              : isPast
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isPast ? '✓' : idx + 1}
                        </span>
                        <div className="min-w-0">
                          <strong className="text-xs sm:text-sm block truncate">{place.name}</strong>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {place.city}, {place.country}
                          </span>
                        </div>
                      </div>

                      {idx < tripPlaces.length - 1 && (
                        <span className="text-[10px] text-slate-500 shrink-0">
                          +{calculateDistanceKm(place.coords, tripPlaces[idx + 1].coords)} km
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
