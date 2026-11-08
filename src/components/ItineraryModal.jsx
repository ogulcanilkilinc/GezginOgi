import React, { useState } from 'react';
import { routeKm, formatKm, ROAD_FACTOR } from '../services/geo';
import {
  X,
  Calendar,
  Route,
  Printer,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Navigation,
  Compass
} from 'lucide-react';

const PREMADE_TRIP_TEMPLATES = [
  {
    id: 'balkan-nisan',
    title: '🌸 6 Günlük Nisan Balkanlar Turu',
    desc: 'Saraybosna, Mostar, Kravice Şelalesi, Kotor Körfezi, Berat, Ohri ve Üsküp',
    stops: [
      { day: 1, query: 'Saraybosna Başçarşı' },
      { day: 1, query: 'Vrelo Bosne' },
      { day: 2, query: 'Konjic' },
      { day: 2, query: 'Mostar Köprüsü' },
      { day: 2, query: 'Blagaj' },
      { day: 3, query: 'Počitelj' },
      { day: 3, query: 'Kravice' },
      { day: 3, query: 'Trebinje' },
      { day: 4, query: 'Kotor' },
      { day: 4, query: 'Perast' },
      { day: 4, query: 'Budva' },
      { day: 5, query: 'İşkodra' },
      { day: 5, query: 'Berat' },
      { day: 6, query: 'Ohri' },
      { day: 6, query: 'Üsküp' },
    ]
  },
  {
    id: 'kapadokya-konya',
    title: '🎈 5 Günlük Kapadokya + Konya & Tuz Gölü',
    desc: 'Göreme, Uçhisar, Derinkuyu Yeraltı Şehri, Ihlara Vadisi, Mevlana Müzesi ve Tuz Gölü',
    stops: [
      { day: 1, query: 'Tuz Gölü' },
      { day: 2, query: 'Göreme' },
      { day: 2, query: 'Uçhisar' },
      { day: 3, query: 'Derinkuyu' },
      { day: 3, query: 'Ihlara' },
      { day: 4, query: 'Sultanhanı' },
      { day: 4, query: 'Mevlana' },
      { day: 5, query: 'Sille' },
      { day: 5, query: 'Çatalhöyük' },
    ]
  },
  {
    id: 'ege-antik',
    title: '🏛️ 4 Günlük Ege Antik Kentler & Sahil',
    desc: 'Efes, Şirince, Meryem Ana, Pamukkale Travertenleri ve Bergama Akropolü',
    stops: [
      { day: 1, query: 'Efes' },
      { day: 1, query: 'Şirince' },
      { day: 2, query: 'Priene' },
      { day: 2, query: 'Milet' },
      { day: 3, query: 'Pamukkale' },
      { day: 3, query: 'Hierapolis' },
      { day: 4, query: 'Bergama' },
      { day: 4, query: 'Ayvalık' },
    ]
  },
  {
    id: 'ankara-kultur-doga',
    title: '🌿 3 Günlük Başkent Ankara Kültür & Doğa',
    desc: 'Anıtkabir, Ankara Kalesi, Hamamönü, Anadolu Medeniyetleri, Çubuk Karagöl ve Beypazarı',
    stops: [
      { day: 1, query: 'Anıtkabir' },
      { day: 1, query: 'Anadolu Medeniyetleri' },
      { day: 1, query: 'Hamamönü' },
      { day: 2, query: 'Çubuk Karagöl' },
      { day: 2, query: 'Işık Dağı' },
      { day: 3, query: 'Beypazarı' },
      { day: 3, query: 'Gordion' },
    ]
  }
];

