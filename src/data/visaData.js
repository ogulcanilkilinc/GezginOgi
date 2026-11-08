// src/data/visaData.js
// Turkish Ordinary (Bordo / Umuma Mahsus) Passport Visa Status Catalog
// Sources: T.C. Dışişleri Bakanlığı (MFA), IATA Timatic & Güncel Seyahat Mevzuatı

export const VISA_CATEGORIES = {
  turkiye: {
    id: 'turkiye',
    label: 'Yurtiçi',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: '🇹🇷',
    isVisaFree: true
  },
  kimlikle: {
    id: 'kimlikle',
    label: 'Kimlikle Vizesiz',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
    icon: '🪪',
    isVisaFree: true
  },
  vizesiz: {
    id: 'vizesiz',
    label: 'Vizesiz',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: '✈️',
    isVisaFree: true
  },
  kapi_evize: {
    id: 'kapi_evize',
    label: 'Kapıda / e-Vize',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: '🎫',
    isVisaFree: false
  },
  schengen: {
    id: 'schengen',
    label: 'Schengen Şart',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    icon: '🇪🇺',
    isVisaFree: false
  },
  vize_gerekli: {
    id: 'vize_gerekli',
    label: 'Özel Vize Şart',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
    icon: '🔒',
    isVisaFree: false
  }
};

export const CANONICAL_COUNTRY_MAP = {
  'Bavyera': 'Almanya',
  'Baden-Württemberg': 'Almanya',
  'Romantik Yol': 'Almanya',
  'Saksonya': 'Almanya',
  'Saksonya-Anhalt': 'Almanya',
  'Ren-Mosel': 'Almanya',
  'Londra': 'Birleşik Krallık',
  'Berkshire': 'Birleşik Krallık',
  'Somerset': 'Birleşik Krallık',
  'Yorkshire': 'Birleşik Krallık',
  'Güneybatı İngiltere': 'Birleşik Krallık',
  'İskoçya': 'Birleşik Krallık',
  'İskoçya (BK)': 'Birleşik Krallık',
  'Kuzey İrlanda': 'Birleşik Krallık',
  'Tokyo': 'Japonya',
  'Kanagawa': 'Japonya',
  'Kyoto': 'Japonya',
  'Hyogo': 'Japonya',
  'New York': 'ABD',
  'Illinois': 'ABD',
  'Louisiana': 'ABD',
  'Kaliforniya': 'ABD',
  'Nevada': 'ABD',
  'Amerika': 'ABD',
  'Kahire': 'Mısır',
  'Batı Çölü': 'Mısır',
  'Bali': 'Endonezya',
  'Batı Kazakistan': 'Kazakistan',
  'Kuzey Pakistan': 'Pakistan',
  'Güneydoğu Cezayir (Sahra Çölü)': 'Cezayir',
  'Seyşeller (Hint Okyanusu)': 'Seyşeller',
  'Yemen (Hint Okyanusu)': 'Yemen',
  'Rapa Nui (Şili - Güney Pasifik)': 'Şili',
  'Svalbard (Norveç Arktik)': 'Norveç',
  'Fransız Polinezyası (Güney Pasifik)': 'Fransa',
  'Fransa (Réunion)': 'Fransa',
  'Grönland': 'Danimarka',
  'Faroe Adaları': 'Danimarka',
  'Danimarka (Faroe)': 'Danimarka',
  'Stockholm (İsveç) & Kopenhag (Danimarka)': 'İsveç',
  'Hollanda & Belçika': 'Hollanda',
  'Exuma (Bahamalar) & Bridgetown (Barbados)': 'Bahamalar',
  'Guyana & Surinam': 'Guyana',
  'İsrail & Filistin': 'İsrail',
  'Peru–Bolivya': 'Peru',
  'Çin (Tibet)': 'Çin',
  'Kıbrıs & KKTC': 'KKTC',
  'Güney Afrika Cumhuriyeti': 'Güney Afrika'
};

