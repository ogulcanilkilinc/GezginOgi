import React, { useState, useMemo } from 'react';
import { X, Award, Globe, Trophy, Sparkles, CheckCircle2, MapPin } from 'lucide-react';

const COUNTRY_FLAGS = {
  'Türkiye': '🇹🇷',
  'İtalya': '🇮🇹',
  'Fransa': '🇫🇷',
  'İspanya': '🇪🇸',
  'Almanya': '🇩🇪',
  'Birleşik Krallık': '🇬🇧',
  'Yunanistan': '🇬🇷',
  'Portekiz': '🇵🇹',
  'Bosna-Hersek': '🇧🇦',
  'Karadağ': '🇲🇪',
  'Sırbistan': '🇷🇸',
  'Arnavutluk': '🇦🇱',
  'Kuzey Makedonya': '🇲🇰',
  'Hırvatistan': '🇭🇷',
  'Kosova': '🇽🇰',
  'Bulgaristan': '🇧🇬',
  'Slovenya': '🇸🇮',
  'Romanya': '🇷🇴',
  'Japonya': '🇯🇵',
  'ABD': '🇺🇸',
  'Kanada': '🇨🇦',
  'Meksika': '🇲🇽',
  'Peru': '🇵🇪',
  'Brezilya': '🇧🇷',
  'Arjantin': '🇦🇷',
  'Şili': '🇨🇱',
  'Kolombiya': '🇨🇴',
  'Avusturya': '🇦🇹',
  'İsviçre': '🇨🇭',
  'Hollanda': '🇳🇱',
  'Belçika': '🇧🇪',
  'Norveç': '🇳🇴',
  'İzlanda': '🇮🇸',
  'Çekya': '🇨🇿',
  'Macaristan': '🇭🇺',
};

const BALKAN_LIST = ['Bosna-Hersek', 'Karadağ', 'Sırbistan', 'Arnavutluk', 'Kuzey Makedonya', 'Hırvatistan', 'Kosova', 'Slovenya', 'Bulgaristan', 'Romanya', 'Yunanistan'];

export default function ScratchMapModal({ isOpen, onClose, places }) {
  const [filterView, setFilterView] = useState('all'); // 'all', 'visited', 'balkans'

  // Group by countries and calculate visited counts
  const countryStats = useMemo(() => {
    if (!places) return [];
    const map = new Map();

    places.forEach((p) => {
      const c = p.country || 'Diğer';
      if (!map.has(c)) {
        map.set(c, {
          name: c,
          flag: COUNTRY_FLAGS[c] || '🏳️',
          total: 0,
          visited: 0,
          isBalkan: BALKAN_LIST.includes(c)
        });
      }
      const item = map.get(c);
      item.total += 1;
      if (p.visited) item.visited += 1;
    });

    return Array.from(map.values()).sort((a, b) => {
      // Put countries with visited places first, then largest total
      if (b.visited !== a.visited) return b.visited - a.visited;
      return b.total - a.total;
    });
  }, [places]);

  if (!isOpen) return null;

  const totalCountries = countryStats.length;
  const visitedCountries = countryStats.filter((c) => c.visited > 0).length;
  const globalPercent = totalCountries > 0 ? Math.round((visitedCountries / totalCountries) * 100) : 0;

  const balkanCountries = countryStats.filter((c) => c.isBalkan);
  const visitedBalkans = balkanCountries.filter((c) => c.visited > 0).length;
  const balkanPercent = balkanCountries.length > 0 ? Math.round((visitedBalkans / balkanCountries.length) * 100) : 0;

  const filteredList = countryStats.filter((c) => {
    if (filterView === 'visited') return c.visited > 0;
    if (filterView === 'balkans') return c.isBalkan;
    return true;
  });

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner">
              🎨
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Dijital Kazı-Kazan Dünya & Fetih Atlası</span>
              </h2>
              <p className="text-xs text-slate-400">
                Gezdiğin ülkeler haritada altın rengine bürünür, fethettiğin coğrafyaları takip et
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

        {/* Conquest Scorecard Banner */}
        <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-lg shrink-0">
              🌍
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Dünya Geneli Fetih</span>
              <div className="text-base font-extrabold text-amber-300">
                {visitedCountries} / {totalCountries} Ülke ({globalPercent}%)
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-lg shrink-0">
              🌸
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Balkanlar Fetih Oranı</span>
              <div className="text-base font-extrabold text-emerald-400">
                {visitedBalkans} / {balkanCountries.length} Ülke ({balkanPercent}%)
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-lg shrink-0">
              🏆
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Gezgin Unvanı</span>
              <div className="text-xs font-bold text-violet-300">
                {visitedCountries === 0
                  ? 'Yolun Başında Kaşif'
                  : visitedCountries < 5
                  ? 'Bölgesel Seyyah'
                  : visitedCountries < 15
                  ? 'Kıdemli Gezgin'
                  : 'Dünya Fatihi & Evliya Çelebi'}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800/60 flex items-center gap-2">
          <button
            onClick={() => setFilterView('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
              filterView === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            Tüm Ülkeler ({countryStats.length})
          </button>
          <button
            onClick={() => setFilterView('visited')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
              filterView === 'visited'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <span>🏆 Ayak Bastıklarım ({visitedCountries})</span>
          </button>
          <button
            onClick={() => setFilterView('balkans')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
              filterView === 'balkans'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <span>🌸 Balkanlar ({balkanCountries.length})</span>
          </button>
        </div>

        {/* Content Body: Scratch Country Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredList.map((country) => {
              const isConquered = country.visited > 0;
              const percent = country.total > 0 ? Math.round((country.visited / country.total) * 100) : 0;

              return (
                <div
                  key={country.name}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 relative overflow-hidden ${
                    isConquered
                      ? 'bg-gradient-to-br from-amber-500/15 via-slate-900 to-amber-950/20 border-amber-500/50 shadow-lg shadow-amber-500/5'
                      : 'bg-slate-950/60 border-slate-800/80 opacity-75 hover:opacity-100'
                  }`}
                >
                  {isConquered && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> FETHEDİLDİ
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{country.flag}</span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{country.name}</h3>
                      <span className="text-[11px] text-slate-400">
                        {country.visited} / {country.total} Mekan Gezildi
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
                      <span>Keşif İlerlemesi:</span>
                      <span className={isConquered ? 'text-amber-400 font-bold' : ''}>%{percent}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isConquered ? 'bg-amber-400' : 'bg-slate-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
