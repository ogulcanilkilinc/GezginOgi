// Türkiye 81 İl Bilgisi ve Coğrafi Bölge Dağılımı

export const TURKEY_REGIONS = [
  { id: 'ic_anadolu', label: 'İç Anadolu', icon: '🌾' },
  { id: 'marmara', label: 'Marmara', icon: '🌉' },
  { id: 'ege', label: 'Ege', icon: '🫒' },
  { id: 'akdeniz', label: 'Akdeniz', icon: '🍊' },
  { id: 'karadeniz', label: 'Karadeniz', icon: '🌲' },
  { id: 'dogu_anadolu', label: 'Doğu Anadolu', icon: '🏔️' },
  { id: 'guneydogu', label: 'Güneydoğu Anadolu', icon: '🏺' }
];

export const TURKEY_PROVINCES = [
  { plate: 1, name: 'Adana', region: 'akdeniz' },
  { plate: 2, name: 'Adıyaman', region: 'guneydogu' },
  { plate: 3, name: 'Afyonkarahisar', region: 'ege' },
  { plate: 4, name: 'Ağrı', region: 'dogu_anadolu' },
  { plate: 5, name: 'Amasya', region: 'karadeniz' },
  { plate: 6, name: 'Ankara', region: 'ic_anadolu' },
  { plate: 7, name: 'Antalya', region: 'akdeniz' },
  { plate: 8, name: 'Artvin', region: 'karadeniz' },
  { plate: 9, name: 'Aydın', region: 'ege' },
  { plate: 10, name: 'Balıkesir', region: 'marmara' },
  { plate: 11, name: 'Bilecik', region: 'marmara' },
  { plate: 12, name: 'Bingöl', region: 'dogu_anadolu' },
  { plate: 13, name: 'Bitlis', region: 'dogu_anadolu' },
  { plate: 14, name: 'Bolu', region: 'karadeniz' },
  { plate: 15, name: 'Burdur', region: 'akdeniz' },
  { plate: 16, name: 'Bursa', region: 'marmara' },
  { plate: 17, name: 'Çanakkale', region: 'marmara' },
  { plate: 18, name: 'Çankırı', region: 'ic_anadolu' },
  { plate: 19, name: 'Çorum', region: 'karadeniz' },
  { plate: 20, name: 'Denizli', region: 'ege' },
  { plate: 21, name: 'Diyarbakır', region: 'guneydogu' },
  { plate: 22, name: 'Edirne', region: 'marmara' },
  { plate: 23, name: 'Elazığ', region: 'dogu_anadolu' },
  { plate: 24, name: 'Erzincan', region: 'dogu_anadolu' },
  { plate: 25, name: 'Erzurum', region: 'dogu_anadolu' },
  { plate: 26, name: 'Eskişehir', region: 'ic_anadolu' },
  { plate: 27, name: 'Gaziantep', region: 'guneydogu' },
  { plate: 28, name: 'Giresun', region: 'karadeniz' },
  { plate: 29, name: 'Gümüşhane', region: 'karadeniz' },
  { plate: 30, name: 'Hakkâri', region: 'dogu_anadolu' },
  { plate: 31, name: 'Hatay', region: 'akdeniz' },
  { plate: 32, name: 'Isparta', region: 'akdeniz' },
  { plate: 33, name: 'Mersin', region: 'akdeniz' },
  { plate: 34, name: 'İstanbul', region: 'marmara' },
  { plate: 35, name: 'İzmir', region: 'ege' },
  { plate: 36, name: 'Kars', region: 'dogu_anadolu' },
  { plate: 37, name: 'Kastamonu', region: 'karadeniz' },
  { plate: 38, name: 'Kayseri', region: 'ic_anadolu' },
  { plate: 39, name: 'Kırklareli', region: 'marmara' },
  { plate: 40, name: 'Kırşehir', region: 'ic_anadolu' },
  { plate: 41, name: 'Kocaeli', region: 'marmara' },
  { plate: 42, name: 'Konya', region: 'ic_anadolu' },
  { plate: 43, name: 'Kütahya', region: 'ege' },
  { plate: 44, name: 'Malatya', region: 'dogu_anadolu' },
  { plate: 45, name: 'Manisa', region: 'ege' },
  { plate: 46, name: 'Kahramanmaraş', region: 'akdeniz' },
  { plate: 47, name: 'Mardin', region: 'guneydogu' },
  { plate: 48, name: 'Muğla', region: 'ege' },
  { plate: 49, name: 'Muş', region: 'dogu_anadolu' },
  { plate: 50, name: 'Nevşehir', region: 'ic_anadolu' },
  { plate: 51, name: 'Niğde', region: 'ic_anadolu' },
  { plate: 52, name: 'Ordu', region: 'karadeniz' },
  { plate: 53, name: 'Rize', region: 'karadeniz' },
  { plate: 54, name: 'Sakarya', region: 'marmara' },
  { plate: 55, name: 'Samsun', region: 'karadeniz' },
  { plate: 56, name: 'Siirt', region: 'guneydogu' },
  { plate: 57, name: 'Sinop', region: 'karadeniz' },
  { plate: 58, name: 'Sivas', region: 'ic_anadolu' },
  { plate: 59, name: 'Tekirdağ', region: 'marmara' },
  { plate: 60, name: 'Tokat', region: 'karadeniz' },
  { plate: 61, name: 'Trabzon', region: 'karadeniz' },
  { plate: 62, name: 'Tunceli', region: 'dogu_anadolu' },
  { plate: 63, name: 'Şanlıurfa', region: 'guneydogu' },
  { plate: 64, name: 'Uşak', region: 'ege' },
  { plate: 65, name: 'Van', region: 'dogu_anadolu' },
  { plate: 66, name: 'Yozgat', region: 'ic_anadolu' },
  { plate: 67, name: 'Zonguldak', region: 'karadeniz' },
  { plate: 68, name: 'Aksaray', region: 'ic_anadolu' },
  { plate: 69, name: 'Bayburt', region: 'karadeniz' },
  { plate: 70, name: 'Karaman', region: 'ic_anadolu' },
  { plate: 71, name: 'Kırıkkale', region: 'ic_anadolu' },
  { plate: 72, name: 'Batman', region: 'guneydogu' },
  { plate: 73, name: 'Şırnak', region: 'guneydogu' },
  { plate: 74, name: 'Bartın', region: 'karadeniz' },
  { plate: 75, name: 'Ardahan', region: 'dogu_anadolu' },
  { plate: 76, name: 'Iğdır', region: 'dogu_anadolu' },
  { plate: 77, name: 'Yalova', region: 'marmara' },
  { plate: 78, name: 'Karabük', region: 'karadeniz' },
  { plate: 79, name: 'Kilis', region: 'guneydogu' },
  { plate: 80, name: 'Osmaniye', region: 'akdeniz' },
  { plate: 81, name: 'Düzce', region: 'karadeniz' }
];

