// scripts/enrich-places-metadata.mjs
// Enriches public/data/places.json with:
// 1. Normalized canonical country names (cleaning composite regions & states from country field)
// 2. Realistic multi-stop flight times and Ankara distances
// 3. Accurate Turkish citizen passport visa status with MFA source attribution (Kasım 2026)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const placesPath = path.resolve(__dirname, '../public/data/places.json');

const ANKARA_COORDS = [39.9208, 32.8541];

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
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

// Canonical normalization for non-country names stored in country field
const CANONICAL_MAP = {
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
  'Fransız Polinezyası (Güney Pasifik)': 'Fransız Polinezyası',
  'Fransa (Réunion)': 'Fransa',
  'Grönland': 'Grönland',
  'Faroe Adaları': 'Faroe Adaları',
  'Danimarka (Faroe)': 'Faroe Adaları',
  'Stockholm (İsveç) & Kopenhag (Danimarka)': 'Finlandiya',
  'Exuma (Bahamalar) & Bridgetown (Barbados)': 'Bahamalar',
  'Guyana & Surinam': 'Guyana',
  'İsrail & Filistin': 'İsrail',
  'Peru–Bolivya': 'Peru',
  'Çin (Tibet)': 'Çin',
  'Rusya Uzak Doğusu': 'Rusya',
  'Kıbrıs & KKTC': 'KKTC',
  'Güney Afrika Cumhuriyeti': 'Güney Afrika'
};

const ID_SPECIFIC_MAP = {
  'nl-01': 'Hollanda',
  'nl-04': 'Hollanda',
  'be-03': 'Belçika',
  'w195-cy-1': 'KKTC',
  'wld-mtp-antarktika': 'Antarktika',
  'wld-mtp-palau-nan-madol': 'Palau',
  'wld-mtp-saint-helena-tristan': 'Saint Helena (BK)',
  'wld-af-victoria-selaleleri': 'Zambiya',
  'wld-ort-alula-umman': 'Suudi Arabistan',
  'wld-asya-nepal-tibet-everest': 'Nepal',
  'wld-asya-turkmenistan-kirgizistan': 'Kırgızistan',
  'wld-asya-singapur-gardens': 'Singapur',
  'wld-am-patagonya-torres-perito': 'Şili',
  'wld-av-iskandinavya-laponya-stockholm': 'Finlandiya',
  'wld-mtp4-uganda-ruanda-goriller': 'Uganda',
  'wld-mtp4-isvicre-bernina-como': 'İsviçre',
  'wld-mtp4-karayipler-stlucia-bahama': 'Bahamalar',
  'wld-mtp4-pasifik-vanuatu-fiji': 'Vanuatu',
  'w195-other-af1': 'Benin',
  'w195-other-af2': 'Cibuti',
  'w195-other-af3': 'Kongo'
};

