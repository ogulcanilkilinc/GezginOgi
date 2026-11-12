import React, { useState } from 'react';
import { CATEGORIES, REGIONS } from '../data/metadata';
import { getProvinceVisitStats, TURKEY_REGIONS } from '../data/turkeyProvinces';
import { getOptimizedImageUrl, coverOf } from '../data/curatedPhotoResolver';
import ChoroplethMap from './ChoroplethMap';
import {
  X,
  Award,
  Compass,
  CheckCircle2,
  Star,
  MapPin,
  Calendar,
  Globe,
  Flag,
  ChevronRight,
  Sparkles,
  BookOpen,
  Layers,
  Map as MapIcon,
  Search,
  Quote,
  Camera,
  Filter
} from 'lucide-react';

export default function PassportModal({ isOpen, onClose, places, onSelectPlace }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | '81_provinces' | 'countries' | 'log'
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('all');
  const [selectedProvinceModal, setSelectedProvinceModal] = useState(null);
  const [journalSearch, setJournalSearch] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState('all');

  if (!isOpen) return null;

  const visitedPlaces = places.filter((p) => p.visited);
  const favoritePlaces = places.filter((p) => p.favorite && !p.visited);

  const ankaraTotal = places.filter((p) => p.region === 'ankara').length;
  const ankaraVisited = places.filter((p) => p.region === 'ankara' && p.visited).length;

  const trTotal = places.filter((p) => p.region === 'turkiye').length;
  const trVisited = places.filter((p) => p.region === 'turkiye' && p.visited).length;

  const worldTotal = places.filter((p) => p.region === 'dunya').length;
  const worldVisited = places.filter((p) => p.region === 'dunya' && p.visited).length;

  const worldPlaces = places.filter((p) => p.region === 'dunya');
  const mtpContinents = [
    { id: 'Avrupa', label: '🏰 Avrupa & Balkanlar', icon: '🇪🇺' },
    { id: 'Asya', label: '⛩️ Asya & İpek Yolu', icon: '🌏' },
    { id: 'Orta Doğu & Afrika', label: '🏜️ Orta Doğu & Afrika', icon: '🌍' },
    { id: 'Amerika', label: '🗽 Kuzey & Güney Amerika', icon: '🌎' },
    { id: 'Okyanusya', label: '🦘 Okyanusya & Pasifik', icon: '🏝️' },
    { id: 'MTP Uzak Adalar & Kutuplar', label: '🧭 MTP Uzak Adalar & Kutuplar', icon: '❄️' }
  ];

  const visitedContinentsCount = mtpContinents.filter((c) =>
    worldPlaces.some((p) => p.subRegion === c.id && p.visited)
  ).length;

  const visitedCountries = [...new Set(visitedPlaces.map((p) => p.country).filter(Boolean))];
  const allCountries = [...new Set(places.map((p) => p.country).filter(Boolean))];

  const provinceStats = getProvinceVisitStats(places);

  // Visited places sorted by visitedDate descending (most recent first)
  const sortedVisited = (() => {
    return [...visitedPlaces].sort((a, b) => {
      const dateA = a.visitedDate || '0000-00-00';
      const dateB = b.visitedDate || '0000-00-00';
      return dateB.localeCompare(dateA);
    });
  })();

  // Extract available years for the journal filter
  const availableYears = (() => {
    const years = new Set();
    visitedPlaces.forEach((p) => {
      if (p.visitedDate && p.visitedDate.length >= 4) {
        const y = p.visitedDate.slice(0, 4);
        if (/^\d{4}$/.test(y)) years.add(y);
      }
    });
    return Array.from(years).sort().reverse();
  })();

  // Filtered places for travel journal
  const filteredJournalPlaces = (() => {
    return sortedVisited.filter((p) => {
      if (selectedYearFilter !== 'all') {
        const pYear = p.visitedDate ? p.visitedDate.slice(0, 4) : 'Tarihsiz';
        if (pYear !== selectedYearFilter) return false;
      }
      if (journalSearch.trim()) {
        const q = journalSearch.toLowerCase();
        const mName = p.name?.toLowerCase().includes(q);
        const mCity = p.city?.toLowerCase().includes(q);
        const mCountry = p.country?.toLowerCase().includes(q);
        const mNote = p.userNotes?.toLowerCase().includes(q);
        return mName || mCity || mCountry || mNote;
      }
      return true;
    });
  })();

  // Group filtered journal places by Year
  const timelineByYear = (() => {
    const groups = {};
    filteredJournalPlaces.forEach((p) => {
      const year = p.visitedDate && /^\d{4}/.test(p.visitedDate)
        ? p.visitedDate.slice(0, 4)
        : 'Tarihsiz Anılar';
      if (!groups[year]) groups[year] = [];
      groups[year].push(p);
    });
    return groups;
  })();

  const badges = [
    {
      id: 'first-step',
      title: 'İlk Adım',
      desc: 'Haritadaki ilk noktanı keşfettin!',
      icon: '🌱',
      unlocked: visitedPlaces.length >= 1
    },
    {
      id: 'ankara-explorer',
      title: 'Başkent Gurmesi & Kaşifi',
      desc: 'Ankara’da en az 5 noktayı keşfettin',
      icon: '🏛️',
      unlocked: ankaraVisited >= 5
    },
    {
      id: 'anatolia-traveler',
      title: 'Anadolu Seyyahı',
      desc: 'Türkiye genelinde en az 5 rotayı tamamladın',
      icon: '🇹🇷',
      unlocked: trVisited >= 5
    },
    {
      id: 'provinces-5',
      title: '5 İl Fatihi',
      desc: 'Türkiye’nin 81 ilinden en az 5’ini ziyaret ettin',
      icon: '🗺️',
      unlocked: provinceStats.totalVisited >= 5
    },
    {
      id: 'provinces-15',
      title: 'İl Gezgini (Evliya Çelebi Çırağı)',
      desc: 'Türkiye’nin 81 ilinden en az 15’inde ayak izi bıraktın',
      icon: '📜',
      unlocked: provinceStats.totalVisited >= 15
    },
    {
      id: 'museum-lover',
      title: 'UNESCO & Tarih Avcısı',
      desc: 'En az 5 müze, antik kent veya Dünya Mirası gezdin',
      icon: '🏺',
      unlocked: visitedPlaces.filter((p) => p.category === 'muze').length >= 5
    },
    {
      id: 'nature-soul',
      title: 'Gezegen Doğa Kaşifi',
      desc: 'En az 5 doğal harika, kanyon veya milli park keşfettin',
      icon: '🌲',
      unlocked: visitedPlaces.filter((p) => p.category === 'doga').length >= 5
    },
    {
      id: 'world-citizen',
      title: 'Kıtalararası Gezgin',
      desc: 'En az 3 farklı kıta/MTP bölgesinde ayak izi bıraktın',
      icon: '✈️',
      unlocked: visitedContinentsCount >= 3
    },
    {
      id: 'mtp-frontier',
      title: 'MTP Sınır & Kutup Öncüsü',
      desc: 'MTP Uzak Adalar & Kutuplar listesinden en az 1 ekstrem noktaya ulaştın',
      icon: '🧭',
      unlocked: worldPlaces.some((p) => p.subRegion === 'MTP Uzak Adalar & Kutuplar' && p.visited)
    },
    {
      id: 'globetrotter-15',
      title: 'Dünya Vatandaşı (MTP Master)',
      desc: 'Dünya genelinde 15’ten fazla ikonik destinasyonu tamamladın',
      icon: '🌍',
      unlocked: worldVisited >= 15
    },
    {
      id: 'grand-explorer-30',
      title: 'Efsanevi Seyyah',
      desc: 'Toplamda 30’dan fazla keşif noktasının üstünü çizdin',
      icon: '👑',
      unlocked: visitedPlaces.length >= 30
    }
  ];

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/70 via-white to-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900">
                Kişisel Keşif Pasaportum & Fetih Atlasım
              </h2>
              <p className="text-xs text-slate-500">
                81 İl dolum haritan, dünya fetihlerin, gezgin rozetlerin ve gezi günlüğün
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-50/90 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Genel Bakış & Rozetler</span>
          </button>

          <button
            onClick={() => setActiveTab('81_provinces')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === '81_provinces'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span>🇹🇷</span>
            <span>81 İl Dolum Haritası ({provinceStats.totalVisited}/81)</span>
          </button>

          <button
            onClick={() => setActiveTab('countries')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'countries'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Dünya Fetih Atlası ({visitedCountries.length}/{allCountries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('log')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'log'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Gezi Günlüğü ({visitedPlaces.length} Yer)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/40">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Hero KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-xs">
                  <div className="text-3xl font-bold font-serif text-amber-600">
                    {visitedPlaces.length}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-1">Keşfedilen Nokta</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Atlasında {places.length} yer</div>
                </div>

                <div className="bg-white border border-emerald-200 rounded-2xl p-4 text-center shadow-xs">
                  <div className="text-3xl font-bold font-serif text-emerald-600">
                    {provinceStats.totalVisited} / 81
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-1">Görülen Türkiye İli</div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-0.5">%{provinceStats.percentage} Doluluk</div>
                </div>

                <div className="bg-white border border-sky-200 rounded-2xl p-4 text-center shadow-xs">
                  <div className="text-3xl font-bold font-serif text-sky-600">
                    {visitedCountries.length}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-1">Keşfedilen Ülke</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Atlasında {allCountries.length} ülke</div>
                </div>

                <div className="bg-white border border-purple-200 rounded-2xl p-4 text-center shadow-xs">
                  <div className="text-3xl font-bold font-serif text-purple-600">
                    {badges.filter((b) => b.unlocked).length} / {badges.length}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-1">Kazanılan Rozet</div>
                  <div className="text-[11px] text-purple-600 font-bold mt-0.5">Gezgin Ünvanları</div>
                </div>
              </div>

              {/* Region Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>📍 ANKARA</span>
                    <span className="text-amber-600">
                      {ankaraVisited} / {ankaraTotal}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                      style={{
                        width: `${ankaraTotal ? Math.round((ankaraVisited / ankaraTotal) * 100) : 0}%`
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-600">
                    %{ankaraTotal ? Math.round((ankaraVisited / ankaraTotal) * 100) : 0} tamamlandı
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>🇹🇷 TÜRKİYE (81 İL)</span>
                    <span className="text-emerald-600">
                      {trVisited} / {trTotal}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                      style={{
                        width: `${trTotal ? Math.round((trVisited / trTotal) * 100) : 0}%`
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-600">
                    %{trTotal ? Math.round((trVisited / trTotal) * 100) : 0} tamamlandı
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>✈️ DÜNYA & MTP</span>
                    <span className="text-sky-600">
                      {worldVisited} / {worldTotal}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 transition-all duration-500 rounded-full"
                      style={{
                        width: `${worldTotal ? Math.round((worldVisited / worldTotal) * 100) : 0}%`
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-600">
                    %{worldTotal ? Math.round((worldVisited / worldTotal) * 100) : 0} tamamlandı
                  </div>
                </div>
              </div>

              {/* 81 Province Quick Callout Banner */}
              <div
                onClick={() => setActiveTab('81_provinces')}
                className="bg-gradient-to-r from-emerald-50 via-white to-teal-50 border border-emerald-200 hover:border-emerald-300 p-4 rounded-2xl cursor-pointer transition flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl">🇹🇷</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition flex items-center gap-2">
                      <span>Türkiye’nin 81 İl Dolum Haritası</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        {provinceStats.totalVisited} / 81 İl Feth Edildi
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Atlasında gittiğin her yer ili yeşile boyar. Tıkla ve interaktif haritada keşfet!
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition" />
              </div>

              {/* Badges Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Gezgin Rozetlerim ({badges.filter((b) => b.unlocked).length}/{badges.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {badges.map((b) => (
                    <div
                      key={b.id}
                      className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                        b.unlocked
                          ? 'bg-amber-50/70 border-amber-200 text-slate-900 shadow-xs'
                          : 'bg-white border-slate-200/70 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="text-2xl shrink-0">{b.icon}</div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>{b.title}</span>
                          {b.unlocked && (
                            <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-extrabold">
                              KAZANILDI
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{b.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 81 PROVINCES (TÜRKİYE İL HARİTASI) */}
          {activeTab === '81_provinces' && (
            <div className="space-y-5">
              {/* Overall Progress Banner */}
              <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                      <span>🇹🇷</span>
                      <span>İnteraktif 81 İl Dolum Haritası</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Atlasında ziyaret ettiğin her mekan, bağlı olduğu ili haritada zümrüt yeşiline boyar.
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-2xl font-bold font-serif text-emerald-700">
                      {provinceStats.totalVisited} / 81 İl
                    </div>
                    <div className="text-xs text-emerald-600 font-bold">
                      %{provinceStats.percentage} Keşfedildi
                    </div>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
                    style={{ width: `${provinceStats.percentage}%` }}
                  />
                </div>
              </div>

              {/* Visual Interactive Leaflet Choropleth Map */}
              <ChoroplethMap
                mode="turkey"
                places={places}
                onSelectProvince={(provName, plateNum) => {
                  const matched = provinceStats.regionalBreakdown
                    .flatMap((r) => r.provinces)
                    .find(
                      (p) =>
                        p.plate === plateNum ||
                        p.name.toLowerCase() === provName.toLowerCase()
                    );
                  if (matched) setSelectedProvinceModal(matched);
                }}
              />

              {/* Geographic Region Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setSelectedRegionFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    selectedRegionFilter === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  Tüm Bölgeler (81 İl)
                </button>
                {TURKEY_REGIONS.map((reg) => {
                  const regData = provinceStats.regionalBreakdown.find((r) => r.id === reg.id);
                  const isSel = selectedRegionFilter === reg.id;
                  return (
                    <button
                      key={reg.id}
                      onClick={() => setSelectedRegionFilter(reg.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                        isSel
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      <span>{reg.icon}</span>
                      <span>{reg.label}</span>
                      <span className="text-[10px] opacity-80">
                        ({regData?.visitedProvinces || 0}/{regData?.totalProvinces || 0})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 81 Province Tiles Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {provinceStats.regionalBreakdown
                  .filter((reg) => selectedRegionFilter === 'all' || selectedRegionFilter === reg.id)
                  .flatMap((reg) => reg.provinces)
                  .map((prov) => {
                    const isVisited = prov.visited;
                    return (
                      <div
                        key={prov.plate}
                        onClick={() => setSelectedProvinceModal(prov)}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between ${
                          isVisited
                            ? 'bg-emerald-50/80 border-emerald-300 hover:border-emerald-400 text-emerald-950 shadow-xs'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                              isVisited
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {prov.plate.toString().padStart(2, '0')}
                          </span>
                          {isVisited ? (
                            <span className="text-emerald-700 text-xs font-bold">✓ Gidildi</span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Bekliyor</span>
                          )}
                        </div>

                        <div className="mt-2">
                          <div
                            className={`text-xs font-bold truncate ${
                              isVisited ? 'text-emerald-950' : 'text-slate-800'
                            }`}
                          >
                            {prov.name}
                          </div>
                          <div className="text-[10px] text-slate-600 mt-0.5">
                            {prov.totalPlaces > 0 ? `${prov.totalPlaces} kayıtlı mekan` : 'Henüz yer yok'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Province Details Drawer / Modal if clicked */}
              {selectedProvinceModal && (
                <div className="bg-white border border-emerald-300 rounded-2xl p-4 space-y-3 shadow-md animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-600 text-white rounded">
                        Plaka {selectedProvinceModal.plate.toString().padStart(2, '0')}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {selectedProvinceModal.name} — Kayıtlı Mekanlar
                      </h4>
                    </div>
                    <button
                      onClick={() => setSelectedProvinceModal(null)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {selectedProvinceModal.placesList.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Bu il için henüz atlasında kayıtlı mekan bulunmuyor. Yeni bir mekan ekleyerek bu ili doldurabilirsin!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedProvinceModal.placesList.map((pl) => (
                        <div
                          key={pl.id}
                          onClick={() => {
                            onSelectPlace(pl);
                            onClose();
                          }}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-400 cursor-pointer flex items-center justify-between transition"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">{pl.name}</div>
                            <div className="text-[11px] text-slate-500">{pl.city}</div>
                          </div>
                          {pl.visited ? (
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                              ✓ Gittim
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Gidilecek
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COUNTRIES */}
          {activeTab === 'countries' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-amber-600" />
                    <span>Gezilen Ülkeler & Dünya Fetih Atlası</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Atlasında yer alan {allCountries.length} ülkeden {visitedCountries.length} tanesini ziyaret ettin.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-serif text-amber-600">
                    {visitedCountries.length} / {allCountries.length}
                  </div>
                  <div className="text-xs text-slate-600 font-medium">Ülke Ayak İzi</div>
                </div>
              </div>

              {/* World Choropleth Map */}
              <ChoroplethMap mode="world" places={places} />

              {/* Visited Countries Badges */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  ✓ Ziyaret Edilen Ülkeler ({visitedCountries.length})
                </h4>
                {visitedCountries.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500 shadow-xs">
                    Henüz bir ülkeyi ziyaret edilmiş olarak işaretlemedin. Gittiğin yerleri işaretledikçe ülkeler haritada altın rengine bürünür!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {visitedCountries.map((c) => {
                      const countInCountry = places.filter((p) => p.country === c).length;
                      const visitedInCountry = places.filter((p) => p.country === c && p.visited).length;
                      return (
                        <div
                          key={c}
                          className="p-3 rounded-2xl bg-white border border-amber-200 shadow-xs flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-900">{c}</div>
                            <div className="text-[10px] text-slate-600 mt-0.5">
                              {visitedInCountry} / {countInCountry} yer
                            </div>
                          </div>
                          <span className="text-emerald-600 text-xs font-bold">✓</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* MTP Continents Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  MTP (Most Traveled People) Kıtalar & Özel Bölgeler
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {mtpContinents.map((cont) => {
                    const totalCont = worldPlaces.filter((p) => p.subRegion === cont.id).length;
                    const visCont = worldPlaces.filter(
                      (p) => p.subRegion === cont.id && p.visited
                    ).length;
                    const pct = totalCont ? Math.round((visCont / totalCont) * 100) : 0;
                    return (
                      <div
                        key={cont.id}
                        className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-2 shadow-xs"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 truncate">{cont.label}</span>
                          <span className="font-bold text-amber-600 shrink-0 ml-2">
                            {visCont}/{totalCont}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VISITED PLACES LOG & TRAVEL TIMELINE */}
          {activeTab === 'log' && (
            <div className="space-y-6">
              {/* Journal Header & Filters */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-amber-600" />
                      <span>Kişisel Gezi Günlüğü & Anı Zaman Çizelgesi</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ziyaret tarihlerine göre kronolojik sıralanmış keşiflerin, kişisel notların ve seyahat anıların
                    </p>
                  </div>
                  <div className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0">
                    Toplam {visitedPlaces.length} Ziyaret Edilmiş Mekan
                  </div>
                </div>

                {/* Search & Year Filters Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={journalSearch}
                      onChange={(e) => setJournalSearch(e.target.value)}
                      placeholder="Anılarda veya mekanlarda ara..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                    />
                    {journalSearch && (
                      <button
                        onClick={() => setJournalSearch('')}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
                    <button
                      onClick={() => setSelectedYearFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                        selectedYearFilter === 'all'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Tüm Yıllar
                    </button>
                    {availableYears.map((yr) => (
                      <button
                        key={yr}
                        onClick={() => setSelectedYearFilter(yr)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                          selectedYearFilter === yr
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {visitedPlaces.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3 shadow-xs">
                  <span className="text-4xl block">📖</span>
                  <h4 className="text-sm font-bold text-slate-800">Henüz Gezi Günlüğünde Anı Yok</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Haritadan veya listeden gittiğin yerlerin yanındaki ○ butonuna basarak ilk mekanını "Gittim" olarak işaretle. Ziyaret tarihi, puanın ve kişisel notların burada kronolojik bir zaman tüneli olarak derlenecektir!
                  </p>
                </div>
              ) : Object.keys(timelineByYear).length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
                  Aradığın kriterlere uygun anı bulunamadı.
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(timelineByYear).map(([year, yearPlaces]) => {
                    const distinctCountries = [
                      ...new Set(yearPlaces.map((p) => p.country).filter(Boolean))
                    ];

                    return (
                      <div key={year} className="space-y-4">
                        {/* Year Milestone Header */}
                        <div className="flex items-center gap-3">
                          <div className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-serif font-bold text-sm shadow-sm flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-950" />
                            <span>{year} Yılı</span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {yearPlaces.length} Mekan Ziyareti · {distinctCountries.length} Farklı Ülke ({distinctCountries.slice(0, 3).join(', ')}{distinctCountries.length > 3 ? '...' : ''})
                          </div>
                          <div className="flex-1 h-px bg-slate-200" />
                        </div>

                        {/* Chronological Cards */}
                        <div className="grid grid-cols-1 gap-3 pl-2 sm:pl-4 border-l-2 border-amber-200/80 ml-3">
                          {yearPlaces.map((pl) => {
                            const catObj =
                              CATEGORIES.find((c) => c.id === pl.category) || CATEGORIES[0];

                            return (
                              <div
                                key={pl.id}
                                onClick={() => {
                                  onSelectPlace(pl);
                                  onClose();
                                }}
                                className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 cursor-pointer transition shadow-xs hover:shadow-md group relative -ml-[19px] sm:-ml-[27px]"
                              >
                                {/* Timeline Dot */}
                                <div className="hidden sm:flex absolute -left-[11px] top-6 w-5 h-5 rounded-full bg-white border-4 border-amber-500 shadow-xs items-center justify-center" />

                                {/* Thumbnail */}
                                <div className="relative w-full sm:w-32 h-28 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center">
                                  {coverOf(pl) ? (
                                    <img
                                      src={getOptimizedImageUrl(coverOf(pl), 500)}
                                      loading="lazy"
                                      alt={pl.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'block';
                                      }}
                                    />
                                  ) : null}
                                  <span
                                    className="text-3xl"
                                    style={{ display: coverOf(pl) ? 'none' : 'block' }}
                                  >
                                    {catObj.icon}
                                  </span>
                                  <span className="absolute bottom-1 right-1 text-[10px] bg-white/95 text-slate-800 border border-slate-200 rounded px-1.5 py-0.5 font-bold shadow-xs">
                                    {catObj.icon} {catObj.label}
                                  </span>
                                </div>

                                {/* Body */}
                                <div className="flex-1 min-w-0 space-y-2">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                      <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-600 transition truncate">
                                        ✓ {pl.name}
                                      </h4>
                                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                        <span>{pl.city}, {pl.country}</span>
                                        {pl.ankaraDistance?.summaryText && (
                                          <>
                                            <span>·</span>
                                            <span className="text-slate-600 font-medium">{pl.ankaraDistance.summaryText}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    {pl.visitedDate && (
                                      <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold shrink-0 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>{pl.visitedDate}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* User Rating Stars */}
                                  {pl.userRating > 0 && (
                                    <div className="flex items-center gap-1 text-amber-500 text-xs">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-3.5 h-3.5 ${
                                            i < pl.userRating
                                              ? 'fill-amber-400 text-amber-400'
                                              : 'text-slate-200'
                                          }`}
                                        />
                                      ))}
                                      <span className="text-[11px] font-bold text-slate-600 ml-1">
                                        {pl.userRating}/5 Puan
                                      </span>
                                    </div>
                                  )}

                                  {/* Personal User Note */}
                                  {pl.userNotes && (
                                    <div className="bg-amber-50/70 border-l-2 border-amber-400 rounded-r-xl p-2.5 text-xs text-slate-700 italic flex items-start gap-2">
                                      <Quote className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                      <span className="line-clamp-2">{pl.userNotes}</span>
                                    </div>
                                  )}

                                  {/* User Photos Preview */}
                                  {pl.userPhotos && pl.userPhotos.length > 0 && (
                                    <div className="flex items-center gap-1.5 pt-1">
                                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <Camera className="w-3 h-3 text-slate-400" />
                                        {pl.userPhotos.length} Kişisel Fotoğraf:
                                      </span>
                                      <div className="flex items-center gap-1">
                                        {pl.userPhotos.slice(0, 4).map((imgUrl, idx) => (
                                          <img
                                            key={idx}
                                            src={imgUrl}
                                            alt="Anı"
                                            className="w-7 h-7 rounded-md object-cover border border-slate-200"
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
