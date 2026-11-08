import React, { useState } from 'react';
import { CATEGORIES, REGIONS } from '../data/initialPlaces';
import { getProvinceVisitStats, TURKEY_REGIONS } from '../data/turkeyProvinces';
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
  BookOpen
} from 'lucide-react';

export default function PassportModal({ isOpen, onClose, places, onSelectPlace }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | '81_provinces' | 'countries' | 'log'
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('all');
  const [selectedProvinceModal, setSelectedProvinceModal] = useState(null);

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
    <div className="fixed inset-0 z-[1000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white">
                Kişisel Keşif Pasaportum & Gezi İstatistiklerim
              </h2>
              <p className="text-xs text-slate-400">
                81 İl ilerlemen, dünya keşiflerin, gezgin rozetlerin ve gezi günlüğün
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Genel Bakış & Rozetler</span>
          </button>

          <button
            onClick={() => setActiveTab('81_provinces')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === '81_provinces'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>🇹🇷</span>
            <span>81 İl Dolum Haritası ({provinceStats.totalVisited}/81)</span>
          </button>

          <button
            onClick={() => setActiveTab('countries')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'countries'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Ülkeler ({visitedCountries.length}/{allCountries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('log')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'log'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Gezi Günlüğü ({visitedPlaces.length} Yer)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Hero KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold font-serif text-amber-400">
                    {visitedPlaces.length}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Keşfedilen Nokta</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Toplam {places.length} yer</div>
                </div>

                <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold font-serif text-emerald-400">
                    {provinceStats.totalVisited} / 81
                  </div>
                  <div className="text-xs text-slate-300 mt-1">Görülen Türkiye İli</div>
                  <div className="text-[10px] text-emerald-400/80 mt-0.5">%{provinceStats.percentage} Doluluk</div>
                </div>

                <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold font-serif text-cyan-400">
                    {visitedCountries.length}
                  </div>
                  <div className="text-xs text-slate-300 mt-1">Keşfedilen Ülke</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Atlasında {allCountries.length} ülke</div>
                </div>

                <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold font-serif text-amber-300">
                    {badges.filter((b) => b.unlocked).length} / {badges.length}
                  </div>
                  <div className="text-xs text-slate-300 mt-1">Kazanılan Rozet</div>
                  <div className="text-[10px] text-amber-400/80 mt-0.5">Gezgin Ünvanları</div>
                </div>
              </div>

              {/* Region Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>📍 ANKARA</span>
                    <span className="text-amber-400 font-bold">
                      {ankaraVisited} / {ankaraTotal}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{
                        width: `${ankaraTotal ? Math.round((ankaraVisited / ankaraTotal) * 100) : 0}%`
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    %{ankaraTotal ? Math.round((ankaraVisited / ankaraTotal) * 100) : 0} tamamlandı
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>🇹🇷 TÜRKİYE</span>
                    <span className="text-emerald-400 font-bold">
                      {trVisited} / {trTotal}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${trTotal ? Math.round((trVisited / trTotal) * 100) : 0}%`
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    %{trTotal ? Math.round((trVisited / trTotal) * 100) : 0} tamamlandı
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>✈️ DÜNYA</span>
                    <span className="text-cyan-400 font-bold">
                      {worldVisited} / {worldTotal}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 transition-all duration-500"
                      style={{
                        width: `${worldTotal ? Math.round((worldVisited / worldTotal) * 100) : 0}%`
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    %{worldTotal ? Math.round((worldVisited / worldTotal) * 100) : 0} tamamlandı
                  </div>
                </div>
              </div>

              {/* 81 Province Quick Callout Banner */}
              <div
                onClick={() => setActiveTab('81_provinces')}
                className="bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 p-4 rounded-2xl cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🇹🇷</span>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition flex items-center gap-2">
                      <span>Türkiye’nin 81 İl Haritası & Dolum Durumu</span>
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-normal">
                        {provinceStats.totalVisited} / 81 İl Görüldü
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      7 coğrafi bölgeye göre hangi illeri gezdin, hangi iller seni bekliyor?
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition" />
              </div>

              {/* Badges Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Gezgin Rozetlerim ({badges.filter((b) => b.unlocked).length}/{badges.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {badges.map((b) => (
                    <div
                      key={b.id}
                      className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                        b.unlocked
                          ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-sm'
                          : 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="text-2xl shrink-0">{b.icon}</div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>{b.title}</span>
                          {b.unlocked && (
                            <span className="text-[9px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-extrabold">
                              KAZANILDI
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] opacity-80 mt-0.5">{b.desc}</div>
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
              {/* 81 Province Overall Header & Progress */}
              <div className="bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                      <span>🇹🇷</span>
                      <span>Türkiye’nin 81 İl Dolum Haritası</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Atlasında gittiğin her mekan otomatik olarak bağlı olduğu ili yeşile boyar.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold font-serif text-emerald-400">
                      {provinceStats.totalVisited} / 81 İl
                    </div>
                    <div className="text-xs text-emerald-300/80 font-medium">
                      %{provinceStats.percentage} Keşfedildi
                    </div>
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${provinceStats.percentage}%` }}
                  />
                </div>
              </div>

              {/* Geographic Region Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setSelectedRegionFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    selectedRegionFilter === 'all'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
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
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{reg.icon}</span>
                      <span>{reg.label}</span>
                      <span className="text-[10px] opacity-75">
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
                        className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                          isVisited
                            ? 'bg-emerald-950/40 border-emerald-500/50 hover:border-emerald-400 shadow-sm'
                            : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                              isVisited
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {prov.plate.toString().padStart(2, '0')}
                          </span>
                          {isVisited ? (
                            <span className="text-emerald-400 text-xs font-bold">✓ Gidildi</span>
                          ) : (
                            <span className="text-slate-600 text-[10px]">Bekliyor</span>
                          )}
                        </div>

                        <div className="mt-2">
                          <div
                            className={`text-xs font-bold truncate ${
                              isVisited ? 'text-white' : 'text-slate-300'
                            }`}
                          >
                            {prov.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {prov.totalPlaces > 0 ? `${prov.totalPlaces} kayıtlı mekan` : 'Henüz yer yok'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Province Details Drawer / Modal if clicked */}
              {selectedProvinceModal && (
                <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-amber-500 text-slate-950 rounded">
                        Plaka {selectedProvinceModal.plate.toString().padStart(2, '0')}
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {selectedProvinceModal.name} — Kayıtlı Mekanlar
                      </h4>
                    </div>
                    <button
                      onClick={() => setSelectedProvinceModal(null)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {selectedProvinceModal.placesList.length === 0 ? (
                    <p className="text-xs text-slate-400">
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
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400/50 cursor-pointer flex items-center justify-between transition"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{pl.name}</div>
                            <div className="text-[11px] text-slate-400">{pl.city}</div>
                          </div>
                          {pl.visited ? (
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                              ✓ Gittim
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
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
              <div className="bg-gradient-to-br from-cyan-950/40 via-slate-950 to-slate-900 border border-cyan-500/30 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    <span>Gezilen Ülkeler & Küresel Atlas</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Atlasında yer alan {allCountries.length} ülkeden {visitedCountries.length} tanesini ziyaret ettin.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-serif text-cyan-400">
                    {visitedCountries.length} / {allCountries.length}
                  </div>
                  <div className="text-xs text-slate-400">Ülke Ayak İzi</div>
                </div>
              </div>

              {/* Visited Countries Badges */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  ✓ Ziyaret Edilen Ülkeler ({visitedCountries.length})
                </h4>
                {visitedCountries.length === 0 ? (
                  <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
                    Henüz bir ülkeyi ziyaret edilmiş olarak işaretlemedin.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {visitedCountries.map((c) => {
                      const countInCountry = places.filter((p) => p.country === c).length;
                      const visitedInCountry = places.filter((p) => p.country === c && p.visited).length;
                      return (
                        <div
                          key={c}
                          className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/30 flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-bold text-cyan-200">{c}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {visitedInCountry} / {countInCountry} yer
                            </div>
                          </div>
                          <span className="text-emerald-400 text-xs font-bold">✓</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* MTP Continents Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
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
                        className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-3 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200 truncate">{cont.label}</span>
                          <span className="font-bold text-cyan-400 shrink-0 ml-2">
                            {visCont}/{totalCont}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 transition-all duration-500"
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

          {/* TAB 4: VISITED PLACES LOG */}
          {activeTab === 'log' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  ✓ Gittiğim & Üstünü Çizdiğim Yerler ({visitedPlaces.length})
                </h3>
                <span className="text-xs text-emerald-400 font-semibold">
                  Toplam {visitedPlaces.length} Anı
                </span>
              </div>

              {visitedPlaces.length === 0 ? (
                <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
                  Henüz bir yeri "Gittim" olarak işaretlemedin. Haritadan veya listeden gittiğin yerlerin yanındaki ○ butonuna tıklayarak pasaportuna ilk damganı vurabilirsin!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {visitedPlaces.map((pl) => (
                    <div
                      key={pl.id}
                      onClick={() => {
                        onSelectPlace(pl);
                        onClose();
                      }}
                      className="bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-400 rounded-xl p-3 flex items-center justify-between cursor-pointer transition group"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200 truncate">
                          ✓ {pl.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{pl.city}, {pl.country}</div>
                      </div>
                      {pl.visitedDate && (
                        <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-300 shrink-0 ml-2">
                          {pl.visitedDate}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
