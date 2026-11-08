// src/data/countryIntelData.js
// Practical traveler intelligence for countries (currency, plug types, tipping, emergencies, time diff, local tips)

import { CANONICAL_COUNTRY_MAP } from './visaData';

export const COUNTRY_INTEL = {
  'Türkiye': {
    country: 'Türkiye',
    flag: '🇹🇷',
    capital: 'Ankara',
    currency: { code: 'TRY', symbol: '₺', name: 'Türk Lirası' },
    plug: {
      types: ['C', 'F'],
      voltage: '230V / 50Hz',
      needsAdapter: false,
      summary: 'Standart Avrupa / Türkiye fişleri. Adaptör gerekmez.'
    },
    tipping: 'Restoranlarda %10 yaygın ve makbuldür; esnaf ve taksilerde para üstü bırakmak nezakettendir.',
    emergency: { general: '112', police: '112', ambulance: '112' },
    timeDiff: '0 saat (Referans Saat Dilimi UTC+3)',
    drivingSide: 'Sağ',
    waterDrinkable: 'Büyük şehirlerde şebeke suyu genellikle içilmez, arıtma veya damacana tercih edilir.',
    phrases: [
      { tr: 'Merhaba', local: 'Merhaba', phonetic: 'Merhaba' },
      { tr: 'Teşekkürler', local: 'Teşekkür ederim / Sağ olun', phonetic: 'Teşekkür ederim' },
      { tr: 'Lütfen', local: 'Lütfen', phonetic: 'Lütfen' },
      { tr: 'Hesap lütfen', local: 'Hesap lütfen', phonetic: 'Hesap lütfen' },
      { tr: 'Evet / Hayır', local: 'Evet / Hayır', phonetic: 'Evet / Hayır' }
    ],
    localTips: 'Camilere girerken ayakkabılar çıkarılır. Çay ikramı geri çevrilmez, samimiyet göstergesidir.'
  },

  'İtalya': {
    country: 'İtalya',
    flag: '🇮🇹',
    capital: 'Roma',
    currency: { code: 'EUR', symbol: '€', name: 'Euro', approxTry: '~47 ₺' },
    plug: {
      types: ['C', 'F', 'L'],
      voltage: '230V / 50Hz',
      needsAdapter: false,
      summary: 'Standart C ve F tipi Türk fişleri doğrudan uyar. İnce 3 delikli L tipi prizlere de 2 dişli fişler takılabilir.'
    },
    tipping: 'Zorunlu değildir; hesapta "Coperto" (kuver ücreti) zaten yer alır. Beğendiyseniz masaya €1–2 bozukluk bırakmak yeterlidir.',
    emergency: { general: '112', police: '113', ambulance: '118' },
    timeDiff: '-1 saat (İtalya, Türkiye’den 1 saat geridedir)',
    drivingSide: 'Sağ',
    waterDrinkable: 'Musluk suyu ("Acqua potabile") ve sokak çeşmeleri (Roma’daki Nasoni çeşmeleri) son derece temiz ve içilebilir.',
    phrases: [
      { tr: 'Merhaba / İyi günler', local: 'Ciao / Buongiorno', phonetic: 'Çao / Buconcorno' },
      { tr: 'Teşekkür ederim', local: 'Grazie mille', phonetic: 'Gratsye mille' },
      { tr: 'Lütfen', local: 'Per favore', phonetic: 'Per favore' },
      { tr: 'Hesap lütfen', local: 'Il conto, per favore', phonetic: 'İl konto, per favore' },
      { tr: 'Evet / Hayır', local: 'Sì / No', phonetic: 'Si / No' }
    ],
    localTips: 'Saat 11:00’den sonra cappuccino sipariş etmek İtalyanlara garip gelir, yemek sonrası sadece espresso ("un caffè") içilir. Tarihi şehir merkezlerindeki ZTL (sınırlı trafik) alanlarına araçla girmeyin, ağır ceza yazılır.'
  },

  'İspanya': {
    country: 'İspanya',
    flag: '🇪🇸',
    capital: 'Madrid',
    currency: { code: 'EUR', symbol: '€', name: 'Euro', approxTry: '~47 ₺' },
    plug: {
      types: ['C', 'F'],
      voltage: '230V / 50Hz',
      needsAdapter: false,
      summary: 'Türkiye ile birebir aynı prizler (Tip C ve F). Adaptör gerekmez.'
    },
    tipping: 'Zorunlu değildir. Barlarda bozuk para üstü, iyi restoranlarda %5-10 bırakılabilir.',
    emergency: { general: '112', police: '091', ambulance: '061' },
    timeDiff: '-1 saat (İspanya, Türkiye’den 1 saat geridedir; Kanarya Adaları -2 saat)',
    drivingSide: 'Sağ',
    waterDrinkable: 'Madrid ve kuzeyde musluk suyu çok kalitelidir. Sahil ve adalarda (Barselona, Valensiya) şişe su tercih edilir.',
    phrases: [
      { tr: 'Merhaba / İyi günler', local: 'Hola / Buenos días', phonetic: 'Ola / Buenos diyas' },
      { tr: 'Teşekkürler', local: 'Muchas gracias', phonetic: 'Muças grasyas' },
      { tr: 'Lütfen', local: 'Por favor', phonetic: 'Por favor' },
      { tr: 'Hesap lütfen', local: 'La cuenta, por favor', phonetic: 'La kuenta, por favor' },
      { tr: 'Evet / Hayır', local: 'Sí / No', phonetic: 'Si / No' }
    ],
    localTips: 'Akşam yemekleri Türkiye’den bile geç yenir (genellikle 21:00–23:00 arası). Öğle saatleri (14:00–17:00) siesta nedeniyle küçük dükkanlar kapalı olabilir.'
  },

  'Fransa': {
    country: 'Fransa',
    flag: '🇫🇷',
    capital: 'Paris',
    currency: { code: 'EUR', symbol: '€', name: 'Euro', approxTry: '~47 ₺' },
    plug: {
      types: ['C', 'E'],
      voltage: '230V / 50Hz',
      needsAdapter: false,
      summary: 'Tip E prizlerde toprak çıkıntısı bulunur; standart Türk tipi topraklı fişlerin ortasında delik olduğu için doğrudan uyar.'
    },
    tipping: 'Yasalar gereği hesapta %15 servis ("Service compris") dahildir. Memnun kaldıysanız €1-2 bırakılabilir.',
    emergency: { general: '112', police: '17', ambulance: '15' },
    timeDiff: '-1 saat (Fransa, Türkiye’den 1 saat geridedir)',
    drivingSide: 'Sağ',
    waterDrinkable: 'Musluk suyu ("Eau de robinet") temiz ve lezzetlidir. Restoranlarda ücretsiz sürahi su istemek için "Une carafe d’eau, s’il vous plaît" diyebilirsiniz.',
    phrases: [
      { tr: 'Merhaba / İyi günler', local: 'Bonjour', phonetic: 'Bonjur' },
      { tr: 'Teşekkür ederim', local: 'Merci beaucoup', phonetic: 'Mersi boku' },
      { tr: 'Lütfen', local: 'S’il vous plaît', phonetic: 'Sil vu ple' },
      { tr: 'Hesap lütfen', local: 'L’addition, s’il vous plaît', phonetic: 'Ladisyon, sil vu ple' },
      { tr: 'Evet / Hayır', local: 'Oui / Non', phonetic: 'Vi / Non' }
    ],
    localTips: 'Bir dükkana veya restorana girerken mutlaka "Bonjour" demek şarttır; selam vermeden soru sormak kabalık kabul edilir.'
  },

  'Almanya': {
    country: 'Almanya',
    flag: '🇩🇪',
    capital: 'Berlin',
    currency: { code: 'EUR', symbol: '€', name: 'Euro', approxTry: '~47 ₺' },
    plug: {
      types: ['C', 'F'],
      voltage: '230V / 50Hz',
      needsAdapter: false,
      summary: 'Schuko tipi prizler (Tip F). Türkiye fişleriyle %100 uyumlu.'
    },
    tipping: '%5-10 arası bahşiş ("Trinkgeld") beklenir. Bahşiş masaya bırakılmaz; ödeme yaparken toplam yuvarlanarak söylenir (örn. hesap €18.50 ise garsona "€20 machen, bitte" denir).',
    emergency: { general: '112', police: '110', ambulance: '112' },
    timeDiff: '-1 saat (Almanya, Türkiye’den 1 saat geridedir)',
    drivingSide: 'Sağ',
    waterDrinkable: 'Musluk suyu ("Leitungswasser") son derece sıkı denetlenir ve mükemmel içim kalitesine sahiptir.',
    phrases: [
      { tr: 'Merhaba / İyi günler', local: 'Hallo / Guten Tag', phonetic: 'Halo / Guten Tag' },
      { tr: 'Çok teşekkürler', local: 'Vielen Dank', phonetic: 'Filın Dank' },
      { tr: 'Lütfen', local: 'Bitte', phonetic: 'Bite' },
      { tr: 'Hesap lütfen', local: 'Die Rechnung, bitte', phonetic: 'Di Rehnung, bite' },
      { tr: 'Evet / Hayır', local: 'Ja / Nein', phonetic: 'Ya / Nayn' }
    ],
    localTips: 'Pazar günleri neredeyse tüm süpermarketler ve dükkanlar kapalıdır (sadece havalimanı/ana tren istasyonu açar). Nakit para hala pek çok fırın ve kafede karttan daha çok sevilir.'
  },

  'Birleşik Krallık': {
    country: 'Birleşik Krallık',
    flag: '🇬🇧',
    capital: 'Londra',
    currency: { code: 'GBP', symbol: '£', name: 'İngiliz Sterlini', approxTry: '~56 ₺' },
    plug: {
      types: ['G'],
      voltage: '230V / 50Hz',
      needsAdapter: true,
      summary: '⚠️ Tip G (3 kalın dikdörtgen dişli İngiliz prizi). Türkiye fişleri için MUTLAKA adaptör gerekir!'
    },
    tipping: 'Çoğu restoranda faturaya %12.5 opsiyonel servis ücreti eklenir. Eklenmemişse %10-12 bahşiş verilir. Publarda bara gidip sipariş verilir, barda bahşiş verilmez.',
    emergency: { general: '999 veya 112', police: '999', ambulance: '999' },
    timeDiff: '-2 saat (İngiltere, Türkiye’den 2 saat geridedir)',
    drivingSide: 'Sol (Trafik soldan akar, karşıdan karşıya geçerken önce SAĞA bakın!)',
    waterDrinkable: 'Musluk suyu içilebilir ve güvenlidir.',
    phrases: [
      { tr: 'Merhaba', local: 'Hello / Cheers', phonetic: 'Helo / Çiyırs' },
      { tr: 'Teşekkürler', local: 'Thank you very much', phonetic: 'Tenk yu veri maç' },
      { tr: 'Özür dilerim / Afedersiniz', local: 'Sorry / Excuse me', phonetic: 'Sori / Ekskyuz mi' },
      { tr: 'Hesap lütfen', local: 'The bill, please', phonetic: 'Dı bil, pliiz' },
      { tr: 'Evet / Hayır', local: 'Yes / No', phonetic: 'Yes / No' }
    ],
    localTips: 'Yürüyen merdivenlerde daima SAĞDA durulur, sol taraf yürüyenlere bırakılır. Sıraya girmek ("queuing") kutsaldır, asla sıra atlamayın.'
  },

  'Yunanistan': {
    country: 'Yunanistan',
    flag: '🇬🇷',
    capital: 'Atina',
    currency: { code: 'EUR', symbol: '€', name: 'Euro', approxTry: '~47 ₺' },
    plug: {
      types: ['C', 'F'],
      voltage: '230V / 50Hz',
      needsAdapter: false,
      summary: 'Türkiye fişleriyle birebir aynı prizler. Adaptör gerekmez.'
    },
    tipping: '%5-10 civarı veya bozuk parayı yuvarlamak adettendir.',
    emergency: { general: '112', police: '100', ambulance: '166' },
    timeDiff: '0 saat veya kışın -1 saat (Yunanistan AB yaz/kış saatine tabidir)',
    drivingSide: 'Sağ',
    waterDrinkable: 'Atina ve Selanik’te musluk suyu içilebilir. Ege ve İyon adalarında tuzlu arıtma suyu olduğundan şişe su önerilir.',
    phrases: [
      { tr: 'Merhaba', local: 'Yassas / Kalimera', phonetic: 'Yasas / Kalimera' },
      { tr: 'Teşekkür ederim', local: 'Efharisto', phonetic: 'Efharisto' },
      { tr: 'Lütfen / Rica ederim', local: 'Parakalo', phonetic: 'Parakalo' },
      { tr: 'Hesap lütfen', local: 'Ton logariasmo, parakalo', phonetic: 'Ton logaryazmo, parakalo' },
      { tr: 'Evet / Hayır', local: 'Nai (Evet!) / Ochi (Hayır)', phonetic: 'Ne (Evet!) / Ohi (Hayır)' }
    ],
    localTips: '⚠️ Dikkat: Yunanca "Nai" (Ne diye okunur) EVET demektir; "Ochi" (Ohi) HAYIR demektir! Kafa karıştırmasın.'
  },

  'Japonya': {
    country: 'Japonya',
    flag: '🇯🇵',
    capital: 'Tokyo',
    currency: { code: 'JPY', symbol: '¥', name: 'Japon Yeni', approxTry: '100 ¥ ~25 ₺' },
    plug: {
      types: ['A', 'B'],
      voltage: '100V / 50-60Hz',
      needsAdapter: true,
      summary: '⚠️ Tip A/B (2 düz paralel dişli priz, 100V). Türk fişleri için adaptör ŞARTTIR. Cihazınızın adaptöründe 100-240V yazdığından emin olun.'
    },
    tipping: '❌ KESİNLİKLE BAHŞİŞ VERİLMEZ! Bahşiş vermek hakaret veya kabalık sayılır; masaya para bırakırsanız garson peşinizden koşup paranızı unuttunuz diye geri verir.',
    emergency: { general: '110 (Polis) / 119 (Ambulans & İtfaiye)', police: '110', ambulance: '119' },
    timeDiff: '+6 saat (Japonya, Türkiye’den 6 saat ileridedir)',
    drivingSide: 'Sol (Trafik soldan akar)',
    waterDrinkable: 'Musluk suyu dünyadaki en temiz sulardandır, güvenle içebilirsiniz.',
    phrases: [
      { tr: 'Merhaba', local: 'Konnichiwa', phonetic: 'Koniçiva' },
      { tr: 'Çok teşekkürler', local: 'Arigatou gozaimasu', phonetic: 'Arigato gozaymas' },
      { tr: 'Lütfen / Afedersiniz', local: 'Sumimasen', phonetic: 'Sumimasen' },
      { tr: 'Hesap lütfen', local: 'O-kaikei kudasai', phonetic: 'O-kaykey kudasay' },
      { tr: 'Lezzetli!', local: 'Oishii!', phonetic: 'Oyşi!' }
    ],
    localTips: 'Toplu taşımada telefonla konuşmak yasaktır. Sokaklarda neredeyse hiç çöp kutusu yoktur; çöpünüzü otelinize veya çantanıza taşımanız beklenir. Yürürken bir şeyler yemek hoş karşılanmaz.'
  },

  'Bosna-Hersek': {
    country: 'Bosna-Hersek',
    flag: '🇧🇦',
    capital: 'Saraybosna',
    currency: { code: 'BAM', symbol: 'KM', name: 'Bosna Markı (KM)', approxTry: '1 KM ~24 ₺ (1 EUR = 1.95583 KM sabit kur)' },
    plug: {
      types: ['C', 'F'],
      voltage: '230V / 50Hz',
      needsAdapter: false,
      summary: 'Türkiye ile aynı prizler. Adaptör gerekmez.'
    },
    tipping: '%10 civarı bahşiş oldukça makbuldür.',
    emergency: { general: '112', police: '122', ambulance: '124' },
    timeDiff: '-1 veya -2 saat (Mevsime göre)',
    drivingSide: 'Sağ',
    waterDrinkable: 'Saraybosna ve Mostar’da tarihi Osmanlı se २०१l çeşmelerinden ("Sebilj") buz gibi dağ suyu akar, gönül rahatlığıyla içilir.',
    phrases: [
      { tr: 'Merhaba', local: 'Dobar dan', phonetic: 'Dobar dan' },
      { tr: 'Teşekkürler', local: 'Hvala', phonetic: 'Hvala' },
      { tr: 'Lütfen', local: 'Molim', phonetic: 'Molim' },
      { tr: 'Hesap lütfen', local: 'Račun, molim', phonetic: 'Račun, molim' },
      { tr: 'Evet / Hayır', local: 'Da / Ne', phonetic: 'Da / Ne' }
    ],
    localTips: 'Boşnak kahvesi lokum ve su ile servis edilir. Köpüğü kaşıkla fincana aktarılır, telvesi içilmez. Euro hemen hemen her turistik dükkanda 1€ = 2 KM oranıyla kabul edilir.'
  },

  'Sırbistan': {
    country: 'Sırbistan',
    flag: '🇷🇸',
    capital: 'Belgrad',
    currency: { code: 'RSD', symbol: 'din', name: 'Sırp Dinarı', approxTry: '100 RSD ~40 ₺' },
    plug: {
      types: ['C', 'F'],
      voltage: '230V / 50Hz',
      needsAdapter: false,
      summary: 'Türkiye fişleriyle tam uyumlu.'
    },
    tipping: '%10 bahşiş restoranda standarttır.',
    emergency: { general: '112', police: '192', ambulance: '194' },
    timeDiff: '-1 veya -2 saat',
    drivingSide: 'Sağ',
    waterDrinkable: 'Musluk suyu içilebilir.',
    phrases: [
      { tr: 'Merhaba', local: 'Dobar dan / Zdravo', phonetic: 'Dobar dan / Zdravo' },
      { tr: 'Teşekkür ederim', local: 'Hvala lepo', phonetic: 'Hvala lepo' },
      { tr: 'Lütfen', local: 'Molim', phonetic: 'Molim' },
      { tr: 'Hesap lütfen', local: 'Račun, molim', phonetic: 'Račun, molim' },
      { tr: 'Şerefe!', local: 'Živeli!', phonetic: 'Jiveli!' }
    ],
    localTips: 'Belgrad’da taksiye binerken sokaktan rastgele çevirmek yerine CarGo veya Yandex Go uygulaması kullanın; taksi dolandırıcılığının önüne geçersiniz.'
  },

  'Karadağ': {
    country: 'Karadağ',
    flag: '🇲🇪',
    capital: 'Podgorica',
    currency: { code: 'EUR', symbol: '€', name: 'Euro', approxTry: '~47 ₺' },
    plug: {
      types: ['C', 'F'],
      voltage: '230V / 50Hz',
      needsAdapter: false,
      summary: 'Türkiye fişleriyle tam uyumlu.'
    },
    tipping: 'Restoranlarda %10 bahşiş yaygındır.',
    emergency: { general: '112', police: '122', ambulance: '124' },
    timeDiff: '-1 veya -2 saat',
    drivingSide: 'Sağ',
    waterDrinkable: 'Musluk suyu içilebilir.',
    phrases: [
      { tr: 'Merhaba', local: 'Dobar dan', phonetic: 'Dobar dan' },
      { tr: 'Teşekkür ederim', local: 'Hvala puno', phonetic: 'Hvala puno' },
      { tr: 'Lütfen', local: 'Molim vas', phonetic: 'Molim vas' },
      { tr: 'Hesap lütfen', local: 'Račun, molim', phonetic: 'Račun, molim' },
      { tr: 'Evet / Hayır', local: 'Da / Ne', phonetic: 'Da / Ne' }
    ],
    localTips: 'Kotor Körfezi virajlı ve dar yollara sahiptir; araç kiraladıysanız acele etmeden körfez manzarası eşliğinde sürün.'
  },

  'Mısır': {
    country: 'Mısır',
    flag: '🇪🇬',
    capital: 'Kahire',
    currency: { code: 'EGP', symbol: 'E£', name: 'Mısır Lirası', approxTry: '100 E£ ~95 ₺' },
    plug: {
      types: ['C', 'F'],
      voltage: '220V / 50Hz',
      needsAdapter: false,
      summary: 'Standart C ve F tipi prizler kullanılır.'
    },
    tipping: '⚠️ "Bahşiş" kültürü gündelik hayatın temelidir. Bavul taşıyandan tuvalet görevlisine, taksiciden garsona kadar herkes küçük bir bahşiş bekler (5-20 EGP bozukluk hazır bulundurun).',
    emergency: { general: '122 (Polis) / 123 (Ambulans)', police: '122', ambulance: '123' },
    timeDiff: '0 veya -1 saat',
    drivingSide: 'Sağ',
    waterDrinkable: '❌ Asla musluk suyu içmeyin, dişlerinizi dahi şişe suyuyla fırçalayın. Buzlu içeceklerden kaçının.',
    phrases: [
      { tr: 'Merhaba', local: 'Selamün Aleyküm / Ahlan', phonetic: 'Ahlen' },
      { tr: 'Teşekkürler', local: 'Şükran', phonetic: 'Şükran' },
      { tr: 'İstemiyorum / Gerek yok', local: 'La, şükran', phonetic: 'La, şükran' },
      { tr: 'Hesap lütfen', local: 'El-hisab, min fadlak', phonetic: 'El-hisab, min fadlak' },
      { tr: 'Yavaş / Sakin', local: 'Şüveyye şüveyye', phonetic: 'Şüveyye şüveyye' }
    ],
    localTips: 'Piramitler çevresinde deveye veya ata binmeden önce mutlaka pazarlık yapıp toplam fiyatta (iniş ücreti dahil!) netleşin. Israrcı satıcılara net bir şekilde "La, şükran" deyin.'
  },

  'ABD': {
    country: 'ABD',
    flag: '🇺🇸',
    capital: 'Washington, D.C.',
    currency: { code: 'USD', symbol: '$', name: 'Amerikan Doları', approxTry: '~43 ₺' },
    plug: {
      types: ['A', 'B'],
      voltage: '120V / 60Hz',
      needsAdapter: true,
      summary: '⚠️ Tip A/B (2 düz paralel uçlu priz, 120V). Türk fişleri için adaptör ŞARTTIR.'
    },
    tipping: '⚠️ Restoranlarda bahşiş neredeyse ZORUNLUDUR (%18 - %22 standart kabul edilir; %15 altı memnuniyetsizlik göstergesidir). Taksilerde %15-20, barlarda içki başına $1-2 verilir.',
    emergency: { general: '911', police: '911', ambulance: '911' },
    timeDiff: '-7 ila -10 saat (New York UTC-5, Los Angeles UTC-8)',
    drivingSide: 'Sağ (Kırmızı ışıkta aksine tabela yoksa sağa dönülebilir: "Right turn on red")',
    waterDrinkable: 'Musluk suyu içilebilir ve güvenlidir.',
    phrases: [
      { tr: 'Merhaba', local: 'Hello / Hi there', phonetic: 'Hay der' },
      { tr: 'Teşekkürler', local: 'Thanks a lot', phonetic: 'Tenks e lot' },
      { tr: 'Hesap lütfen', local: 'Check, please', phonetic: 'Çek, pliiz' },
      { tr: 'Paket yapabilir misiniz?', local: 'To go / Box, please', phonetic: 'Tu go' },
      { tr: 'Afedersiniz', local: 'Excuse me', phonetic: 'Ekskyuz mi' }
    ],
    localTips: 'Etiket fiyatlarına eyalet vergisi ("Sales Tax") dahil DEĞİLDİR; kasada ödeyeceğiniz tutar etiketten %6-10 daha yüksek olacaktır.'
  },

  'Gürcistan': {
    country: 'Gürcistan',
    flag: '🇬🇪',
    capital: 'Tiflis',
    currency: { code: 'GEL', symbol: '₾', name: 'Gürcü Larisi', approxTry: '1 ₾ ~15 ₺' },
    plug: {
      types: ['C', 'F'],
      voltage: '220V / 50Hz',
      needsAdapter: false,
      summary: 'Türkiye ile aynı fişler ve prizler. Adaptör gerekmez.'
    },
    tipping: 'Restoranlarda %10 bahşiş hesaba dahil edilebilir, edilmediyse %10 bırakılır.',
    emergency: { general: '112', police: '112', ambulance: '112' },
    timeDiff: '+1 saat (Gürcistan, Türkiye’den 1 saat ileridedir)',
    drivingSide: 'Sağ',
    waterDrinkable: 'Musluk suyu içilebilir; maden suyu olarak meşhur Borjomi çok yaygındır.',
    phrases: [
      { tr: 'Merhaba', local: 'Gamarjoba', phonetic: 'Gamarjoba' },
      { tr: 'Teşekkür ederim', local: 'Madloba', phonetic: 'Madloba' },
      { tr: 'Lütfen', local: 'Gthkhovt', phonetic: 'Gıthovt' },
      { tr: 'Hesap lütfen', local: 'Angarishi, tu sheidzleba', phonetic: 'Angariş, tu şeydzleba' },
      { tr: 'Şerefe!', local: 'Gaumarjos!', phonetic: 'Gaumarcos!' }
    ],
    localTips: 'Yeni çipli T.C. Kimlik Kartınızla Sarp Sınır Kapısı’ndan yürüyerek veya direkt uçuşla vizesiz, pasaportsuz girebilirsiniz. Hınkal (Gürcü mantısı) elle yenir, sapı tabakta bırakılır.'
  }
};

