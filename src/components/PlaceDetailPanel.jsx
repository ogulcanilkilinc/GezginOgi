import React, { useState, useEffect, useRef } from 'react';
import { CATEGORIES, SEASONS, REGIONS } from '../data/metadata';
import { getPhrasebookForCountry } from '../data/phrasebookData';
import { getOptimizedImageUrl } from '../data/curatedPhotoResolver';
import { getCloudConfig, uploadPhotoToSupabase } from '../services/cloudSyncService';
import {
  X,
  Clock,
  Calendar,
  Compass,
  Utensils,
  Sparkles,
  CheckCircle2,
  Circle,
  Star,
  MapPin,
  BookOpen,
  Edit3,
  Trash2,
  ExternalLink,
  Save,
  Wallet,
  Route,
  CloudSun,
  Briefcase,
  Camera,
  Plus,
  CheckSquare,
  Square,
  Sun,
  Sunset,
  Sunrise,
  Volume2,
  Smile,
  Plane,
  Hotel,
  ChevronDown,
  Loader2
} from 'lucide-react';

// Client-side image downscaler to prevent localStorage quota exhaustion (converts 10MB raw photos to ~100-150KB JPEG)
function resizeImageToMax(file, maxDimension = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Görsel formatı desteklenmiyor.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const DEFAULT_CHECKLIST_BY_CATEGORY = {
  muze: ['Müzekart / Online Bilet kontrolü', 'Rahat yürüyüş ayakkabısı', 'Powerbank & Kamera', 'Kulaklık (Sesli rehber için)'],
  doga: ['Termos kahve & Su matarası', 'Kaymaz tabanlı yürüyüş ayakkabısı', 'Katmanlı kıyafet / Rüzgarlık', 'Kamp sandalyesi / Piknik örtüsü'],
  restoran: ['Rezervasyon kontrolü', 'İmza yemeği / tatlıyı sipariş et', 'Nakit / Kart kontrolü'],
  bar: ['Rezervasyon / Etkinlik takvimi kontrolü', 'Kimlik', 'Gece dönüş ulaşım planı'],
  kultur: ['Rahat yürüyüş ayakkabısı', 'Fotoğraf makinesi / Powerbank', 'Yerel çarşı için bez çanta', 'Nakit bozuk para'],
  gizli: ['Offline harita / Konum kaydı', 'Yedek şarj (Powerbank)', 'Su ve atıştırmalık', 'Gün batımı saatini kontrol et']
};

function getWeatherLabel(code) {
  if (code === 0) return { icon: '☀️', text: 'Açık & Güneşli' };
  if (code <= 3) return { icon: '⛅', text: 'Parçalı Bulutlu' };
  if (code <= 48) return { icon: '🌫️', text: 'Sisli / Puslu' };
  if (code <= 67) return { icon: '🌧️', text: 'Yağmurlu' };
  if (code <= 77) return { icon: '❄️', text: 'Karlı' };
  if (code <= 82) return { icon: '🌦️', text: 'Sağanak Geçişli' };
  return { icon: '⛈️', text: 'Fırtınalı' };
}

export default function PlaceDetailPanel({
  place,
  onClose,
  onToggleVisited,
  onToggleFavorite,
  onUpdateNotes,
  onEditPlace,
  onDeletePlace,
  inTripPlan = false,
  onToggleTripPlan,
  onOpenCountryIntel
}) {
  const [noteText, setNoteText] = useState('');
  const [rating, setRating] = useState(5);
  const [visitedDate, setVisitedDate] = useState('');
  const [noteSavedToast, setNoteSavedToast] = useState(false);

  // Live Weather State
  const [weather, setWeather] = useState(null);

  // Checklist State
  const [checklist, setChecklist] = useState([]);
  const [newCheckItem, setNewCheckItem] = useState('');

  // User Photos State
  const [userPhotos, setUserPhotos] = useState([]);
  const [imgError, setImgError] = useState(false);
  const [photoCompressing, setPhotoCompressing] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const photoInputRef = useRef(null);

  // Accordion Expand/Collapse States (Improves mobile layout)
  const [isBlogExpanded, setIsBlogExpanded] = useState(false);
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);
  const [isPhrasebookExpanded, setIsPhrasebookExpanded] = useState(false);

  useEffect(() => {
    if (!place) return;
    setImgError(false);
    setNoteText(place.userNotes || '');
    setRating(place.userRating || 5);
    setVisitedDate(place.visitedDate || new Date().toISOString().slice(0, 10));
    setUserPhotos(place.userPhotos || []);

    if (place.checklist && place.checklist.length > 0) {
      setChecklist(place.checklist);
    } else {
      const defaults =
        DEFAULT_CHECKLIST_BY_CATEGORY[place.category] || DEFAULT_CHECKLIST_BY_CATEGORY.kultur;
      const extraWorld =
        place.region === 'dunya' ? ['Pasaport / Kimlik & Bilet kontrolü', 'Priz adaptörü / eSIM'] : [];
      setChecklist(
        [...extraWorld, ...defaults].map((text, idx) => ({
          id: `chk-${idx}`,
          text,
          done: false
        }))
      );
    }
  }, [place]);

  // Fetch Live Weather from Open-Meteo (Free, No API Key Required)
  useEffect(() => {
    if (!place?.coords || place.coords.length !== 2) return;
    let cancelled = false;
    setWeather(null);

    const [lat, lng] = place.coords;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.current_weather) {
          const cw = data.current_weather;
          const info = getWeatherLabel(cw.weathercode);
          setWeather({
            temp: Math.round(cw.temperature),
            wind: Math.round(cw.windspeed),
            icon: info.icon,
            text: info.text
          });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [place?.id]);

  if (!place) return null;

  const catObj = CATEGORIES.find((c) => c.id === place.category) || CATEGORIES[0];
  const regObj = REGIONS.find((r) => r.id === place.region) || REGIONS[0];

  const handleSaveJournal = (e) => {
    e.preventDefault();
    onUpdateNotes(place.id, {
      userNotes: noteText,
      userRating: rating,
      visitedDate: visitedDate,
      checklist,
      userPhotos
    });
    setNoteSavedToast(true);
    setTimeout(() => setNoteSavedToast(false), 2200);
  };

  const handleToggleCheckItem = (itemId) => {
    const updated = checklist.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    setChecklist(updated);
    onUpdateNotes(place.id, { checklist: updated });
  };

  const handleAddCheckItem = (e) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;
    const updated = [
      ...checklist,
      { id: `chk-${Date.now()}`, text: newCheckItem.trim(), done: false }
    ];
    setChecklist(updated);
    setNewCheckItem('');
    onUpdateNotes(place.id, { checklist: updated });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (userPhotos.length >= 6) {
      alert('Bu mekan için en fazla 6 fotoğraf ekleyebilirsiniz.');
      return;
    }

    try {
      setPhotoCompressing(true);
      setPhotoError('');
      // 1. Downscale to max 1200px and JPEG quality 0.82 to prevent storage overflow
      const compressedDataUrl = await resizeImageToMax(file, 1200, 0.82);

      let finalPhotoUrl = compressedDataUrl;
      // 2. If Supabase is connected, upload to Supabase Storage bucket
      const cloudConfig = getCloudConfig();
      if (cloudConfig && cloudConfig.supabaseUrl && cloudConfig.supabaseKey) {
        const cloudUrl = await uploadPhotoToSupabase(compressedDataUrl, place.id, cloudConfig);
        if (cloudUrl) {
          finalPhotoUrl = cloudUrl;
        }
      }

      const updated = [...userPhotos, finalPhotoUrl];
      setUserPhotos(updated);
      onUpdateNotes(place.id, { userPhotos: updated });
    } catch (err) {
      console.error('Fotoğraf küçültme/kaydetme hatası:', err);
      const isQuota = err?.name === 'QuotaExceededError' || err?.code === 22;
      const msg = isQuota
        ? 'Yer kalmadı, fotoğraf kaydedilmedi! Lütfen bazı fotoğrafları silin veya Bulut Eşleme kullanın.'
        : 'Yer kalmadı, fotoğraf kaydedilmedi. Depolama alanı dolu olabilir.';
      setPhotoError(msg);
      alert(`⚠️ ${msg}`);
    } finally {
      setPhotoCompressing(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleRemoveUserPhoto = (idx) => {
    const updated = userPhotos.filter((_, i) => i !== idx);
    setUserPhotos(updated);
    onUpdateNotes(place.id, { userPhotos: updated });
  };

  const googleMapsUrl =
    place?.coords && place.coords.length === 2
      ? `https://www.google.com/maps/search/?api=1&query=${place.coords[0]},${place.coords[1]}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((place?.name || '') + ' ' + (place?.city || ''))}`;

  const destinationQuery = encodeURIComponent(
    [place?.city, place?.country].filter(Boolean).join(' ') || place?.name || ''
  );
  const bookingUrl = `https://www.booking.com/searchresults.tr.html?ss=${destinationQuery}${
    place?.coords && place.coords.length === 2
      ? `&latitude=${place.coords[0]}&longitude=${place.coords[1]}`
      : ''
  }`;
  const thyUrl = `https://www.turkishairlines.com/tr-tr/ucak-bileti/`;
  const flightsUrl = `https://www.google.com/travel/flights?q=${destinationQuery}`;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full text-slate-800">
      {/* Hero Image Header */}
      <div className="relative h-56 sm:h-64 w-full shrink-0 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/60 flex items-center justify-center">
        {place.coverImage && !imgError ? (
          <img
            src={getOptimizedImageUrl(place.coverImage, 960)}
            alt={place.name}
            className={`w-full h-full object-cover transition duration-700 ${
              place.visited ? 'saturate-90' : ''
            }`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="text-center p-6 space-y-2 opacity-90">
            <span className="text-6xl block transform hover:scale-110 transition duration-300">{catObj.icon}</span>
            <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">
              {catObj.label} • {place.city}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent pointer-events-none" />

        {/* Top Bar Actions */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${catObj.bg}`}
            >
              {catObj.icon} {catObj.label}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900/80 text-slate-200 border border-slate-700/80 backdrop-blur-md">
              {regObj.flag} {place.city}
            </span>
            {weather && (
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/85 text-sky-300 border border-sky-500/30 backdrop-blur-md flex items-center gap-1"
                title={`Şu anki canlı hava durumu: ${weather.text}, Rüzgar: ${weather.wind} km/s`}
              >
                <span>{weather.icon}</span>
                <span>{weather.temp}°C</span>
                <span className="hidden sm:inline text-[10px] text-slate-300 font-normal">
                  ({weather.text})
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleTripPlan && (
              <button
                onClick={() => onToggleTripPlan(place.id)}
                className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold backdrop-blur-md border flex items-center gap-1 transition ${
                  inTripPlan
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-slate-900/80 text-slate-200 border-slate-700 hover:border-amber-400'
                }`}
                title="Numaralı gezi rotasına ekle/çıkar"
              >
                <Route className="w-3.5 h-3.5" />
                <span>{inTripPlan ? 'Rotada' : '+ Rota'}</span>
              </button>
            )}
            <button
              onClick={() => onToggleFavorite(place.id)}
              className={`p-2 rounded-full backdrop-blur-md border transition ${
                place.favorite
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:text-amber-300'
              }`}
              title={place.favorite ? 'Favorilerden çıkar' : 'Gidilecekler listemde öne çıkar'}
            >
              <Star className={`w-4 h-4 ${place.favorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => onEditPlace(place)}
              className="p-2 rounded-full bg-slate-900/80 text-slate-300 border border-slate-700 hover:text-white backdrop-blur-md transition"
              title="Mekan bilgilerini düzenle"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-900/80 text-slate-300 border border-slate-700 hover:text-white backdrop-blur-md transition"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Title & Status Action on Hero */}
        <div className="absolute bottom-3 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            {place.visited && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500 text-slate-950 mb-1.5 shadow">
                ✓ KEŞFEDİLDİ {place.visitedDate ? `(${place.visitedDate})` : ''}
              </span>
            )}
            <h2
              className={`text-xl sm:text-2xl font-bold font-serif leading-tight text-white ${
                place.visited ? 'strikethrough-animated' : ''
              }`}
            >
              {place.name}
            </h2>
          </div>

          <button
            onClick={() => onToggleVisited(place.id)}
            className={`shrink-0 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition transform active:scale-95 ${
              place.visited
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
            }`}
          >
            {place.visited ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Gittim! (Üstü Çizili)</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" />
                <span>Gittim Olarak İşaretle</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Photo attribution (Wikimedia Commons license requirement) */}
      {place.coverImage && !imgError && place.photoCredit && (
        <div className="px-4 py-1.5 bg-slate-100 border-b border-slate-200 text-[10px] text-slate-500 truncate">
          📷{' '}
          <a
            href={place.photoCredit.page}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-800 underline decoration-dotted"
            title={`${place.photoCredit.artist} — ${place.photoCredit.license}`}
          >
            {place.photoCredit.artist}
          </a>
          {place.photoCredit.license && (
            <>
              {' · '}
              {place.photoCredit.licenseUrl ? (
                <a
                  href={place.photoCredit.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-800 underline decoration-dotted"
                >
                  {place.photoCredit.license}
                </a>
              ) : (
                <span>{place.photoCredit.license}</span>
              )}
            </>
          )}
          {' · Wikimedia Commons'}
        </div>
      )}

      {/* Scrollable Content Body (LIGHT THEME) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/60">
        {/* Quick Key Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold mb-1">
              <Clock className="w-4 h-4" />
              <span>Ne Kadar Sürede Gezilir?</span>
            </div>
            <div className="text-sm font-bold text-slate-900">{place.duration || '2 - 3 Saat'}</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold mb-1">
              <Calendar className="w-4 h-4" />
              <span>İdeal Mevsimler</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {(place.seasons || []).map((sId) => {
                const sObj = SEASONS.find((s) => s.id === sId);
                return sObj ? (
                  <span
                    key={sId}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/70"
                  >
                    {sObj.icon} {sObj.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-cyan-700 text-xs font-semibold">
                <Wallet className="w-4 h-4" />
                <span>Bütçe Seviyesi</span>
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {place.budget || 'Orta (₺₺)'}
              </span>
            </div>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 py-1.5 px-3 rounded-lg border border-amber-200/80 transition"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Google Haritalar</span>
              <ExternalLink className="w-3 h-3 text-amber-700/70" />
            </a>
          </div>
        </div>

        {/* Ankara'dan Mesafe & Vize Durumu Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Ankara Distance Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 border border-amber-200/90 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                <span>🚗</span>
                <span>Ankara’dan Ne Kadar Uzak?</span>
              </span>
              {place.ankaraDistance?.isWeekendEscape && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-xs">
                  🌿 Hafta Sonu Kaçamağı
                </span>
              )}
            </div>

            <div className="text-base sm:text-lg font-bold text-slate-900">
              {place.ankaraDistance?.summaryText || (place.country === 'Türkiye' ? 'Ankara’ya Yakın' : 'Uluslararası Uçuş')}
            </div>

            <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/50">
              {place.ankaraDistance?.distKm > 0 && (
                <span>📍 Kuş uçuşu: <strong>{place.ankaraDistance.distKm} km</strong></span>
              )}
              {place.ankaraDistance?.roadKm > 0 && place.ankaraDistance?.driveMinutes > 0 && (
                <span>· Karayolu: <strong>~{place.ankaraDistance.roadKm} km</strong></span>
              )}
              {place.ankaraDistance?.trainText && (
                <span className="text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  🚄 {place.ankaraDistance.trainText}
                </span>
              )}
            </div>
          </div>

          {/* Visa Status & Country Intel Card */}
          <div className="bg-gradient-to-br from-sky-500/10 via-white to-blue-500/5 border border-sky-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sky-950 font-bold text-xs">
                  <span>🛂</span>
                  <span>Türk Pasaportu Vize Durumu</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${place.visaStatus?.badgeClass || 'bg-slate-100 text-slate-700'}`}>
                  {place.visaStatus?.icon} {place.visaStatus?.label || 'Belirtilmedi'}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed line-clamp-2">
                {place.visaStatus?.notes || `${place.country || 'Türkiye'} seyahat detayları.`}
              </p>
              <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 border-t border-sky-100 pt-1">
                <span>🏛️</span>
                <span>{place.visaStatus?.source || 'Kaynak: mfa.gov.tr & konsolosluk.gov.tr · Kontrol: Kasım 2026'}</span>
              </div>
            </div>

            <button
              onClick={() => onOpenCountryIntel && onOpenCountryIntel(place.country || 'Türkiye')}
              className="mt-2 w-full py-1.5 px-3 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-sky-900 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <span>🌍</span>
              <span>{place.country || 'Türkiye'} Pratik Rehberi (Priz, Bahşiş, Kur)</span>
            </button>
          </div>
        </div>

        {/* Seyahat, Ulaşım & Konaklama Köprüsü */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-600" />
              <span>Uçuş, Konaklama & Yol Planlama Bağlantıları</span>
            </span>
            <span className="text-[10px] text-slate-500">Canlı Arama & Fiyat Kontrolü</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 transition group"
              title="Google Haritalar'da yol tarifi aç"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition" />
              <span>Yol Tarifi</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <a
              href={bookingUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-xl bg-blue-50/70 hover:bg-blue-100 border border-blue-200/80 text-blue-800 text-xs font-medium flex items-center justify-center gap-1.5 transition group"
              title={`${place.city || place.name} otel ve konaklama seçeneklerine Booking.com'da bak`}
            >
              <Hotel className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition" />
              <span>Booking.com</span>
              <ExternalLink className="w-3 h-3 text-blue-400" />
            </a>

            <a
              href={thyUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-xl bg-rose-50/70 hover:bg-rose-100 border border-rose-200/80 text-rose-800 text-xs font-medium flex items-center justify-center gap-1.5 transition group"
              title="Türk Hava Yolları uçak bileti araması"
            >
              <Plane className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition" />
              <span>THY Uçuş</span>
              <ExternalLink className="w-3 h-3 text-rose-400" />
            </a>

            <a
              href={flightsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-xl bg-sky-50/70 hover:bg-sky-100 border border-sky-200/80 text-sky-800 text-xs font-medium flex items-center justify-center gap-1.5 transition group"
              title={`${place.city || place.name} için uçuş seferleri ve fiyat karşılaştırması`}
            >
              <Plane className="w-3.5 h-3.5 text-sky-600 group-hover:scale-110 transition" />
              <span>Uçuş Ara</span>
              <ExternalLink className="w-3 h-3 text-sky-400" />
            </a>
          </div>
        </div>

        {/* 1. İçeride Seni Neler Bekliyor? */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
          <h3 className="text-base font-bold text-amber-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>İçeride Seni Neler Bekliyor?</span>
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">{place.whatAwaits}</p>

          {place.highlights && place.highlights.length > 0 && (
            <div className="pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Kaçırılmaması Gereken Detaylar:
              </div>
              <ul className="space-y-1.5">
                {place.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                    <span className="text-amber-500 font-bold mt-0.5">✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 2. Hangi Mevsimde & Ne Zaman Gidilir + Nasıl Gezilir? */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
            <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Ne Zaman & Hangi Saatte Gidilir?</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {place.bestTimeText ||
                'İlkbahar ve sonbahar aylarında sabah saatleri en keyifli zaman dilimidir.'}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
            <h4 className="text-sm font-bold text-cyan-800 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-600" />
              <span>Nasıl Gezilir & Ulaşım İpuçları</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{place.howToVisit}</p>
          </div>
        </div>

        {/* 3. Yöresel Lezzetler & Yakında Neler Var? */}
        <div className="bg-orange-50/60 border border-orange-200/80 rounded-2xl p-4 sm:p-5 space-y-2 shadow-xs">
          <h4 className="text-sm font-bold text-orange-900 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-orange-600" />
            <span>Yöresel Ne Yenir & Yakın Çevrede Neler Var?</span>
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {place.localSpecialties}
          </p>
        </div>

        {/* 3.1 Fotoğraf Rehberi (Yalnızca özgün/özel ipucu varsa gösterilir) */}
        {place.practicalTips && !place.practicalTips.includes('Geniş açı ile mekanı çevreleyen') ? (
          <div className="bg-gradient-to-r from-amber-50/80 via-white to-rose-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-600" />
                <span>Fotoğraf Rehberi & En İyi Çekim Zamanı</span>
              </h4>
              <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                🌅 Altın Saat
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs flex items-start gap-2.5">
                <Sunset className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">İdeal Işık Saati:</strong>
                  <span className="text-slate-600">
                    {place.category === 'doga'
                      ? 'Gün Doğumu (06:30 - 08:00) & Gün Batımı Altın Saat'
                      : place.category === 'muze'
                      ? 'Sabah Erken (09:00) veya Öğleden Sonra Işığı'
                      : 'Akşam Alacakaranlığı & Mavi Saat (Işıklar Yanarken)'}
                  </span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs flex items-start gap-2.5">
                <Compass className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Önerilen Çekim Açısı:</strong>
                  <span className="text-slate-600">{place.practicalTips}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* 3.2 Yerel İpuçları & Hayat Kurtaran Kelimeler (Yalnızca Yurtdışı Destinasyonlarında Gösterilir) */}
        {(() => {
          if (!place.country || place.country === 'Türkiye') return null;
          const pb = getPhrasebookForCountry(place.country);
          if (!pb) return null;
          return (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
              <button
                type="button"
                onClick={() => setIsPhrasebookExpanded(!isPhrasebookExpanded)}
                className="w-full flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{pb.flag}</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{pb.language} — Hayat Kurtaran İfadeler</span>
                    </h4>
                    <span className="text-[10px] text-slate-500">{place.country} seyahatinde yerel esnafla pratik iletişim</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                    🗣️ {isPhrasebookExpanded ? 'Kapat' : 'Sözlüğü Aç'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isPhrasebookExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isPhrasebookExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 animate-fadeIn">
                  {pb.phrases.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="text-[11px] text-slate-500 block">{item.tr}</span>
                        <strong className="text-xs text-slate-900 block mt-0.5">{item.local}</strong>
                      </div>
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 shrink-0">
                        /{item.phonetic}/
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* 4. Mini-Blog & Rehber Hikayesi (Katlanabilir Akordiyon) */}
        {place.blogArticle && (
          <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-xs">
            <button
              type="button"
              onClick={() => setIsBlogExpanded(!isBlogExpanded)}
              className="w-full flex items-center justify-between text-left focus:outline-none"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm sm:text-base font-serif font-bold text-amber-950">
                  Gezi Rehberi & Mini-Blog Hikayesi
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-amber-800 font-semibold bg-amber-100/70 border border-amber-300/70 px-2.5 py-0.5 rounded-full">
                  {isBlogExpanded ? 'Hikayeyi Kapat' : 'Devamını Oku'}
                </span>
                <ChevronDown className={`w-4 h-4 text-amber-700 transition-transform duration-200 ${isBlogExpanded ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {isBlogExpanded ? (
              <div className="space-y-3 pt-2 border-t border-amber-200/60 text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal animate-fadeIn">
                {place.blogArticle}
              </div>
            ) : (
              <p className="text-xs text-slate-600 line-clamp-2 italic pt-1">
                {place.blogArticle.slice(0, 150)}...
              </p>
            )}
          </div>
        )}

        {/* 5. Hazırlık & Çanta Kontrol Listesi (Checklist - Katlanabilir Akordiyon) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
          <button
            type="button"
            onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-bold text-purple-900">
                Gitmeden Önce Hazırlık & Çanta Listesi
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-purple-800 font-medium bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                {checklist.filter((c) => c.done).length}/{checklist.length} Tamamlandı
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isChecklistExpanded ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {isChecklistExpanded && (
            <div className="space-y-3 pt-2 border-t border-slate-100 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {checklist.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleCheckItem(item.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition ${
                      item.done
                        ? 'bg-emerald-50 border-emerald-200 text-slate-400 line-through'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {item.done ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{item.text}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddCheckItem} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newCheckItem}
                  onChange={(e) => setNewCheckItem(e.target.value)}
                  placeholder="Listeye kendi hazırlık maddeni ekle..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ekle</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* 6. Kişisel Gezi Günlüğüm, Puanım & Fotoğraf Albümüm */}
        <form
          onSubmit={handleSaveJournal}
          className="bg-white border border-amber-300/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-600" />
              <span>Benim Gezi Günlüğüm & Anı Fotoğraflarım</span>
            </h4>

            {/* Star Rating Selector */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 mr-1">Puanım:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`transition ${
                    star <= rating
                      ? 'text-amber-500 scale-110'
                      : 'text-slate-300 hover:text-slate-400'
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Buraya kendi gezi planını, kiminle gideceğini, gittiysen en sevdiğin detayı veya anılarını yazabilirsin..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition"
          />

          {/* User Photo Gallery */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kendi Çektiğim Fotoğraflar ({userPhotos.length}/6)</span>
                </span>
                <span className="text-[10px] text-slate-400 block">Otomatik sıkıştırılır (maks. ~120KB)</span>
              </div>
              <div className="flex items-center gap-2">
                {photoCompressing && (
                  <span className="text-xs text-amber-600 font-medium flex items-center gap-1 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Küçültülüyor...</span>
                  </span>
                )}
                <button
                  type="button"
                  disabled={photoCompressing || userPhotos.length >= 6}
                  onClick={() => photoInputRef.current?.click()}
                  className="text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Fotoğraf Ekle</span>
                </button>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {photoError && (
              <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2.5 font-medium animate-fadeIn">
                ⚠️ {photoError}
              </div>
            )}

            {userPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {userPhotos.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative group h-24 rounded-xl overflow-hidden border border-slate-200 shadow-xs"
                  >
                    <img src={src} alt="Anı" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveUserPhoto(idx)}
                      className="absolute top-1 right-1 bg-slate-900/80 text-rose-300 p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      title="Fotoğrafı kaldır"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Ziyaret / Plan Tarihi:</span>
              <input
                type="date"
                value={visitedDate}
                onChange={(e) => setVisitedDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              {noteSavedToast && (
                <span className="text-xs text-emerald-600 font-semibold animate-pulse">
                  ✓ Günlüğüne kaydedildi!
                </span>
              )}
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Notumu Kaydet</span>
              </button>
            </div>
          </div>
        </form>

        {/* Footer Delete / Edit */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-400">
          <span>
            Koordinatlar: {place.coords[0]}, {place.coords[1]}
          </span>
          <button
            type="button"
            onClick={() => onDeletePlace(place.id)}
            className="text-rose-500 hover:text-rose-700 flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Mekanı Haritamdan Sil</span>
          </button>
        </div>
      </div>
    </div>
  );
}