export default function ItineraryModal({
  isOpen,
  onClose,
  places,
  tripPlanIds,
  onSelectPlace,
  onSetTripPlanIds,
  tripMeta = { days: {}, name: '', startDate: '' },
  onSetTripMeta = () => {},
  onOpenBudget,
  onOpenPacking
}) {
  // Day per stop is saved with the trip, so it survives reloads
  const dayAssignments = tripMeta.days || {};
  const setDayAssignments = (days) => onSetTripMeta({ ...tripMeta, days });
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // "3. Gün" -> "3. Gün · 14 Mar Cmt" when a start date is set
  const dayDateLabel = (dayNum) => {
    if (!tripMeta.startDate) return '';
    const d = new Date(`${tripMeta.startDate}T12:00:00`);
    if (isNaN(d)) return '';
    d.setDate(d.getDate() + dayNum - 1);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', weekday: 'short' });
  };

  if (!isOpen) return null;

  // Resolve trip places
  const tripPlaces = tripPlanIds
    .map((id) => places.find((p) => p.id === id))
    .filter(Boolean);

  const getDayForPlace = (placeId, index) => {
    if (dayAssignments[placeId]) return dayAssignments[placeId];
    return Math.floor(index / 3) + 1;
  };

  const handleSetDay = (placeId, dayNum) => {
    setDayAssignments({
      ...dayAssignments,
      [placeId]: parseInt(dayNum, 10)
    });
  };

  const handleLoadTemplate = (templateId) => {
    const tpl = PREMADE_TRIP_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;

    const matchedIds = [];
    const newAssignments = {};

    tpl.stops.forEach((stop) => {
      const q = stop.query.toLowerCase();
      const found = places.find(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.city && p.city.toLowerCase().includes(q))
      );
      if (found && !matchedIds.includes(found.id)) {
        matchedIds.push(found.id);
        newAssignments[found.id] = stop.day;
      }
    });

    if (matchedIds.length > 0) {
      onSetTripPlanIds(matchedIds);
      setDayAssignments(newAssignments);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Google Maps Multi-Stop Directions URL Generator
  const getGoogleMapsDirUrl = (placesList) => {
    if (!placesList || placesList.length === 0) return '#';
    const valid = placesList.filter((p) => p.coords && p.coords.length === 2);
    if (valid.length === 0) return '#';
    if (valid.length === 1) {
      return `https://www.google.com/maps/search/?api=1&query=${valid[0].coords[0]},${valid[0].coords[1]}`;
    }
    const coordsStr = valid.slice(0, 10).map((p) => `${p.coords[0]},${p.coords[1]}`).join('/');
    return `https://www.google.com/maps/dir/${coordsStr}`;
  };

  // Group by days
  const groupedByDay = {};
  tripPlaces.forEach((p, idx) => {
    const d = getDayForPlace(p.id, idx);
    if (!groupedByDay[d]) groupedByDay[d] = [];
    groupedByDay[d].push(p);
  });

  const dayNumbers = Object.keys(groupedByDay)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner">
              📅
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Gün Gün Seyahat Planlayıcısı & Gezi Rehberi</span>
              </h2>
              <p className="text-xs text-slate-400">
                Rotandaki yerleri günlere ayır, tek tıkla Google Maps navigasyonuna aktar ve yazdır
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {tripPlaces.length > 0 && (
              <a
                href={getGoogleMapsDirUrl(tripPlaces)}
                target="_blank"
                rel="noreferrer"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
                title="Tüm rotayı Google Maps üzerinde tek tıkla aç"
              >
                <Navigation className="w-3.5 h-3.5 fill-current" />
                <span>Google Maps'te Aç</span>
              </a>
            )}
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Yazıcıya gönder veya PDF olarak kaydet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Premade Templates Bar */}
        <div className="bg-slate-950/90 px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-300">Hazır Rota Şablonları:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {PREMADE_TRIP_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleLoadTemplate(tpl.id)}
                className="bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 px-2.5 py-1 rounded-xl text-xs font-medium transition"
                title={tpl.desc}
              >
                {tpl.title}
              </button>
            ))}
            {tripPlaces.length > 0 && (
              <button
                onClick={() => onSetTripPlanIds([])}
                className="text-xs text-rose-400 hover:underline px-2 py-1 ml-1"
              >
                Rotayı Temizle
              </button>
            )}
          </div>
        </div>

        {/* Print Header (Only visible when printing) */}
        <div className="hidden print:block p-8 border-b-2 border-slate-900 mb-6">
          <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
            🧭 GezginOgi — Kişisel Seyahat Yol Haritası
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Özel Rota Planı • Tarih: {new Date().toLocaleDateString('tr-TR')}
          </p>
        </div>

        {/* Trip name, start date, distance and linked tools */}
        {tripPlaces.length > 0 && (
          <div className="px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-end gap-3 print:hidden">
            <label className="flex flex-col gap-1 text-[11px] text-slate-400 min-w-[160px] flex-1">
              Gezi adı
              <input
                value={tripMeta.name || ''}
                onChange={(e) => onSetTripMeta({ ...tripMeta, name: e.target.value })}
                placeholder="ör. Nisan Balkan Turu"
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-slate-400">
              Başlangıç tarihi
              <input
                type="date"
                value={tripMeta.startDate || ''}
                onChange={(e) => onSetTripMeta({ ...tripMeta, startDate: e.target.value })}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </label>
            <div className="text-[11px] text-slate-300 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
              🚗 Toplam yol ~<strong className="text-amber-300">{formatKm(routeKm(tripPlaces) * ROAD_FACTOR)}</strong>
              <span className="text-slate-500"> ({dayNumbers.length} gün)</span>
            </div>
            {onOpenBudget && (
              <button
                onClick={() => { onClose(); onOpenBudget(); }}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
              >
                💰 Gezi Bütçesi
              </button>
            )}
            {onOpenPacking && (
              <button
                onClick={() => { onClose(); onOpenPacking(); }}
                className="bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
              >
                🎒 Bavul Listesi
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 print:overflow-visible print:p-0">
          {tripPlaces.length === 0 ? (
            <div className="text-center py-16 px-4 text-slate-400 space-y-4">
              <Route className="w-12 h-12 mx-auto text-slate-600" />
              <div className="max-w-md mx-auto">
                <p className="text-base font-bold text-slate-200">Rotanda henüz mekan yok.</p>
                <p className="text-xs text-slate-400 mt-1.5">
                  Haritada beğendiğin mekanların yanındaki <strong>'+ Rota'</strong> butonuna tıklayarak seyahat planına ekleyebilir veya yukarıdaki hazır şablonlardan birini tek tıkla yükleyebilirsin!
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => handleLoadTemplate('balkan-nisan')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-lg transition"
                >
                  <span>🌸 6 Günlük Nisan Balkan Rotası</span>
                </button>
                <button
                  onClick={() => handleLoadTemplate('kapadokya-konya')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow-lg transition"
                >
                  <span>🎈 5 Günlük Kapadokya + Konya</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {dayNumbers.map((dayNum) => {
                const dayPlaces = groupedByDay[dayNum] || [];

                return (
                  <div
                    key={dayNum}
                    className="bg-slate-950/70 border border-slate-800/90 rounded-2xl overflow-hidden print:bg-white print:border-slate-300 print:mb-6 print:break-inside-avoid"
                  >
                    {/* Day Header */}
                    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 print:bg-slate-100 print:text-black">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center print:bg-black print:text-white">
                          {dayNum}
                        </span>
                        <h3 className="text-sm font-bold text-white print:text-black">
                          {dayNum}. Gün Rotası ({dayPlaces.length} Durak)
                          {dayDateLabel(dayNum) && (
                            <span className="ml-1.5 text-amber-300 font-semibold print:text-black">· {dayDateLabel(dayNum)}</span>
                          )}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 print:text-slate-600">
                          {dayPlaces.length > 1 && <>~{formatKm(routeKm(dayPlaces) * ROAD_FACTOR)} yol · </>}
                          Tahmini Süre: {dayPlaces.length * 2} - {dayPlaces.length * 3} Saat
                        </span>
                        <a
                          href={getGoogleMapsDirUrl(dayPlaces)}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition print:hidden"
                          title="Bu günün duraklarını Google Maps'te aç"
                        >
                          <Navigation className="w-3 h-3 fill-current" />
                          <span>Bu Günü Haritada Aç</span>
                        </a>
                      </div>
                    </div>

                    {/* Places List within Day */}
                    <div className="divide-y divide-slate-800/60 p-2 print:divide-slate-200">
                      {dayPlaces.map((place, pIdx) => (
                        <div
                          key={place.id}
                          className="p-3 hover:bg-slate-900/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <span className="text-xs font-bold text-slate-500 mt-1 w-5 shrink-0 print:text-black">
                              #{pIdx + 1}
                            </span>
                            <div className="min-w-0">
                              <h4
                                onClick={() => {
                                  onSelectPlace(place);
                                  onClose();
                                }}
                                className="text-xs sm:text-sm font-bold text-slate-100 hover:text-amber-400 cursor-pointer transition print:text-black flex items-center gap-1.5"
                              >
                                <span>{place.name}</span>
                                <span className="text-[10px] text-slate-400 font-normal">({place.city})</span>
                              </h4>
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 print:text-slate-700">
                                {place.whatAwaits || place.description}
                              </p>
                              {place.localSpecialties && (
                                <p className="text-[11px] text-amber-300/90 mt-0.5 flex items-center gap-1 print:text-slate-800">
                                  <span>🍽️</span>
                                  <span>Tavsiye: {place.localSpecialties}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Day Switcher Dropdown */}
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0 print:hidden">
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <span>Güne Taşı:</span>
                              <select
                                value={dayNum}
                                onChange={(e) => handleSetDay(place.id, e.target.value)}
                                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-bold focus:outline-none"
                              >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                                  <option key={d} value={d}>
                                    {d}. Gün
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
