import React, { useState, useEffect } from 'react';
import { CATEGORIES, REGIONS, SEASONS } from '../data/metadata';
import { X, Crosshair, Sparkles, Save, MapPin } from 'lucide-react';

const DEFAULT_FORM = {
  name: '',
  region: 'ankara',
  city: 'Ankara',
  category: 'muze',
  lat: 39.9208,
  lng: 32.8541,
  duration: '2 - 3 Saat',
  durationCategory: 'yarim',
  seasons: ['ilkbahar', 'sonbahar'],
  bestTimeText: 'İlkbahar ve sonbahar aylarında sabah veya gün batımı saatleri idealdir.',
  whatAwaits: '',
  highlightsText: '',
  howToVisit: '',
  localSpecialties: '',
  blogArticle: '',
  coverImage: '',
  visited: false,
  favorite: true,
  userNotes: '',
  budget: 'Orta (₺₺)'
};

export default function PlaceFormModal({
  isOpen,
  onClose,
  onSave,
  editingPlace,
  pickedCoords,
  onStartPickOnMap
}) {
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (editingPlace) {
      setForm({
        ...DEFAULT_FORM,
        ...editingPlace,
        lat: editingPlace.coords?.[0] ?? 39.9208,
        lng: editingPlace.coords?.[1] ?? 32.8541,
        highlightsText: (editingPlace.highlights || []).join('\n')
      });
    } else {
      setForm({
        ...DEFAULT_FORM,
        lat: pickedCoords?.[0] ?? 39.9208,
        lng: pickedCoords?.[1] ?? 32.8541
      });
    }
  }, [editingPlace, isOpen]);

  useEffect(() => {
    if (pickedCoords && pickedCoords.length === 2) {
      setForm((prev) => ({
        ...prev,
        lat: pickedCoords[0],
        lng: pickedCoords[1]
      }));
    }
  }, [pickedCoords]);

  if (!isOpen) return null;

  const toggleSeason = (seasonId) => {
    setForm((prev) => {
      const exists = prev.seasons.includes(seasonId);
      const updated = exists
        ? prev.seasons.filter((s) => s !== seasonId)
        : [...prev.seasons, seasonId];
      return { ...prev, seasons: updated.length ? updated : ['ilkbahar'] };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const highlights = form.highlightsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      id: editingPlace?.id || `custom-${Date.now()}`,
      name: form.name.trim(),
      region: form.region,
      city: form.city.trim() || 'Ankara',
      category: form.category,
      coords: [Number(form.lat), Number(form.lng)],
      duration: form.duration || '2 - 3 Saat',
      durationCategory: form.durationCategory || 'yarim',
      seasons: form.seasons,
      bestTimeText: form.bestTimeText,
      whatAwaits:
        form.whatAwaits ||
        'Bu keşif noktasında harika bir atmosfer, özgün detaylar ve unutulmaz bir deneyim seni bekliyor.',
      highlights,
      howToVisit:
        form.howToVisit ||
        'Şehir merkezinden toplu taşıma veya özel araçla kolayca ulaşılabilir. Rahat bir yürüyüş ayakkabısı tercih et.',
      localSpecialties:
        form.localSpecialties ||
        'Çevredeki yerel lezzet duraklarını ve kahvecileri mutlaka dene.',
      blogArticle: form.blogArticle,
      coverImage: form.coverImage || '',
      visited: form.visited,
      visitedDate: form.visited ? editingPlace?.visitedDate || new Date().toISOString().slice(0, 10) : '',
      favorite: form.favorite,
      userNotes: form.userNotes,
      userRating: editingPlace?.userRating || 5,
      budget: form.budget
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {editingPlace ? 'Mekan Rehberini & Blog Yazısını Düzenle' : 'Haritama Yeni Keşif Noktası Ekle'}
              </h3>
              <p className="text-xs text-slate-400">
                Ankara, Türkiye veya Dünya üzerindeki yeni durağını tüm detaylarıyla kaydet
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mekan / Yer Adı *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Örn: Atatürk Orman Çiftliği, Amasra, Hallstatt..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bölge Kapsamı</label>
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              >
                {REGIONS.filter((r) => r.id !== 'all').map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.flag} {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                İlçe / Şehir / Ülke
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Örn: Çankaya, Ankara veya Floransa, İtalya"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              >
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ne Kadar Sürede Gezilir?
              </label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="Örn: 2 - 3 Saat, Yarım Gün, Hafta Sonu (2 Gün)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Coordinates & Pick from Map */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>Harita Koordinatları (Enlem & Boylam)</span>
              </span>
              <button
                type="button"
                onClick={onStartPickOnMap}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Haritadan Tıklayarak Nokta Seç</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Enlem (Latitude)</label>
                <input
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Boylam (Longitude)</label>
                <input
                  type="number"
                  step="any"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Seasons & Best Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Hangi Mevsimlerde Gidilir?
              </label>
              <div className="flex flex-wrap gap-2">
                {SEASONS.map((s) => {
                  const active = form.seasons.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSeason(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                        active
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s.icon} {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tahmini Bütçe Seviyesi
              </label>
              <select
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Ücretsiz">Ücretsiz</option>
                <option value="Ekonomik (₺)">Ekonomik (₺)</option>
                <option value="Orta (₺₺)">Orta (₺₺)</option>
                <option value="Premium (₺₺₺)">Premium (₺₺₺)</option>
              </select>
            </div>
          </div>

          {/* Guide Sections */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1">
                ✨ İçeride Seni Neler Bekliyor? (Atmosfer, deneyim, genel bakış)
              </label>
              <textarea
                rows={2}
                value={form.whatAwaits}
                onChange={(e) => setForm({ ...form, whatAwaits: e.target.value })}
                placeholder="İçeri adım attığında nasıl bir ortam var? Neden görülmeli?"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ✦ İçeride Kaçırılmaması Gerekenler (Her satıra bir madde yazabilirsin)
              </label>
              <textarea
                rows={3}
                value={form.highlightsText}
                onChange={(e) => setForm({ ...form, highlightsText: e.target.value })}
                placeholder={`Örn:\nGün batımı seyir terası\n2. kattaki mozaik salonu\nBahçedeki tarihi çınar ağacı`}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-cyan-300 mb-1">
                  🧭 Nasıl Gezilir & Ulaşım İpuçları
                </label>
                <textarea
                  rows={3}
                  value={form.howToVisit}
                  onChange={(e) => setForm({ ...form, howToVisit: e.target.value })}
                  placeholder="Nasıl gidilir? Müzekart geçerli mi? Hangi kapıdan girilmeli?"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-orange-300 mb-1">
                  🍽️ Yöresel Ne Yenir & Yakın Çevre
                </label>
                <textarea
                  rows={3}
                  value={form.localSpecialties}
                  onChange={(e) => setForm({ ...form, localSpecialties: e.target.value })}
                  placeholder="Buraya gidince ne tadılmalı? Çıkışta yakınında nereye uğranır?"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1">
                📖 Mini-Blog / Gezi Rehberi Yazısı
              </label>
              <textarea
                rows={3}
                value={form.blogArticle}
                onChange={(e) => setForm({ ...form, blogArticle: e.target.value })}
                placeholder="Bu mekanla ilgili kendi blog yazını, hikayesini veya uzun gezi notlarını buraya yazabilirsin..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kapak Fotoğrafı URL (İsteğe Bağlı)
                </label>
                <input
                  type="url"
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  placeholder="https://... (boş bırakılabilir)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-4 pt-5">
                <label className="flex items-center gap-2 text-xs font-semibold text-emerald-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.visited}
                    onChange={(e) => setForm({ ...form, visited: e.target.checked })}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>✓ Buraya Gittim (Üstünü Çiz)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-amber-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.favorite}
                    onChange={(e) => setForm({ ...form, favorite: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>★ Öncelikli Listemde</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-lg transition"
            >
              <Save className="w-4 h-4" />
              <span>{editingPlace ? 'Değişiklikleri Kaydet' : 'Haritama Ekle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
