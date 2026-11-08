// src/data/ankaraDistance.js
// Ankara Base Distance & Travel Time Calculator (Drive, Flight, YHT Train)
// Ankara Reference: Kızılay / Çankaya [39.9208, 32.8541]

export const ANKARA_COORDS = [39.9208, 32.8541];

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// YHT (Yüksek Hızlı Tren) routes originating from Ankara YHT Gar
const YHT_DESTINATIONS = {
  'eskişehir': { time: '1 sa 25 dk', note: 'Ankara Gar’dan günde 14+ sefer' },
  'konya': { time: '1 sa 45 dk', note: 'Ankara Gar’dan direkt hızlı tren' },
  'karaman': { time: '2 sa 40 dk', note: 'Konya aktarmasız hızlı tren' },
  'sivas': { time: '2 sa 30 dk', note: 'Yeni Ankara-Sivas YHT hattı' },
  'istanbul': { time: '4 sa 15 dk', note: 'Söğütlüçeşme & Halkalı yönü' },
  'bilecik': { time: '2 sa 15 dk', note: 'Bozüyük & Bilecik YHT' },
  'kırıkkale': { time: '35 dk', note: 'YHT ile yarım saat' },
  'yozgat': { time: '1 sa 15 dk', note: 'YHT hattı üzeri' }
};

export function getAnkaraTravelInfo(place) {
  if (!place || !place.coords || place.coords.length < 2) {
    return {
      distKm: 0,
      roadKm: 0,
      driveMinutes: 0,
      driveText: 'Mesafe hesaplanamadı',
      flightText: null,
      trainText: null,
      isWeekendEscape: false,
      summaryText: 'Konum bilgisi eksik'
    };
  }

  const [lat, lng] = place.coords;
  const distKm = Math.round(haversineDistance(ANKARA_COORDS[0], ANKARA_COORDS[1], lat, lng));
  const isTr = place.country === 'Türkiye' || !place.country;

  let driveMinutes = 0;
  let driveText = '';
  let flightText = null;
  let trainText = null;

  // 1. Driving Calculation
  if (distKm <= 15) {
    driveMinutes = Math.max(10, Math.round(distKm * 2.5));
    driveText = `${driveMinutes} dk araçla`;
  } else if (distKm <= 35) {
    driveMinutes = Math.round(distKm * 2.0);
    const h = Math.floor(driveMinutes / 60);
    const m = driveMinutes % 60;
    driveText = h > 0 ? `${h} sa ${m} dk araçla` : `${m} dk araçla`;
  } else if (isTr || distKm <= 1200) {
    const roadKm = Math.round(distKm * 1.25);
    driveMinutes = Math.round(20 + (roadKm / 90) * 60);
    const h = Math.floor(driveMinutes / 60);
    const m = driveMinutes % 60;
    driveText = m > 0 ? `${h} sa ${m} dk araçla` : `${h} sa araçla`;
  } else {
    driveText = null; // Too far for driving from Ankara
  }

  // 2. YHT Train check
  const cityName = (place.city || '').toLowerCase();
  const subRegionName = (place.subRegion || '').toLowerCase();
  for (const [key, val] of Object.entries(YHT_DESTINATIONS)) {
    if (cityName.includes(key) || subRegionName.includes(key)) {
      trainText = `YHT ile ${val.time}`;
      break;
    }
  }

  // 3. Flight Calculation
  if (isTr) {
    if (distKm >= 320) {
      if (cityName.includes('istanbul')) flightText = '1 sa uçakla';
      else if (cityName.includes('izmir')) flightText = '1 sa 10 dk uçakla';
      else if (cityName.includes('antalya')) flightText = '1 sa 10 dk uçakla';
      else if (cityName.includes('bodrum') || cityName.includes('muğla') || cityName.includes('dalaman')) flightText = '1 sa 15 dk uçakla';
      else if (cityName.includes('trabzon') || cityName.includes('rize')) flightText = '1 sa 20 dk uçakla';
      else if (cityName.includes('van') || cityName.includes('kars') || cityName.includes('gaziantep')) flightText = '1 sa 25 dk uçakla';
      else flightText = '1 sa 15 dk uçakla';
    }
  } else {
    // Abroad flights from Ankara (direct / 1-stop)
    if (distKm < 1500) flightText = '~1.5 - 2.5 sa uçakla';
    else if (distKm < 2800) flightText = '~3 - 3.5 sa uçakla';
    else if (distKm < 4500) flightText = '~4 - 5.5 sa uçakla';
    else flightText = '~9 - 14 sa uçakla';
  }

  // 4. Weekend Escape Criteria:
  // Must be in Turkey, drive time <= 270 mins (4.5 hours), and dist >= 15 km (not just inner city)
  const isWeekendEscape = isTr && driveMinutes > 0 && driveMinutes <= 270 && distKm >= 15;

  // 5. Combined Concise Label for Badges & Cards
  let summaryParts = [];
  if (trainText) summaryParts.push(trainText);
  if (driveText && (!trainText || driveMinutes <= 180)) summaryParts.push(driveText);
  if (flightText && !trainText && driveMinutes > 240) summaryParts.push(flightText);
  if (summaryParts.length === 0) {
    if (flightText) summaryParts.push(flightText);
    else if (driveText) summaryParts.push(driveText);
  }

  const summaryText = summaryParts.join(' · ');

  return {
    distKm,
    roadKm: Math.round(distKm * 1.25),
    driveMinutes,
    driveText,
    flightText,
    trainText,
    isWeekendEscape,
    summaryText: summaryText ? `Ankara’dan ${summaryText}` : `Ankara’ya ${distKm} km`
  };
}
