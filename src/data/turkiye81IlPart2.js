import { buildDeepCountryPack } from './placeBuilder';

// ============================================================================
// TÜRKİYE 81 İL EKSİKSİZ TAMAMLAMA PAKETİ — BÖLÜM 2
// (Karadeniz, Doğu Anadolu ve Güneydoğu Anadolu'daki Tüm Eksik İller)
// ============================================================================
export const TURKIYE_81_IL_PART2 = buildDeepCountryPack({
  region: 'turkiye',
  subRegion: 'Anadolu 81 İl',
  country: 'Türkiye',
  seasons: ['ilkbahar', 'yaz', 'sonbahar'],
  budget: 'Ekonomik (₺)',
  food: 'Karadeniz pidesi ve mıhlaması, Tokat kebabı, Doğu Anadolu tandır ve bal-kaymak kahvaltıları, Güneydoğu kebap ve taş fırın lezzetleri.',
  transport: 'Karadeniz Sahil Yolu, Doğu/Kurtalan Ekspresi, bölgesel havalimanları ve yayla/kanyon minibüsleri.',
  items: [
    // KARADENİZ EKSİK İLLER (Düzce, Zonguldak, Bartın, Tokat, Gümüşhane, Bayburt)
    ['tr-81-duz-1', 'Düzce — Samandere Şelalesi (Tabiat Anıtı), Güzeldere Şelalesi ve Efteni Gölü Kuş Cenneti', 'Gölyaka / Beyköy, Düzce', 40.6922, 31.2583, 'doga', '5 Saat', 'Türkiye’nin tescilli ilk tabiat anıtı şelalesi Samandere, 130 metreden dökülen Güzeldere ve 150 kuş türünün konakladığı Efteni Gölü.'],
    ['tr-81-duz-2', 'Düzce — Akçakoca Ceneviz Kalesi, Fakıllı Mağarası ve Prusias ad Hypium (Konuralp Antik Tiyatrosu)', 'Akçakoca / Konuralp, Düzce', 41.0875, 31.0936, 'kultur', '4 Saat', 'UNESCO Geçici Listesi’ndeki Ceneviz kıyı kalesi, mavi bayraklı kumsal ve Batı Karadeniz’in tek antik tiyatrosu ("Kırk Basamaklar").'],

    ['tr-81-zon-1', 'Zonguldak — Gökgöl Mağarası, Maden Müzesi (Deneyim Ocağı) ve Kapuz / Filyos (Tios) Antik Kenti', 'Merkez / Çaycuma, Zonguldak', 41.4431, 31.8331, 'gizli', '5 Saat', 'Yeraltı deresi ve fosil sarkıtlarıyla 3.350 metrelik Gökgöl Mağarası, baret takarak gerçek kömür galerisine inilen Maden Müzesi ve Karadeniz kıyısındaki tek antik kent Tios.'],
    ['tr-81-zon-2', 'Zonguldak — Karadeniz Ereğli Cehennemağzı Mağaraları (Herkül ve Kerberos Efsanesi) ve Gümeli 4.115 Yaşındaki Porsuk Ağacı', 'Ereğli / Alaplı, Zonguldak', 41.2847, 31.4142, 'muze', '4 Saat', 'Mitolojide Herkül’ün üç başlı köpek Kerberos’u yeraltı dünyasından çıkardığı mağaralar ve dünyanın bilinen en yaşlı porsuk ağacı.'],

    ['tr-81-bar-1', 'Bartın — Amasra Kalesi (Kemere Köprüsü, Çekiciler Çarşısı, Direkli Kaya) ve Güzelcehisar 80 Milyon Yıllık Lav Sütunları', 'Amasra / Merkez, Bartın', 41.7486, 32.3864, 'doga', '1 Gün', 'Fatih Sultan Mehmet’in "Çeşm-i Cihan (Dünyanın Gözü)" dediği yarımada kenti, 30 çeşidiyle Amasra salatası ve ahşap iskeleyle gezilen bazalt lav sütunları.'],
    ['tr-81-bar-2', 'Bartın — Ulukaya Şelalesi & Kanyonu, İnkumu Plajı ve Bartın Irmağı Tarihi Ahşap Yalıları', 'Ulus / Merkez, Bartın', 41.6722, 32.7417, 'doga', '4 Saat', 'Küre Dağları eteklerinde bir kaya oyuğundan fışkıran Ulukaya Şelalesi ve üzerinde gemilerin yüzebildiği Türkiye’nin tek ırmağı Bartın Çayı.'],

    ['tr-81-tok-1', 'Tokat — Ballıca Mağarası (Dünya Mirası Geçici Listesi — Soğan Sarkıtlar) ve Kaz Gölü', 'Pazar, Tokat', 40.2286, 36.3042, 'doga', '4 Saat', '108 milyon yıllık dev salonları ve dünyada eşi az bulunan soğan sarkıtlarıyla doğa harikası Ballıca Mağarası.'],
    ['tr-81-tok-2', 'Tokat — Sulu Sokak (900 Adımda 900 Yıllık Tarih), Taşhan, Gök Medrese, Latifoğlu Konağı ve Zile Kalesi', 'Merkez / Zile, Tokat', 40.3139, 36.5544, 'kultur', '5 Saat', 'Anadolu’nun ilk açık hava müze sokağı; ıhlamur baskı yazmacılar çarşısı, Jül Sezar’ın "Veni, Vidi, Vici (Geldim, Gördüm, Yendim)" sözünü söylediği Zile Kalesi ve Tokat kebabı.'],

    ['tr-81-gum-1', 'Gümüşhane — Karaca Mağarası (Damlataş Sarayı), Torul Kalesi Cam Terası ve Krom (İmera) Antik Vadisi', 'Torul / Merkez, Gümüşhane', 40.5442, 39.4028, 'doga', '5 Saat', 'Renkli traverten havuzları ve org desenli duvarlarıyla dünyanın en zengin damlataş mağaralarından Karaca, 240 metre yüksekte Torul Cam Terası ve pestil/köme.'],
    ['tr-81-gum-2', 'Gümüşhane — Santa Harabeleri (Dumanlı Taş Köyler), Tomara Şelalesi ve Limni Gölü (Zigana)', 'Dumanlı / Şiran, Gümüşhane', 40.6667, 39.8833, 'gizli', '5 Saat', 'Dağın yamacından 40 ayrı gözden fışkıran Tomara Şelalesi ve bulutların üzerinde korunmuş 17. yüzyıl taş Rum köyleri Santa.'],

    ['tr-81-bay-1', 'Bayburt — Baksı Müzesi (Çoruh Vadisi’nde Avrupa Konseyi Ödüllü Çağdaş Sanat ve Zanaat Müzesi)', 'Bayraktar Köyü, Bayburt', 40.1939, 40.4831, 'muze', '3.5 Saat', 'Prof. Dr. Hüsamettin Koçan’ın doğduğu köyde kurduğu, geleneksel ehram dokuması ile modern sanatı birleştiren uluslararası ödüllü müze.'],
    ['tr-81-bay-2', 'Bayburt — Bayburt Kalesi (Çinimaçin), Aydıntepe Yeraltı Şehri, Kenan Yavuz Etnografya Müzesi ve Çoruh Nehri', 'Merkez / Aydıntepe, Bayburt', 40.2603, 40.2286, 'kultur', '4 Saat', 'Dede Korkut hikayelerinin geçtiği devasa Çoruh kalesi, tüf kayaya oyulmuş 3.000 yıllık Aydıntepe Yeraltı Şehri ve Avrupa Yılın Müzesi (Silletto) ödüllü Kenan Yavuz Müzesi.'],

    // DOĞU ANADOLU EKSİK İLLER (Ardahan, Iğdır, Muş, Bingöl, Bitlis, Hakkari)
    ['tr-81-ard-1', 'Ardahan — Çıldır Gölü (Şeytan Kalesi & Akçakale Adası), Yalnızçam Kayak Merkezi ve Posof (Cittaslow)', 'Çıldır / Posof, Ardahan', 41.1583, 43.2500, 'doga', '1 Gün', 'Kura Nehri’nin sarp kanyonundaki kartal yuvası Şeytan Kalesi, kışın buz üstünde sarı balık avı ve dışı kırmızı içi kırmızı elmasıyla ünlü sakin şehir Posof.'],

    ['tr-81-igd-1', 'Iğdır — Tuzluca Tuz Mağaraları (Kristal Tuz Terapi Tünelleri), Ejder Kervansarayı ve Ağrı Dağı Kuzey Cephesi', 'Tuzluca / Karakoyunlu, Iğdır', 40.0389, 43.6611, 'doga', '4 Saat', '55 dönümlük yeraltı kristal tuz galerileri, 13. yüzyıl Selçuklu Harmandöven Kervansarayı, Koçbaşı mezar taşları ve Doğu’nun Çukurova’sı kayısı bahçeleri.'],

    ['tr-81-mus-1', 'Muş — Tarihi Murat Köprüsü (143m Selçuklu Köprüsü), Muş Ovası Kırmızı Laleleri ve Malazgirt Zafer Anıtı', 'Merkez / Malazgirt, Muş', 38.8083, 41.5250, 'doga', '5 Saat', 'Nisan sonu - Mayıs başında Muş Ovası’nı kırmızı halı gibi kaplayan endemik Muş Lalesi (Ters Lale), 12 gözlü Murat Köprüsü ve 1071 Malazgirt Kalesi.'],

    ['tr-81-bin-1', 'Bingöl — Yüzen Adalar (Turnalar Gölü Tabiat Anıtı), Güneşin Doğuşu (Kös Kaplıcaları) ve Zağ Mağaraları', 'Solhan / Karlıova, Bingöl', 38.9589, 40.9417, 'doga', '4 Saat', 'Krater gölünün üzerinde rüzgarla bağımsız olarak sal gibi hareket eden üç doğal torf adası (üzerinde ağaçlar yetişiyor!) ve 3.250 rakımlı Kala Tepesi’nden eşsiz gün doğumu.'],

    ['tr-81-bit-1', 'Bitlis — Nemrut Krater Gölü (Dünyanın 2. Büyük Kalderası — Sıcak ve Soğuk Göller) ve Süphan Dağı', 'Tatvan / Adilcevaz, Bitlis', 38.6250, 42.2333, 'doga', '5 Saat', 'Avrupa Seçkin Destinasyonlar (EDEN) ödüllü dev volkan krateri içinde yan yana duran ılık, soğuk ve buhar bacalı göller.'],
    ['tr-81-bit-2', 'Bitlis — Ahlat Selçuklu Meydan Mezarlığı (UNESCO Geçici Listesi), Emir Bayındır Kümbeti ve Bitlis Beş Minare', 'Ahlat / Merkez, Bitlis', 38.7536, 42.4822, 'muze', '4 Saat', 'Orta Asya Orhun Abideleri’nin Anadolu’daki devamı sayılan 8.000’den fazla anıtsal oymalı mezar taşı, İhlasiye Medresesi ve büryan kebabı.'],

    ['tr-81-hak-1', 'Hakkari — Cilo ve Sat Dağları Milli Parkı (Sat Buzul Gölleri, 20.000 Yıllık Buzullar ve Cennet-Cehennem Vadisi)', 'Yüksekova, Hakkari', 37.4833, 44.0000, 'doga', '1 - 2 Gün', '3.000 metre yükseklikte bir tarafta dört mevsim erimeyen dev buzullar, hemen yanında rengarenk çiçeklerin ve ters lalelerin açtığı Cennet-Cehennem Vadisi ile 22 turkuaz buzul gölü.'],
    ['tr-81-hak-2', 'Hakkari — Zap Suyu Vadisi, Meydan Medresesi (1700), Taş Köprü ve Mergabütan Kayak Merkezi', 'Merkez / Şemdinli, Hakkari', 37.5744, 43.7408, 'kultur', '4 Saat', 'Sarp dağlar arasından köpürerek akan Zap Suyu asma köprüleri ve Şemdinli’de tek kemerli tarihi Nehri Taş Köprüsü.'],

    // GÜNEYDOĞU ANADOLU EKSİK İLLER (Kilis, Siirt, Batman, Şırnak)
    ['tr-81-kil-1', 'Kilis — Ravanda Kalesi, Oylum Höyük (4.000 Yıllık Mozaikli Bazilika), Tarihi Mevlevihane ve Kilis Tava', 'Polateli / Merkez, Kilis', 36.7167, 37.1167, 'kultur', '4 Saat', 'Afrin Çayı vadisine hakim konik tepe üzerindeki Haçlı-Eyyubi kalesi Ravanda, Salih Efendi Sokak taş konakları, Kilis tava ve cennet çamuru tatlısı.'],

    ['tr-81-bat-1', 'Batman — Hasankeyf (Zeynel Bey Türbesi, Artuklu Hamamı, Tekne Turu ve Şaab Vadisi) & Malabadi Köprüsü', 'Hasankeyf / Kozluk, Batman', 37.7136, 41.4158, 'kultur', '5 Saat', '12.000 yıllık Dicle mağara yerleşimi, taş işçiliği harikası Zeynel Bey Kümbeti ve dünyada taş köprüler arasında en geniş kemer açıklığına (38.6 m) sahip 1147 tarihli Malabadi Köprüsü.'],

    ['tr-81-sii-1', 'Siirt — Botan Vadisi Milli Parkı (Rasıl Hacar — Taşbaşı Uçurumu), Tillo Cam Terası ve Işık Hadisesi', 'Merkez / Tillo, Siirt', 37.9500, 41.8833, 'doga', '5 Saat', 'Botan Çayı’nın 400 metre üzerinde nefes kesen Taşbaşı kayalıkları ve İbrahim Hakkı Hazretleri’nin 1756’da kurduğu astronomik ışık düzeneği (UNESCO Geçici Listesi) ile Siirt perde pilavı.'],

    ['tr-81-sir-1', 'Şırnak — Cizre (Mem u Zin Türbesi, Kırmızı Medrese, Nuh Peygamber Camii ve Birca Belek) & Cehennem Deresi Kanyonu', 'Cizre / İdil, Şırnak', 37.3264, 42.1903, 'kultur', '5 Saat', 'Sibernetik ve robot biliminin babası El-Cezeri’nin memleketi ve türbesi, Cudi Dağı etekleri, Süryani Meryem Ana Kilisesi (İdil) ve Dicle kanyonu.']
  ]
});
