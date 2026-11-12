import React, { useState } from 'react';
import { coverOf } from '../data/curatedPhotoResolver';
import {
  X,
  Calendar,
  Sparkles,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sun,
  CloudSun,
  Flame,
  Snowflake,
  Compass,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const MONTH_DATA = [
  {
    monthIndex: 0,
    monthNumber: 1,
    name: 'Ocak',
    season: 'kis',
    seasonLabel: 'Kış Masalı',
    theme: 'Karlı Zirveler, Termal Kaçamaklar & Kış Sakinliği',
    summary:
      'Yılın en huzurlu dönemi. Kalabalıklardan uzak müzeleri gezmek, karlar altındaki Kapadokya peribacalarını izlemek ve kaplıcalarda dinlenmek için mükemmel zaman.',
    highlights: ['Kapadokya Karlar Altında', 'Kızılcahamam & Afyon Termalleri', 'Viyana & Prag Kış Ruhu', 'Uludağ & Erciyes'],
    recommendedKeywords: ['kapadokya', 'kızılcahamam', 'viyana', 'prag', 'erciyes', 'kars', 'ani', 'bolu', 'abant']
  },
  {
    monthIndex: 1,
    monthNumber: 2,
    name: 'Şubat',
    season: 'kis',
    seasonLabel: 'Kış Romantizmi',
    theme: 'Donmuş Göller, Butik Oteller & Kış Doğa Fotoğrafçılığı',
    summary:
      'Göl kıyılarında kar manzaraları, şömine başında butik kaçamaklar ve Avrupa’nın tarihi meydanlarının sakin kış hali.',
    highlights: ['Çubuk Karagöl Kış Manzaraları', 'Abant & Yedigöller', 'Venedik Karnavalı Ruhu', 'Zermatt & Alp Dağları'],
    recommendedKeywords: ['abant', 'çubuk karagöl', 'zermatt', 'venedik', 'safranbolu', 'ılgaz', 'beypazarı']
  },
  {
    monthIndex: 2,
    monthNumber: 3,
    name: 'Mart',
    season: 'ilkbahar',
    seasonLabel: 'İlkbahar Uyanışı',
    theme: 'Akdeniz Ilıklığı & Antik Kentlerde Bahar Yürüyüşleri',
    summary:
      'Doğanın uyanmaya başladığı, Ege ve Akdeniz antik kentlerinin aşırı sıcaktan uzak en yürünebilir olduğu dönem.',
    highlights: ['Efes & Şirince', 'Perge & Aspendos', 'Roma Forumu & Kolezyum', 'İzmir Kordon & Urla'],
    recommendedKeywords: ['efes', 'şirince', 'perge', 'aspendos', 'roma', 'urla', 'side', 'hierapolis', 'pamukkale']
  },
  {
    monthIndex: 3,
    monthNumber: 4,
    name: 'Nisan',
    season: 'ilkbahar',
    seasonLabel: 'Lale & Nehir Zamanı',
    theme: 'Balkanların Coşkulu Şelaleleri & Lale Festivalleri',
    summary:
      'Karların erimesiyle nehirlerin ve şelalelerin en gür aktığı ay! Balkanlar (Kravice, Mostar, Ohri) ve çiçek açan İstanbul parkları bu ayda büyüleyicidir.',
    highlights: ['Kravice & Mostar Şelaleleri', 'Ohrid Gölü & Aziz Yuhanna', 'Gülhane & Emirgan Lale Günleri', 'Kapadokya Balon Uçuşları'],
    recommendedKeywords: ['kravice', 'mostar', 'blagaj', 'ohri', 'saraybosna', 'kotor', 'lale', 'gülhane', 'kapadokya']
  },
  {
    monthIndex: 4,
    monthNumber: 5,
    name: 'Mayıs',
    season: 'ilkbahar',
    seasonLabel: 'Bahar Zirvesi',
    theme: 'Toskana Tepeleri, Likya Yolu & Karadeniz Yayla Girişleri',
    summary:
      'Havanın ne soğuk ne sıcak olduğu seyahat cenneti. Toskana’nın yeşil vadileri, Akdeniz kıyı patikaları ve bahar çiçekleriyle kaplı göl kıyıları.',
    highlights: ['Likya Yolu Başlangıç Rotaları', 'Toskana Val d’Orcia', 'Eğirdir & Beyşehir Gölleri', 'Amasra & Karadeniz Kıyısı'],
    recommendedKeywords: ['likya', 'toskana', 'amasra', 'eğirdir', 'fethiye', 'kaş', 'göcek', 'prag', 'budapeşte']
  },
  {
    monthIndex: 5,
    monthNumber: 6,
    name: 'Haziran',
    season: 'yaz',
    seasonLabel: 'Erken Yaz & Masmavi Koylar',
    theme: 'Lavanta Bahçeleri, Ege Koyları & Akdeniz Akşamları',
    summary:
      'Güneşin tadını deniz kenarında çıkarma vakti! Kuyucak lavanta tarlaları mor renge bürünür, Ege koyları berraktır.',
    highlights: ['Isparta Kuyucak Lavanta Köyü', 'Kaş & Kekova Batık Şehir', 'Bodrum & Datça Bükleri', 'Santorini & Kikladlar'],
    recommendedKeywords: ['lavanta', 'kuyucak', 'kaş', 'kekova', 'datça', 'bodrum', 'cunda', 'ayvalık', 'santorini']
  },
  {
    monthIndex: 6,
    monthNumber: 7,
    name: 'Temmuz',
    season: 'yaz',
    seasonLabel: 'Yüksek Yaz & Serin Rotalar',
    theme: 'Karadeniz Yaylaları, Norveç Fiyortları & Yüksek Göller',
    summary:
      'Sıcaklardan kaçıp serinlemek isteyen gezginlerin zamanı: Rize-Artvin bulut denizi yaylaları, Kuzey Avrupa ve Alpler.',
    highlights: ['Pokut & Sal Yaylası (Rize)', 'Uzungöl & Ayder', 'Geirangerfjord Norveç', 'İsviçre Alpleri & Göller'],
    recommendedKeywords: ['pokut', 'ayder', 'rize', 'artvin', 'borçka', 'karagöl', 'fiyort', 'norveç', 'alpler', 'isviçre']
  },
  {
    monthIndex: 7,
    monthNumber: 8,
    name: 'Ağustos',
    season: 'yaz',
    seasonLabel: 'Yaz Doruğu & Gece Gökyüzü',
    theme: 'Perseid Meteor Yağmurları, Yayla Kampları & Kuzey Başkentleri',
    summary:
      'Işık kirliliğinden uzak yaylalarda yıldız gözlemleri, kanyon yürüyüşleri ve serin kuzey şehirleri (Stockholm, Kopenhag).',
    highlights: ['Karanlık Gökyüzü Parkları & Perseid', 'Kanyon Geçişleri (Saklıkent, Horma)', 'Kopenhag & Stockholm', 'Gökçeada & Bozcaada'],
    recommendedKeywords: ['horma', 'saklıkent', 'bozcaada', 'gökçeada', 'kopenhag', 'stockholm', 'edinburgh', 'karadeniz']
  },
  {
    monthIndex: 8,
    monthNumber: 9,
    name: 'Eylül',
    season: 'sonbahar',
    seasonLabel: 'Altın Sarı Eylül',
    theme: 'Bağ Bozumu, Ilık Denizler & Huzurlu Sahiller',
    summary:
      'Gezginlerin favori ayı! Deniz suyu sıcacıktır ama yaz kalabalığı çekilmiştir. Bozcaada, Kapadokya ve Toskana’da bağ bozumu zamanı.',
    highlights: ['Bozcaada Bağ Bozumu', 'Datça Palamutbükü Sakinliği', 'Kapadokya Vadi Yürüyüşleri', 'Kotor Körfezi & Dubrovnik'],
    recommendedKeywords: ['bozcaada', 'datça', 'kapadokya', 'kotor', 'dubrovnik', 'şirince', 'amalfi', 'toskana']
  },
  {
    monthIndex: 9,
    monthNumber: 10,
    name: 'Ekim',
    season: 'sonbahar',
    seasonLabel: 'Renk Şöleni',
    theme: 'Yedigöller Renk Cümbüşü & Likya Yürüyüş Sezonu',
    summary:
      'Sonbaharın tüm tonları bir arada. Ağaçlar sarı, kızıl ve kehribar rengine bürünür. Yürüyüş ve açık hava fotoğrafçılığı için yılın en asil ayı.',
    highlights: ['Yedigöller & Bolu Ormanları', 'Kapadokya Güvercinlik Vadisi', 'Likya Yolu Gelidonya Feneri', 'Floransa & Roma Müzeleri'],
    recommendedKeywords: ['yedigöller', 'bolu', 'kapadokya', 'likya', 'gelidonya', 'roma', 'floransa', 'soğanlı']
  },
  {
    monthIndex: 10,
    monthNumber: 11,
    name: 'Kasım',
    season: 'sonbahar',
    seasonLabel: 'Hüzün & Sanat Ayı',
    theme: 'Dökülen Yapraklar, Müze Gezileri & Sıcak Kahveler',
    summary:
      'Müzelerde uzun saatler geçirmek, tarihi hanlarda çay molası vermek ve termal sularda gevşemek için ideal kasım günleri.',
    highlights: ['Anadolu Medeniyetleri Müzesi', 'Hamamönü & Ankara Kalesi Sanat Atölyeleri', 'Kızılcahamam Soğuksu Tabiat Parkı', 'Paris Louvre & Orsay'],
    recommendedKeywords: ['anadolu medeniyetleri', 'hamamönü', 'kale', 'soğuksu', 'kızılcahamam', 'louvre', 'paris', 'müze']
  },
  {
    monthIndex: 11,
    monthNumber: 12,
    name: 'Aralık',
    season: 'kis',
    seasonLabel: 'Işıltılı Aralık',
    theme: 'Yılbaşı Pazarları, Işıklar & Karlı Tarihi Şehirler',
    summary:
      'Tarihi meydanların peri masalına dönüştüğü ay. Yılbaşı pazarları, tarçın kokulu sıcak içecekler ve karlar altında yükselen kaleler.',
    highlights: ['Prag Eski Şehir Meydanı', 'Alsas & Kolmar Işıkları', 'Kars Kalesi & Çıldır Gölü', 'Anıtkabir & Başkent Işıkları'],
    recommendedKeywords: ['prag', 'alsas', 'kolmar', 'kars', 'çıldır', 'anıtkabir', 'viyana', 'budapeşte']
  }
];

export default function SeasonalCalendarModal({
  isOpen,
  onClose,
  places,
  onSelectPlace,
  onApplySeasonalFilter
}) {
  const currentMonthIdx = new Date().getMonth();
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(currentMonthIdx);

  if (!isOpen) return null;

  const currentMonth = MONTH_DATA[selectedMonthIdx];

  // Match atlas places for this month
  const matchingPlaces = places.filter((p) => {
    // Check if season matches
    const seasonMatch = (p.seasons || []).includes(currentMonth.season);
    // Check if place name, city or highlights matches any keywords
    const textBlob = `${p.name} ${p.city} ${p.subRegion || ''} ${p.whatAwaits || ''}`.toLowerCase();
    const keywordMatch = currentMonth.recommendedKeywords.some((kw) => textBlob.includes(kw));

    return keywordMatch || (seasonMatch && (p.favorite || p.category === 'doga' || p.category === 'kultur'));
  }).slice(0, 18);

  const handlePrevMonth = () => {
    setSelectedMonthIdx((prev) => (prev === 0 ? 11 : prev - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonthIdx((prev) => (prev === 11 ? 0 : prev + 1));
  };

  const handleFilterOnMap = () => {
    if (onApplySeasonalFilter) {
      onApplySeasonalFilter(currentMonth.season, currentMonth.recommendedKeywords);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-amber-950/25 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-white">
                  Bu Ay Nereye Gitsem? — 12 Ay Mevsim Rehberi
                </h2>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  Mevsimsel Rota Motoru
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Yılın her ayına özel en ideal hava durumu, doğa olayları ve seyahat önerileri
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

        {/* Month Selector Pills Strip */}
        <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {MONTH_DATA.map((m, idx) => {
            const isSelected = idx === selectedMonthIdx;
            const isCurrentRealMonth = idx === currentMonthIdx;
            return (
              <button
                key={m.name}
                onClick={() => setSelectedMonthIdx(idx)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <span>{m.name}</span>
                {isCurrentRealMonth && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-extrabold ${
                      isSelected ? 'bg-slate-950 text-amber-300' : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    ŞİMDİ
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Active Month Showcase Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950/40 via-slate-900 to-cyan-950/40 border border-amber-500/30 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title="Önceki Ay"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-bold block">
                    {currentMonth.seasonLabel} • {currentMonth.monthNumber}. Ay
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                    {currentMonth.name} Ayı Seyahat Önerileri
                  </h3>
                </div>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title="Sonraki Ay"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleFilterOnMap}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95 shrink-0"
              >
                <Compass className="w-4 h-4" />
                <span>Bu Ayın Rotalarını Haritada Filtrele</span>
              </button>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed max-w-3xl">
              {currentMonth.summary}
            </p>

            {/* Highlights row */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 block mb-2">
                🌟 {currentMonth.name} Ayında Kaçırılmayacak Deneyimler:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentMonth.highlights.map((hl, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-slate-800/90 text-amber-300 text-xs font-medium border border-amber-500/20 flex items-center gap-1.5"
                  >
                    <span>✦</span>
                    <span>{hl}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Destinations Grid from Atlas */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Atlasındaki İdeal {currentMonth.name} Noktaları</span>
                  <span className="text-xs text-slate-400 font-normal">({matchingPlaces.length} Öneri)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Bu ay için atlasından özenle seçilen mekanlar. İncelemek için tıkla.
                </p>
              </div>
            </div>

            {matchingPlaces.length === 0 ? (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
                Bu ay kriterlerine uygun kayıtlı mekan bulunamadı.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {matchingPlaces.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => {
                      onSelectPlace(pl);
                      onClose();
                    }}
                    className="group bg-slate-950/70 hover:bg-slate-850 border border-slate-800 hover:border-amber-400/50 rounded-2xl p-3 cursor-pointer transition flex flex-col justify-between overflow-hidden shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-800 relative flex items-center justify-center">
                        {coverOf(pl) ? (
                          <img
                            src={coverOf(pl)}
                            loading="lazy"
                            alt={pl.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-2xl">📍</span>
                        )}
                        {pl.visited && (
                          <div className="absolute top-1 left-1 bg-emerald-500 text-slate-950 text-[9px] font-bold px-1 rounded">
                            ✓
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-white group-hover:text-amber-300 transition truncate">
                          {pl.name}
                        </h5>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{pl.city}, {pl.country}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                          {pl.whatAwaits || pl.howToVisit || 'Bu ay ziyaret için en uygun zaman.'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="text-amber-400/90 font-medium">⏱️ {pl.duration || '2-3 Saat'}</span>
                      <span className="group-hover:text-amber-300 flex items-center gap-1 font-semibold transition">
                        <span>Detayı Gör</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
