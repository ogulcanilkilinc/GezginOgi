import { buildDeepCountryPack } from './placeBuilder.js';

// ============================================================================
// TÜRKİYE 81 İL EKSİKSİZ TAMAMLAMA PAKETİ — BÖLÜM 1
// (Marmara, Ege, Akdeniz ve İç Anadolu'daki Tüm İller ve İlçeleri)
// ============================================================================
export const TURKIYE_81_IL_PART1 = buildDeepCountryPack({
  region: 'turkiye',
  subRegion: 'Anadolu 81 İl',
  country: 'Türkiye',
  seasons: ['ilkbahar', 'yaz', 'sonbahar'],
  budget: 'Ekonomik (₺)',
  food: 'Her ilin coğrafi işaretli yöresel yemekleri, taş fırın lezzetleri ve asırlık esnaf lokantaları.',
  transport: 'Şehirlerarası karayolu, hızlı tren (YHT) ve ilçe minibüs/otobüs hatları ile kolay ulaşım.',
  items: [
    // MARMARA BÖLGESİ EKSİK İLLER (Kırklareli, Tekirdağ, Kocaeli, Sakarya, Yalova, Bilecik)
    ['tr-81-klr-1', 'Kırklareli — İğneada Longoz Ormanları Milli Parkı (Mert ve Erikli Gölleri)', 'Demirköy, Kırklareli', 41.8764, 27.9856, 'doga', '1 Gün', 'Avrupa’nın en büyük subasar (longoz) ormanlarında kano turu, Karadeniz kumsalları ve Limanköy Fransız Feneri.'],
    ['tr-81-klr-2', 'Kırklareli — Dupnisa Mağarası (Istranca Dağları) ve Vize Antik Tiyatrosu / Kıyıköy', 'Sarpdere / Vize, Kırklareli', 41.8406, 27.5564, 'doga', '5 Saat', 'Trakya’nın turizme açık tek yeraltı nehirli iki katlı mağarası Dupnisa ve Kıyıköy’de kayalara oyulmuş Aya Nikola Manastırı.'],
    ['tr-81-klr-3', 'Kırklareli — Lüleburgaz Sokullu Mehmet Paşa Külliyesi ve Aşağıpınar Höyüğü', 'Lüleburgaz / Merkez, Kırklareli', 41.4056, 27.3569, 'kultur', '3 Saat', 'Mimar Sinan eseri 1569 tarihli külliye, Yayla Meydanı tarihi konakları, hardaliye ve Kırklareli köftesi.'],

    ['tr-81-tek-1', 'Tekirdağ — Uçmakdere Yamaç Paraşütü, Şarköy Bağ Rotası ve Hora Feneri', 'Şarköy / Süleymanpaşa, Tekirdağ', 40.7933, 27.3656, 'doga', '5 Saat', 'Ganos Dağları’nın yemyeşil yamaçlarından Marmara Denizi’ne uçuş, tarihi Rum köyü Uçmakdere ve zeytin/üzüm bağları.'],
    ['tr-81-tek-2', 'Tekirdağ — Rakoczi Müzesi, Namık Kemal Evi, Rüstem Paşa Külliyesi ve Köfteciler', 'Süleymanpaşa, Tekirdağ', 40.9781, 27.5117, 'muze', '3.5 Saat', 'Macar bağımsızlık kahramanı II. Ferenc Rákóczi’nin yaşadığı 18. yüzyıl ahşap konağı ve meşhur Tekirdağ köftesi/peynir helvası.'],
    ['tr-81-tek-3', 'Tekirdağ — Çorlu Kalesi, Kastro (Çamlıköy) Sahili ve Perinthos (Marmaraereğlisi) Bazilikası', 'Saray / Marmaraereğlisi, Tekirdağ', 41.0028, 27.9625, 'kultur', '4 Saat', 'Trakya’nın antik başkentlerinden Perinthos mozaikleri ve Çamlıköy’de nehirle Karadeniz’in buluştuğu çam ormanı.'],

    ['tr-81-koc-1', 'Kocaeli — Maşukiye, Kartepe Zirvesi ve Sapanca Gölü Kıyısı (Ormanya Hobbit Evleri)', 'Kartepe, Kocaeli', 40.6950, 30.1467, 'doga', '1 Gün', 'Samanlı Dağları’nda alabalık vadisi Maşukiye, kışın kayak merkezi Kartepe ve Avrupa’nın en büyük doğal yaşam parkı Ormanya.'],
    ['tr-81-koc-2', 'Kocaeli — Kerpe Kayalıkları (Kartal Kayalar), Kefken Pembe Kayalar ve Cebeci Sahili', 'Kandıra, Kocaeli', 41.1558, 30.1942, 'doga', '5 Saat', 'Suyun içinde yumuşak olup çıkarıldığında sertleşen, Osmanlı’da Sultanahmet Camii taşlarının kesildiği antik Pembe Kayalar ve Kandıra yoğurdu.'],
    ['tr-81-koc-3', 'Kocaeli — Gayret Gemi Müzesi, Hızırreis Denizaltısı, Kasr-ı Hümayun ve SEKA Kağıt Müzesi', 'İzmit, Kocaeli', 40.7614, 29.9197, 'muze', '4 Saat', 'İstanbul dışındaki tek padişah sarayı Kasr-ı Hümayun, gerçek savaş gemisi/denizaltı müzesi ve Cumhuriyet’in ilk kağıt fabrikası SEKA.'],
    ['tr-81-koc-4', 'Kocaeli — Ballıkayalar Kanyonu, Yuvacık Barajı ve Osman Hamdi Bey Müzesi (Eskihisar)', 'Gebze / Başiskele, Kocaeli', 40.7711, 29.4292, 'doga', '4 Saat', 'Kaplumbağa Terbiyecisi’nin ressamı Osman Hamdi Bey’in deniz kıyısındaki ahşap köşkü ve kaya tırmanışı cenneti Ballıkayalar.'],

    ['tr-81-sak-1', 'Sakarya — Sapanca Gölü Kordonu, Kırkpınar Bağdat Caddesi ve İlmiye/Soğucak Yaylaları', 'Sapanca, Sakarya', 40.6914, 30.2675, 'doga', '4 Saat', 'Göl kıyısında bisiklet yolu, manolya ve süs bitkileri bahçeleri, teleferik ve göl manzaralı bungalov rotası.'],
    ['tr-81-sak-2', 'Sakarya — Acarlar Longozu (Subasar Ormanı), Karasu Sahili ve Maden Deresi Şelalesi', 'Karasu / Kaynarca, Sakarya', 41.1239, 30.5256, 'doga', '5 Saat', 'Beyaz su menekşeleri ve nilüferlerle kaplı Türkiye’nin tek parça halindeki en büyük longoz ormanı ve tarihi kaya tünelli Maden Deresi.'],
    ['tr-81-sak-3', 'Sakarya — Taraklı Tarihi Konakları (Cittaslow), Karagöl Yaylası ve Justinianus Köprüsü', 'Taraklı / Serdivan, Sakarya', 40.3967, 30.4928, 'kultur', '5 Saat', '300 yıllık cumbalı Osmanlı evleri, şimşir kaşık ustaları, köpük helvası ve Bizans İmparatoru Justinianus’un 562 tarihli 12 kemerli taş köprüsü.'],

    ['tr-81-yal-1', 'Yalova — Yürüyen Köşk (Atatürk Köşkü), Karaca Arboretumu ve Termal Kaplıcaları', 'Merkez / Termal, Yalova', 40.6597, 29.2950, 'muze', '4 Saat', 'Atatürk’ün bir çınar ağacının dalı kesilmesin diye raylar üzerinde 4.8 metre kaydırttığı dünyadaki ilk çevreci anıt köşk ve 7.000 bitki türlü arboretum.'],
    ['tr-81-yal-2', 'Yalova — Sudüşen Şelalesi, Erikli Çifte Şelale ve Delmece Yaylası (Çınarcık)', 'Termal / Çınarcık, Yalova', 40.5736, 29.1706, 'doga', '4 Saat', 'Ihlamur ve kestane ormanları içinde yürüyüş parkurları, Dipsiz Göl ve kayalıklardan dökülen Sudüşen Şelalesi.'],

    ['tr-81-bil-1', 'Bilecik — Söğüt Ertuğrul Gazi Türbesi, Şeyh Edebali Külliyesi ve Yaşayan Şehir Müzesi', 'Söğüt / Merkez, Bilecik', 40.0189, 30.1808, 'muze', '4 Saat', 'Osmanlı İmparatorluğu’nun kurulduğu topraklar; Alp kıyafetli saygı nöbeti, Kuyulu Mescit ve kanyon yamacındaki Şeyh Edebali Türbesi.'],
    ['tr-81-bil-2', 'Bilecik — Küçükelmalı ve Bozcaarmut Göletleri, Kınık Çömlek Köyü ve Harmankaya Kanyonu', 'Pazaryeri / İnhisar, Bilecik', 39.9972, 29.9042, 'doga', '4 Saat', 'Çam ağaçlarının suya yansıdığı sakin göletler, şerbetçiotu tarlaları, Pazaryeri bozası/helvası ve dev Harmankaya Kanyonu.'],

    // EGE BÖLGESİ EKSİK İLLER (Uşak, Kütahya, Afyonkarahisar)
    ['tr-81-kut-1', 'Kütahya — Aizanoi Antik Kenti (Zeus Tapınağı ve Dünyanın İlk Borsası)', 'Çavdarhisar, Kütahya', 39.2014, 29.6108, 'muze', '4 Saat', 'Anadolu’daki en sağlam Zeus Tapınağı, tiyatro ile stadyumun bitişik olduğu dünyadaki tek antik kompleks ve MÖ 301 tarihli fiyat fermanı (Macellum).'],
    ['tr-81-kut-2', 'Kütahya — Kütahya Kalesi (Döner Gazino), Çini Müzesi, Germiyan Sokağı ve Frig Vadisi', 'Merkez, Kütahya', 39.4167, 29.9833, 'kultur', '4 Saat', 'Dünyanın ilk ve tek Çini Müzesi (Yakup Bey Külliyesi), Macar Kossuth Evi, tarihi Germiyan konakları ve Kütahya çini atölyeleri.'],

    ['tr-81-usa-1', 'Uşak — Ulubey Kanyonu Cam Terası, Blaundos Antik Kenti ve Clandras Köprüsü', 'Ulubey / Karahallı, Uşak', 38.4111, 29.2889, 'doga', '5 Saat', 'ABD Arizona Grand Canyon’dan sonra dünyanın en uzun 2. kanyonu Ulubey, uçurumla çevrili yarımada üzerindeki Stonehenge görünümlü Blaundos ve Frig köprüsü Clandras.'],
    ['tr-81-usa-2', 'Uşak — Uşak Arkeoloji Müzesi (Karun Hazineleri — Kanatlı Denizatı Broşu) ve Taşyaran Vadisi', 'Merkez / Yenişehir, Uşak', 38.6736, 29.4058, 'muze', '4 Saat', 'Lidya Kralı Kroisos’a (Karun) ait paha biçilemez altın hazineler ve suyun binlerce yılda mermer gibi oyduğu Taşyaran Vadisi.'],

    ['tr-81-afy-1', 'Afyonkarahisar — Afyon Kalesi (226m Volkanik Kaya), Ulu Cami (40 Ahşap Sütunlu) ve Tarihi Konaklar', 'Merkez, Afyonkarahisar', 38.7567, 30.5319, 'kultur', '4 Saat', 'Şehrin ortasında yükselen sarp volkanik kaya üzerindeki Hitit kalesi, 1272 tarihli 40 direkli Ulu Cami, Mevlevihane ve kaymak/sucuk/lokum çarşısı.'],
    ['tr-81-afy-2', 'Afyonkarahisar — Frig Vadisi (Ayazini Kaya Kilisesi, Emre Gölü Balon Turu ve Aslantaş-Yılantaş)', 'İhsaniye, Afyonkarahisar', 39.0681, 30.4222, 'doga', '1 Gün', '3.000 yıllık Frig kaya anıtları, oyma kalesiyle Ayazini köyü, Emre Gölü üzerinde Frig kral kayıkları ve sıcak hava balonları.'],
    ['tr-81-afy-3', 'Afyonkarahisar — Yeni Afyon Müzesi, Başkomutan Tarihi Milli Parkı (Kocatepe) ve Akdağ Tabiat Parkı', 'Sandıklı / Şuhut, Afyonkarahisar', 38.6750, 30.4500, 'muze', '4 Saat', 'Büyük Taarruz’un başladığı 1.874 rakımlı Kocatepe Anıtı ve geyiklerin özgürce dolaştığı Akdağ Tokalı Kanyonu.'],

    // AKDENİZ BÖLGESİ EKSİK İLLER (Isparta, Burdur, Osmaniye, Kahramanmaraş)
    ['tr-81-isp-1', 'Isparta — Eğirdir Gölü (Yeşilada & Can Adası), Kovada Gölü Milli Parkı ve Yazılı Kanyon', 'Eğirdir / Sütçüler, Isparta', 37.8744, 30.8508, 'doga', '1 Gün', 'Yedi renkli Eğirdir Gölü yarımadası, sığla ve çınar ağaçlarıyla Kovada Gölü ve Aziz Paul’ün yürüdüğü Kral Yolu üzerindeki Yazılı Kanyon (Hür İnsan Şiiri).'],
    ['tr-81-isp-2', 'Isparta — Kuyucak Lavanta Köyü, Gül Bahçeleri Hasadı ve Pisidia Antiokheia (Yalvaç)', 'Keçiborlu / Yalvaç, Isparta', 37.9417, 30.2667, 'doga', '1 Gün', 'Haziran-Temmuz’da mora bürünen lavanta tarlaları, Mayıs’ta sabah erken yapılan dünya gül yağı hasadı ve Cittaslow Yalvaç antik kenti.'],

    ['tr-81-bur-1', 'Burdur — Sagalassos Antik Kenti (Antoninler Çeşmesi — 1.700 m) ve Kibyra (Medusa Mozaiği)', 'Ağlasun / Gölhisar, Burdur', 37.6769, 30.5189, 'muze', '1 Gün', 'Ağlasun Dağı yamacında 1.800 yıldır orijinal mermer oluğundan buz gibi su akan Antoninler Çeşmesi ve renkli mermerden Medusa mozaiğiyle Kibyra Odeonu.'],
    ['tr-81-bur-2', 'Burdur — İnsuyu Mağarası, Burdur Arkeoloji Müzesi ve Lisinia Doğa (Yaban Hayatı ve Lavanta) Köyü', 'Merkez, Burdur', 37.6589, 30.3736, 'doga', '4 Saat', 'Türkiye’nin turizme açılan ilk mağarası İnsuyu, dev antik heykeller müzesi ve Burdur Gölü kıyısındaki ekolojik proje alanı Lisinia.'],

    ['tr-81-osm-1', 'Osmaniye — Karatepe-Aslantaş Açık Hava Müzesi (Hitit Hiyeroglifleri) ve Kastabala ("Çukurova’nın Efes’i")', 'Kadirli / Merkez, Osmaniye', 37.2639, 36.2528, 'muze', '4 Saat', 'Ceyhan Nehri kıyısında çam ormanı içinde Anadolu’nun ilk açık hava müzesi (Aslanlı kapılar) ve sütunlu caddesiyle Kastabala Kalesi.'],
    ['tr-81-osm-2', 'Osmaniye — Karaçay Şelalesi, Sabun Çayı Şelalesi, Zorkun Yaylası ve Ala Cami', 'Merkez / Düziçi / Kadirli, Osmaniye', 37.0417, 36.2917, 'doga', '4 Saat', 'Amanos Dağları kanyonundaki 25 metrelik Karaçay Şelalesi, Roma mozaiği üzerine kurulu Kadirli Ala Cami ve yer fıstığı lezzetleri.'],

    ['tr-81-mar-1', 'Kahramanmaraş — Başkonuş Yaylası, Ali Kayası Cam Terası (Menzelet) ve Yeşilgöz Obruğu', 'Onikişubat, Kahramanmaraş', 37.7667, 36.5833, 'doga', '5 Saat', 'Köknar ve sedir ormanları içinde alageyiklerin yaşadığı Başkonuş Yaylası, Ceyhan Nehri kanyonuna tepeden bakan Ali Kayası ve turkuaz Yeşilgöz.'],
    ['tr-81-mar-2', 'Kahramanmaraş — Germanicia Antik Kenti Mozaikleri, Yedi Güzel Adam Müzesi ve Tarihi Dondurma/Bakır Çarşısı', 'Dulkadiroğlu, Kahramanmaraş', 37.5847, 36.9264, 'kultur', '4 Saat', 'Keçi sütü ve salepten dövme Maraş dondurması, taş hanlar, el dövmesi bakır çarşısı ve Maraş tarhanası/eli böğründe.'],

    // İÇ ANADOLU BÖLGESİ EKSİK İLLER (Kırıkkale, Kırşehir, Yozgat, Niğde, Karaman, Çankırı)
    ['tr-81-krk-1', 'Kırıkkale — Çeşnigir Köprüsü, Kızılırmak Kanyonu Cam Terası ve Silah Sanayi Müzesi', 'Karakeçili / Merkez, Kırıkkale', 39.5681, 33.4150, 'kultur', '3.5 Saat', 'Büyük Selçuklu döneminden kalma, Timur’un ordularının geçtiği 13 gözlü taş Çeşnigir Köprüsü, kanyon tekne turu ve MKE tarihi silah koleksiyonu.'],

    ['tr-81-krs-1', 'Kırşehir — Cacabey Gökbilim Medresesi (1272), Ahi Evran Külliyesi ve Neşet Ertaş Gönül Sultanları Kültür Evi', 'Merkez, Kırşehir', 39.1458, 34.1606, 'muze', '4 Saat', 'Dünyanın ilk astronomi yüksekokulu olan roket sütunlu Cacabey Medresesi, Ahilik teşkilatının merkezi ve Bozlak ustası Neşet Ertaş’ın anı evi (UNESCO Müzik Şehri).'],
    ['tr-81-krs-2', 'Kırşehir — Kaman Kalehöyük Arkeoloji Müzesi ve Japon Bahçesi (Mikasanomiya) & Seyfe Gölü Flamingoları', 'Kaman / Mucur, Kırşehir', 39.3622, 33.7889, 'doga', '4 Saat', 'Japon Prensi Mikasa tarafından kurulan, Japonya dışındaki en büyük Japon Bahçesi ve höyük biçimli ödüllü müze.'],

    ['tr-81-yoz-1', 'Yozgat — Sarıkaya Roma Hamamı ("Kral Kızı" — Basilica Therma) ve Çamlık Milli Parkı', 'Sarıkaya / Merkez, Yozgat', 39.4939, 35.3772, 'muze', '4 Saat', '2.000 yıldır kesintisiz sıcak termal su akan ve dünyada mermer cephesi ayakta kalmış iki Roma hamamından biri (UNESCO Geçici Listesi) ile Türkiye’nin ilk milli parkı Çamlık.'],
    ['tr-81-yoz-2', 'Yozgat — Kazankaya Kanyonu, Kerkenes Harabeleri (Kayıp Kent Pteria), Saat Kulesi ve Testi Kebabı', 'Aydıncık / Sorgun, Yozgat', 40.2194, 35.2917, 'doga', '4 Saat', 'Çekerek Irmağı’nın yarattığı sarp Kazankaya Kanyonu yürüyüş yolu, dağ zirvesindeki antik Pteria surları ve Çapanoğlu Camii.'],

    ['tr-81-nig-1', 'Niğde — Aladağlar Milli Parkı (Yedigöller Platosu & Kapuzbaşı) ve Çinili Göl (Bolkar Dağları)', 'Çamardı / Ulukışla, Niğde', 37.8167, 35.1500, 'doga', '1 Gün', 'Türkiye’nin Alpleri sayılan 3.756 metrelik Demirkazık zirvesi, buzul gölleri ve dünyada sadece Bolkar Dağları’nda yaşayan Toros Kurbağası.'],
    ['tr-81-nig-2', 'Niğde — Gümüşler Manastırı ("Gülen Meryem Ana" Freski), Tyana Su Kemerleri ve Alaaddin Camii', 'Merkez / Kemerhisar, Niğde', 37.9917, 34.7708, 'muze', '4 Saat', 'Tüf kayanın içine dev bir avlu şeklinde oyulmuş Kapadokya’nın en sağlam manastırlarından Gümüşler ve sabah güneşinde kapısında kadın silüeti beliren 1223 Alaaddin Camii.'],

    ['tr-81-krm-1', 'Karaman — Taşkale Tahıl Ambarları, Manazan Mağaraları (5 Katlı Kaya Şehri) ve İncesu Mağarası', 'Merkez, Karaman', 37.1394, 33.6119, 'gizli', '5 Saat', 'Sarp kireçtaşı kayalığına oyulmuş 250’den fazla tahıl ambarı ve Bizans döneminde 5 katlı apartman gibi kayaya oyulan Manazan Mağaraları.'],
    ['tr-81-krm-2', 'Karaman — Yerköprü Şelalesi (Göksu Nehri), Binbirpınar (Madenşehri) ve Hatuniye Medresesi / Karaman Kalesi', 'Ermenek / Merkez, Karaman', 36.9333, 32.8833, 'doga', '5 Saat', 'Ermenek Turkuaz Baraj Gölü, Göksu üzerinde doğal traverten köprüden dökülen Yerköprü Şelalesi ve Türk Dili Başkenti mirası.'],

    ['tr-81-cnk-1', 'Çankırı — Tuz Mağarası (Yeraltı Tuz Şehri), Ilgaz Dağı Milli Parkı ve Taş Mescit', 'Merkez / Ilgaz, Çankırı', 40.5333, 33.7667, 'gizli', '5 Saat', 'Hititlerden beri 5.000 yıldır işletilen, tünellerine kamyonların girebildiği devasa yeraltı kristal tuz galerileri ve Anadolu’nun ilk darüşşifalarından Taş Mescit.']
  ]
});