// Detailed Turkish citizen visa requirements database
export const COUNTRY_VISA_INFO = {
  'Türkiye': {
    category: 'turkiye',
    label: 'Yurtiçi',
    duration: 'Sınırsız',
    notes: 'Kendi vatanın; pasaport veya vize gerekmez.'
  },
  // KİMLİKLE GİRİLEBİLEN ÜLKELER
  'Gürcistan': {
    category: 'kimlikle',
    label: 'Kimlikle (1 Yıl)',
    duration: '365 gün',
    notes: 'Yeni çipli T.C. Kimlik Kartı ile pasaporta ve vizeye ihtiyaç duymadan 1 yıla kadar kalış hakkı.'
  },
  'Azerbaycan': {
    category: 'kimlikle',
    label: 'Kimlikle (90 Gün)',
    duration: '90 gün',
    notes: 'Yeni çipli T.C. Kimlik Kartı ile vizesiz 90 gün. (15 günü aşan kalışlarda adres kaydı gerekir).'
  },
  'KKTC': {
    category: 'kimlikle',
    label: 'Kimlikle (90 Gün)',
    duration: '90 gün',
    notes: 'Yeni çipli T.C. Kimlik Kartı ile giriş yapılır; pasaport damgası vurulmaz.'
  },
  'Bosna-Hersek': {
    category: 'kimlikle',
    label: 'Kimlikle / Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'T.C. Kimlik Kartı ile seyahat protokolü yürürlükte; bordo pasaportla da 90 gün vizesiz.'
  },
  'Sırbistan': {
    category: 'kimlikle',
    label: 'Kimlikle / Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Çipli kimlikle seyahat anlaşması imzalanmıştır; bordo pasaportla 6 ay içinde 90 gün vizesiz.'
  },
  'Moldova': {
    category: 'kimlikle',
    label: 'Kimlikle (90 Gün)',
    duration: '90 gün',
    notes: 'Yeni çipli T.C. Kimlik Kartı ile 180 gün içinde 90 güne kadar vizesiz.'
  },

  // VİZESİZ BALKANLAR & AVRUPA
  'Karadağ': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 180 gün içinde 90 gün vizesiz seyahat imkanı.'
  },
  'Arnavutluk': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 180 gün içinde 90 gün vizesiz giriş.'
  },
  'Kuzey Makedonya': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 90 güne kadar vizesiz.'
  },
  'Kosova': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 180 gün içinde 90 gün vizesiz.'
  },

  // VİZESİZ ASYA & KAFKASLAR & ORTA ASYA
  'Japonya': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 90 güne kadar turistik vizesiz giriş. Pasaportun en az 6 ay geçerli olmalıdır.'
  },
  'Güney Kore': {
    category: 'vizesiz',
    label: 'Vizesiz / K-ETA (90 Gün)',
    duration: '90 gün',
    notes: '90 gün vizesiz; uçuş öncesi online K-ETA seyahat onay formu doldurulması tavsiye edilir.'
  },
  'Singapur': {
    category: 'vizesiz',
    label: 'Vizesiz (30 Gün)',
    duration: '30 gün',
    notes: 'Turistik amaçla 30 güne kadar vizesiz. Girişten 3 gün önce SG Arrival Card doldurulur.'
  },
  'Malezya': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 90 güne kadar vizesiz. MDAC online varış kartı doldurulur.'
  },
  'Tayland': {
    category: 'vizesiz',
    label: 'Vizesiz (60 Gün)',
    duration: '60 gün',
    notes: 'Bordo pasaportla 60 güne kadar turistik vizesiz giriş (2024 uzatması).'
  },
  'Özbekistan': {
    category: 'vizesiz',
    label: 'Vizesiz (30 Gün)',
    duration: '30 gün',
    notes: 'Bordo pasaportla 30 güne kadar vizesiz.'
  },
  'Kazakistan': {
    category: 'vizesiz',
    label: 'Vizesiz (30 Gün)',
    duration: '30 gün',
    notes: 'Bordo pasaportla 30 güne kadar vizesiz.'
  },
  'Kırgızistan': {
    category: 'vizesiz',
    label: 'Vizesiz (30 Gün)',
    duration: '30 gün',
    notes: 'Bordo pasaportla 30 güne kadar vizesiz.'
  },
  'Filipinler': {
    category: 'vizesiz',
    label: 'Vizesiz (30 Gün)',
    duration: '30 gün',
    notes: 'Bordo pasaportla 30 güne kadar vizesiz.'
  },
  'Moğolistan': {
    category: 'vizesiz',
    label: 'Vizesiz (30 Gün)',
    duration: '30 gün',
    notes: 'Bordo pasaportla 30 güne kadar vizesiz.'
  },
  'Brunei': {
    category: 'vizesiz',
    label: 'Vizesiz (30 Gün)',
    duration: '30 gün',
    notes: 'Bordo pasaportla 30 güne kadar vizesiz.'
  },
  'Katar': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 180 gün içinde 90 gün vizesiz.'
  },
  'Ürdün': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 90 güne kadar vizesiz.'
  },
  'Lübnan': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Havalimanında 90 güne kadar ücretsiz vize muafiyeti.'
  },

  // VİZESİZ AMERİKALAR
  'Brezilya': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 180 gün içinde 90 gün vizesiz.'
  },
  'Arjantin': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 90 güne kadar vizesiz.'
  },
  'Şili': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 90 güne kadar vizesiz.'
  },
  'Kolombiya': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 90 güne kadar vizesiz.'
  },
  'Peru': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 90 güne kadar vizesiz.'
  },
  'Ekvador': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 90 güne kadar vizesiz.'
  },
  'Bolivya': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 90 güne kadar vizesiz.'
  },
  'Uruguay': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 90 güne kadar vizesiz.'
  },
  'Paraguay': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 90 güne kadar vizesiz.'
  },
  'Panama': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 90 güne kadar vizesiz.'
  },
  'Kosta Rika': {
    category: 'vizesiz',
    label: 'Vizesiz (30 Gün)',
    duration: '30 gün',
    notes: 'Bordo pasaportla 30 güne kadar vizesiz.'
  },
  'Guatemala': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'CA-4 anlaşması kapsamında 90 güne kadar vizesiz.'
  },
  'El Salvador': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'CA-4 anlaşmasıyla vizesiz ($12 turist kartı).'
  },
  'Honduras': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 90 güne kadar vizesiz.'
  },
  'Nikaragua': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Girişte $10 turist kartı alınarak 90 gün kalış.'
  },

  // VİZESİZ AFRİKA & ADA ÜLKELERİ
  'Fas': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 90 güne kadar vizesiz.'
  },
  'Tunus': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 90 güne kadar vizesiz.'
  },
  'Seyşeller': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Varışta ücretsiz ziyaretçi izni ile 90 gün vizesiz.'
  },
  'Mauritius': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 90 güne kadar vizesiz.'
  },
  'Güney Afrika': {
    category: 'vizesiz',
    label: 'Vizesiz (30 Gün)',
    duration: '30 gün',
    notes: 'Bordo pasaportla 30 güne kadar vizesiz.'
  },
  'Botsvana': {
    category: 'vizesiz',
    label: 'Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Bordo pasaportla 90 güne kadar vizesiz.'
  },
  'Bahamalar': {
    category: 'vizesiz',
    label: 'Vizesiz (8 Ay)',
    duration: '8 ay',
    notes: 'Bordo pasaportla 8 aya kadar vizesiz.'
  },
  'Fiji': {
    category: 'vizesiz',
    label: 'Vizesiz (4 Ay)',
    duration: '4 ay',
    notes: 'Bordo pasaportla 4 aya kadar vizesiz.'
  },
  'Maldivler': {
    category: 'vizesiz',
    label: 'Vizesiz / Kapıda (30 Gün)',
    duration: '30 gün',
    notes: 'Havalimanında ücretsiz 30 günlük turist vizesi verilir.'
  },

  // KAPIDA VİZE VEYA KOLAY E-VİZE
  'Mısır': {
    category: 'kapi_evize',
    label: 'Kapıda Vize ($25)',
    duration: '30 gün',
    notes: 'Havalimanında banko üzerinden $25 karşılığı kapıda tek girişlik 30 günlük etiket vize alınır.'
  },
  'BAE': {
    category: 'kapi_evize',
    label: 'Kolay e-Vize',
    duration: '30 gün',
    notes: 'Uçak bileti alırken havayolu (THY, Emirates, FlyDubai) veya online portal üzerinden 2-3 günde çıkar.'
  },
  'Suudi Arabistan': {
    category: 'kapi_evize',
    label: 'e-Vize / Kapıda',
    duration: '90 gün',
    notes: 'Türk vatandaşlarına online e-Vize veya havalimanında hızlı self-servis vize imkanı.'
  },
  'Umman': {
    category: 'kapi_evize',
    label: 'Vizesiz (14G) / e-Vize',
    duration: '14 gün',
    notes: '14 güne kadar vizesiz; daha uzun süreli kalışlar için pratik online e-Vize.'
  },
  'Kamboçya': {
    category: 'kapi_evize',
    label: 'Kapıda Vize / e-Vize ($30)',
    duration: '30 gün',
    notes: 'Havalimanında $30 ve vesikalık fotoğrafla kapıda vize veya resmi siteden e-Vize.'
  },
  'Laos': {
    category: 'kapi_evize',
    label: 'Kapıda Vize / e-Vize ($40)',
    duration: '30 gün',
    notes: 'Sınır kapılarında veya online e-vize portalından 30 günlük vize.'
  },
  'Nepal': {
    category: 'kapi_evize',
    label: 'Kapıda Vize (Katmandu)',
    duration: '15-90 gün',
    notes: 'Katmandu Tribhuvan Havalimanı otomatlarından 15 gün ($30) veya 30 gün ($50) kapıda vize.'
  },
  'Sri Lanka': {
    category: 'kapi_evize',
    label: 'Online ETA e-Vize',
    duration: '30 gün',
    notes: 'Uçuştan önce online ETA sistemi üzerinden pratik onay alınır.'
  },
  'Tanzanya': {
    category: 'kapi_evize',
    label: 'Kapıda Vize / e-Vize ($50)',
    duration: '90 gün',
    notes: 'Havalimanında veya resmi e-vize portalından $50 harçla kolayca alınır.'
  },
  'Kenya': {
    category: 'kapi_evize',
    label: 'Online eTA ($35)',
    duration: '90 gün',
    notes: 'Elektronik Seyahat İzni (eTA) uçuştan en az 3 gün önce resmi siteden alınır.'
  },
  'Ruanda': {
    category: 'kapi_evize',
    label: 'Kapıda Vize ($50)',
    duration: '30 gün',
    notes: 'Kigali Havalimanı’nda kapıda 30 günlük turist vizesi.'
  },
  'Uganda': {
    category: 'kapi_evize',
    label: 'Online e-Vize ($50)',
    duration: '90 gün',
    notes: 'Uçuştan önce resmi Uganda e-vize sistemi üzerinden başvuru yapılır.'
  },
  'Ermenistan': {
    category: 'kapi_evize',
    label: 'Online e-Vize / Kapıda',
    duration: '21-120 gün',
    notes: 'Havalimanında kapıda veya önceden e-vize portalından alınabilir.'
  },
  'Madagaskar': {
    category: 'kapi_evize',
    label: 'Kapıda Vize (30 Gün)',
    duration: '30 gün',
    notes: 'İvato Havalimanı’nda kapıda turistik vize harcı ödenerek giriş yapılır.'
  },
  'Vietnam': {
    category: 'kapi_evize',
    label: 'Online e-Vize ($25)',
    duration: '90 gün',
    notes: 'Resmi Vietnam Göçmenlik Bürosu portalından 3-5 iş gününde çok girişli 90 günlük e-vize.'
  },
  'Hindistan': {
    category: 'kapi_evize',
    label: 'Online e-Tourist Visa',
    duration: '30 gün - 1 yıl',
    notes: 'Resmi Indian e-Visa portalından online başvuru; 72 saatte onay maili gelir.'
  },
  'Tacikistan': {
    category: 'kapi_evize',
    label: 'Online e-Vize + GBAO',
    duration: '60 gün',
    notes: 'Pamir Otoyolu için GBAO izniyle birlikte online e-vize portalından kolayca alınır.'
  },
  'Pakistan': {
    category: 'kapi_evize',
    label: 'Online e-Vize',
    duration: '90 gün',
    notes: 'Resmi Pakistan NADRA portalından online turistik e-vize verilir.'
  },

  // SCHENGEN BÖLGESİ (Bordo Pasaporta Vize Şart, Yeşil Pasaporta Vizesiz)
  'Almanya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Bordo pasaport için geçerli Schengen vizesi gereklidir. Yeşil (hususi) pasaporta 90 gün vizesizdir.' },
  'Fransa': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'İtalya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'İspanya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'Yunanistan': { category: 'schengen', label: 'Schengen Şart (Adalarda Kapı)', duration: '90 gün', notes: 'Schengen zorunludur. Belirli Ege adalarında yaz aylarında 7 günlük ekspres kapı vizesi uygulanır.' },
  'Hollanda': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'Belçika': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'İsviçre': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen üyesidir; Schengen vizesiyle serbest dolaşım. Yeşil pasaporta vizesiz.' },
  'Avusturya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'Çekya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'Macaristan': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'Polonya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'Portekiz': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'Hırvatistan': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: '2023 itibariyle Schengen bölgesine dahil olmuştur. Schengen vizesi şarttır.' },
  'Slovenya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'Slovakya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'Estonya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'Letonya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'Litvanya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'Lüksemburg': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'Malta': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'Romanya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Hava ve deniz sınırlarında Schengen uygulanır; geçerli Schengen veya ulusal vize gerekir.' },
  'Bulgaristan': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Hava ve deniz sınırlarında Schengen uygulanır; geçerli çok girişli Schengen veya ulusal vize gerekir.' },
  'Norveç': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'AB üyesi olmasa da Schengen alanındadır; Schengen vizesi geçerlidir.' },
  'İsveç': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'Danimarka': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'Finlandiya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'İzlanda': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen anlaşmasına dahildir; Schengen vizesi gereklidir.' },
  'Andorra': { category: 'schengen', label: 'Schengen Şart (İspanya/Fransa)', duration: '90 gün', notes: 'Havalimanı yoktur; İspanya veya Fransa üzerinden geçildiği için çift/çok girişli Schengen şarttır.' },
  'Monako': { category: 'schengen', label: 'Schengen Şart (Fransa)', duration: '90 gün', notes: 'Fransa sınır kontrolü olmadan geçilir; Schengen vizesi şarttır.' },
  'San Marino': { category: 'schengen', label: 'Schengen Şart (İtalya)', duration: '90 gün', notes: 'İtalya içerisindedir; İtalya/Schengen vizesi şarttır.' },
  'Lihtenştayn': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen alanına dahildir.' },

  // ÖZEL VİZE ŞART (Konsolosluk Başvurusu)
  'ABD': {
    category: 'vize_gerekli',
    label: 'ABD Vizesi Şart (B1/B2)',
    duration: '10 yıl çok girişli',
    notes: 'Konsolosluk mülakatı ile B1/B2 turist vizesi alınmalıdır. Randevular aylar öncesinden alınmalıdır.'
  },
  'Birleşik Krallık': {
    category: 'vize_gerekli',
    label: 'İngiltere Vizesi Şart (UK Standard Visitor)',
    duration: '6 ay - 2 yıl',
    notes: 'Schengen geçerli değildir! TLScontact üzerinden biyometrik parmak izi ve evrak başvurusu şarttır.'
  },
  'İrlanda': {
    category: 'vize_gerekli',
    label: 'İrlanda Vizesi Şart',
    duration: '90 gün',
    notes: 'Schengen veya UK vizesi doğrudan yetmez (UK vizesiyle giriş için BIVS kuralları geçerlidir).'
  },
  'Kanada': {
    category: 'vize_gerekli',
    label: 'Kanada Vizesi Şart (V-1)',
    duration: 'Pasaport süresince',
    notes: 'Online başvuru ve VFS Global üzerinden parmak izi verilmesi şarttır.'
  },
  'Avustralya': {
    category: 'vize_gerekli',
    label: 'Avustralya e-Visitor / Subclass 600',
    duration: '3-12 ay',
    notes: 'ImmiAccount üzerinden online başvuru yapılır; pasaporta etiket basılmaz.'
  },
  'Yeni Zelanda': {
    category: 'vize_gerekli',
    label: 'Yeni Zelanda Turist Vizesi',
    duration: '9 ay',
    notes: 'Online başvuru yapılır (NZeTA sadece vizeden muaf ülkeler içindir).'
  },
  'Çin': {
    category: 'vize_gerekli',
    label: 'Çin Vizesi Şart (L Vizesi)',
    duration: '30 gün',
    notes: 'Vize Başvuru Merkezi üzerinden evrak teslimi ve biyometri şarttır (Transit vize muafiyetleri hariç).'
  },
  'Rusya': {
    category: 'vize_gerekli',
    label: 'Rusya e-Vize ($52)',
    duration: '16 gün',
    notes: 'Resmi Dışişleri portalından online elektronik vize alınarak 16 güne kadar seyahat edilebilir.'
  },
  'Meksika': {
    category: 'vize_gerekli',
    label: 'SAE e-Onay / Vize',
    duration: '180 gün',
    notes: 'Havayoluyla seyahatlerde online ücretsiz SAE elektronik onay belgesi alınabilir. Geçerli ABD/Schengen/UK vizesi olanlar vizesiz girer.'
  },
  'Küba': {
    category: 'vize_gerekli',
    label: 'Küba Turist Kartı (Tarjeta)',
    duration: '90 gün',
    notes: 'Konsolosluk veya yetkili seyahat acentelerinden yaklaşık €30-35 karşılığı turist kartı temin edilir.'
  },
  'Cezayir': {
    category: 'vize_gerekli',
    label: 'Cezayir Vizesi Şart',
    duration: '30-90 gün',
    notes: 'Konsolosluk üzerinden davetiye ve otel rezervasyonuyla vize başvurusu yapılır.'
  }
};