const COUNTRY_VISA_INFO = {
  'Türkiye': { category: 'turkiye', label: 'Yurtiçi', duration: 'Sınırsız', notes: 'Kendi vatanın; pasaport veya vize gerekmez.' },
  'KKTC': { category: 'kimlikle', label: 'Kimlikle (90 Gün)', duration: '90 gün', notes: 'Yeni çipli T.C. Kimlik Kartı ile doğrudan pasaporta ihtiyaç duymadan girilir; pasaporta damga vurulmaz.' },
  'Gürcistan': { category: 'kimlikle', label: 'Kimlikle (1 Yıl)', duration: '365 gün', notes: 'Yeni çipli T.C. Kimlik Kartı ile vizesiz 1 yıl.' },
  'Azerbaycan': { category: 'kimlikle', label: 'Kimlikle (90 Gün)', duration: '90 gün', notes: 'Yeni çipli T.C. Kimlik Kartı ile vizesiz 90 gün.' },
  'Bosna-Hersek': { category: 'kimlikle', label: 'Kimlikle / Vizesiz (90 Gün)', duration: '90 gün', notes: 'Çipli kimlikle veya bordo pasaportla 90 gün vizesiz.' },
  'Sırbistan': { category: 'kimlikle', label: 'Kimlikle / Vizesiz (90 Gün)', duration: '90 gün', notes: 'Çipli kimlikle veya bordo pasaportla 90 gün vizesiz.' },
  'Moldova': { category: 'kimlikle', label: 'Kimlikle (90 Gün)', duration: '90 gün', notes: 'Yeni çipli T.C. Kimlik Kartı ile vizesiz 90 gün.' },
  'Ukrayna': {
    category: 'kimlikle',
    label: 'Kimlikle / Vizesiz (90 Gün)',
    duration: '90 gün',
    notes: 'Yeni çipli T.C. Kimlik Kartı ile vizesiz giriş protokolü mevcuttur. ⚠️ GÜVENLİK VE SEYAHAT UYARISI: Savaş ve olağanüstü hal nedeniyle Ukrayna hava sahası kapalıdır; yalnızca kara sınır kapılarından ulaşım sağlanmaktadır. Dışişleri Bakanlığı zorunlu olmadıkça seyahat edilmemesini tavsiye etmektedir.'
  },
  'Karadağ': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: 'Bordo pasaportla 90 gün vizesiz.' },
  'Arnavutluk': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: 'Bordo pasaportla 90 gün vizesiz.' },
  'Kuzey Makedonya': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: 'Bordo pasaportla 90 gün vizesiz.' },
  'Kosova': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: 'Bordo pasaportla 90 gün vizesiz.' },
  'Belarus': { category: 'vizesiz', label: 'Vizesiz (30 Gün)', duration: '30 gün', notes: 'Türkiye ile Belarus arasındaki anlaşma uyarınca bordo pasaportla 30 güne kadar vizesiz seyahat edilir.' },
  'Rusya': { category: 'vizesiz', label: 'Vizesiz / Karşılıklı Muafiyet', duration: '30-90 gün', notes: 'Karşılıklı anlaşmalar ve yürürlükteki turizm rejimi kapsamında vizesiz / kolaylaştırılmış e-vize rejimi geçerlidir.' },
  'İran': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: 'Türkiye ve İran arasındaki vize muafiyeti anlaşması gereği bordo pasaportla 90 güne kadar turistik amaçlı vizesiz seyahat edilir.' },
  'Japonya': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: 'Bordo pasaportla 90 gün turistik vizesiz.' },
  'Güney Kore': { category: 'vizesiz', label: 'Vizesiz / K-ETA', duration: '90 gün', notes: '90 gün vizesiz; K-ETA formu tavsiye edilir.' },
  'Singapur': { category: 'vizesiz', label: 'Vizesiz (30 Gün)', duration: '30 gün', notes: '30 gün vizesiz (SG Arrival Card).' },
  'Malezya': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Tayland': { category: 'vizesiz', label: 'Vizesiz (60 Gün)', duration: '60 gün', notes: '60 gün turistik vizesiz.' },
  'Özbekistan': { category: 'vizesiz', label: 'Vizesiz (30 Gün)', duration: '30 gün', notes: '30 gün vizesiz.' },
  'Kazakistan': { category: 'vizesiz', label: 'Vizesiz (30 Gün)', duration: '30 gün', notes: '30 gün vizesiz.' },
  'Kırgızistan': { category: 'vizesiz', label: 'Vizesiz (30 Gün)', duration: '30 gün', notes: '30 gün vizesiz.' },
  'Filipinler': { category: 'vizesiz', label: 'Vizesiz (30 Gün)', duration: '30 gün', notes: '30 gün vizesiz.' },
  'Moğolistan': { category: 'vizesiz', label: 'Vizesiz (30 Gün)', duration: '30 gün', notes: '30 gün vizesiz.' },
  'Brunei': { category: 'vizesiz', label: 'Vizesiz (30 Gün)', duration: '30 gün', notes: '30 gün vizesiz.' },
  'Katar': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Ürdün': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Lübnan': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: 'Havalimanında 90 gün vize muafiyeti.' },
  'Brezilya': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Arjantin': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Şili': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Kolombiya': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Peru': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Ekvador': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Bolivya': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Uruguay': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Paraguay': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Panama': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Kosta Rika': { category: 'vizesiz', label: 'Vizesiz (30 Gün)', duration: '30 gün', notes: '30 gün vizesiz.' },
  'Guatemala': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'El Salvador': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Honduras': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Nikaragua': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Fas': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Tunus': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Seyşeller': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Mauritius': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Güney Afrika': { category: 'vizesiz', label: 'Vizesiz (30 Gün)', duration: '30 gün', notes: '30 gün vizesiz.' },
  'Botsvana': { category: 'vizesiz', label: 'Vizesiz (90 Gün)', duration: '90 gün', notes: '90 gün vizesiz.' },
  'Bahamalar': { category: 'vizesiz', label: 'Vizesiz (8 Ay)', duration: '8 ay', notes: '8 aya kadar vizesiz.' },
  'Fiji': { category: 'vizesiz', label: 'Vizesiz (4 Ay)', duration: '4 ay', notes: '4 aya kadar vizesiz.' },
  'Maldivler': { category: 'vizesiz', label: 'Vizesiz / Kapıda', duration: '30 gün', notes: '30 gün kapıda ücretsiz vize.' },
  'Palau': { category: 'vizesiz', label: 'Vizesiz (30 Gün)', duration: '30 gün', notes: '30 gün ücretsiz giriş izni.' },

  // KAPIDA / E-VİZE
  'Endonezya': {
    category: 'kapi_evize',
    label: 'Kapıda Vize / e-VOA ($35)',
    duration: '30 gün',
    notes: 'Cakarta veya Bali Ngurah Rai Havalimanı’nda kapıda 500.000 IDR (~$35) karşılığı 30 günlük VoA (Visa on Arrival) veya online Molina e-VOA sistemi üzerinden alınır.'
  },
  'Irak': {
    category: 'kapi_evize',
    label: 'Kapıda Vize / e-Vize',
    duration: '15-30 gün',
    notes: 'Bağdat, Necef, Basra ve Erbil/Süleymaniye havalimanlarında turistik kapıda vize veya resmi online e-vize portalı üzerinden başvuru imkanı bulunmaktadır.'
  },
  'Mısır': { category: 'kapi_evize', label: 'Kapıda Vize ($25)', duration: '30 gün', notes: 'Havalimanında kapıda $25 etiket vize.' },
  'BAE': { category: 'kapi_evize', label: 'Kolay e-Vize', duration: '30 gün', notes: 'Online kolay e-Vize.' },
  'Suudi Arabistan': { category: 'kapi_evize', label: 'e-Vize / Kapıda', duration: '90 gün', notes: 'e-Vize veya kapıda self-servis vize.' },
  'Umman': { category: 'kapi_evize', label: 'Vizesiz (14G) / e-Vize', duration: '14 gün', notes: '14 gün vizesiz / e-vize.' },
  'Kamboçya': { category: 'kapi_evize', label: 'Kapıda / e-Vize ($30)', duration: '30 gün', notes: 'Kapıda $30 veya e-Vize.' },
  'Laos': { category: 'kapi_evize', label: 'Kapıda / e-Vize ($40)', duration: '30 gün', notes: 'Kapıda veya e-Vize.' },
  'Nepal': { category: 'kapi_evize', label: 'Kapıda Vize', duration: '15-90 gün', notes: 'Katmandu havalimanında kapıda vize.' },
  'Sri Lanka': { category: 'kapi_evize', label: 'Online ETA', duration: '30 gün', notes: 'Online ETA seyahat onayı.' },
  'Tanzanya': { category: 'kapi_evize', label: 'Kapıda / e-Vize ($50)', duration: '90 gün', notes: 'Kapıda veya resmi e-Vize.' },
  'Kenya': { category: 'kapi_evize', label: 'Online eTA ($35)', duration: '90 gün', notes: 'Elektronik seyahat izni (eTA).' },
  'Ruanda': { category: 'kapi_evize', label: 'Kapıda Vize ($50)', duration: '30 gün', notes: 'Kapıda $50 vize.' },
  'Uganda': { category: 'kapi_evize', label: 'Online e-Vize', duration: '90 gün', notes: 'Online e-vize.' },
  'Zambiya': { category: 'kapi_evize', label: 'Kapıda / KAZA Univisa', duration: '30 gün', notes: 'Victoria Şelaleleri için ortak KAZA Univisa.' },
  'Ermenistan': { category: 'kapi_evize', label: 'e-Vize / Kapıda', duration: '21-120 gün', notes: 'Kapıda veya e-Vize.' },
  'Madagaskar': { category: 'kapi_evize', label: 'Kapıda Vize', duration: '30 gün', notes: 'Havalimanında kapıda vize.' },
  'Vietnam': { category: 'kapi_evize', label: 'Online e-Vize ($25)', duration: '90 gün', notes: 'Online 90 günlük e-Vize.' },
  'Hindistan': { category: 'kapi_evize', label: 'Online e-Tourist Visa', duration: '30 gün - 1 yıl', notes: 'Online e-vize.' },
  'Tacikistan': { category: 'kapi_evize', label: 'Online e-Vize', duration: '60 gün', notes: 'Online e-vize.' },
  'Pakistan': { category: 'kapi_evize', label: 'Online e-Vize', duration: '90 gün', notes: 'Online e-vize.' },

  // SCHENGEN
  'Almanya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'Fransa': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'İtalya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'İspanya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen vizesi zorunludur. Yeşil pasaporta 90 gün vizesiz.' },
  'Yunanistan': { category: 'schengen', label: 'Schengen Şart (Adalarda Kapı)', duration: '90 gün', notes: 'Schengen zorunludur (adalarda kapı vizesi).' },
  'Hollanda': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen zorunludur.' },
  'Belçika': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen zorunludur.' },
  'İsviçre': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen alanındadır.' },
  'Avusturya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen zorunludur.' },
  'Çekya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen zorunludur.' },
  'Macaristan': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen zorunludur.' },
  'Polonya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen zorunludur.' },
  'Portekiz': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen zorunludur.' },
  'Hırvatistan': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen zorunludur.' },
  'Slovenya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen zorunludur.' },
  'Slovakya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen zorunludur.' },
  'Estonya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen zorunludur.' },
  'Letonya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen zorunludur.' },
  'Litvanya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen zorunludur.' },
  'Lüksemburg': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen zorunludur.' },
  'Malta': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen zorunludur.' },
  'Romanya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen veya ulusal vize.' },
  'Bulgaristan': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen veya ulusal vize.' },
  'Norveç': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen alanındadır.' },
  'İsveç': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen zorunludur.' },
  'Danimarka': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen zorunludur.' },
  'Finlandiya': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen zorunludur.' },
  'İzlanda': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen alanındadır.' },
  'Andorra': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'İspanya/Fransa üzerinden geçiş.' },
  'Monako': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen şart.' },
  'San Marino': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen şart.' },
  'Lihtenştayn': { category: 'schengen', label: 'Schengen Şart', duration: '90 gün', notes: 'Schengen şart.' },

  // ÖZERK / DENİZAŞIRI (SCHENGEN DIŞI)
  'Grönland': {
    category: 'vize_gerekli',
    label: 'Özel İzin Şart (Schengen Değil!)',
    duration: '90 gün',
    notes: '⚠️ DİKKAT: Danimarka’ya bağlıdır ancak SCHENGEN ALANINA DAHİL DEĞİLDİR! Standart Schengen vizesi ile girilemez. Danimarka Konsolosluğu’ndan pasaporta "Valid for Greenland" şerhli özel vize alınması zorunludur.'
  },
  'Faroe Adaları': {
    category: 'vize_gerekli',
    label: 'Özel İzin Şart (Schengen Değil!)',
    duration: '90 gün',
    notes: '⚠️ DİKKAT: Danimarka’ya bağlı özerk bölgedir ancak SCHENGEN DIŞINDADIR! Danimarka makamlarından "Valid for Faroe Islands" ibareli özel vize alınmalıdır.'
  },
  'Fransız Polinezyası': {
    category: 'vize_gerekli',
    label: 'Özel Denizaşırı İzni (Schengen Değil!)',
    duration: '90 gün',
    notes: '⚠️ DİKKAT: Fransa’nın Denizaşırı Toprağıdır (POM) ve SCHENGEN ALANI DIŞINDADIR! Standart Schengen vizesi geçmez; Fransa Konsolosluğu’ndan "Visa pour Territoire d’Outre-Mer (TOM)" alınmalıdır.'
  },

  // ÖZEL VİZE
  'ABD': { category: 'vize_gerekli', label: 'ABD Vizesi Şart (B1/B2)', duration: '10 yıl', notes: 'Konsolosluk mülakatı ile B1/B2 vizesi.' },
  'Birleşik Krallık': { category: 'vize_gerekli', label: 'İngiltere Vizesi Şart', duration: '6 ay', notes: 'UK Standard Visitor vizesi şarttır; Schengen geçmez.' },
  'İrlanda': { category: 'vize_gerekli', label: 'İrlanda Vizesi Şart', duration: '90 gün', notes: 'İrlanda konsolosluk vizesi şarttır.' },
  'Kanada': { category: 'vize_gerekli', label: 'Kanada Vizesi Şart', duration: 'Pasaport süresince', notes: 'Online başvuru + biyometri.' },
  'Avustralya': { category: 'vize_gerekli', label: 'Avustralya Vizesi Şart', duration: '3-12 ay', notes: 'Online ImmiAccount başvurusu.' },
  'Yeni Zelanda': { category: 'vize_gerekli', label: 'Yeni Zelanda Vizesi Şart', duration: '9 ay', notes: 'Online başvuru.' },
  'Çin': { category: 'vize_gerekli', label: 'Çin Vizesi Şart', duration: '30 gün', notes: 'Vize Başvuru Merkezi üzerinden.' },
  'Meksika': { category: 'vize_gerekli', label: 'SAE e-Onay / Vize', duration: '180 gün', notes: 'Online SAE belgesi (ABD vizesi varsa vizesiz).' },
  'Küba': { category: 'vize_gerekli', label: 'Küba Turist Kartı', duration: '90 gün', notes: 'Turist kartı alınarak girilir.' },
  'Cezayir': { category: 'vize_gerekli', label: 'Cezayir Vizesi Şart', duration: '30-90 gün', notes: 'Konsolosluk vizesi şarttır.' },
  'Antarktika': { category: 'turkiye', label: 'Vize Yok (Özel İzin)', duration: 'Sezonluk', notes: 'Antarktika sahipsizdir; çıkış yapılan Şili veya Arjantin Türk vatandaşlarına vizesizdir.' }
};