/**
 * Returns country intelligence data with fallbacks.
 */
export function getCountryIntel(countryName) {
  if (!countryName) return null;
  const canon = CANONICAL_COUNTRY_MAP[countryName] || countryName;
  if (COUNTRY_INTEL[canon]) {
    return COUNTRY_INTEL[canon];
  }

  // Fallback for countries not explicitly in dictionary
  return {
    country: canon,
    flag: '🌍',
    capital: 'Bilinmiyor',
    currency: { code: 'USD / EUR', symbol: '$ / €', name: 'Yerel Para Birimi' },
    plug: {
      types: ['C', 'F'],
      voltage: '220-240V',
      needsAdapter: false,
      summary: 'Seyahat öncesi priz tipini ve voltajı kontrol ediniz.'
    },
    tipping: 'Restoranlarda %5-10 bahşiş genel olarak nezakettendir.',
    emergency: { general: '112 veya 911', police: '112', ambulance: '112' },
    timeDiff: 'Yerel saat dilimini kontrol ediniz.',
    drivingSide: 'Sağ',
    waterDrinkable: 'Genel kural olarak şişelenmiş kapalı su tüketilmesi tavsiye edilir.',
    phrases: [
      { tr: 'Merhaba', local: 'Hello', phonetic: 'Helo' },
      { tr: 'Teşekkürler', local: 'Thank you', phonetic: 'Tenk yu' },
      { tr: 'Lütfen', local: 'Please', phonetic: 'Pliiz' },
      { tr: 'Hesap lütfen', local: 'Bill, please', phonetic: 'Bil, pliiz' },
      { tr: 'Evet / Hayır', local: 'Yes / No', phonetic: 'Yes / No' }
    ],
    localTips: 'Seyahat öncesi pasaport geçerlilik sürenizi ve yerel acil numaraları kontrol edin.'
  };
}