function normalizeTr(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/i̇/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
}

export function getProvinceVisitStats(places) {
  const trPlaces = places.filter(
    (p) => p.country === 'Türkiye' || p.region === 'turkiye' || p.region === 'ankara'
  );

  // Map each province to its places
  const provinceMap = {};
  TURKEY_PROVINCES.forEach((prov) => {
    const normProv = normalizeTr(prov.name);
    const matchedPlaces = trPlaces.filter((p) => {
      const normCity = normalizeTr(p.city);
      const normName = normalizeTr(p.name);
      return normCity.includes(normProv) || normName.includes(normProv);
    });

    const visitedPlaces = matchedPlaces.filter((p) => p.visited);

    provinceMap[prov.name] = {
      ...prov,
      totalPlaces: matchedPlaces.length,
      visitedPlaces: visitedPlaces.length,
      visited: visitedPlaces.length > 0,
      placesList: matchedPlaces
    };
  });

  const visitedProvinces = TURKEY_PROVINCES.filter(
    (prov) => provinceMap[prov.name]?.visited
  );

  const totalVisited = visitedProvinces.length;
  const percentage = Math.round((totalVisited / 81) * 100);

  // Group by region
  const regionalBreakdown = TURKEY_REGIONS.map((reg) => {
    const regProvinces = TURKEY_PROVINCES.filter((p) => p.region === reg.id);
    const regVisited = regProvinces.filter((p) => provinceMap[p.name]?.visited).length;
    return {
      ...reg,
      totalProvinces: regProvinces.length,
      visitedProvinces: regVisited,
      percentage: Math.round((regVisited / regProvinces.length) * 100),
      provinces: regProvinces.map((p) => provinceMap[p.name])
    };
  });

  return {
    totalVisited,
    totalProvinces: 81,
    percentage,
    provinceMap,
    visitedProvinces,
    regionalBreakdown
  };
}
