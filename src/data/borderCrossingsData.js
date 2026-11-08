// ==========================================
// BALKANLAR SINIR KAPILARI & KARAYOLU GEÇİŞ REHBERİ
// Canlı ipuçları, bekleme süreleri, evrak kontrolleri ve alternatif rotalar
// ==========================================

export const BORDER_CROSSINGS = [
  {
    id: 'srb-bih-kotroman',
    name: 'Sırbistan ↔ Bosna-Hersek (Kotroman / Vardište)',
    countries: ['Sırbistan', 'Bosna-Hersek'],
    route: 'Mokra Gora / Zlatibor ↔ Višegrad (Drina Köprüsü)',
    busyRating: 'Orta',
    avgWaitMin: '20 - 45 dk',
    bestHours: 'Sabah 08:00 - 10:00 veya Akşam 19:00 sonrası',
    tips: 'Višegrad ve Drina Köprüsü’ne en popüler geçiştir. Manzaralı dağ yoludur. Yeşil Kart sigortası ve araç ruhsatı mutlaka fiziki olarak sorulur.',
    alternative: 'Uvac / Rudo sınır kapısı daha sakindir ancak yolu biraz daha dar virajlıdır.'
  },
  {
    id: 'bih-mne-klobuk',
    name: 'Bosna-Hersek ↔ Karadağ (Klobuk / Ilino Brdo)',
    countries: ['Bosna-Hersek', 'Karadağ'],
    route: 'Trebinje ↔ Nikšić / Kotor',
    busyRating: 'Orta - Yoğun',
    avgWaitMin: '30 - 60 dk',
    bestHours: 'Erken sabah (07:30 - 09:00)',
    tips: 'Trebinje üzerinden Karadağ’a inen en düzgün asfalt yoldur. Yaz aylarında ve hafta sonları Kotor’a giden turistlerle yoğunlaşır.',
    alternative: 'Deleuša kapısı (Bileća üzerinden) yoğun saatlerde iyi bir alternatiftir.'
  },
  {
    id: 'mne-cro-debeli-brijeg',
    name: 'Karadağ ↔ Hırvatistan (Debeli Brijeg / Karasovići)',
    countries: ['Karadağ', 'Hırvatistan'],
    route: 'Kotor / Herceg Novi ↔ Dubrovnik',
    busyRating: 'Çok Yoğun (AB / Schengen Sınırı)',
    avgWaitMin: '60 - 180 dk',
    bestHours: 'Sabah 07:00 öncesi veya Gece 21:00 sonrası',
    tips: 'AB ve Schengen sınırıdır. Pasaportlar tek tek damgalanır ve bagaj kontrolü sıkıdır. Nisan ayında yaz kadar olmasa da hafta sonu turları kuyruk oluşturur.',
    alternative: 'Kobila / Vitaljina (Herceg Novi yarımada yolu) küçük araçlar için çok daha hızlıdır.'
  },
  {
    id: 'mne-alb-sukobin',
    name: 'Karadağ ↔ Arnavutluk (Sukobin / Muriqan)',
    countries: ['Karadağ', 'Arnavutluk'],
    route: 'Ulcinj ↔ İşkodra (Shkodër)',
    busyRating: 'Hızlı / Modern Ortak Kapı',
    avgWaitMin: '15 - 35 dk',
    bestHours: 'Günün büyük bölümünde akıcıdır',
    tips: 'Karadağ ve Arnavutluk polisinin tek bir kulübede birlikte çalıştığı ortak entegre sınır kapısıdır. Zaman kazandırır.',
    alternative: 'Hani i Hotit / Božaj (İşkodra Gölü’nün kuzeyinden Podgorica’ya bağlanan ana kapı).'
  },
  {
    id: 'alb-ksv-morina',
    name: 'Arnavutluk ↔ Kosova (Morina / Vërmica)',
    countries: ['Arnavutluk', 'Kosova'],
    route: 'Kukës / Tiran ↔ Prizren',
    busyRating: 'Çok Hızlı (Otoban Kapısı)',
    avgWaitMin: '10 - 20 dk',
    bestHours: 'Günün her saati rahat',
    tips: 'Millet Yolu (Rruga e Kombit) modern otoyolu üzerindedir. Genelde hızlı bir pasaport kontrolüyle geçilir. Prizren’e sadece 20 km mesafededir.',
    alternative: 'Ana kapı çok hızlı olduğu için alternatif aramaya gerek yoktur.'
  },
  {
    id: 'alb-mkd-qafethane',
    name: 'Arnavutluk ↔ Kuzey Makedonya (Qafë Thanë / Kjafasan)',
    countries: ['Arnavutluk', 'Kuzey Makedonya'],
    route: 'Elbasan ↔ Struga / Ohri',
    busyRating: 'Orta',
    avgWaitMin: '20 - 40 dk',
    bestHours: 'Sabah veya ikindi saatleri',
    tips: 'Ohri Gölü’nün batı girişidir. Dağ geçidi manzarası çok güzeldir. Makedonya tarafında otoyol çalışmaları devam etmektedir, hız limitlerine dikkat edin.',
    alternative: 'Tushemisht / Sveti Naum (Ohri’nin güneyindeki Aziz Naum Manastırı dibindeki küçük kapı, çok şirin ve sakindir).'
  },
  {
    id: 'srb-mkd-tabanovce',
    name: 'Sırbistan ↔ Kuzey Makedonya (Preševo / Tabanovce)',
    countries: ['Sırbistan', 'Kuzey Makedonya'],
    route: 'Niş / Belgrad ↔ Üsküp (E-75 Koridoru)',
    busyRating: 'Yoğun (Avrupa - Türkiye Gurbetçi Koridoru)',
    avgWaitMin: '30 - 75 dk',
    bestHours: 'Öğle saatleri (11:00 - 14:00)',
    tips: 'Batı Avrupa ile Türkiye/Yunanistan arasındaki ana transit otoyol kapısıdır. Ortak geçiş noktası projesi uygulanmaktadır.',
    alternative: 'Pelince / Prohor Pčinjski manastır kapısı tırlar için kapalı olup otomobiller için çok sakin bir kaçış noktasıdır.'
  },
  {
    id: 'mkd-grc-bogorodica',
    name: 'Kuzey Makedonya ↔ Yunanistan (Bogorodica / Evzoni)',
    countries: ['Kuzey Makedonya', 'Yunanistan'],
    route: 'Üsküp ↔ Selanik / Halkidiki',
    busyRating: 'Yoğun (Schengen Girişi)',
    avgWaitMin: '45 - 90 dk',
    bestHours: 'Sabah 08:00 öncesi',
    tips: 'Yunanistan Schengen bölgesine giriş noktasıdır. Biyometrik pasaport kontrolü yapılır. Yunanistan’a sigara ve et ürünleri sokma kısıtlamalarına dikkat edin.',
    alternative: 'Medžitlija / Niki kapısı (Manastır / Bitola üzerinden Selanik’e geçiş, genelde bombostur).'
  },
  {
    id: 'tur-bgr-kapikule',
    name: 'Türkiye ↔ Bulgaristan (Kapıkule / Kapitan Andreevo)',
    countries: ['Türkiye', 'Bulgaristan'],
    route: 'Edirne ↔ Sofya / Filibe',
    busyRating: 'Dünyanın En Yoğun 2. Kara Sınırı',
    avgWaitMin: '45 - 120 dk',
    bestHours: 'Salı - Çarşamba günleri, Gece yarısı 02:00 - 05:00',
    tips: 'Bulgaristan’a girer girmez sınır çıkışındaki makinelerden veya bgtoll.bg sitesinden haftalık e-Vignette (otoyol pulu) satın almayı kesinlikle unutmayın; kameralar anında ceza keser.',
    alternative: 'Hamzabeyli / Lesovo (kuzey yönü) veya Dereköy / Malko Tırnovo (Kırklareli üzeri, sadece küçük araçlar).'
  }
];

