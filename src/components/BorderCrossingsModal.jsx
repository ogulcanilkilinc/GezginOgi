import React, { useState } from 'react';
import { X, ShieldAlert, Clock, ArrowRight, Car, Compass, ExternalLink, AlertTriangle, FileText } from 'lucide-react';
import { BORDER_CROSSINGS, VIGNETTE_GUIDE } from '../data/borderCrossingsData';

export default function BorderCrossingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('crossings'); // 'crossings' or 'vignettes'
  const [filterCountry, setFilterCountry] = useState('all');

  if (!isOpen) return null;

  const filteredCrossings = BORDER_CROSSINGS.filter((item) => {
    if (filterCountry === 'all') return true;
    return item.countries.includes(filterCountry);
  });

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner">
              🚗
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Balkan Sınır Kapıları Radarı & Karayolu Taktikleri</span>
              </h2>
              <p className="text-xs text-slate-400">
                Sınır kapısı bekleme süreleri, yoğunluk tahminleri, alternatif rotalar ve vinyet rehberi
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

        {/* Tab & Filter Bar */}
        <div className="bg-slate-950/80 px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('crossings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'crossings'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Sınır Kapıları ({BORDER_CROSSINGS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('vignettes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'vignettes'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Vinyet & Otoyol Ücretleri</span>
            </button>
          </div>

          {activeTab === 'crossings' && (
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-xs text-amber-300 font-bold focus:outline-none"
            >
              <option value="all">🌍 Tüm Sınırlar</option>
              <option value="Bosna-Hersek">🇧🇦 Bosna Sınırları</option>
              <option value="Karadağ">🇲🇪 Karadağ Sınırları</option>
              <option value="Sırbistan">🇷🇸 Sırbistan Sınırları</option>
              <option value="Arnavutluk">🇦🇱 Arnavutluk Sınırları</option>
              <option value="Kuzey Makedonya">🇲🇰 Makedonya Sınırları</option>
              <option value="Hırvatistan">🇭🇷 Hırvatistan (Schengen) Sınırları</option>
              <option value="Türkiye">🇹🇷 Türkiye / Bulgaristan</option>
            </select>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'crossings' ? (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Balkanlar Sınır Geçiş Altın Kuralı:</strong> Araç Yeşil Kartı (Green Card), ruhsat ve pasaportları torpido gözünde hazır tutun. Hırvatistan ve Yunanistan sınırları AB / Schengen kapısı olduğundan diğer Balkan içi sınırlara göre daha titiz ve yavaş kontrol yapılır.
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {filteredCrossings.map((cross) => (
                  <div
                    key={cross.id}
                    className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-3 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/70 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{cross.name}</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Güzergah: {cross.route}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-amber-300">
                          ⏱️ Bekleme: {cross.avgWaitMin}
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
                          {cross.busyRating}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <strong className="text-emerald-400 block mb-1">💡 Taktik & Önemli İpucu:</strong>
                        <p className="text-slate-300 leading-relaxed">{cross.tips}</p>
                      </div>
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <strong className="text-cyan-400 block mb-1">🔄 Kuyruk Varsa Alternatif Rota:</strong>
                        <p className="text-slate-300 leading-relaxed">{cross.alternative}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* VIGNETTES TAB */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {VIGNETTE_GUIDE.map((vig, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{vig.flag}</span>
                        <h3 className="text-sm font-bold text-white">{vig.country}</h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {vig.type}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400">Ücret / Tarife: </span>
                        <strong className="text-emerald-300">{vig.price}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Zorunluluk: </span>
                        <span className="text-slate-200">{vig.mandatory}</span>
                      </div>
                      <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[11px] text-amber-400 font-bold block mb-0.5">Nasıl Alınır?</span>
                        <span className="text-slate-300 text-[11px]">{vig.howToBuy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
