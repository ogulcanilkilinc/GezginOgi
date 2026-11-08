// Helper builder to transform compact country-by-country encyclopedia entries into full Keşif Atlasım place objects

const CATEGORY_IMAGES = {
  muze: [
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1543429257-3eb0b65d9c58?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?auto=format&fit=crop&w=1000&q=80'
  ],
  doga: [
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80'
  ],
  kultur: [
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1000&q=80'
  ],
  restoran: [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80'
  ],
  bar: [
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80'
  ],
  gizli: [
    'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80'
  ]
};

/**
 * Compact tuple format:
 * [id, name, city, lat, lng, category, duration, durationCategory, whatAwaits, highlightsStr, howToVisit, localSpecialties, bestTimeText]
 */
export function buildCountryPlaces(region, subRegion, country, defaultSeasons, defaultBudget, rows) {
  return rows.map((row, idx) => {
    const [
      id,
      name,
      city,
      lat,
      lng,
      category = 'kultur',
      duration = '2 - 4 Saat',
      durationCategory = 'yarim',
      whatAwaits = '',
      highlightsStr = '',
      howToVisit = '',
      localSpecialties = '',
      bestTimeText = ''
    ] = row;

    const imgList = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.kultur;
    const coverImage = imgList[idx % imgList.length];

    const highlights = highlightsStr
      ? highlightsStr.split('|').map((s) => s.trim()).filter(Boolean)
      : [
          `${name} ana gezi ve seyir alanı`,
          `${city} tarihi ve kültürel dokusu içinde yürüyüş rotası`,
          'En fotojenik panoramik manzara ve mimari detay noktaları'
        ];

    const fullCity = country && !city.includes(country) ? `${city}, ${country}` : city;

    return {
      id,
      name,
      region,
      subRegion,
      country: country || (region === 'turkiye' ? 'Türkiye' : region === 'ankara' ? 'Ankara' : subRegion),
      city: fullCity,
      category,
      coords: [lat, lng],
      duration,
      durationCategory,
      seasons: defaultSeasons || ['ilkbahar', 'yaz', 'sonbahar'],
      bestTimeText:
        bestTimeText ||
        `${fullCity} rotasında sabah erken saatler (08:30-10:30) veya gün batımı öncesi altın saatler (Golden Hour) en etkileyici atmosferi sunar.`,
      whatAwaits,
      highlights,
      howToVisit:
        howToVisit ||
        `${city} merkezinden toplu taşıma, yürüyüş rotası veya bölgesel tren/araç bağlantısıyla kolayca ulaşılır. Yoğun sezonda giriş biletlerini online almak zaman kazandırır.`,
      localSpecialties:
        localSpecialties ||
        `${fullCity} mutfağının geleneksel sokak lezzetleri, yerel pazarları ve karakteristik kafeleri.`,
      blogArticle: `${fullCity} seyahatinde mutlaka görülmesi gereken başlıca duraklardan biri olan ${name}; coğrafi konumu, tarihi derinliği ve kendine özgü atmosferiyle gezginlerin listesinde üst sıralarda yer alıyor. ${whatAwaits}`,
      coverImage,
      visited: false,
      visitedDate: '',
      favorite: idx % 4 === 0,
      userNotes: `${fullCity} rotasında ${name} keşfi!`,
      userRating: 5,
      budget: defaultBudget || 'Orta (₺₺)'
    };
  });
}

/**
 * High-density builder for 20-30 places per country:
 * Each item: [id, name, city, lat, lng, category, duration, whatAwaits]
 */
export function buildDeepCountryPack({
  region = 'dunya',
  subRegion,
  country,
  seasons = ['ilkbahar', 'yaz', 'sonbahar'],
  budget = 'Orta (₺₺)',
  food,
  transport,
  items
}) {
  return items.map((item, idx) => {
    const [id, name, city, lat, lng, category = 'kultur', duration = '2 - 4 Saat', whatAwaits = ''] = item;
    const imgList = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.kultur;
    const coverImage = imgList[idx % imgList.length];
    const fullCity = country && !city.includes(',') && !city.includes(country) ? `${city}, ${country}` : city;
    const derivedCountry = city.includes(',')
      ? city.split(',').pop().trim()
      : country || (region === 'turkiye' ? 'Türkiye' : 'Ankara');
    const hasCountryPrefix = name.includes('—');
    const finalName = hasCountryPrefix || !derivedCountry || region !== 'dunya' ? name : `${derivedCountry} — ${name}`;
    const durCat =
      duration.includes('Gün') || duration.includes('5') || duration.includes('6')
        ? 'tam'
        : duration.includes('1') || duration.includes('2 Saat')
        ? 'kisa'
        : 'yarim';

    return {
      id,
      name: finalName,
      region,
      subRegion,
      country: derivedCountry,
      city: fullCity,
      category,
      coords: [lat, lng],
      duration,
      durationCategory: durCat,
      seasons,
      bestTimeText: `${fullCity} içinde bu noktayı keşfetmek için sabah erken saatler (08:30-10:30) veya gün batımı öncesi altın saatler en ideal ışık ve sakinliği sunar.`,
      whatAwaits,
      highlights: [
        `${name} ana gezi, mimari ve panoramik seyir noktası`,
        `${city} çevresindeki tarihi sokaklar, kültür durakları ve yürüyüş rotası`,
        `Gezginler için en fotojenik kadrajlar ve yerel atmosfer`
      ],
      howToVisit:
        transport ||
        `${fullCity} merkezinden toplu taşıma, yürüyüş rotası veya bölgesel tren/araç bağlantısıyla kolayca ulaşılır.`,
      localSpecialties:
        food || `${fullCity} mutfağının geleneksel lezzetleri, sokak tatları ve yerel kafeleri.`,
      blogArticle: `${fullCity} seyahatinin en özel duraklarından biri olan ${name}, bölgenin ruhunu, tarihini ve coğrafi çeşitliliğini yerinde hissetmek isteyen gezginler için unutulmaz bir deneyim sunuyor. ${whatAwaits}`,
      coverImage,
      visited: false,
      visitedDate: '',
      favorite: idx % 5 === 0,
      userNotes: `${fullCity}: ${name}`,
      userRating: 5,
      budget
    };
  });
}