const VISA_BADGES = {
  turkiye: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  kimlikle: 'bg-teal-100 text-teal-800 border-teal-300',
  vizesiz: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  kapi_evize: 'bg-amber-100 text-amber-900 border-amber-300',
  schengen: 'bg-blue-100 text-blue-900 border-blue-300',
  vize_gerekli: 'bg-rose-100 text-rose-900 border-rose-300'
};

const VISA_ICONS = {
  turkiye: '🇹🇷',
  kimlikle: '🪪',
  vizesiz: '✈️',
  kapi_evize: '🎫',
  schengen: '🇪🇺',
  vize_gerekli: '🔒'
};

const places = JSON.parse(fs.readFileSync(placesPath, 'utf8'));

let weekendCount = 0;
let visaFreeCount = 0;

for (const p of places) {
  // 1. Normalize Country Field Cleanly
  const rawCountry = p.country || 'Türkiye';
  const cleanCountry = ID_SPECIFIC_MAP[p.id] || CANONICAL_MAP[rawCountry] || rawCountry;
  p.country = cleanCountry;

  // 2. Ankara Travel Info (with realistic multi-stop flights)
  if (p.coords && p.coords.length === 2) {
    const [lat, lng] = p.coords;
    const distKm = Math.round(haversine(ANKARA_COORDS[0], ANKARA_COORDS[1], lat, lng));
    const isTr = p.country === 'Türkiye' || !p.country;

    let driveMinutes = 0;
    let driveText = '';
    let flightText = null;
    let trainText = null;

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
    }

    const cityName = (p.city || '').toLowerCase();
    const subRegionName = (p.subRegion || '').toLowerCase();
    const placeName = (p.name || '').toLowerCase();

    for (const [key, val] of Object.entries(YHT_DESTINATIONS)) {
      if (cityName.includes(key) || subRegionName.includes(key)) {
        trainText = `YHT ile ${val.time}`;
        break;
      }
    }

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
      // REALISTIC ABROAD MULTI-STOP MODEL
      if (['Peru', 'Bolivya', 'Ekvador', 'Şili', 'Arjantin', 'Kolombiya', 'Brezilya', 'Uruguay', 'Paraguay', 'Guyana'].includes(cleanCountry)) {
        if (placeName.includes('machu picchu') || placeName.includes('cusco') || cityName.includes('cusco')) {
          flightText = '~22 - 26 sa (2+ aktarma: Lima & Cusco)';
        } else if (placeName.includes('patagonya') || cityName.includes('calafate') || cityName.includes('natales')) {
          flightText = '~24 - 28 sa (2+ aktarma: Buenos Aires & El Calafate)';
        } else if (placeName.includes('galapagos')) {
          flightText = '~22 - 26 sa (2 aktarma: Guayaquil & Baltra)';
        } else {
          flightText = '~18 - 24 sa (1-2 aktarma)';
        }
      } else if (['Avustralya', 'Yeni Zelanda', 'Fiji', 'Vanuatu', 'Palau', 'Fransız Polinezyası'].includes(cleanCountry) || placeName.includes('rapa nui')) {
        if (placeName.includes('rapa nui') || placeName.includes('paskalya')) {
          flightText = '~30 - 36 sa (2-3 aktarma: Santiago & Paskalya)';
        } else if (cleanCountry === 'Fransız Polinezyası' || placeName.includes('bora bora') || placeName.includes('tahiti')) {
          flightText = '~28 - 34 sa (2-3 aktarma: LAX & Papeete)';
        } else if (cleanCountry === 'Yeni Zelanda') {
          flightText = '~24 - 28 sa (2 aktarma)';
        } else if (cleanCountry === 'Avustralya') {
          flightText = '~20 - 24 sa (1-2 aktarma)';
        } else {
          flightText = '~26 - 32 sa (2-3 aktarma)';
        }
      } else if (cleanCountry === 'Antarktika') {
        flightText = '~30+ sa (Buenos Aires + Ushuaia + Keşif Gemisi)';
      } else if (cleanCountry === 'Grönland') {
        flightText = '~14 - 18 sa (Kopenhag & Kangerlussuaq aktarmalı)';
      } else if (placeName.includes('svalbard')) {
        flightText = '~12 - 16 sa (Oslo & Longyearbyen aktarmalı)';
      } else if (cleanCountry === 'ABD' || cleanCountry === 'Kanada') {
        if (cityName.includes('hawaii') || placeName.includes('hawaii')) {
          flightText = '~22 - 26 sa (2 aktarma)';
        } else if (cityName.includes('san francisco') || cityName.includes('los angeles') || cityName.includes('kaliforniya') || cityName.includes('las vegas')) {
          flightText = '~15 - 18 sa (1 aktarma)';
        } else {
          flightText = '~11 - 13 sa (1 aktarma veya direkt)';
        }
      } else if (['Meksika', 'Küba', 'Bahamalar', 'Kosta Rika', 'Panama', 'Guatemala', 'Dominik Cumhuriyeti', 'Jamaika'].includes(cleanCountry)) {
        flightText = '~16 - 22 sa (1-2 aktarma)';
      } else if (cleanCountry === 'Japonya' || cleanCountry === 'Güney Kore') {
        flightText = '~11 - 14 sa (1 aktarma)';
      } else if (cleanCountry === 'Endonezya') {
        if (cityName.includes('bali') || placeName.includes('bali')) {
          flightText = '~15 - 18 sa (1-2 aktarma: Doha/Dubai & Bali)';
        } else {
          flightText = '~13 - 16 sa (1 aktarma)';
        }
      } else if (['Tayland', 'Vietnam', 'Singapur', 'Malezya', 'Filipinler', 'Kamboçya', 'Laos', 'Çin'].includes(cleanCountry)) {
        flightText = '~10 - 14 sa (1 aktarma)';
      } else if (['Hindistan', 'Nepal', 'Sri Lanka', 'Pakistan', 'Bangladeş', 'Bhutan'].includes(cleanCountry)) {
        flightText = '~8 - 12 sa (1 aktarma)';
      } else if (['Özbekistan', 'Kazakistan', 'Kırgızistan', 'Tacikistan', 'Türkmenistan', 'Moğolistan'].includes(cleanCountry)) {
        flightText = '~5 - 8 sa (direkt / 1 aktarma)';
      } else if (['Güney Afrika', 'Botsvana', 'Namibya', 'Zambiya', 'Zimbabve', 'Madagaskar', 'Mauritius', 'Seyşeller', 'Kongo', 'Benin', 'Cibuti'].includes(cleanCountry)) {
        flightText = '~12 - 17 sa (1-2 aktarma)';
      } else if (['Kenya', 'Tanzanya', 'Uganda', 'Ruanda', 'Etiyopya'].includes(cleanCountry)) {
        flightText = '~8 - 12 sa (1 aktarma)';
      } else if (['Mısır', 'Tunus', 'Fas', 'Cezayir'].includes(cleanCountry)) {
        flightText = '~2.5 - 5 sa (direkt / 1 aktarma)';
      } else if (['BAE', 'Katar', 'Umman', 'Suudi Arabistan', 'Lübnan', 'Ürdün', 'İsrail', 'Kuveyt', 'Bahreyn', 'Irak', 'İran'].includes(cleanCountry)) {
        flightText = '~2.5 - 4.5 sa (direkt / 1 aktarma)';
      } else if (['Yunanistan', 'Bulgaristan', 'Sırbistan', 'Bosna-Hersek', 'Karadağ', 'Arnavutluk', 'Kuzey Makedonya', 'Kosova', 'Romanya', 'Gürcistan', 'Azerbaycan', 'KKTC'].includes(cleanCountry)) {
        flightText = '~1.5 - 2.5 sa (direkt / 1 aktarma)';
      } else if (['Norveç', 'İsveç', 'Danimarka', 'Finlandiya', 'İzlanda', 'Faroe Adaları'].includes(cleanCountry)) {
        flightText = '~4.5 - 6.5 sa (1 aktarma)';
      } else {
        flightText = '~3 - 4.5 sa (direkt / 1 aktarma)';
      }
    }

    const isWeekendEscape = isTr && driveMinutes > 0 && driveMinutes <= 270 && distKm >= 15;
    if (isWeekendEscape) weekendCount++;

    let summaryParts = [];
    if (trainText) summaryParts.push(trainText);
    if (driveText && (!trainText || driveMinutes <= 180)) summaryParts.push(driveText);
    if (flightText && !trainText && driveMinutes > 240) summaryParts.push(flightText);
    if (summaryParts.length === 0) {
      if (flightText) summaryParts.push(flightText);
      else if (driveText) summaryParts.push(driveText);
    }
    const summaryText = summaryParts.join(' · ');

    p.ankaraDistance = {
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

  // 3. Turkish Passport Visa Info
  const visaMeta = COUNTRY_VISA_INFO[cleanCountry] || {
    category: 'vize_gerekli',
    label: 'Vize Şart',
    duration: 'Değişken',
    notes: `${cleanCountry} için konsolosluk veya e-vize şartlarını kontrol ediniz.`
  };

  const isVisaFree = visaMeta.category === 'turkiye' || visaMeta.category === 'kimlikle' || visaMeta.category === 'vizesiz';
  if (isVisaFree) visaFreeCount++;

  p.visaStatus = {
    category: visaMeta.category,
    label: visaMeta.label,
    badgeClass: VISA_BADGES[visaMeta.category] || VISA_BADGES.vize_gerekli,
    icon: VISA_ICONS[visaMeta.category] || '🔒',
    isVisaFree,
    duration: visaMeta.duration,
    notes: visaMeta.notes,
    source: 'Kaynak: T.C. Dışişleri Bakanlığı (mfa.gov.tr) & konsolosluk.gov.tr · Kontrol: Kasım 2026'
  };
}

fs.writeFileSync(placesPath, JSON.stringify(places, null, 2), 'utf8');

console.log(`✅ Successfully enriched and normalized ${places.length} places!`);
console.log(`🚗 Hafta Sonu Kaçamağı: ${weekendCount} mekan`);
console.log(`🛂 Vizesiz (Türkiye + Kimlikle + Bordo Pasaport): ${visaFreeCount} mekan`);