export const VIGNETTE_GUIDE = [
  {
    country: 'Bulgaristan',
    flag: '🇧🇬',
    type: 'Elektronik Vinyet (e-Vignette - BGTOLL)',
    price: 'Haftalık: ~13 BGN (7 €) / Hafta Sonu: ~9 BGN (5 €)',
    mandatory: 'Evet, tüm otoyol ve şehirlerarası ana yollarda zorunludur.',
    howToBuy: 'bgtoll.bg resmi sitesinden sınıra varmadan plakayı girerek online alınır.'
  },
  {
    country: 'Slovenya',
    flag: '🇸🇮',
    type: 'e-Vinjeta',
    price: 'Haftalık: 16 €',
    mandatory: 'Evet, otoyollara adım attığınız anda kameralar okur.',
    howToBuy: 'evinjeta.dars.si adresinden online alınır.'
  },
  {
    country: 'Kuzey Makedonya',
    flag: '🇲🇰',
    type: 'Gişe Sistemi (Pay Toll)',
    price: 'Gişe başı ~40 - 80 MKD (1 - 1.5 €)',
    mandatory: 'Otoyol gişelerinde nakit Euro, Makedon Dinarı veya temassız kredi kartı kabul edilir.',
    howToBuy: 'Önceden pul almanıza gerek yoktur, bariyerli gişede ödenir.'
  },
  {
    country: 'Sırbistan',
    flag: '🇷🇸',
    type: 'Gişe Sistemi (Naplatna Rampa)',
    price: 'Mesafe bazlı (Belgrad-Niş arası ~9 €)',
    mandatory: 'Girişte bilet alınır, çıkış gişesinde kart veya nakit Euro/Dinar ödenir.',
    howToBuy: 'Gişeden bilet alınarak kullanılır.'
  },
  {
    country: 'Bosna-Hersek',
    flag: '🇧🇦',
    type: 'Gişe Sistemi (Sadece A1 Otoyolu)',
    price: 'Kısa mesafeli (2 - 5 KM / 1 - 2.5 €)',
    mandatory: 'Ülke genelinde vinyet yoktur; sadece Saraybosna çevresindeki A1 otobanında gişede ödenir.',
    howToBuy: 'Gişede nakit BAM veya Euro ile ödenir.'
  },
  {
    country: 'Karadağ & Arnavutluk',
    flag: '🇲🇪',
    type: 'Genel Vinyet Yok',
    price: 'Ücretsiz ana yollar (Sadece Karadağ Sozina Tüneli 2.5 €)',
    mandatory: 'Karadağ ve Arnavutluk’ta genel vinyet zorunluluğu yoktur.',
    howToBuy: 'Gerekli değildir.'
  }
];
