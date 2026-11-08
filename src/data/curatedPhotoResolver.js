// src/data/curatedPhotoResolver.js
// Strictly curated, 100% authentic, standard 960px / 500px Wikimedia thumbnail photos.
// Enforces official Wikimedia CDN bucket widths (960px, 500px) avoiding 400 Bad Request errors.
// Zero unverified/automated matches, zero stock photos.

export const VERIFIED_LANDMARK_PHOTOS = {
  'ank-anitkabir': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Ataturk%27s_Mausoleum_%286225341313%29.jpg/960px-Ataturk%27s_Mausoleum_%286225341313%29.jpg',
  'ank-kugulu-tunali': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Ankara_Ku%C4%9Fulu_Park.JPG/960px-Ankara_Ku%C4%9Fulu_Park.JPG',
  'ank-anadolu-medeniyetleri': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Museum_of_Anatolian_Civilizations001.jpg/960px-Museum_of_Anatolian_Civilizations001.jpg',
  'go-tuz-golu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Lake_Tuz_at_sunset.jpg/960px-Lake_Tuz_at_sunset.jpg',
  'tr-kapadokya': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Cappadocia_Hot_Air_Balloons.jpg/960px-Cappadocia_Hot_Air_Balloons.jpg',
  'tr-efes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Library_of_Celsus_side_view.jpg/960px-Library_of_Celsus_side_view.jpg',
  'tr-gobeklitepe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/G%C3%B6bekli_Tepe%2C_Urfa.jpg/960px-G%C3%B6bekli_Tepe%2C_Urfa.jpg',
  'tr-pamukkale-hierapolis': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Pamukkale00.JPG/960px-Pamukkale00.JPG',
  'tr-nemrut-dagi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Mount_Nemrut_heads.jpg/960px-Mount_Nemrut_heads.jpg',
  'tr-sumela-trabzon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Sumela_from_across_valley.JPG/960px-Sumela_from_across_valley.JPG',
  'tr-istanbul-galata-karakoy-moda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Galata_Tower_in_Istanbul.JPG/960px-Galata_Tower_in_Istanbul.JPG',
  'tr-kas-kaputas': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Kaputa%C5%9F_Beach%2C_Ka%C5%9F%2C_Antalya%2C_Turkey.jpg/960px-Kaputa%C5%9F_Beach%2C_Ka%C5%9F%2C_Antalya%2C_Turkey.jpg',
  'wld-balkan-saraybosna-mostar-ohrid': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Mostar_Old_Town_Panorama_2007.jpg/960px-Mostar_Old_Town_Panorama_2007.jpg',
  'wld-roma-kolezyum': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/960px-Colosseo_2020.jpg',
  'wld-peru-machu-picchu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Machu_Picchu%2C_2023_%28012%29.jpg/960px-Machu_Picchu%2C_2023_%28012%29.jpg'
};

/**
 * Returns a 500px thumbnail URL for compact card views or 960px for detail hero.
 */
export function getOptimizedImageUrl(url, width = 960) {
  if (!url) return '';
  // Convert any Wikimedia 800px or custom width to standard supported bucket width
  if (url.includes('upload.wikimedia.org') || url.includes('thumb.wikimedia.org')) {
    const targetWidth = width <= 500 ? '500px' : '960px';
    return url.replace(/\/\d+px-/, `/${targetWidth}-`);
  }
  return url;
}

export function resolveCuratedPhoto(place, width = 960) {
  if (!place) return '';

  // 1. Direct verified landmark ID match
  if (place.id && VERIFIED_LANDMARK_PHOTOS[place.id]) {
    return getOptimizedImageUrl(VERIFIED_LANDMARK_PHOTOS[place.id], width);
  }

  // 2. Anıtkabir special check
  const lowerName = (place.name || '').toLowerCase();
  if (lowerName.includes('anıtkabir')) {
    return getOptimizedImageUrl(VERIFIED_LANDMARK_PHOTOS['ank-anitkabir'], width);
  }

  // 3. Keep if verified thumbnail in place (ensuring valid width bucket)
  if (place.coverImage && place.coverImage.includes('wikimedia.org') && place.coverImage.includes('/thumb/')) {
    return getOptimizedImageUrl(place.coverImage, width);
  }

  // 4. Return empty string so UI renders a clean, honest placeholder card with category styling
  return '';
}
