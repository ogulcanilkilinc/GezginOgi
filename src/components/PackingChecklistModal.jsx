import React, { useState, useEffect } from 'react';
import { useDocSync } from '../services/useDocSync';
import { X, CheckSquare, Square, Plus, Trash2, RotateCcw, Briefcase, Sparkles, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'kesif_atlasim_bavul_checklist_v1';

const DEFAULT_PACKING_CATEGORIES = [
  {
    id: 'belgeler',
    title: '📄 Belgeler & Bürokrasiler',
    color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-300',
    items: [
      { id: 'b1', text: 'Pasaport (En az 6 ay geçerlilik süresi kontrolü)', done: false },
      { id: 'b2', text: 'Araç Yeşil Sigortası (Green Card - Karayolu için)', done: false },
      { id: 'b3', text: 'Seyahat Sağlık Sigortası poliçesi (İngilizce çıktı)', done: false },
      { id: 'b4', text: 'Yeni tip Çipli Ehliyet (Tüm Balkanlar’da geçerlidir)', done: false },
      { id: 'b5', text: 'Otel & Konaklama rezervasyon belgeleri (Sınır polisi sorabilir)', done: false },
      { id: 'b6', text: 'Pasaport ve kimliklerin telefonda fotoğrafı / fotokopisi', done: false },
    ]
  },
  {
    id: 'finans',
    title: '💶 Para, Finans & Kartlar',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300',
    items: [
      { id: 'f1', text: 'Nakit Euro (Sınır kapıları, otoyol gişeleri ve küçük kafeler için şart)', done: false },
      { id: 'f2', text: 'Banka / Kredi kartlarını yurt dışı harcamaya açtırmak', done: false },
      { id: 'f3', text: 'Mobil bankacılık SMS onayının yurt dışında çalıştığını teyit etmek', done: false },
      { id: 'f4', text: 'Acil durum için ayrı bir cebe konulacak yedek 50-100 Euro', done: false },
    ]
  },
  {
    id: 'elektronik',
    title: '🔌 Elektronik, Şebeke & Navigasyon',
    color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-300',
    items: [
      { id: 'e1', text: 'e-SIM veya Balkanlar Roaming internet paketi ayarı', done: false },
      { id: 'e2', text: 'Google Maps / Haritalar’da Balkanlar bölgesini çevrimdışı indirmek', done: false },
      { id: 'e3', text: 'Powerbank (En az 10.000 mAh taşınabilir şarj aleti)', done: false },
      { id: 'e4', text: 'Araç içi telefon tutacağı ve hızlı araç şarj başlığı', done: false },
      { id: 'e5', text: 'Yedek şarj kablosu ve kulaklık', done: false },
    ]
  },
  {
    id: 'kiyafet',
    title: '🧥 Kıyafet & Ayakkabı (Nisan & Bahar Rotaları)',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300',
    items: [
      { id: 'k1', text: 'Su geçirmez yağmurluk / rüzgarlık (Şelaleler ve kanyonlar için şart)', done: false },
      { id: 'k2', text: 'Kaymaz tabanlı rahat yürüyüş ayakkabısı (Arnavut kaldırımları ve patikalar)', done: false },
      { id: 'k3', text: 'Kat kat giyilebilecek polar / fermuarlı hırka', done: false },
      { id: 'k4', text: 'Yedek çorap ve hafif termal içlik (Akşam serinlikleri için)', done: false },
      { id: 'k5', text: 'Güneş gözlüğü & kompakt seyahat şemsiyesi', done: false },
    ]
  },
  {
    id: 'saglik',
    title: '💊 Sağlık, İlaç & Kişisel Bakım',
    color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-300',
    items: [
      { id: 's1', text: 'Ağrı kesici, ateş düşürücü ve kas gevşetici', done: false },
      { id: 's2', text: 'Mide, sindirim ve bulantı ilacı (Yol virajları ve zengin et yemekleri)', done: false },
      { id: 's3', text: 'Yara bandı & topuk vurma önleyici sünger bantlar', done: false },
      { id: 's4', text: 'Islak mendil, dezenfektan ve seyahat boy güneş kremi', done: false },
      { id: 's5', text: 'Kişisel reçeteli düzenli ilaçlar ve orijinal kutuları', done: false },
    ]
  },
  {
    id: 'arac',
    title: '🚗 Araç & Karayolu Özel (Gerekiyorsa)',
    color: 'from-cyan-500/20 to-sky-500/10 border-cyan-500/30 text-cyan-300',
    items: [
      { id: 'a1', text: 'Fosforlu reflektör yelek (Bagajda değil, kabin içinde olmalı!)', done: false },
      { id: 'a2', text: 'Trafik ilk yardım seti, yangın tüpü ve üçgen reflektör', done: false },
      { id: 'a3', text: 'Bulgaristan / Slovenya vinyet (e-vignette) online satın alımı', done: false },
      { id: 'a4', text: 'Lastik havaları, silecek suyu ve motor yağı kontrolü', done: false },
    ]
  }
];

export default function PackingChecklistModal({ isOpen, onClose }) {
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return DEFAULT_PACKING_CATEGORIES;
  });

  const [newItemText, setNewItemText] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(DEFAULT_PACKING_CATEGORIES[0].id);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch (_) {}
  }, [categories]);

  // The packing list follows the user across devices
  useDocSync({
    id: 'packing',
    value: categories,
    setValue: (d) => {
      if (Array.isArray(d) && d.length > 0) setCategories(d);
    },
    isEmpty: () => false
  });

  if (!isOpen) return null;

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const doneItems = categories.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.done).length,
    0
  );
  const progressPercent = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const handleToggle = (catId, itemId) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          items: cat.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i))
        };
      })
    );
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== selectedCatId) return cat;
        return {
          ...cat,
          items: [...cat.items, { id: `custom-${Date.now()}`, text: newItemText.trim(), done: false }]
        };
      })
    );
    setNewItemText('');
  };

  const handleDeleteItem = (catId, itemId) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          items: cat.items.filter((i) => i.id !== itemId)
        };
      })
    );
  };

  const handleResetDefault = () => {
    if (window.confirm('Bavul listesini varsayılan önerilen hazırlık maddelerine sıfırlamak istiyor musun?')) {
      setCategories(DEFAULT_PACKING_CATEGORIES);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner">
              🎒
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Akıllı Bavul & Seyahat Öncesi Kontrol Listesi</span>
              </h2>
              <p className="text-xs text-slate-400">
                Nisan Balkanlar turu ve küresel seyahatlerin için eksiksiz hazırlık rehberi
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

        {/* Progress Bar Banner */}
        <div className="bg-slate-950/80 px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-200">
              Hazırlık Durumu:{' '}
              <span className={progressPercent === 100 ? 'text-emerald-400' : 'text-amber-400'}>
                %{progressPercent}
              </span>
            </span>
            <span className="text-[11px] text-slate-400">
              ({doneItems}/{totalItems} Madde Tamamlandı)
            </span>
            {progressPercent === 100 && (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Yola Çıkmaya Hazırsın!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefault}
              className="text-[11px] text-slate-400 hover:text-rose-300 flex items-center gap-1 transition"
              title="Varsayılan listeye dön"
            >
              <RotateCcw className="w-3 h-3" /> Sıfırla
            </button>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Categories Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const catTotal = cat.items.length;
              const catDone = cat.items.filter((i) => i.done).length;

              return (
                <div
                  key={cat.id}
                  className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                      <h3 className="text-xs font-bold text-slate-200">{cat.title}</h3>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {catDone}/{catTotal}
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-1.5">
                      {cat.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggle(cat.id, item.id)}
                          className={`group flex items-start gap-2.5 p-2 rounded-xl cursor-pointer text-xs transition select-none ${
                            item.done
                              ? 'bg-slate-900/40 text-slate-500 line-through'
                              : 'bg-slate-900/90 text-slate-200 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <button
                            type="button"
                            className="mt-0.5 text-slate-400 group-hover:text-amber-400 transition shrink-0"
                          >
                            {item.done ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                          <span className="flex-1 leading-snug">{item.text}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(cat.id, item.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition p-0.5"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Custom Item Footer */}
        <form
          onSubmit={handleAddItem}
          className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center gap-2"
        >
          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Kendi özel eşyanı / hazırlık maddeni ekle (ör: Fotoğraf makinesi yedek pili)..."
            className="flex-1 min-w-[200px] bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Madde Ekle</span>
          </button>
        </form>
      </div>
    </div>
  );
}
