// src/data/ankaraDistance.js
// Ankara Base Distance & Travel Time Calculator (Drive, Realistic Multi-Stop Flight, YHT Train)
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
  'eskişehir': { time: '1 sa 25 dk' },
  'konya': { time: '1 sa 45 dk' },
  'karaman': { time: '2 sa 40 dk' },
  'sivas': { time: '2 sa 30 dk' },
  'istanbul': { time: '4 sa 15 dk' },
  'bilecik': { time: '2 sa 15 dk' },
  'kırıkkale': { time: '35 dk' },
  'yozgat': { time: '1 sa 15 dk' }
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

  // 3. Realistic Flight Calculation (Considering transfers and real transit corridors)
  const country = place.country || '';
  const placeName = (place.name || '').toLowerCase();

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
    // ABROAD: Realistic transit & multi-stop modeling
    // A. South America (Multi-stop international + domestic connection)
    if (['Peru', 'Bolivya', 'Ekvador', 'Şili', 'Arjantin', 'Kolombiya', 'Brezilya', 'Uruguay', 'Paraguay', 'Guyana'].includes(country)) {
      if (placeName.includes('machu picchu') || placeName.includes('cusco') || cityName.includes('cusco')) {
        flightText = '~22 - 26 sa (2+ aktarma: Lima & Cusco)';
      } else if (placeName.includes('patagonya') || cityName.includes('calafate') || cityName.includes('natales')) {
        flightText = '~24 - 28 sa (2+ aktarma: Buenos Aires & El Calafate)';
      } else if (placeName.includes('galapagos')) {
        flightText = '~22 - 26 sa (2 aktarma: Guayaquil & Baltra)';
      } else {
        flightText = '~18 - 24 sa (1-2 aktarma)';
      }
    }
    // B. Oceania & Pacific
    else if (['Avustralya', 'Yeni Zelanda', 'Fiji', 'Vanuatu', 'Palau', 'Fransız Polinezyası'].includes(country) || placeName.includes('rapa nui')) {
      if (placeName.includes('rapa nui') || placeName.includes('paskalya')) {
        flightText = '~30 - 36 sa (2-3 aktarma: Santiago & Paskalya)';
      } else if (country === 'Fransız Polinezyası' || placeName.includes('bora bora') || placeName.includes('tahiti')) {
        flightText = '~28 - 34 sa (2-3 aktarma: LAX & Papeete)';
      } else if (country === 'Yeni Zelanda') {
        flightText = '~24 - 28 sa (2 aktarma)';
      } else if (country === 'Avustralya') {
        flightText = '~20 - 24 sa (1-2 aktarma)';
      } else {
        flightText = '~26 - 32 sa (2-3 aktarma)';
      }
    }
    // C. Antarctica & Extremes
    else if (country === 'Antarktika') {
      flightText = '~30+ sa (Buenos Aires + Ushuaia + Keşif Gemisi)';
    } else if (country === 'Grönland') {
      flightText = '~14 - 18 sa (Kopenhag & Kangerlussuaq aktarmalı)';
    } else if (placeName.includes('svalbard')) {
      flightText = '~12 - 16 sa (Oslo & Longyearbyen aktarmalı)';
    }
    // D. North America & Caribbean
    else if (country === 'ABD' || country === 'Kanada') {
      if (cityName.includes('hawaii') || placeName.includes('hawaii')) {
        flightText = '~22 - 26 sa (2 aktarma)';
      } else if (cityName.includes('san francisco') || cityName.includes('los angeles') || cityName.includes('kaliforniya') || cityName.includes('las vegas')) {
        flightText = '~15 - 18 sa (1 aktarma)';
      } else {
        // East Coast (New York, Boston, Washington)
        flightText = '~11 - 13 sa (1 aktarma veya direkt)';
      }
    } else if (['Meksika', 'Küba', 'Bahamalar', 'Kosta Rika', 'Panama', 'Guatemala', 'Dominik Cumhuriyeti', 'Jamaika'].includes(country)) {
      flightText = '~16 - 22 sa (1-2 aktarma)';
    }
    // E. East Asia & Southeast Asia
    else if (country === 'Japonya' || country === 'Güney Kore') {
      flightText = '~11 - 14 sa (1 aktarma)';
    } else if (country === 'Endonezya') {
      if (cityName.includes('bali') || placeName.includes('bali')) {
        flightText = '~15 - 18 sa (1-2 aktarma: Doha/Dubai & Bali)';
      } else {
        flightText = '~13 - 16 sa (1 aktarma)';
      }
    } else if (['Tayland', 'Vietnam', 'Singapur', 'Malezya', 'Filipinler', 'Kamboçya', 'Laos', 'Çin'].includes(country)) {
      flightText = '~10 - 14 sa (1 aktarma)';
    }
    // F. Central Asia & Indian Subcontinent
    else if (['Hindistan', 'Nepal', 'Sri Lanka', 'Pakistan', 'Bangladeş', 'Bhutan'].includes(country)) {
      flightText = '~8 - 12 sa (1 aktarma)';
    } else if (['Özbekistan', 'Kazakistan', 'Kırgızistan', 'Tacikistan', 'Türkmenistan', 'Moğolistan'].includes(country)) {
      flightText = '~5 - 8 sa (direkt / 1 aktarma)';
    }
    // G. Africa
    else if (['Güney Afrika', 'Botsvana', 'Namibya', 'Zambiya', 'Zimbabve', 'Madagaskar', 'Mauritius', 'Seyşeller'].includes(country)) {
      flightText = '~12 - 17 sa (1-2 aktarma)';
    } else if (['Kenya', 'Tanzanya', 'Uganda', 'Ruanda', 'Etiyopya'].includes(country)) {
      flightText = '~8 - 12 sa (1 aktarma)';
    } else if (['Mısır', 'Tunus', 'Fas', 'Cezayir'].includes(country)) {
      flightText = '~2.5 - 5 sa (direkt / 1 aktarma)';
    }
    // H. Middle East & Gulf
    else if (['BAE', 'Katar', 'Umman', 'Suudi Arabistan', 'Lübnan', 'Ürdün', 'İsrail', 'Kuveyt', 'Bahreyn', 'Irak', 'İran'].includes(country)) {
      flightText = '~2.5 - 4.5 sa (direkt / 1 aktarma)';
    }
    // I. Europe
    else if (['Yunanistan', 'Bulgaristan', 'Sırbistan', 'Bosna-Hersek', 'Karadağ', 'Arnavutluk', 'Kuzey Makedonya', 'Kosova', 'Romanya', 'Gürcistan', 'Azerbaycan', 'KKTC'].includes(country)) {
      flightText = '~1.5 - 2.5 sa (direkt / 1 aktarma)';
    } else if (['Norveç', 'İsveç', 'Danimarka', 'Finlandiya', 'İzlanda', 'Faroe Adaları'].includes(country)) {
      flightText = '~4.5 - 6.5 sa (1 aktarma)';
    } else {
      // General Western/Central Europe
      flightText = '~3 - 4.5 sa (direkt / 1 aktarma)';
    }
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