/**
 * Returns the resolved visa info for a country name.
 * Handles composite/regional names gracefully.
 */
export function getCountryVisaInfo(countryName) {
  if (!countryName) {
    return {
      country: 'Bilinmeyen',
      category: 'vize_gerekli',
      label: 'Vize Durumu Belirsiz',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: '❓',
      isVisaFree: false,
      duration: 'Belirtilmedi',
      notes: 'Lütfen güncel konsolosluk duyurularını kontrol edin.'
    };
  }

  const canon = CANONICAL_COUNTRY_MAP[countryName] || countryName;
  const info = COUNTRY_VISA_INFO[canon] || {
    category: 'vize_gerekli',
    label: 'Vize Şart / Konsolosluk',
    duration: 'Değişken',
    notes: `${canon} için seyahat öncesi vize şartlarını ve konsolosluk gereksinimlerini kontrol ediniz.`
  };

  const meta = VISA_CATEGORIES[info.category] || VISA_CATEGORIES.vize_gerekli;

  return {
    country: canon,
    originalCountry: countryName,
    category: info.category,
    label: info.label,
    badgeClass: meta.badgeClass,
    icon: meta.icon,
    isVisaFree: meta.isVisaFree,
    duration: info.duration,
    notes: info.notes
  };
}

/**
 * Checks whether a place is considered "Visa-free" for Turkish citizens.
 * True for Türkiye, kimlikle, and vizesiz (no prior embassy visa application required).
 */
export function isPlaceVisaFree(place) {
  if (!place || !place.country) return false;
  if (place.country === 'Türkiye') return true;
  const info = getCountryVisaInfo(place.country);
  return info.category === 'kimlikle' || info.category === 'vizesiz';
}
