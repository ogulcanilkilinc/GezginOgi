// src/data/metadata.js
// Ultra-lightweight metadata for filters, categories, and regions.
// Independent of the heavy place dataset for instant app bootstrapping.

export const CATEGORIES = [
  { id: 'all', label: 'Tümü', icon: '🌍', color: '#f59e0b', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'muze', label: 'Müze & Tarih', icon: '🏛️', color: '#8b5cf6', bg: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
  { id: 'doga', label: 'Doğa & Manzara', icon: '🌲', color: '#10b981', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'restoran', label: 'Restoran & Lezzet', icon: '🍽️', color: '#f97316', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  { id: 'bar', label: 'Bar, Kafe & Gece', icon: '🍸', color: '#ec4899', bg: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  { id: 'kultur', label: 'Sokak & Kültür', icon: '🧭', color: '#06b6d4', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  { id: 'gizli', label: 'Gizli Cevher', icon: '📸', color: '#eab308', bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
];

export const REGIONS = [
  { id: 'all', label: 'Tüm Dünya', flag: '🌐', center: [25.0, 20.0], zoom: 2, desc: 'Ankara, Türkiye (81 İl) ve Dünya (195 Ülke) genelindeki tüm keşif noktaları' },
  { id: 'ankara', label: 'Ankara', flag: '📍', center: [39.9208, 32.8541], zoom: 12, desc: 'Başkentin tarihi sokakları, müzeleri, bağ evleri ve lezzet durakları' },
  { id: 'turkiye', label: 'Türkiye (81 İl)', flag: '🇹🇷', center: [39.0, 35.0], zoom: 6, desc: 'Ege koylarından Kapadokya vadilerine, Doğu ekspresinden Karadeniz yaylalarına' },
  { id: 'dunya', label: 'Dünya & MTP', flag: '✈️', center: [30.0, 15.0], zoom: 3, desc: 'Balkan rotaları, Avrupa metropolleri, Asya tapınakları ve MTP coğrafyaları' },
];

export const SEASONS = [
  { id: 'all', label: 'Tüm Mevsimler', icon: '🗓️' },
  { id: 'ilkbahar', label: 'İlkbahar', icon: '🌸' },
  { id: 'yaz', label: 'Yaz', icon: '☀️' },
  { id: 'sonbahar', label: 'Sonbahar', icon: '🍂' },
  { id: 'kis', label: 'Kış', icon: '❄️' },
];

export const DURATIONS = [
  { id: 'all', label: 'Her Süre' },
  { id: 'kisa', label: '1-2 Saat (Hızlı Keşif)' },
  { id: 'yarim', label: 'Yarım Gün (3-5 Saat)' },
  { id: 'tam', label: 'Tam Gün (6+ Saat)' },
  { id: 'haftasonu', label: 'Hafta Sonu Rotası' },
];
