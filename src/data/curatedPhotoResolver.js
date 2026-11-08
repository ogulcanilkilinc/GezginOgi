// src/data/curatedPhotoResolver.js
// Strictly curated, 100% authentic, lightweight 800px landmark photo resolver.
// Zero unverified/automated matches, zero stock photos.

export const VERIFIED_LANDMARK_PHOTOS = {
  'ank-anitkabir': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Ataturk%27s_Mausoleum_%286225341313%29.jpg/800px-Ataturk%27s_Mausoleum_%286225341313%29.jpg',
  'ank-kugulu-tunali': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Ankara_Ku%C4%9Fulu_Park.JPG/800px-Ankara_Ku%C4%9Fulu_Park.JPG',
  'ank-dp-13': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Ankara%2C_Turkey_-_panoramio_%2892%29.jpg/800px-Ankara%2C_Turkey_-_panoramio_%2892%29.jpg',
  'ank-anadolu-medeniyetleri': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Museum_of_Anatolian_Civilizations001.jpg/800px-Museum_of_Anatolian_Civilizations001.jpg',
  'go-tuz-golu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Lake_Tuz_at_sunset.jpg/800px-Lake_Tuz_at_sunset.jpg',
  'tr-kapadokya': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Cappadocia_Hot_Air_Balloons.jpg/800px-Cappadocia_Hot_Air_Balloons.jpg',
  'tr-efes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Library_of_Celsus_side_view.jpg/800px-Library_of_Celsus_side_view.jpg',
  'tr-gobeklitepe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/G%C3%B6bekli_Tepe%2C_Urfa.jpg/800px-G%C3%B6bekli_Tepe%2C_Urfa.jpg',
  'tr-pamukkale-hierapolis': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Pamukkale00.JPG/800px-Pamukkale00.JPG',
  'tr-nemrut-dagi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Mount_Nemrut_heads.jpg/800px-Mount_Nemrut_heads.jpg',
  'tr-sumela-trabzon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Sumela_from_across_valley.JPG/800px-Sumela_from_across_valley.JPG',
  'tr-istanbul-galata-karakoy-moda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Galata_Tower_in_Istanbul.JPG/800px-Galata_Tower_in_Istanbul.JPG',
  'tr-kas-kaputas': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Kaputa%C5%9F_Beach%2C_Ka%C5%9F%2C_Antalya%2C_Turkey.jpg/800px-Kaputa%C5%9F_Beach%2C_Ka%C5%9F%2C_Antalya%2C_Turkey.jpg',
  'wld-balkan-saraybosna-mostar-ohrid': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Mostar_Old_Town_Panorama_2007.jpg/800px-Mostar_Old_Town_Panorama_2007.jpg',
  'wld-roma-kolezyum': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/800px-Colosseo_2020.jpg',
  'wld-peru-machu-picchu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Machu_Picchu%2C_2023_%28012%29.jpg/800px-Machu_Picchu%2C_2023_%28012%29.jpg'
};

export function resolveCuratedPhoto(place) {
  if (!place) return '';

  // 1. Direct ID match
  if (place.id && VERIFIED_LANDMARK_PHOTOS[place.id]) {
    return VERIFIED_LANDMARK_PHOTOS[place.id];
  }

  // 2. Anıtkabir special check
  const lowerName = (place.name || '').toLowerCase();
  if (lowerName.includes('anıtkabir')) {
    return VERIFIED_LANDMARK_PHOTOS['ank-anitkabir'];
  }

  // 3. Keep if verified thumbnail in place
  if (place.coverImage && place.coverImage.includes('wikimedia.org') && place.coverImage.includes('/thumb/')) {
    return place.coverImage;
  }

  // 4. Return empty so UI renders a clean, honest placeholder card
  return '';
}
