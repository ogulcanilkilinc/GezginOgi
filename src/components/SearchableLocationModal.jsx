import React, { useState, useMemo } from 'react';
import { Search, X, MapPin, ChevronRight, Check } from 'lucide-react';

const COUNTRY_FLAGS = {
  'Türkiye': '🇹🇷',
  'İtalya': '🇮🇹',
  'Fransa': '🇫🇷',
  'İspanya': '🇪🇸',
  'Almanya': '🇩🇪',
  'Birleşik Krallık': '🇬🇧',
  'İngiltere': '🇬🇧',
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
  'Çin': '🇨🇳',
  'Mısır': '🇪🇬',
  'Rusya': '🇷🇺',
  'İsviçre': '🇨🇭',
  'Avusturya': '🇦🇹',
  'Hollanda': '🇳🇱',
  'Belçika': '🇧🇪',
  'Norveç': '🇳🇴',
  'İsveç': '🇸🇪',
  'Danimarka': '🇩🇰',
  'Finlandiya': '🇫🇮',
  'İzlanda': '🇮🇸',
  'Güney Kore': '🇰🇷',
  'Tayland': '🇹🇭',
  'Hindistan': '🇮🇳',
  'Vietnam': '🇻🇳',
  'Özbekistan': '🇺🇿',
  'Azerbaycan': '🇦🇿',
  'Gürcistan': '🇬🇪',
  'Fas': '🇲🇦',
  'Ürdün': '🇯🇴',
  'BAE': '🇦🇪',
  'İran': '🇮🇷',
  'Güney Afrika': '🇿🇦',
  'Meksika': '🇲🇽',
  'Peru': '🇵🇪',
  'Brezilya': '🇧🇷',
  'Arjantin': '🇦🇷',
  'Kanada': '🇨🇦',
  'Avustralya': '🇦🇺',
  'Yeni Zelanda': '🇳🇿',
};

export default function SearchableLocationModal({
  isOpen,
  onClose,
  places,
  activeCountry,
  activeCity,
  onSelectLocation
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Group places by Country -> Cities
  const countryGroups = useMemo(() => {
    const map = new Map();

    places.forEach((p) => {
      const country = p.country || 'Diğer';
      const city = p.city || 'Genel';

      if (!map.has(country)) {
        map.set(country, {
          name: country,
          flag: COUNTRY_FLAGS[country] || '🏳️',
          totalCount: 0,
          cities: new Map()
        });
      }

      const countryObj = map.get(country);
      countryObj.totalCount += 1;
      countryObj.cities.set(city, (countryObj.cities.get(city) || 0) + 1);
    });

    // Convert to sorted array
    const sorted = Array.from(map.values()).map((c) => ({
      ...c,
      citiesList: Array.from(c.cities.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    }));

    // Put Türkiye, then largest countries first
    return sorted.sort((a, b) => {
      if (a.name === 'Türkiye') return -1;
      if (b.name === 'Türkiye') return 1;
      return b.totalCount - a.totalCount;
    });
  }, [places]);

  // Filter based on search query
  const filteredGroups = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return countryGroups;

    return countryGroups
      .map((country) => {
        const countryMatches = country.name.toLowerCase().includes(q);
        const matchingCities = country.citiesList.filter((city) =>
          city.name.toLowerCase().includes(q)
        );

        if (countryMatches) {
          return country; // show country with all its cities
        }

        if (matchingCities.length > 0) {
          return {
            ...country,
            citiesList: matchingCities
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [countryGroups, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold text-lg shadow-2xs">
              🌍
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900">
                Ülke ve Şehir Rehberi
              </h3>
              <p className="text-xs text-slate-500">
                Aramak istediğin ülkeyi veya şehri seç, harita o bölgeye odaklansın
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Reset */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ülke veya şehir ara... (örn: İtalya, Mostar, İzmir, Tokyo, Paris)"
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              onSelectLocation('all', 'all');
              onClose();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeCountry === 'all' && activeCity === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Tüm Dünyayı Göster
          </button>
        </div>

        {/* Countries & Cities Accordion List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm font-semibold">"{searchTerm}" ile eşleşen ülke veya şehir bulunamadı.</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-xs text-amber-600 underline font-semibold"
              >
                Aramayı temizle
              </button>
            </div>
          ) : (
            filteredGroups.map((country) => {
              const isCountrySelected = activeCountry === country.name && activeCity === 'all';

              return (
                <div
                  key={country.name}
                  className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 space-y-2.5 hover:border-slate-300 transition"
                >
                  {/* Country Header Row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        onSelectLocation(country.name, 'all');
                        onClose();
                      }}
                      className="flex items-center gap-2 text-left group"
                    >
                      <span className="text-xl">{country.flag}</span>
                      <span className="font-bold text-sm text-slate-800 group-hover:text-amber-700 transition">
                        {country.name}
                      </span>
                      <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full font-medium">
                        {country.totalCount} Mekan
                      </span>
                      {isCountrySelected && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          <Check className="w-3 h-3" /> Seçili Ülke
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        onSelectLocation(country.name, 'all');
                        onClose();
                      }}
                      className="text-[11px] font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 bg-white hover:bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 transition shadow-2xs"
                    >
                      <span>Tüm {country.name} ({country.totalCount})</span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                  </div>

                  {/* Sub-Cities Pills */}
                  <div className="pl-7 flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">
                      Şehirler:
                    </span>
                    {country.citiesList.map((city) => {
                      const isCitySelected =
                        activeCountry === country.name && activeCity === city.name;

                      return (
                        <button
                          key={city.name}
                          onClick={() => {
                            onSelectLocation(country.name, city.name);
                            onClose();
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs transition flex items-center gap-1 ${
                            isCitySelected
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                              : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200/90'
                          }`}
                        >
                          <MapPin className="w-3 h-3 opacity-60 text-amber-600" />
                          <span>{city.name}</span>
                          <span className="text-[10px] opacity-70">({city.count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Toplam {filteredGroups.length} Ülke listeleniyor</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
