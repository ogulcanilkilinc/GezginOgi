import { buildDeepCountryPack } from './placeBuilder.js';

// ============================================================================
// RUSYA (24 Granular Places)
// ============================================================================
const RUSYA_PACK = buildDeepCountryPack({
  region: 'dunya',
  subRegion: 'Avrupa',
  country: 'Rusya',
  seasons: ['ilkbahar', 'yaz', 'kis'],
  budget: 'Orta (₺₺)',
  food: 'Borş Çorbası, Pelmeni (Rus Mantısı), Blini (Havyarlı ve Ekşi Kremalı Krep), Beef Stroganoff, Piroşki ve Gürcü Haçapurisi.',
  transport: 'Moskova ve St. Petersburg arasında Sapsan yüksek hızlı treni (4 saat) ve şehir içi tarihi metro hatları kullanılır.',
  items: [
    ['ru-dp-1', 'Kızıl Meydan ve Aziz Vasil Katedrali', 'Moskova', 55.7525, 37.6231, 'kultur', '3 - 4 Saat', 'Korkunç İvan tarafından yaptırılan rengarenk soğan kubbeli Aziz Vasil Katedrali, GUM Çarşısı, Devlet Tarih Müzesi ve Lenin Mozolesi ile çevrili dünyanın en ikonik meydanlarından biri.'],
    ['ru-dp-2', 'Moskova Kremlini ve Cephanelik Müzesi (Armoury)', 'Moskova', 55.7520, 37.6175, 'muze', '4 Saat', 'Rus Çarlarının taç giydiği Katedraller Meydanı, Çar Topu, Çar Çanı ve Fabergé yumurtaları ile elmas tahtların sergilendiği Hazine Dairesi.'],
    ['ru-dp-3', 'Bolşoy Tiyatrosu', 'Moskova', 55.7601, 37.6186, 'kultur', '3 Saat', 'Dünyanın en prestijli bale ve opera sahnesi; kırmızı kadife ve altın varaklı 6 katlı tarihi salonunda Kuğu Gölü veya Fındıkkıran temsili.'],
    ['ru-dp-4', 'Moskova Metrosu Tarihi İstasyonları Turu', 'Moskova', 55.7580, 37.6050, 'gizli', '2 - 3 Saat', 'Yeraltı sarayları olarak inşa edilen Komsomolskaya, Mayakovskaya, Kievskaya ve Ploshchad Revolyutsii istasyonlarının avizeleri, mozaikleri ve bronz heykelleri.'],
    ['ru-dp-5', 'Tretyakov Devlet Galerisi', 'Moskova', 55.7415, 37.6208, 'muze', '3 Saat', 'Andrey Rublev’in ikonalarından İlya Repin, Ayvazovski ve Kandinsky’ye uzanan Rus sanat tarihinin en büyük koleksiyonu.'],
    ['ru-dp-6', 'Eski Arbat Caddesi ve Puşkin Evi', 'Moskova', 55.7495, 37.5914, 'kultur', '2 Saat', 'Sokak ressamları, müzisyenler, Viktor Tsoi duvarı, tiyatrolar ve tarihi kafelerle dolu Moskova’nın en ünlü yaya caddesi.'],
    ['ru-dp-7', 'VDNH ve Uzay Fatihi Anıtı (Kozmonotluk Müzesi)', 'Moskova', 55.8263, 37.6377, 'muze', '4 Saat', 'Sovyet cumhuriyetlerinin görkemli pavyonları, altın fıskiyeler ve 107 metrelik titanyum roket anıtının altındaki Uzay Müzesi.'],
    ['ru-dp-8', 'Novodeviçi Manastırı ve Ünlüler Mezarlığı', 'Moskova', 55.7261, 37.5564, 'muze', '2 Saat', 'UNESCO koruması altındaki 16. yüzyıl barok manastırı ve Çehov, Gogol, Bulgakov, Nazım Hikmet ve Şostakoviç’in mezarlarının bulunduğu anıt park.'],
    ['ru-dp-9', 'Sergiyev Posad (Aziz Sergius Teslis Lavrası)', 'Moskova Bölgesi', 56.3100, 38.1306, 'kultur', '4 Saat', 'Moskova’nın Altın Halka rotasının kalbi; yıldızlı mavi ve altın kubbeleriyle Rus Ortodoksluğunun en kutsal manastır kompleksi ve matruşka atölyeleri.'],
    ['ru-dp-10', 'İzmaylovo Kremlin ve Bit Pazarı', 'Moskova', 55.7942, 37.7503, 'gizli', '3 Saat', 'Geleneksel Rus ahşap mimarisiyle inşa edilmiş masalsı kale, Sovyet antikaları, kehribar takılar ve el yapımı matruşka pazarı.'],
    ['ru-dp-11', 'Hermitage Müzesi ve Kışlık Saray', 'St. Petersburg', 59.9398, 30.3146, 'muze', '5 - 6 Saat', 'Çariçe Katerina’nın barok Kışlık Sarayı içinde Leonardo da Vinci, Rembrandt, Michelangelo ve Fransız empresyonistlerine ait 3 milyon eserlik dev koleksiyon.'],
    ['ru-dp-12', 'Dökülen Kan Kilisesi (Kurtarıcı İsa)', 'St. Petersburg', 59.9401, 30.3289, 'muze', '1.5 Saat', 'Griboedov Kanalı kıyısında yükselen rengarenk kubbeleri ve iç mekanını baştan sona kaplayan 7.500 metrekarelik altın mozaikleriyle başyapıt.'],
    ['ru-dp-13', 'Peterhof Sarayı ve Büyük Kaskad Çeşmeleri', 'St. Petersburg', 59.8845, 29.9087, 'muze', '5 Saat', 'Baltık Denizi kıyısında "Rus Versay’ı" olarak kurulan, yerçekimiyle çalışan 150’den fazla altın heykel çeşmesi ve saray bahçeleri.'],
    ['ru-dp-14', 'Catherine Sarayı ve Kehribar Odası (Puşkin)', 'St. Petersburg', 59.7160, 30.3957, 'muze', '4 Saat', 'Mavi-altın rokoko cephesi ve duvarları tamamen gerçek Baltık kehribarı ile altın yapraklardan oluşan efsanevi Kehribar Odası.'],
    ['ru-dp-15', 'Aziz İsak Katedrali ve Kolonad Seyir Terası', 'St. Petersburg', 59.9341, 30.3061, 'muze', '2 Saat', '100 kilo saf altınla kaplı devasa kubbesi ve 262 basamakla çıkılan sütunlu terasından 360 derece St. Petersburg ve Neva Nehri manzarası.'],
    ['ru-dp-16', 'Nevsky Prospekt, Kazan Katedrali ve Singer Kitabevi', 'St. Petersburg', 59.9343, 30.3246, 'kultur', '3 Saat', 'Vatikan San Pietro meydanından esinlenen sütunlu Kazan Katedrali, Art Nouveau Singer Binası (Dom Knigi) ve edebi kafeler.'],
    ['ru-dp-17', 'Neva Nehri Açılan Köprüler ve Beyaz Geceler Tekne Turu', 'St. Petersburg', 59.9420, 30.3160, 'bar', '2.5 Saat', 'Haziran-Temmuz Beyaz Gecelerinde gece 01:00’de dev nehir köprülerinin kanat gibi açılışını tekneden izleme deneyimi.'],
    ['ru-dp-18', 'Peter ve Paul Kalesi (Petropavlovskaya)', 'St. Petersburg', 59.9500, 30.3167, 'muze', '3 Saat', 'Şehrin kurulduğu Tavşan Adası’ndaki yıldız kale ve Romanov hanedanı çarlarının mermer lahitlerinin bulunduğu katedral.'],
    ['ru-dp-19', 'Fabergé Müzesi (Şuvalov Sarayı)', 'St. Petersburg', 59.9348, 30.3431, 'muze', '2 Saat', 'Fontanka Nehri kıyısındaki sarayda Rus Çarları için üretilen 9 orijinal İmparatorluk Paskalya Yumurtası ve mücevher koleksiyonu.'],
    ['ru-dp-20', 'Kazan Kremlini ve Kul Şerif Camii', 'Kazan (Tataristan)', 55.7983, 49.1053, 'kultur', '4 Saat', 'İdil (Volga) Nehri kıyısında Tatar ve Rus kültürünün buluştuğu UNESCO mirası kale, turkuaz kubbeli Kul Şerif Camii ve eğik Süyümbike Kulesi.'],
    ['ru-dp-21', 'Suzdal Ahşap Mimarisi ve Kremlini (Altın Halka)', 'Suzdal', 56.4167, 40.4500, 'gizli', '1 Gün', 'Tek bir yüksek binanın bile olmadığı, mavi yıldızlı kiliseleri, Kamenka Nehri çayırları ve bal likörü (Medovukha) ile ünlü açık hava müzesi kasaba.'],
    ['ru-dp-22', 'Soçi ve Krasnaya Polyana (Kafkas Dağları)', 'Soçi', 43.6815, 40.2611, 'doga', '1 - 2 Gün', 'Karadeniz’in subtropikal palmiyeli sahilinden yarım saatte 2.300 metrelik Rosa Khutor zirvelerine çıkılan dağ ve doğa rotası.'],
    ['ru-dp-23', 'Murmansk ve Teriberka (Kuzey Işıkları ve Arktik Okyanusu)', 'Murmansk', 69.1642, 35.1419, 'doga', '2 Gün', 'Kuzey Kutup Dairesi’nin ötesinde Barents Denizi kıyısı, gemi mezarlığı, ejderha yumurtası taşları ve Aurora Borealis (Kuzey Işıkları) avı.'],
    ['ru-dp-24', 'Vladivostok ve Altın Boynuz Köprüsü (Trans-Sibirya Son Durağı)', 'Vladivostok', 43.1155, 131.8855, 'kultur', '1 Gün', '9.288 kilometrelik efsanevi Trans-Sibirya Demiryolu’nun Pasifik Okyanusu kıyısındaki bitiş noktası, deniz fenerleri ve deniz ürünleri pazarı.']
  ]
});

// ============================================================================
// BALKANLAR & DOĞU AVRUPA (65 Granular Places)
// ============================================================================
const BALKANLAR_PACK = buildDeepCountryPack({
  region: 'dunya',
  subRegion: 'Avrupa',
  country: 'Balkanlar & Doğu Avrupa',
  seasons: ['ilkbahar', 'yaz', 'sonbahar'],
  budget: 'Ekonomik (₺)',
  food: 'Boşnak Böreği, Ćevapi (Köfte), Kajmak, Karadağ Deniz Ürünleri, Çek Trdelník, Macar Gulaşı ve Polonya Pierogi mantısı.',
  transport: 'Balkan şehirleri arasında manzaralı karayolları, trenler ve nehir-fiyort tekneleriyle kolayca seyahat edilir.',
  items: [
    // SIRBİSTAN (8)
    ['rs-dp-1', 'Sırbistan — Kalemegdan Kalesi ve Tuna-Sava Kavşağı', 'Belgrad, Sırbistan', 44.8231, 20.4503, 'kultur', '3 Saat', 'Tuna ve Sava nehirlerinin birleştiği noktaya bakan tarihi Osmanlı-Avusturya kalesi ve Belgrad’ın en güzel gün batımı terası.'],
    ['rs-dp-2', 'Sırbistan — Knez Mihailova ve Skadarlija Bohem Mahallesi', 'Belgrad, Sırbistan', 44.8178, 20.4644, 'bar', '3 Saat', 'Arnavut kaldırımlı tarihi sokaklarda canlı Balkan tamburacıları eşliğinde geleneksel kafanalar (restoranlar) ve sanat galerileri.'],
    ['rs-dp-3', 'Sırbistan — Nikola Tesla Müzesi ve Aziz Sava Katedrali', 'Belgrad, Sırbistan', 44.8051, 20.4707, 'muze', '3 Saat', 'Elektriğin dahisi Tesla’nın orijinal icatlarının interaktif denendiği müze ve altın mozaikli devasa Aziz Sava Katedrali.'],
    ['rs-dp-4', 'Sırbistan — Zemun Sahili ve Gardoš (Milenyum) Kulesi', 'Belgrad, Sırbistan', 44.8483, 20.4097, 'kultur', '3 Saat', 'Avusturya-Macaristan mimarisiyle Belgrad’dan tamamen farklı bir atmosfere sahip Tuna kıyısı, kuğular ve balık restoranları.'],
    ['rs-dp-5', 'Sırbistan — Novi Sad, Petrovaradin Kalesi ve Sremski Karlovci', 'Novi Sad, Sırbistan', 45.2528, 19.8633, 'kultur', '1 Gün', 'Tuna kıyısındaki "Saat Kulesi Kalesi", pastel renkli Özgürlük Meydanı ve Osmanlı-Avusturya barışının imzalandığı şarap kasabası Karlofça.'],
    ['rs-dp-6', 'Sırbistan — Uvac Kanyonu Menderesleri ve Kızıl Akbabalar', 'Sjenica, Sırbistan', 43.3564, 19.9614, 'doga', '5 Saat', 'Nehrin 180 derecelik keskin kıvrımlarla çizdiği zümrüt yeşili menderesler ve tepelerinde süzülen nadir kızıl akbabalar.'],
    ['rs-dp-7', 'Sırbistan — Tara Milli Parkı ve Drina Nehri Kaya Evi', 'Bajina Bašta, Sırbistan', 43.9822, 19.5647, 'doga', '4 Saat', 'Drina Nehri’nin ortasındaki tek bir kayanın üzerinde duran ikonik ahşap kulübe ve Banjska Stena seyir noktası.'],
    ['rs-dp-8', 'Sırbistan — Golubac (Güvercinlik) Kalesi ve Demir Kapı Boğazı', 'Golubac, Sırbistan', 44.6611, 21.6775, 'muze', '3 Saat', 'Tuna Nehri’nin deniz gibi genişlediği noktada kayalıklara tırmanan 9 kuleli masalsı Orta Çağ kalesi.'],

    // BOSNA-HERSEK (8)
    ['ba-dp-1', 'Bosna-Hersek — Saraybosna Başçarşı, Sebil ve Bakırcılar Çarşısı', 'Saraybosna, Bosna-Hersek', 43.8598, 18.4313, 'kultur', '4 Saat', 'Gazi Hüsrev Bey Camii, Morica Han, bakır cezvelerde pişen Boşnak kahvesi ve közde pişen ćevapi kokularıyla yaşayan Osmanlı mirası.'],
    ['ba-dp-2', 'Bosna-Hersek — Latin Köprüsü ve Umut Tüneli Müzesi', 'Saraybosna, Bosna-Hersek', 43.8576, 18.4289, 'muze', '3 Saat', '1. Dünya Savaşı’nı başlatan suikastin gerçekleştiği köprü ve 1990’lardaki kuşatma sırasında şehri hayata bağlayan 800 metrelik yeraltı tüneli.'],
    ['ba-dp-3', 'Bosna-Hersek — Vrelo Bosne (Bosna Nehri Kaynağı)', 'Saraybosna, Bosna-Hersek', 43.8186, 18.2694, 'doga', '2.5 Saat', 'İgman Dağı eteklerinde çınarlı fayton yolu, kuğulu berrak göletler ve ahşap köprülerle dolu doğa parkı.'],
    ['ba-dp-4', 'Bosna-Hersek — Mostar Köprüsü ve Koski Mehmed Paşa Camii', 'Mostar, Bosna-Hersek', 43.3372, 17.8150, 'kultur', '4 Saat', 'Mimar Hayreddin’in zümrüt yeşili Neretva Nehri üzerindeki şaheseri, köprüden atlayan gençler ve Kujundžiluk taş çarşısı.'],
    ['ba-dp-5', 'Bosna-Hersek — Blagaj Alperenler Tekkesi (Buna Nehri Kaynağı)', 'Blagaj, Bosna-Hersek', 43.2572, 17.9036, 'kultur', '2.5 Saat', '200 metrelik dik bir uçurumun altındaki mağaradan fışkıran turkuaz su kaynağının hemen kıyısına kurulmuş 16. yüzyıl derviş tekkesi.'],
    ['ba-dp-6', 'Bosna-Hersek — Poçitel Tarihi Osmanlı Taş Köyü', 'Poçitel, Bosna-Hersek', 43.1339, 17.7317, 'gizli', '2 Saat', 'Neretva vadisine bakan yamaçta taş kulesi, Şişman İbrahim Paşa Medresesi ve nar ağaçlarıyla zamanın durduğu UNESCO adayı köy.'],
    ['ba-dp-7', 'Bosna-Hersek — Kravice Şelaleleri', 'Ljubuški, Bosna-Hersek', 43.1558, 17.6081, 'doga', '3 Saat', 'Trebižat Nehri üzerinde 25 metre yükseklikten yarım daire şeklinde dökülen ve yazın göletinde yüzülebilen doğa harikası.'],
    ['ba-dp-8', 'Bosna-Hersek — Jajce Şelalesi, Su Değirmenleri ve Travnik', 'Jajce, Bosna-Hersek', 44.3392, 17.2706, 'doga', '4 Saat', 'Şehir merkezinin tam ortasından dökülen dev şelale, Pliva Gölü üzerindeki tarihi ahşap su değirmenleri ve Vezirler şehri Travnik.'],

    // KARADAĞ (7)
    ['me-dp-1', 'Karadağ — Kotor Eski Şehri (Stari Grad) ve San Giovanni Kalesi', 'Kotor, Karadağ', 42.4247, 18.7712, 'kultur', '4 Saat', 'Avrupa’nın en güney fiyordu olan Kotor Körfezi kıyısındaki Venedik surları ve 1.350 basamakla çıkılan nefes kesici kale manzarası.'],
    ['me-dp-2', 'Karadağ — Perast Barok Kasabası ve Kayaların Leydisi Adası', 'Perast, Karadağ', 42.4869, 18.6983, 'gizli', '2.5 Saat', 'Denizcilerin taş atarak 500 yılda oluşturduğu yapay ada üzerindeki mavi kubbeli kilise ve Perast’ın sessiz taş sarayları.'],
    ['me-dp-3', 'Karadağ — Budva Стаri Grad (Eski Şehir) ve Mogren Plajı', 'Budva, Karadağ', 42.2775, 18.8383, 'kultur', '3 Saat', 'Adriyatik kıyısındaki 2.500 yıllık sur içi taş sokaklar, Balerin Heykeli ve kayalıkların ardındaki berrak Mogren koyları.'],
    ['me-dp-4', 'Karadağ — Sveti Stefan Yarımadası ve Miločer Parkı', 'Sveti Stefan, Karadağ', 42.2556, 18.8914, 'doga', '2 Saat', 'Karaya ince bir kıstakla bağlı 15. yüzyıl balıkçı köyü adası ve çam ağaçları altındaki Kraliyet Plajı yürüyüş yolu.'],
    ['me-dp-5', 'Karadağ — Durmitor Milli Parkı, Kara Göl (Crno Jezero) ve Tara Kanyonu', 'Žabljak, Karadağ', 43.1464, 19.0928, 'doga', '1 Gün', 'Avrupa’nın en derin kanyonu olan Tara Nehri Kanyonu (1.300 m), Đurđevića Tara kemerli köprüsü ve buzul gölleri.'],
    ['me-dp-6', 'Karadağ — Ostrog Manastırı (Kayalıklara Oyulmuş Tapınak)', 'Danilovgrad, Karadağ', 42.6750, 19.0292, 'gizli', '2.5 Saat', '900 metre yükseklikteki tamamen dik Ostroška Greda kayalığının içine beyaz bir mücevher gibi oyulmuş 17. yüzyıl manastırı.'],
    ['me-dp-7', 'Karadağ — İşkodra Gölü (Pavlova Strana) ve Lovćen Mozolesi', 'Cetinje, Karadağ', 42.3997, 18.8378, 'doga', '4 Saat', 'Balkanların en büyük gölünün at nalı kıvrımı ve Lovćen Dağı zirvesinden tüm Karadağ’ı gören Njegoš Mozolesi.'],

    // ARNAVUTLUK & KUZEY MAKEDONYA (10)
    ['al-dp-1', 'Arnavutluk — Berat ("Bin Pencereli Şehir") ve Berat Kalesi', 'Berat, Arnavutluk', 40.7058, 19.9522, 'kultur', '4 Saat', 'Osum Nehri’nin iki yakasında üst üste dizilmiş beyaz Osmanlı konakları (Mangalem ve Gorica) ile UNESCO Dünya Mirası yaşayan kale.'],
    ['al-dp-2', 'Arnavutluk — Gjirokastër (Ergiri) Taş Şehri ve Kalesi', 'Gjirokastër, Arnavutluk', 40.0758, 20.1389, 'kultur', '4 Saat', 'Gri arduvaz taş çatılı Osmanlı konakları, Zekate Evi, tarihi çarşı ve İsmail Kadare’nin doğduğu dağ yamacı kenti.'],
    ['al-dp-3', 'Arnavutluk — Ksamil Adaları, Butrint Antik Kenti ve Mavi Göz (Syri i Kaltër)', 'Sarandë, Arnavutluk', 39.7756, 20.0056, 'doga', '1 Gün', 'İyon Denizi’nin Maldivleri sayılan turkuaz Ksamil koyları, UNESCO mirası Butrint lagün kenti ve dibi görünmeyen buz gibi Mavi Göz su kaynağı.'],
    ['al-dp-4', 'Arnavutluk — Theth ve Valbona (Arnavutluk Alpleri / Lanetli Dağlar)', 'İşkodra, Arnavutluk', 42.3958, 19.7744, 'doga', '2 Gün', 'Avrupa’nın en bakir dağ köylerinden Theth, Kanun Kulesi, Grunas Şelalesi ve Valbona Geçidi trekking rotası.'],
    ['al-dp-5', 'Arnavutluk — Tiran İskender Bey Meydanı, Bunk’Art ve Krujë (Akçahisar)', 'Tiran, Arnavutluk', 41.3275, 19.8187, 'muze', '4 Saat', 'Ethem Bey Camii, soğuk savaş nükleer sığınağından dönüştürülen Bunk’Art müzesi ve dağ yamacındaki tarihi Krujë pazarı.'],
    ['mk-dp-1', 'Kuzey Makedonya — Ohrid Gölü ve Aziz Jovan Kaneo Kilisesi', 'Ohrid, Kuzey Makedonya', 41.1111, 20.7889, 'kultur', '5 Saat', 'Avrupa’nın en eski ve en derin göllerinden Ohrid’in uçurum kenarındaki ikonik kilisesi, Çar Samuel Kalesi ve Ohrid incisi atölyeleri.'],
    ['mk-dp-2', 'Kuzey Makedonya — Sveti Naum Manastırı ve Kara Drim Kaynakları', 'Ohrid, Kuzey Makedonya', 40.9139, 20.7406, 'doga', '3 Saat', 'Tavus kuşlarının dolaştığı manastır bahçesi ve Ohrid Gölü’nü besleyen cam berraklığındaki su kaynaklarında sandal turu.'],
    ['mk-dp-3', 'Kuzey Makedonya — Üsküp Türk Çarşısı, Taşköprü ve Matka Kanyonu', 'Üsküp, Kuzey Makedonya', 41.9981, 21.4254, 'kultur', '1 Gün', 'Balkanların en büyük Osmanlı çarşısı, Vardar Nehri üzerindeki Fatih Sultan Mehmet Taşköprüsü ve Matka Kanyonu’nda Vrelo Mağarası tekne turu.'],

    // HIRVATİSTAN & SLOVENYA (10)
    ['hr-dp-1', 'Hırvatistan — Dubrovnik Surları, Stradun Caddesi ve Lokrum Adası', 'Dubrovnik, Hırvatistan', 42.6414, 18.1083, 'kultur', '1 Gün', 'Adriyatik’in İncisi; 2 kilometrelik kesintisiz Orta Çağ deniz surları yürüyüşü, Lovrijenac Kalesi ve teleferikle Srđ Tepesi manzarası.'],
    ['hr-dp-2', 'Hırvatistan — Split Diocletianus Sarayı ve Riva Kordonu', 'Split, Hırvatistan', 43.5081, 16.4402, 'muze', '4 Saat', 'Roma İmparatoru Diocletianus’un MS 305’te inşa ettirdiği ve bugün içinde kafelerin, dükkanların ve evlerin yaşadığı antik saray kenti.'],
    ['hr-dp-3', 'Hırvatistan — Plitvice Gölleri Milli Parkı', 'Lika-Senj, Hırvatistan', 44.8654, 15.5820, 'doga', '6 Saat', 'Traverten bentlerle birbirine bağlanan 16 turkuaz göl ve 90’dan fazla şelalenin üzerinde uzanan ahşap yürüyüş patikaları.'],
    ['hr-dp-4', 'Hırvatistan — Hvar Adası, İspanyol Kalesi ve Pakleni Adaları', 'Hvar, Hırvatistan', 43.1729, 16.4411, 'doga', '1 Gün', 'Lavanta tarlaları, Venedik mimarili St. Stephen Meydanı, yat limanı ve turkuaz Pakleni koyları.'],
    ['hr-dp-5', 'Hırvatistan — Zadar Deniz Orgu (Morske Orgulje) ve Güneşe Selam', 'Zadar, Hırvatistan', 44.1172, 15.2200, 'gizli', '2.5 Saat', 'Adriyatik dalgalarının mermer basamakların altındaki borulara çarparak müzik ürettiği deniz orgu ve güneş enerjili ışık enstalasyonu.'],
    ['hr-dp-6', 'Hırvatistan — Rovinj Yarımadası ve Pula Roma Arenası (İstria)', 'Rovinj, Hırvatistan', 45.0812, 13.6387, 'kultur', '5 Saat', 'Denize sıfır pastel renkli Venedik evleriyle Rovinj balıkçı kasabası ve dünyanın en iyi korunmuş 6 Roma amfitiyatrosundan biri olan Pula Arenası.'],
    ['hr-dp-7', 'Hırvatistan — Zagreb Yukarı Şehir (Gornji Grad) ve Kırık Kalpler Müzesi', 'Zagreb, Hırvatistan', 45.8164, 15.9736, 'muze', '4 Saat', 'Renkli çinili çatısıyla Aziz Mark Kilisesi, dünyanın en kısa füniküleri ve biten ilişkilerden kalan eşyaların hikayelerini anlatan ödüllü müze.'],
    ['si-dp-1', 'Slovenya — Bled Gölü, Ada Kilisesi ve Bled Kalesi', 'Bled, Slovenya', 46.3625, 14.0936, 'doga', '4 Saat', 'Julian Alpleri’nin eteklerinde zümrüt gölün ortasındaki masalsı ada, Pletna kayıkları ve meşhur Bled kremalı pastası (Kremšnita).'],
    ['si-dp-2', 'Slovenya — Ljubljana Ejderha Köprüsü ve Postojna Mağarası & Predjama Kalesi', 'Ljubljana, Slovenya', 46.0514, 14.5061, 'kultur', '1 Gün', 'Ljubljanica Nehri kıyısındaki yeşil başkent, içinde elektrikli trenle gezilen dev Postojna sarkıt mağarası ve mağara ağzına oyulmuş Predjama Kalesi.'],

    // ÇEKYA, MACARİSTAN, POLONYA, ROMANYA (22)
    ['cz-dp-1', 'Çekya — Prag Karl Köprüsü (Charles Bridge) ve Astronomik Saat', 'Prag, Çekya', 50.0865, 14.4114, 'kultur', '4 Saat', 'Vltava Nehri üzerindeki 30 barok heykelli 14. yüzyıl taş köprüsü, Eski Şehir Meydanı, Týn Kilisesi ve her saat başı canlanan 610 yıllık Astronomik Saat.'],
    ['cz-dp-2', 'Çekya — Prag Kalesi, Aziz Vitus Katedrali ve Altın Yol', 'Prag, Çekya', 50.0909, 14.4005, 'muze', '4 Saat', 'Dünyanın en büyük antik kale kompleksi, vitraylarıyla büyüleyen gotik katedral ve Franz Kafka’nın 22 numaralı minyatür evinin bulunduğu Altın Yol.'],
    ['cz-dp-3', 'Çekya — Klementinum Barok Kütüphanesi ve Strahov Manastırı', 'Prag, Çekya', 50.0866, 14.4160, 'muze', '2.5 Saat', 'Tavan freskleri, tarihi yer/gök küreleri ve binlerce el yazmasıyla dünyanın en güzel barok kütüphane salonları.'],
    ['cz-dp-4', 'Çekya — Český Krumlov Masal Kasabası ve Şatosu', 'Český Krumlov, Çekya', 48.8127, 14.3175, 'kultur', '5 Saat', 'Vltava Nehri’nin S çizerek sardığı Rönesans kasabası, pastel boyalı kuleli şatosu ve barok tiyatrosu.'],
    ['cz-dp-5', 'Çekya — Karlovy Vary Termal Kaplıcaları ve Atatürk’ün Kaldığı Oteller', 'Karlovy Vary, Çekya', 50.2242, 12.8819, 'kultur', '4 Saat', 'Teplá Nehri vadisindeki renkli neoklasik kolonadlar, şifalı sıcak su çeşmeleri ve Mustafa Kemal Atatürk’ün 1918’de kaldığı Carlsbad Plaza.'],
    ['cz-dp-6', 'Çekya — Kutná Hora ve Sedlec Kemik Kilisesi (Ossuary)', 'Kutná Hora, Çekya', 49.9619, 15.2881, 'gizli', '3 Saat', 'İç dekorasyonu ve dev avizesi tamamen 40.000 insan iskeletinden tasarlanmış sıra dışı şapel ve Aziz Barbara Gotik Katedrali.'],
    ['hu-dp-1', 'Macaristan — Budapeşte Parlamento Binası ve Tuna Kıyısındaki Ayakkabılar', 'Budapeşte, Macaristan', 47.5071, 19.0457, 'muze', '3 Saat', 'Tuna kıyısında yükselen 691 odalı neogotik başyapıt, Kutsal Macar Tacı ve nehir kıyısındaki dokunaklı demir ayakkabı anıtı.'],
    ['hu-dp-2', 'Macaristan — Buda Kalesi, Balıkçı Tabyası ve Matthias Kilisesi', 'Budapeşte, Macaristan', 47.5022, 19.0347, 'kultur', '4 Saat', 'Yedi Macar kabilesini simgeleyen masalsı beyaz kuleleriyle Balıkçı Tabyası’ndan Peşte yakası ve Zincirli Köprü panoraması.'],
    ['hu-dp-3', 'Macaristan — Széchenyi ve Gellért Tarihi Termal Hamamları', 'Budapeşte, Macaristan', 47.5186, 19.0824, 'doga', '3 Saat', 'Sarı neobarok saray avlusunda kışın kar yağarken bile 38 derece açık havuzlarda satranç oynanan Avrupa’nın en büyük termal kompleksi.'],
    ['hu-dp-4', 'Macaristan — Yahudi Mahallesi ve Harabe Barlar (Szimpla Kert)', 'Budapeşte, Macaristan', 47.4969, 19.0633, 'bar', '3 Saat', 'Terk edilmiş tarihi binaların retro eşyalar, sanat enstalasyonları ve bitkilerle dönüştürüldüğü dünyaca ünlü Ruin Bars kültürü ve New York Café.'],
    ['hu-dp-5', 'Macaristan — Estergon Kalesi, Vişegrad ve Szentendre Sanat Köyü', 'Estergon, Macaristan', 47.7989, 18.7364, 'kultur', '5 Saat', 'Tuna Dirseği rotası; Osmanlı tarihinde derin iz bırakan Estergon Bazilikası ve Arnavut kaldırımlı renkli Szentendre kasabası.'],
    ['pl-dp-1', 'Polonya — Kraków Ana Meydanı (Rynek Główny) ve Wawel Kalesi', 'Kraków, Polonya', 50.0619, 19.9369, 'kultur', '5 Saat', 'Avrupa’nın en büyük Orta Çağ meydanı, Kumaş Pazarı (Sukiennice), Meryem Ana Bazilikası borazan geleneği ve Wawel Ejderhası Kalesi.'],
    ['pl-dp-2', 'Polonya — Wieliczka Tuz Madeni ve Yeraltı Katedrali', 'Wieliczka, Polonya', 49.9831, 20.0558, 'gizli', '3.5 Saat', 'Yerin 135 metre altında tamamen kaya tuzundan oyulmuş devasa Aziz Kinga Katedrali, tuzdan avizeler, heykeller ve yeraltı gölleri.'],
    ['pl-dp-3', 'Polonya — Auschwitz-Birkenau Anıt ve Müzesi', 'Oświęcim, Polonya', 50.0275, 19.2020, 'muze', '4 Saat', 'İnsanlık tarihinin en karanlık sayfasına tanıklık eden UNESCO Dünya Mirası anıt alanı ve belgesel sergi blokları.'],
    ['pl-dp-4', 'Polonya — Varşova Eski Şehir (Stare Miasto) ve Chopin Müzesi', 'Varşova, Polonya', 52.2497, 21.0122, 'kultur', '4 Saat', '2. Dünya Savaşı sonrası Canaletto tablolarına bakılarak tuğla tuğla yeniden inşa edilen UNESCO mirası meydan ve Kraliyet Kalesi.'],
    ['pl-dp-5', 'Polonya — Gdańsk Uzun Pazar (Długi Targ) ve Malbork Kalesi', 'Gdańsk, Polonya', 54.3485, 18.6532, 'kultur', '1 Gün', 'Baltık kıyısında kehribar dükkanları ve Hansa mimarisiyle parlayan Gdańsk ile dünyanın tuğladan yapılmış en büyük kalesi olan Malbork Şövalye Kalesi.'],
    ['pl-dp-6', 'Polonya — Zakopane ve Tatra Dağları (Morskie Oko Gölü)', 'Zakopane, Polonya', 49.2019, 20.0708, 'doga', '1 Gün', 'Polonya’nın kış başkenti, kendine özgü ahşap dağ mimarisi, tütsülenmiş Oscypek peyniri ve Tatra zirveleri arasındaki buzul gölü yürüyüşü.'],
    ['ro-dp-1', 'Romanya — Bran Şatosu (Drakula Kalesi) ve Braşov Kara Kilise', 'Braşov, Romanya', 45.5149, 25.3672, 'kultur', '5 Saat', 'Transilvanya ormanlarında kayalık tepeye tünemiş efsanevi gotik şato ve Karpat Dağları eteklerindeki Sakson şehri Braşov.'],
    ['ro-dp-2', 'Romanya — Peleş Şatosu (Sinaia) ve Sighișoara Orta Çağ Kalesi', 'Sinaia, Romanya', 45.3600, 25.5428, 'muze', '5 Saat', 'Avrupa’nın elektrik ve asansör kullanılan ilk neo-Rönesans kraliyet sarayı Peleş ve UNESCO mirası renkli kuleli Sighișoara.'],
    ['ro-dp-3', 'Romanya — Transfăgărășan Dağ Yolu ve Bâlea Buzul Gölü', 'Argeș, Romanya', 45.5983, 24.6164, 'doga', '4 Saat', 'Karpat Dağları’nda 2.042 metreye tırmanan 90 keskin virajlı, dünyanın en heyecan verici sürüş ve manzara rotalarından biri.'],
    ['ro-dp-4', 'Romanya — Bükreş Parlamento Sarayı ve Lipscani Eski Şehir (Carturesti Carusel)', 'Bükreş, Romanya', 44.4275, 26.0875, 'kultur', '4 Saat', 'Pentagon’dan sonra dünyanın en ağır idari binası, Stavropoleos Manastırı ve bembeyaz balkonlarıyla ünlü masalsı Carturesti Carusel kitabevi.']
  ]
});

// ============================================================================
// İSKANDİNAVYA & İZLANDA (42 Granular Places)
// ============================================================================
const ISKANDINAVYA_PACK = buildDeepCountryPack({
  region: 'dunya',
  subRegion: 'Avrupa',
  country: 'İskandinavya & İzlanda',
  seasons: ['yaz', 'kis'],
  budget: 'Yüksek (₺₺₺)',
  food: 'Norveç Kral Yengeci ve Somonu, İsveç Köftesi (Köttbullar) ve Tarçınlı Çöreği (Kanelbullar), Danimarka Smørrebrød ve İzlanda Kuzu Çorbası.',
  transport: 'Fiyort feribotları, panoramik dağ trenleri (Flåmsbana), İzlanda Ring Road (1 numaralı çevre yolu) ve elektrikli şehir içi ulaşım.',
  items: [
    // NORVEÇ (12)
    ['no-dp-1', 'Norveç — Oslo Opera Binası, Munch Müzesi ve Vigeland Heykel Parkı', 'Oslo, Norveç', 59.9075, 10.7531, 'muze', '4 Saat', 'Mermer çatısında yürünebilen fiyort kıyısındaki Opera Binası, Edvard Munch’un "Çığlık" tablosu ve 212 granit heykelden oluşan Vigeland Parkı.'],
    ['no-dp-2', 'Norveç — Bergen Bryggen Ahşap İskelesi ve Fløibanen Füniküleri', 'Bergen, Norveç', 60.3975, 5.3233, 'kultur', '4 Saat', 'UNESCO mirası rengarenk Hansa ticaret evleri, ünlü balık pazarı ve Fløyen Dağı tepesinden fiyort manzarası.'],
    ['no-dp-3', 'Norveç — Flåm Panoramik Dağ Treni (Flåmsbana) ve Nærøyfjord', 'Flåm, Norveç', 60.8638, 7.1142, 'doga', '5 Saat', 'Deniz seviyesindeki fiyorttan 866 metredeki Myrdal’a şelaleler arasından tırmanan dünyanın en dik ve manzaralı tren hatlarından biri.'],
    ['no-dp-4', 'Norveç — Geirangerfjord ve Yedi Kız Kardeşler Şelalesi', 'Geiranger, Norveç', 62.1015, 7.0941, 'doga', '5 Saat', 'UNESCO Dünya Mirası fiyordunda dik kayalıklardan dökülen şelaleler, terk edilmiş dağ çiftlikleri ve Dalsnibba (1.500 m) gökyüzü terası.'],
    ['no-dp-5', 'Norveç — Trollstigen (Trollerin Merdiveni) ve Atlantik Okyanus Yolu', 'Møre og Romsdal, Norveç', 62.4567, 7.6733, 'doga', '5 Saat', '11 keskin virajlı dağ geçidi ve okyanus adacıklarını kavisli köprülerle birbirine bağlayan mühendislik harikası Atlantik Yolu.'],
    ['no-dp-6', 'Norveç — Preikestolen (Vaiz Kayası) ve Lysefjord', 'Stavanger, Norveç', 58.9864, 6.1903, 'doga', '5 Saat', 'Lysefjord’un 604 metre üzerinde tamamen düz bir masa gibi uzanan uçurum kayalığına yapılan 4 saatlik efsanevi doğa yürüyüşü.'],
    ['no-dp-7', 'Norveç — Trolltunga (Troll Dili Kayası)', 'Odda, Norveç', 60.1242, 6.7400, 'doga', '1 Gün', 'Ringedalsvatnet Gölü’nün 700 metre üzerinde boşluğa doğru yatay uzanan kaya çıkıntısı; dünyanın en ikonik doğa fotoğrafı noktası.'],
    ['no-dp-8', 'Norveç — Lofoten Adaları (Reine, Hamnøy ve Henningsvær)', 'Nordland, Norveç', 67.9325, 13.0886, 'doga', '2 Gün', 'Denizden bıçak gibi yükselen granit zirvelerin eteklerindeki kırmızı balıkçı kulübeleri (Rorbuer) ve kayalık ada üzerindeki ünlü futbol sahası.'],
    ['no-dp-9', 'Norveç — Tromsø Arktik Katedrali, Fjellheisen ve Kuzey Işıkları', 'Tromsø, Norveç', 69.6492, 18.9553, 'doga', '1 Gün', 'Kuzey Kutup Dairesi’nin 350 km kuzeyinde balina safarileri, ren geyiği kızakları ve Kuzey Işıkları’nın başkenti.'],
    ['no-dp-10', 'Norveç — Ålesund Art Nouveau Şehri ve Aksla Tepesi', 'Ålesund, Norveç', 62.4722, 6.1495, 'kultur', '3 Saat', '1904 yangınından sonra masalsı Art Nouveau kulelerle yeniden kurulan ada şehri ve 418 basamakla çıkılan Aksla seyir terası.'],

    // İSVEÇ, DANİMARKA, FİNLANDİYA (16)
    ['se-dp-1', 'İsveç — Stockholm Gamla Stan (Eski Şehir) ve Nobel Müzesi', 'Stockholm, İsveç', 59.3251, 18.0708, 'kultur', '4 Saat', '14 adaya yayılan başkentin Orta Çağ kalbi, Stortorget Meydanı’nın renkli binaları, Kraliyet Sarayı ve daracık Mårten Trotzigs Gränd sokağı.'],
    ['se-dp-2', 'İsveç — Vasa Müzesi ve Skansen Açık Hava Müzesi (Djurgården)', 'Stockholm, İsveç', 59.3280, 18.0914, 'muze', '4 Saat', '1628’deki ilk yolculuğunda batan ve 333 yıl sonra %98 sağlam çıkarılan 69 metrelik orijinal kalyon ile dünyanın ilk açık hava müzesi.'],
    ['se-dp-3', 'İsveç — Stockholm Metrosu Sanat Galerisi İstasyonları', 'Stockholm, İsveç', 59.3310, 18.0592, 'gizli', '2 Saat', '110 kilometrelik dünyanın en uzun sanat galerisi; T-Centralen, Stadion, Solna Centrum ve Kungsträdgården mağara istasyonları.'],
    ['se-dp-4', 'İsveç — Abisko Milli Parkı ve Jukkasjärvi Buz Otel (İsveç Laponyası)', 'Kiruna, İsveç', 68.3495, 18.8312, 'doga', '2 Gün', 'Mikrokliması sayesinde dünyada Kuzey Işıkları’nın en net görüldüğü Gökyüzü İstasyonu ve her kış Torne Nehri buzlarından yeniden yapılan Icehotel.'],
    ['dk-dp-1', 'Danimarka — Kopenhag Nyhavn Limanı ve Kanal Turu', 'Kopenhag, Danimarka', 55.6798, 12.5914, 'kultur', '3 Saat', 'Hans Christian Andersen’in yaşadığı 17. yüzyıl rengarenk rıhtım evleri, tarihi ahşap yelkenliler ve hygge atmosferli kafeler.'],
    ['dk-dp-2', 'Danimarka — Tivoli Bahçeleri ve Rosenborg Kalesi', 'Kopenhag, Danimarka', 55.6737, 12.5681, 'kultur', '4 Saat', '1843’te açılan ve Walt Disney’e ilham veren dünyanın en eski ikinci eğlence bahçesi ile Danimarka Kraliyet Mücevherlerinin korunduğu Rönesans şatosu.'],
    ['dk-dp-3', 'Danimarka — Küçük Denizkızı, Christiansborg ve Christiania Özgür Bölgesi', 'Kopenhag, Danimarka', 55.6929, 12.5993, 'gizli', '3 Saat', 'Liman kayalıklarındaki ikonik bronz heykel, Kurtarıcı Kilisesi’nin dıştan döner altın kulesi ve alternatif sanat mahallesi Christiania.'],
    ['dk-dp-4', 'Danimarka — Frederiksborg ve Kronborg (Hamlet’in) Şatoları', 'Kuzey Zelanda, Danimarka', 55.9350, 12.3008, 'muze', '5 Saat', 'Göl adacıkları üzerine kurulu Danimarka’nın Versay’ı Frederiksborg ve Shakespeare’in Hamlet oyununa sahne olan deniz kıyısındaki Kronborg Kalesi.'],
    ['fi-dp-1', 'Finlandiya — Helsinki Senato Meydanı, Kaya Kilisesi ve Oodi Kütüphanesi', 'Helsinki, Finlandiya', 60.1699, 24.9522, 'kultur', '4 Saat', 'Bembeyaz Helsinki Katedrali, granit kayanın içine oyulmuş bakır kubbeli Temppeliaukio Kilisesi ve geleceğin yaşam alanı Oodi Kütüphanesi.'],
    ['fi-dp-2', 'Finlandiya — Suomenlinna Deniz Kalesi ve Allas Deniz Havuzu & Sauna', 'Helsinki, Finlandiya', 60.1454, 24.9881, 'doga', '4 Saat', 'Vapur ile 15 dakikada ulaşılan 6 adalık UNESCO Dünya Mirası deniz kalesi ve Baltık kıyısında geleneksel Fin saunası deneyimi.'],
    ['fi-dp-3', 'Finlandiya — Rovaniemi Noel Baba Köyü ve Cam İglo Deneyimi (Laponya)', 'Rovaniemi, Finlandiya', 66.5436, 25.8472, 'doga', '2 Gün', 'Kuzey Kutup Çizgisi’nin (66°33\'N) tam üzerinden geçmek, husky ve ren geyiği safarisi ile cam tavanlı iglolarda Kuzey Işıkları altında uyumak.'],

    // İZLANDA (14)
    ['is-dp-1', 'İzlanda — Altın Çember: Thingvellir, Geysir ve Gullfoss Şelalesi', 'Güneybatı İzlanda', 64.3271, -20.1199, 'doga', '6 Saat', 'Avrasya ve Kuzey Amerika kıta plakalarının ayrıldığı vadi, 5 dakikada bir 30 metreye fışkıran Strokkur gayzeri ve iki kademeli dev Gullfoss şelalesi.'],
    ['is-dp-2', 'İzlanda — Seljalandsfoss ve Skógafoss Şelaleleri', 'Güney İzlanda', 63.6156, -19.9886, 'doga', '3 Saat', 'Su perdesinin tam arkasına yürüyerek geçilebilen 60 metrelik Seljalandsfoss ve güneşli günlerde çift gökkuşağı oluşturan görkemli Skógafoss.'],
    ['is-dp-3', 'İzlanda — Reynisfjara Siyah Kum Plajı ve Dyrhólaey Bazalt Sütunları', 'Vík, İzlanda', 63.4042, -19.0450, 'doga', '2.5 Saat', 'Atlantik’in dev dalgalarının dövdüğü simsiyah volkanik kumsal, altıgen bazalt org sütunları mağarası ve okyanustaki Reynisdrangar kaya kuleleri.'],
    ['is-dp-4', 'İzlanda — Jökulsárlón Buzul Lagünü ve Elmas Plajı (Diamond Beach)', 'Vatnajökull, İzlanda', 64.0484, -16.1794, 'doga', '4 Saat', 'Buzuldan kopan mavi-beyaz buzdağlarının foklarla birlikte yüzdüğü lagün ve siyah kumsala vuran kristal buz kütleleri.'],
    ['is-dp-5', 'İzlanda — Vatnajökull Mavi Buz Mağaraları ve Skaftafell (Svartifoss)', 'Güney İzlanda', 64.0275, -16.9753, 'doga', '5 Saat', 'Avrupa’nın en büyük buzulunun altında kışın oluşan safir mavisi kristal mağaralar ve siyah bazalt sütunlarla çevrili Svartifoss şelalesi.'],
    ['is-dp-6', 'İzlanda — Blue Lagoon (Mavi Lagün) ve Sky Lagoon Jeotermal Kaplıcası', 'Grindavík, İzlanda', 63.8804, -22.4495, 'doga', '3 Saat', 'Siyah lav tarlalarının ortasında silika bakımından zengin süt mavisi 39 derece jeotermal sularda yüzme ve volkanik çamur maskesi.'],
    ['is-dp-7', 'İzlanda — Kirkjufell Dağı ve Snæfellsnes Yarımadası', 'Grundarfjörður, İzlanda', 64.9417, -23.3069, 'doga', '5 Saat', '"Minyatür İzlanda" olarak bilinen yarımadada şapka biçimli ikonik Kirkjufell Dağı, şelalesi, siyah Búðir Kilisesi ve Arnarstapi uçurumları.'],
    ['is-dp-8', 'İzlanda — Reykjavík Hallgrímskirkja, Harpa ve Sun Voyager', 'Reykjavík, İzlanda', 64.1417, -21.9267, 'kultur', '3 Saat', 'Bazalt lav sütunlarından esinlenen 74 metrelik kilise kulesi, renkli cam cepheli Harpa Konser Salonu ve Viking gemisi heykeli.'],
    ['is-dp-9', 'İzlanda — Mývatn Gölü, Dettifoss Şelalesi ve Húsavík Balina Gözlemi', 'Kuzey İzlanda', 65.8147, -16.3847, 'doga', '1 Gün', 'Avrupa’nın en güçlü şelalesi Dettifoss, Hverir kaynayan çamur kazanları ve Húsavík koyunda kambur balina safarisi.'],
    ['is-dp-10', 'İzlanda — Landmannalaugar Renkli Riyolit Dağları ve Stuðlagil Kanyonu', 'İç Yaylalar, İzlanda', 63.9903, -19.0614, 'gizli', '1 Gün', 'Sarı, pembe, yeşil ve mavi tonlardaki volkanik riyolit dağlarında doğal sıcak nehirler ve dev bazalt sütunlu Stuðlagil Kanyonu.']
  ]
});

// ============================================================================
// ASYA DERİNLEŞTİRME: GÜNEY KORE, TAYLAND, HİNDİSTAN, VİETNAM, ÖZBEKİSTAN (75 Places)
// ============================================================================
const ASYA_DEEP_PACK = buildDeepCountryPack({
  region: 'dunya',
  subRegion: 'Asya',
  country: 'Asya Destinasyonları',
  seasons: ['ilkbahar', 'sonbahar', 'kis'],
  budget: 'Ekonomik (₺)',
  food: 'Kore Barbeküsü ve Bibimbap, Tayland Pad Thai ve Tom Yum, Hindistan Butter Chicken ve Masala Chai, Vietnam Pho, Özbek Pilavı.',
  transport: 'Asya’da yüksek hızlı trenler (KTX), şehir içi metrolar, nehir tekneleri ve yerel tuk-tuk/grab uygulamaları kullanılır.',
  items: [
    // GÜNEY KORE (14)
    ['kr-dp-1', 'Güney Kore — Gyeongbokgung Sarayı ve Bukchon Hanok Köyü', 'Seul, Güney Kore', 37.5796, 126.9770, 'kultur', '4 Saat', 'Joseon Hanedanlığı’nın en büyük sarayında kraliyet muhafız değişimi ve geleneksel Hanbok kıyafetleriyle gezilen 600 yıllık ahşap Hanok sokakları.'],
    ['kr-dp-2', 'Güney Kore — Changdeokgung Sarayı ve Gizli Bahçe (Huwon)', 'Seul, Güney Kore', 37.5794, 126.9910, 'muze', '3 Saat', 'Doğayla kusursuz uyum içinde inşa edilmiş UNESCO mirası saray ve nilüferli göletleriyle kralların özel dinlenme alanı olan Gizli Bahçe.'],
    ['kr-dp-3', 'Güney Kore — N Seoul Tower (Namsan) ve Myeongdong Gece Pazarı', 'Seul, Güney Kore', 37.5512, 126.9882, 'bar', '3.5 Saat', 'Teleferikle çıkılan Namsan Tepesi’nden Seul’ün 360 derece ışıkları ve aşağıda Kore kozmetiği ile sokak lezzetlerinin kalbi Myeongdong.'],
    ['kr-dp-4', 'Güney Kore — Gangnam Starfield COEX Kütüphanesi ve Bongeunsa Tapınağı', 'Seul, Güney Kore', 37.5116, 127.0592, 'kultur', '3 Saat', '13 metre yüksekliğindeki dev raflarıyla ünlü Starfield Kütüphanesi ve hemen karşısında gökdelenlerin ortasındaki 1.200 yıllık Budist tapınağı.'],
    ['kr-dp-5', 'Güney Kore — Hongdae, Itaewon ve Dongdaemun Design Plaza (DDP)', 'Seul, Güney Kore', 37.5665, 127.0095, 'bar', '4 Saat', 'Zaha Hadid’in uzay gemisini andıran fütüristik DDP binası ve genç sokak dansçılarının performans sergilediği Hongdae gece hayatı.'],
    ['kr-dp-6', 'Güney Kore — Gwangjang Geleneksel Pazarı ve Cheonggyecheon Deresi', 'Seul, Güney Kore', 37.5700, 126.9997, 'restoran', '2.5 Saat', 'Netflix "Street Food" ile ünlenen el yapımı erişte (Kalguksu) ve maş fasulyeli krep (Bindaetteok) tezgahları.'],
    ['kr-dp-7', 'Güney Kore — DMZ (Kuzey-Güney Kore Silahsızlandırılmış Bölge ve 3. Tünel)', 'Paju, Güney Kore', 37.8986, 126.7169, 'muze', '5 Saat', 'Soğuk Savaş’ın dünyadaki son aktif sınır hattı, Dora Gözlemevi’nden Kuzey Kore köylerini izleme ve yeraltı sızma tüneli.'],
    ['kr-dp-8', 'Güney Kore — Busan Gamcheon Kültür Köyü ve Jagalchi Balık Pazarı', 'Busan, Güney Kore', 35.0975, 129.0106, 'kultur', '4 Saat', '"Kore’nin Santorini’si" olarak anılan yamaçtaki rengarenk sanat köyü, Küçük Prens heykeli ve ülkenin en büyük deniz ürünleri çarşısı.'],
    ['kr-dp-9', 'Güney Kore — Haedong Yonggungsa Deniz Tapınağı ve Haeundae Sahil Treni', 'Busan, Güney Kore', 35.1884, 129.2233, 'kultur', '4 Saat', 'Okyanus dalgalarının dövdüğü kayalıklara kurulmuş nadir kıyı tapınağı ve deniz üstünden giden renkli Sky Capsule kapsül treni.'],
    ['kr-dp-10', 'Güney Kore — Gyeongju Bulguksa Tapınağı, Daereungwon Tümülüsleri ve Wolji Göleti', 'Gyeongju, Güney Kore', 35.7900, 129.3320, 'muze', '1 Gün', 'Silla Krallığı’nın "Duvarları Olmayan Müzesi"; çimen kaplı dev kral mezarları, Cheomseongdae antik gözlemevi ve gece suya yansıyan saray.'],
    ['kr-dp-11', 'Güney Kore — Jeju Adası: Seongsan Ilchulbong, Hallasan ve Manjanggul Lav Tüpü', 'Jeju, Güney Kore', 33.4581, 126.9425, 'doga', '2 Gün', 'Denizden yükselen devasa volkanik krater konisi, şelaleler, mandalina bahçeleri ve tüpsüz dalan kadın dalgıçlar (Haenyeo) kültürü.'],

    // TAYLAND (14)
    ['th-dp-1', 'Tayland — Bangkok Büyük Saray (Grand Palace) ve Zümrüt Buda (Wat Phra Kaew)', 'Bangkok, Tayland', 13.7500, 100.4913, 'muze', '3.5 Saat', 'Altın стуpalar, yakut ve zümrüt işlemeli tapınak çatıları, mitolojik Yaksha muhafızları ve tek parça yeşim taşından oyulmuş kutsal Zümrüt Buda.'],
    ['th-dp-2', 'Tayland — Wat Pho (Yatan Buda) ve Wat Arun (Şafak Tapınağı)', 'Bangkok, Tayland', 13.7465, 100.4927, 'kultur', '3 Saat', '46 metre uzunluğundaki altın kaplama Yatan Buda heykeli, geleneksel Tay masajı okulu ve Chao Phraya Nehri kıyısındaki porselen işlemeli Wat Arun.'],
    ['th-dp-3', 'Tayland — Yaowarat (Chinatown) Gece Lezzet Pazarı ve Sky Barlar', 'Bangkok, Tayland', 13.7411, 100.5083, 'restoran', '3 Saat', 'Neon tabelalar altında Michelin yıldızlı sokak tezgahları (Jay Fai vb.), mango sticky rice ve 60. kattaki çatı barlarından Bangkok panoraması.'],
    ['th-dp-4', 'Tayland — Damnoen Saduak Yüzen Çarşı ve Maeklong Tren Yolu Pazarı', 'Samut Songkhram, Tayland', 13.5194, 99.9592, 'gizli', '5 Saat', 'Kanallarda kayıklar üzerinde tropikal meyve ve noodle satılan yüzen pazar ile tren geçerken saniyeler içinde tentelerini toplayan ünlü pazar.'],
    ['th-dp-5', 'Tayland — Ayutthaya Antik Başkenti ve Ağaç Kökleri İçindeki Buda Başı', 'Ayutthaya, Tayland', 14.3569, 100.5686, 'muze', '5 Saat', 'Siyam Krallığı’nın 400 yıllık UNESCO mirası başkent kalıntıları ve Wat Mahathat’ta incir ağacı köklerinin sardığı ikonik Buda başı.'],
    ['th-dp-6', 'Tayland — Chiang Mai Doi Suthep Tapınağı ve Yi Peng Fener Festivali', 'Chiang Mai, Tayland', 18.8048, 98.9216, 'kultur', '5 Saat', 'Kuzey Tayland dağlarının zirvesindeki altın tapınak, etik fil barınakları ve gece pazarı zanaatkarları.'],
    ['th-dp-7', 'Tayland — Chiang Rai Beyaz Tapınak (Wat Rong Khun) ve Mavi Tapınak', 'Chiang Rai, Tayland', 19.8242, 99.7631, 'kultur', '4 Saat', 'Ayna parçalarıyla kaplı bembeyaz gerçeküstü mimarisiyle Wat Rong Khun ve safir mavisi iç mekanıyla Wat Rong Suea Ten.'],
    ['th-dp-8', 'Tayland — Phuket Eski Şehir (Sino-Portekiz Sokakları) ve Big Buddha', 'Phuket, Tayland', 7.8848, 98.3892, 'kultur', '4 Saat', 'Renkli колоnyal konaklar, Pazar Gecesi Yürüyüş Caddesi (Lard Yai) ve adaya tepeden bakan 45 metrelik beyaz mermer Buda.'],
    ['th-dp-9', 'Tayland — Phi Phi Adaları, Maya Bay ve Pileh Lagünü', 'Krabi, Tayland', 7.6786, 98.7658, 'doga', '1 Gün', 'Dik kireçtaşı kayalıklarının ortasında zümrüt yeşili kapalı lagünler, mercan resifleri ve "The Beach" filmiyle ünlenen Maya Koyu.'],
    ['th-dp-10', 'Tayland — Krabi Railay Plajı, Phra Nang Mağarası ve James Bond Adası (Phang Nga)', 'Krabi, Tayland', 8.0119, 98.8375, 'doga', '1 Gün', 'Sadece uzun kuyruklu teknelerle (Longtail Boat) ulaşılabilen sarkıtlı kireçtaşı kayalıkları ve Phang Nga Körfezi’nde deniz kanosu.'],
    ['th-dp-11', 'Tayland — Koh Samui, Ang Thong Deniz Milli Parkı ve Koh Tao', 'Surat Thani, Tayland', 9.5120, 100.0136, 'doga', '2 Gün', '42 zümrüt adacıktan oluşan takımada manzarası, palmiyeli kumsallar ve dünyanın en popüler tüplü dalış noktalarından Koh Tao.'],

    // HİNDİSTAN (14)
    ['in-dp-1', 'Hindistan — Tac Mahal ve Mehtab Bagh (Agra)', 'Agra, Hindistan', 27.1751, 78.0421, 'muze', '4 Saat', 'Babür İmparatoru Şah Cihan’ın eşi Mümtaz Mahal için yarı değerli taş kakmalı beyaz mermerden yaptırdığı ölümsüz aşk anıtı.'],
    ['in-dp-2', 'Hindistan — Agra Kalesi ve Fatehpur Sikri Hayalet Başkenti', 'Agra, Hindistan', 27.1795, 78.0211, 'muze', '4 Saat', 'Kızıl kumtaşından devasa Babür kalesi ve Ekber Şah’ın inşa ettirip susuzluk nedeniyle terk edilen kusursuz saray kenti.'],
    ['in-dp-3', 'Hindistan — Yeni Delhi: Hümayun Türbesi, Qutub Minar ve Lotus Tapınağı', 'Yeni Delhi, Hindistan', 28.5933, 77.2507, 'muze', '5 Saat', 'Tac Mahal’e ilham veren simetrik bahçeli Hümayun Türbesi, 73 metrelik tuğla zafer minaresi ve nilüfer çiçeği biçimli mermer tapınak.'],
    ['in-dp-4', 'Hindistan — Eski Delhi: Kızıl Kale, Cami Mescid ve Chandni Chowk Çarşısı', 'Yeni Delhi, Hindistan', 28.6562, 77.2410, 'kultur', '4 Saat', 'Bisiklet rikşalarıyla baharat, gümüş ve kumaş çarşıları arasında baş döndürücü bir yolculuk ve Hindistan’ın en büyük camisi.'],
    ['in-dp-5', 'Hindistan — Jaipur (Pembe Şehir): Hawa Mahal (Rüzgarlar Sarayı) ve Jantar Mantar', 'Jaipur, Hindistan', 26.9239, 75.8267, 'kultur', '3.5 Saat', 'Saray kadınlarının sokağı görülmeden izleyebilmesi için 953 petekli pencereyle yapılan pembe cephe ve dev taş astronomi aletleri.'],
    ['in-dp-6', 'Hindistan — Amber Kalesi (Amer Fort), Jal Mahal ve Panna Meena Basamaklı Kuyusu', 'Jaipur, Hindistan', 26.9855, 75.8513, 'muze', '4 Saat', 'Tepedeki kalenin milyonlarca küçük aynayla kaplı Aynalı Salonu (Sheesh Mahal), göl ortasındaki Su Sarayı ve geometrik basamaklı kuyu.'],
    ['in-dp-7', 'Hindistan — Udaipur (Göller Şehri): Şehir Sarayı ve Pichola Gölü Tekne Turu', 'Udaipur, Hindistan', 24.5764, 73.6835, 'kultur', '5 Saat', 'Rajasthan’ın en romantik kenti; tavus kuşu mozaikli saray avluları ve gölün ortasında yüzen mermer Tac Lake Palace.'],
    ['in-dp-8', 'Hindistan — Jodhpur (Mavi Şehir) ve Mehrangarh Kalesi', 'Jodhpur, Hindistan', 26.2978, 73.0185, 'kultur', '4 Saat', '120 metrelik dik bir kayalığın tepesinden aşağıdaki çivit mavisine boyanmış binlerce evi izleyen Hindistan’ın en heybetli kalesi.'],
    ['in-dp-9', 'Hindistan — Jaisalmer (Altın Şehir) ve Thar Çölü Deve Safarisi', 'Jaisalmer, Hindistan', 26.9124, 70.9122, 'doga', '1 Gün', 'Sarı kumtaşından yapılmış ve içinde hala binlerce insanın yaşadığı dünyanın tek "yaşayan çöl kalesi" ve kum tepelerinde yıldızlı kamp.'],
    ['in-dp-10', 'Hindistan — Amritsar Altın Tapınak (Harmandir Sahib)', 'Amritsar, Hindistan', 31.6200, 74.8765, 'kultur', '3.5 Saat', 'Kutsal havuzun ortasında saf altınla kaplı Sih tapınağı ve her gün 100.000 kişiye din/dil ayrımı yapmadan ücretsiz yemek sunan dünyanın en büyük mutfağı.'],
    ['in-dp-11', 'Hindistan — Kerala Backwaters (Alleppey Yüzen Evleri) ve Munnar Çay Tepeleri', 'Kerala, Hindistan', 9.4981, 76.3329, 'doga', '2 Gün', 'Hindistan cevizi palmiyeleriyle çevrili zümrüt lagünlerde geleneksel Kettuvallam tekne evlerle süzülme ve sisli çay plantasyonları.'],

    // VİETNAM, KAMBOÇYA, ENDONEZYA, MALEZYA, SİNGAPUR (18)
    ['vn-dp-1', 'Vietnam — Ha Long Körfezi ve Lan Ha Körfezi Kireçtaşı Adaları', 'Quang Ninh, Vietnam', 20.9101, 107.1839, 'doga', '2 Gün', 'Zümrüt sularından yükselen 1.600’den fazla kireçtaşı kulesi, yüzen balıkçı köyleri ve sarkıt mağaralarda ahşap gemi konaklaması.'],
    ['vn-dp-2', 'Vietnam — Hanoi Eski Mahalle (36 Lonca Sokağı), Tren Sokağı ve Hoan Kiem Gölü', 'Hanoi, Vietnam', 21.0333, 105.8500, 'kultur', '4 Saat', 'Evlerin santimetreler yakınından geçen ünlü Tren Sokağı’nda yumurtalı kahve (Egg Coffee) içmek ve geleneksel su kuklası tiyatrosu.'],
    ['vn-dp-3', 'Vietnam — Ninh Binh (Tam Coc & Trang An) ve Mua Mağarası Seyir Tepesi', 'Ninh Binh, Vietnam', 20.2167, 105.9167, 'doga', '1 Gün', '"Karadaki Ha Long Körfezi"; ayaklarıyla kürek çeken kayıkçılarla çeltik tarlaları ve mağara tünelleri arasından nehir yolculuğu.'],
    ['vn-dp-4', 'Vietnam — Hoi An Fenerli Antik Liman Kasabası ve Altın Köprü (Ba Na Hills)', 'Da Nang / Hoi An, Vietnam', 15.8794, 108.3350, 'kultur', '1 Gün', 'Akşamları binlerce ipek fenerle aydınlanan sarı kolonyal sokaklar, Japon Köprüsü ve dev taş ellerin tuttuğu Altın Köprü.'],
    ['vn-dp-5', 'Vietnam — Ho Chi Minh City (Saygon), Cu Chi Tünelleri ve Mekong Deltası', 'Ho Chi Minh, Vietnam', 10.7769, 106.7009, 'muze', '1 Gün', '250 kilometrelik yeraltı direniş tünelleri ağı, Fransız kolonyal mimarisi ve Mekong kanallarında konik şapkalı sampan kayıkları.'],
    ['kh-dp-1', 'Kamboçya — Angkor Wat, Bayon (Gülen Yüzler) ve Ta Prohm (Ağaçlı Tapınak)', 'Siem Reap, Kamboçya', 13.4125, 103.8670, 'muze', '2 Gün', 'Dünyanın en büyük dini anıtında gün doğumu, 216 devasa taş yüzlü Bayon ve dev ipek pamuk ağaçlarının kökleriyle sarmaş dolaş Ta Prohm.'],
    ['id-dp-1', 'Endonezya — Bali Ubud: Tegallalang Pirinç Terasları ve Kutsal Maymun Ormanı', 'Ubud, Bali', -8.4317, 115.2792, 'doga', '5 Saat', 'Subak sulama sistemiyle işlenen katmanlı zümrüt pirinç terasları, orman salıncakları, Tirta Empul su tapınağı ve sanat pazarları.'],
    ['id-dp-2', 'Endonezya — Bali Uluwatu Uçurum Tapınağı, Tanah Lot ve Nusa Penida (Kelingking)', 'Güney Bali, Endonezya', -8.8291, 115.0849, 'doga', '1 Gün', 'Okyanus uçurumunda gün batımı Kecak ateş dansı ve Nusa Penida adasının T-Rex sırtını andıran Kelingking turkuaz koyu.'],
    ['id-dp-3', 'Endonezya — Borobudur ve Prambanan Tapınakları ile Bromo Yanardağı (Cava)', 'Yogyakarta, Endonezya', -7.6079, 110.2038, 'muze', '2 Gün', 'Dünyanın en büyük Budist tapınağı Borobudur’da sisler içinde gün doğumu ve dumanı tüten Bromo krater kalderası.'],
    ['sg-dp-1', 'Singapur — Gardens by the Bay (Supertree Grove & Cloud Forest) ve Marina Bay Sands', 'Singapur', 1.2816, 103.8636, 'doga', '5 Saat', '50 metrelik dikey bahçe kulelerinde gece ışık şovu, dünyanın en büyük kapalı şelalesi ve 57. kat sonsuzluk havuzu terası.'],
    ['sg-dp-2', 'Singapur — Jewel Changi Havalimanı Şelalesi, Chinatown ve Sentosa Adası', 'Singapur', 1.3602, 103.9898, 'kultur', '5 Saat', 'Tropikal yağmur ormanı kubbesinin ortasından dökülen 40 metrelik Rain Vortex şelalesi ve Michelin yıldızlı Hawker Center lezzetleri.'],
    ['my-dp-1', 'Malezya — Kuala Lumpur Petronas İkiz Kuleleri ve Batu Mağaraları', 'Kuala Lumpur, Malezya', 3.1579, 101.7116, 'kultur', '5 Saat', '452 metrelik İslam geometrisiyle tasarlanmış ikiz kuleler ve 272 gökkuşağı renkli basamakla çıkılan dev kireçtaşı mağarası tapınağı.'],

    // ÖZBEKİSTAN & TÜRK DÜNYASI & KAFKASLAR (15)
    ['uz-dp-1', 'Özbekistan — Semerkant Registan Meydanı (Uluğ Bey, Şirdar ve Tilla-Kari Medreseleri)', 'Semerkant, Özbekistan', 39.6548, 66.9758, 'kultur', '4 Saat', 'İpek Yolu’nun kalbi; çivit mavisi, turkuaz ve altın çinileriyle İslam mimarisinin dünyadaki en görkemli meydanı.'],
    ['uz-dp-2', 'Özbekistan — Şah-ı Zinde Nekropolü, Gür-i Emir (Timur Türbesi) ve Bibi Hanım', 'Semerkant, Özbekistan', 39.6625, 66.9881, 'muze', '4 Saat', 'Emir Timur’un yeşim taşlı anıt mezarı, Uluğ Bey Rasathanesi ve turkuaz çini koridorlarıyla büyüleyen Şah-ı Zinde türbeler sokağı.'],
    ['uz-dp-3', 'Özbekistan — Buhara: Poi Kalon Külliyesi, Ark Kalesi ve Leb-i Havuz', 'Buhara, Özbekistan', 39.7758, 64.4150, 'kultur', '1 Gün', 'Cengiz Han’ın bile yıkmaya kıyamadığı 47 metrelik Kalon Minaresi, tarihi ticaret kubbeleri ve dut ağaçları altındaki Leb-i Havuz.'],
    ['uz-dp-4', 'Özbekistan — Hive İçan Kale (Açık Hava Müzesi Sur İçi Kenti)', 'Hive, Özbekistan', 41.3775, 60.3594, 'gizli', '1 Gün', 'Kerpiç surların içinde Kalta Minor turkuaz kulesi, 218 ahşap sütunlu Cuma Camii ve Binbir Gece Masallarını yaşatan sokaklar.'],
    ['uz-dp-5', 'Özbekistan — Taşkent Çorsu Pazarı, Hazreti İmam Külliyesi ve Metro İstasyonları', 'Taşkent, Özbekistan', 41.3267, 69.2347, 'kultur', '4 Saat', 'Dev turkuaz kubbeli Çorsu Pazarı, Taşkent Pilav Merkezi (Besh Qozon) ve dünyanın en eski Kuran-ı Kerim nüshalarından Osman Mushafı.'],
    ['az-dp-1', 'Azerbaycan — Bakü İçerişehir (Kız Kulesi & Şirvanşahlar Sarayı) ve Alev Kuleleri', 'Bakü, Azerbaycan', 40.3661, 49.8352, 'kultur', '5 Saat', 'UNESCO mirası sur içi tarihi mahalle, Zaha Hadid’in kıvrımlı Haydar Aliyev Merkezi ve Hazar Denizi kıyısındaki Bakü Bulvarı.'],
    ['az-dp-2', 'Azerbaycan — Gobustan Kaya Resimleri, Çamur Volkanları ve Şeki Han Sarayı', 'Gobustan / Şeki, Azerbaycan', 40.1128, 49.3781, 'muze', '1 Gün', '12.000 yıllık kaya üstü çizimler, hiç çivi ve yapıştırıcı kullanılmadan renkli camlarla (Şebeke) yapılan Şeki Han Sarayı ve Yanardağ.'],
    ['ge-dp-1', 'Gürcistan — Tiflis Eski Şehir, Kükürt Hamamları (Abanotubani) ve Narikala Kalesi', 'Tiflis, Gürcistan', 41.6878, 44.8086, 'kultur', '5 Saat', 'Kura Nehri üzerindeki uçurum evleri, Puşkin’in yıkandığı kubbeli kükürt hamamları, Barış Köprüsü ve eğik saat kulesi.'],
    ['ge-dp-2', 'Gürcistan — Kazbegi (Gergeti Teslis Kilisesi) ve Gürcü Askeri Yolu', 'Stepantsminda, Gürcistan', 42.6625, 44.6203, 'doga', '1 Gün', '5.047 metrelik Kazbek Dağı’nın hemen önünde 2.170 metredeki tepeye tünemiş 14. yüzyıl taş kilisesi ve Anauri Kalesi.'],
    ['ge-dp-3', 'Gürcistan — Batum Bulvarı, Ali ve Nino Heykeli ve Botanik Bahçesi', 'Batum, Gürcistan', 41.6539, 41.6361, 'kultur', '4 Saat', 'Karadeniz kıyısında hareket ederek birbirinin içinden geçen çelik aşk heykeli, Piazza Meydanı ve subtropikal botanik bahçesi.']
  ]
});

// ============================================================================
// ORTA DOĞU, AFRİKA & AMERİKA DERİNLEŞTİRME (70 Granular Places)
// ============================================================================
const DUNYA_EXTRA_DEEP_PACK = buildDeepCountryPack({
  region: 'dunya',
  subRegion: 'Amerika & Afrika & Orta Doğu',
  country: 'Küresel Rotalar',
  seasons: ['ilkbahar', 'sonbahar', 'kis'],
  budget: 'Orta (₺₺)',
  food: 'Fas Tajin ve Nane Çayı, Meksika Tacos al Pastor ve Mole, Peru Ceviche, Arjantin Asado Biftek ve Brezilya Churrasco.',
  transport: 'Bölgesel iç hat uçuşları, hızlı trenler (Fas Al Boraq) ve panoramik tur otobüsleri.',
  items: [
    // FAS (10)
    ['ma-dp-1', 'Fas — Marakeş Jemaa el-Fnaa Meydanı, Koutoubia ve Souk Çarşıları', 'Marakeş, Fas', 31.6258, -7.9891, 'kultur', '4 Saat', 'UNESCO Somut Olmayan Kültürel Mirası meydan; hikaye anlatıcıları, baharat tezgahları, deri ve bakır fener çarşıları.'],
    ['ma-dp-2', 'Fas — Majorelle Bahçesi (Yves Saint Laurent), Bahia Sarayı ve Ben Youssef Medresesi', 'Marakeş, Fas', 31.6415, -8.0033, 'muze', '4 Saat', 'Kobalt mavisi köşk ve dev kaktüs bahçesi ile 16. yüzyıl sedir ağacı ve zellij çini işçiliğinin zirvesi olan Ben Youssef Medresesi.'],
    ['ma-dp-3', 'Fas — Aït Benhaddou Kerpiç Kasbahı ve Atlas Dağları Geçidi', 'Ouarzazate, Fas', 31.0470, -7.1319, 'kultur', '4 Saat', 'Gladyatör ve Game of Thrones dizilerinin çekildiği UNESCO mirası kızıl kerpiç kale köyü.'],
    ['ma-dp-4', 'Fas — Merzouga (Erg Chebbi) Sahra Çölü Kumulları ve Berberi Kampı', 'Merzouga, Fas', 31.0994, -3.9794, 'doga', '1 - 2 Gün', '150 metre yüksekliğindeki altın-turuncu kum tepelerinde gün batımı deve kervanı ve Samanyolu altında çadır kampı.'],
    ['ma-dp-5', 'Fas — Fes el-Bali Medinası ve Chouara Tarihi Deri Tabakhaneleri', 'Fes, Fas', 34.0660, -4.9733, 'kultur', '5 Saat', '9.000 dar sokaktan oluşan dünyanın araç trafiğine kapalı en büyük Orta Çağ şehri ve 1.000 yıllık renkli boya kuyuları.'],
    ['ma-dp-6', 'Fas — Şafşavan (Chefchaouen — Mavi İnci Şehri)', 'Şafşavan, Fas', 35.1688, -5.2636, 'gizli', '4 Saat', 'Rif Dağları yamacında kapılarından merdivenlerine kadar mavinin her tonuna boyanmış Endülüs ruhlu kasaba.'],
    ['ma-dp-7', 'Fas — Kazablanka II. Hasan Camii ve Rick’s Café', 'Kazablanka, Fas', 33.6085, -7.6327, 'kultur', '3 Saat', 'Atlantik Okyanusu’nun dalgaları üzerine inşa edilmiş 210 metrelik minaresiyle dünyanın en yüksek minareli camilerinden biri.'],
    ['ma-dp-8', 'Fas — Essaouira (Suveyre) Atlantik Kalesi ve Rabat Oudayas Kasbahı', 'Essaouira, Fas', 31.5125, -9.7700, 'kultur', '4 Saat', 'Mavi balıkçı tekneleri, martılar ve okyanus rüzgarlarıyla ünlü Portekiz surlu sahil kenti.'],

    // ÜRDÜN, BAE, İRAN (12)
    ['jo-dp-1', 'Ürdün — Petra Antik Kenti: El-Hazne (Treasury) ve El-Deir (Manastır)', 'Vadi Musa, Ürdün', 30.3285, 35.4444, 'muze', '1 Gün', '1.2 kilometrelik dar Siq kanyonunun sonunda pembe kumtaşına oyulmuş Nebati başyapıtı ve 800 basamakla çıkılan dev Manastır.'],
    ['jo-dp-2', 'Ürdün — Wadi Rum ("Ay Vadisi") Kızıl Çölü ve Lut Gölü (Ölü Deniz)', 'Akabe, Ürdün', 29.5764, 35.4194, 'doga', '1 Gün', 'Mars filmlerinin çekildiği kızıl granit dağlarda 4x4 safari ve dünyanın en alçak noktası olan (-430 m) Lut Gölü’nde batmadan yüzme.'],
    ['jo-dp-3', 'Ürdün — Jerash (Gerasa) Roma Kenti ve Amman Kalesi', 'Jerash, Ürdün', 32.2808, 35.8911, 'muze', '4 Saat', 'İtalya dışındaki en iyi korunmuş Roma eyalet kenti; Oval Forum, Sütunlu Cadde ve Hadrianus Takı.'],
    ['ae-dp-1', 'BAE — Dubai Burj Khalifa (828 m), Dubai Mall Çeşmeleri ve Gelecek Müzesi', 'Dubai, BAE', 25.1972, 55.2744, 'kultur', '5 Saat', 'Dünyanın en yüksek binasının 148. katından çöl ve Basra Körfezi manzarası ile Arap kaligrafisiyle kaplı çelik Gelecek Müzesi.'],
    ['ae-dp-2', 'BAE — Eski Dubai (Al Fahidi, Abra Kayıkları, Altın Çarşısı) ve Çöl Safarisi', 'Dubai, BAE', 25.2636, 55.2972, 'kultur', '5 Saat', 'Rüzgar kuleli tarihi konaklar, 1 dirheme Dubai Koyu’nu geçen ahşap Abra tekneleri ve baharat/altın çarşıları.'],
    ['ae-dp-3', 'BAE — Abu Dabi Şeyh Zayed Camii, Louvre Abu Dhabi ve Qasr Al Watan', 'Abu Dabi, BAE', 24.4128, 54.4750, 'muze', '6 Saat', '82 beyaz mermer kubbeli Şeyh Zayed Camii ve Jean Nouvel’in "ışık yağmuru" kubbesi altındaki Louvre Abu Dhabi Müzesi.'],
    ['ir-dp-1', 'İran — İsfahan Nakş-ı Cihan Meydanı (İmam Camii, Ali Kapu, Şeyh Lütfullah)', 'İsfahan, İran', 32.6572, 51.6775, 'kultur', '5 Saat', '"İsfahan dünyanın yarısıdır" sözünü doğrulayan turkuaz çinili dev meydan ve Zayende Nehri üzerindeki 33 kemerli Si-o-se-pol Köprüsü.'],
    ['ir-dp-2', 'İran — Şiraz Nasır el-Mülk (Pembe Cami), Persepolis ve Yezd Rüzgar Kuleleri', 'Şiraz, İran', 29.6086, 52.5483, 'muze', '2 Gün', 'Sabah güneşinin vitraylardan halılara gökkuşağı gibi düştüğü Pembe Cami, Pers İmparatorluğu başkenti Persepolis ve Zerdüşt şehri Yezd.'],

    // GÜNEY AFRİKA, TANZANYA, KENYA (8)
    ['za-dp-1', 'Güney Afrika — Cape Town Masa Dağı (Table Mountain), Bo-Kaap ve V&A Waterfront', 'Cape Town, Güney Afrika', -33.9628, 18.4098, 'doga', '5 Saat', '360 derece dönebilen teleferikle çıkılan düz zirve ve rengarenk Cape Malay evleriyle Bo-Kaap mahallesi.'],
    ['za-dp-2', 'Güney Afrika — Ümit Burnu (Cape Point) ve Boulders Plajı Penguen Kolonisi', 'Cape Yarımadası, Güney Afrika', -34.3568, 18.4975, 'doga', '5 Saat', 'Granit kayalar arasında yürüyen binlerce Afrika pengueni ve Afrika kıtasının güneybatı uçurum noktası.'],
    ['za-dp-3', 'Güney Afrika — Kruger Milli Parkı ("Big Five" — Büyük Beşli Safari)', 'Mpumalanga, Güney Afrika', -24.0167, 31.4833, 'doga', '2 Gün', 'Aslan, leopar, fil, gergedan ve bufalonun doğal ortamında izlendiği dünyanın en ünlü safari rezervlerinden biri.'],
    ['tz-dp-1', 'Tanzanya — Serengeti Büyük Göçü, Ngorongoro Krateri ve Zanzibar Taş Şehir', 'Arusha / Zanzibar, Tanzanya', -3.1619, 35.5877, 'doga', '3 Gün', 'Sönmüş volkan kraterinin tabanındaki dev yaban hayatı cenneti ve baharat adası Zanzibar’ın turkuaz suları.'],

    // MEKSİKA (12)
    ['mx-dp-1', 'Meksika — Mexico City: Zócalo Meydanı, Ulusal Antropoloji Müzesi ve Chapultepec Kalesi', 'Mexico City, Meksika', 19.4260, -99.1863, 'muze', '5 Saat', 'Orijinal Aztek Güneş Taşı’nın sergilendiği dünyaca ünlü müze ve Amerika kıtasının tek kraliyet kalesi olan Chapultepec.'],
    ['mx-dp-2', 'Meksika — Frida Kahlo Müzesi (Casa Azul / Mavi Ev) ve Coyoacán Mahallesi', 'Mexico City, Meksika', 19.3551, -99.1625, 'muze', '3 Saat', 'Frida Kahlo ve Diego Rivera’nın yaşadığı çivit mavisi ev, şövalesi, elbiseleri ve bohem Coyoacán çarşısı.'],
    ['mx-dp-3', 'Meksika — Xochimilco Yüzen Bahçeleri ve Teotihuacan (Güneş ve Ay Piramitleri)', 'Mexico City, Meksika', 19.6925, -98.8438, 'kultur', '1 Gün', 'Aztek öncesi "Tanrıların Doğduğu Şehir" Teotihuacan’ın Ölüler Yolu ve Mariachi müzisyenleriyle renkli Trajinera tekneleri.'],
    ['mx-dp-4', 'Meksika — Chichén Itzá (Kukulkan Piramidi) ve Kutsal Cenote Ik Kil / Suytun', 'Yucatán, Meksika', 20.6843, -88.5678, 'muze', '5 Saat', 'Dünyanın Yeni 7 Harikası’ndan biri olan akustik Maya piramidi ve sarmaşıkların sarktığı çöküntü mağarası gölleri (Cenote).'],
    ['mx-dp-5', 'Meksika — Tulum Deniz Kıyısı Maya Kalıntıları ve Isla Mujeres / Cancún', 'Quintana Roo, Meksika', 20.2147, -87.4292, 'doga', '1 Gün', 'Karayip Denizi’nin turkuaz sularına bakan uçurum üzerindeki tek Maya antik kenti ve beyaz kumlu plajlar.'],
    ['mx-dp-6', 'Meksika — Oaxaca Tarihi Merkezi, Hierve el Agua Taşlaşmış Şelaleleri ve Monte Albán', 'Oaxaca, Meksika', 17.0654, -96.7236, 'kultur', '1 Gün', 'Meksika gastronomisinin başkenti, dağ tepesindeki Zapotek kenti Monte Albán ve uçurum kenarındaki mineral havuzlar.'],
    ['mx-dp-7', 'Meksika — Guanajuato Renkli Tünel Şehri ve San Miguel de Allende', 'Guanajuato, Meksika', 20.9144, -100.7452, 'kultur', '1 Gün', 'Disney "Coco" filmine ilham veren pembe neogotik kiliseli San Miguel ve yeraltı caddeleriyle rengarenk Guanajuato.'],

    // PERU, BREZİLYA, ARJANTİN, ŞİLİ, KOLOMBİYA, KANADA (22)
    ['pe-dp-1', 'Peru — Machu Picchu ve Huayna Picchu (Kutsal İnka Kalesi)', 'Cusco, Peru', -13.1631, -72.5450, 'muze', '1 Gün', 'And Dağları’nda 2.430 metrede bulutların arasına gizlenmiş 15. yüzyıl İnka taş işçiliği mucizesi.'],
    ['pe-dp-2', 'Peru — Cusco Plaza de Armas, Sacsayhuamán ve Kutsal Vadi (Ollantaytambo & Moray)', 'Cusco, Peru', -13.5167, -71.9788, 'kultur', '1 Gün', 'İnka İmparatorluğu’nun başkenti, dairesel tarım laboratuvarı Moray ve Maras’ın binlerce beyaz tuz havuzu.'],
    ['pe-dp-3', 'Peru — Vinicunca Gökkuşağı Dağı (5.200 m) ve Humantay Turkuaz Buzul Gölü', 'Cusco, Peru', -13.8694, -71.3031, 'doga', '1 Gün', 'Mineral katmanlarıyla gökkuşağı gibi çizgilenmiş And zirvesi ve karlı Salkantay Dağı altındaki Humantay Gölü.'],
    ['pe-dp-4', 'Peru — Lima Miraflores, Barranco, Huacachina Çöl Vahası ve Nazca Çizgileri', 'Lima / Ica, Peru', -14.0875, -75.7626, 'doga', '2 Gün', 'Dev kum tepelerinin ortasındaki palmiyeli çöl gölü Huacachina ve sadece uçaktan görülebilen 2.000 yıllık dev Nazca jeoglifleri.'],
    ['br-dp-1', 'Brezilya — Rio de Janeiro: Kurtarıcı İsa (Corcovado) ve Kesmeşeker Dağı (Pão de Açúcar)', 'Rio de Janeiro, Brezilya', -22.9519, -43.2105, 'doga', '5 Saat', 'Tijuca yağmur ormanının zirvesindeki Art Deco İsa heykeli ve teleferikle çıkılan Guanabara Körfezi manzarası.'],
    ['br-dp-2', 'Brezilya — Copacabana & Ipanema Plajları, Selarón Merdivenleri ve Santa Teresa', 'Rio de Janeiro, Brezilya', -22.9847, -43.2048, 'kultur', '4 Saat', '60 ülkeden 2.000’den fazla renkli seramik karoyla kaplı ünlü Selarón Merdivenleri ve okyanus kıyısında gün batımı.'],
    ['br-dp-3', 'Brezilya — İguazu Şelaleleri (Şeytan Boğazı) ve Kuş Parkı', 'Foz do Iguaçu, Brezilya', -25.6953, -54.4367, 'doga', '1 Gün', 'Brezilya ve Arjantin sınırında 275 ayrı şelaleden oluşan, 80 metreden dökülen dünyanın en geniş şelale sistemi.'],
    ['ar-dp-1', 'Arjantin — Buenos Aires: La Boca (Caminito), San Telmo, Recoleta ve Teatro Colón', 'Buenos Aires, Arjantin', -34.6345, -58.3631, 'kultur', '1 Gün', 'Rengarenk teneke evlerin önünde sokak tangosu, El Ateneo Grand Splendid tiyatro-kitabevi ve dünyanın en iyi akustikli operası.'],
    ['ar-dp-2', 'Arjantin — Patagonya: Perito Moreno Buzulu ve Fitz Roy Dağı (El Chaltén)', 'Santa Cruz, Arjantin', -50.4950, -73.0464, 'doga', '2 Gün', 'Gök gürültüsü gibi seslerle Argentino Gölü’ne dev buz kütleleri bırakan 70 metre yüksekliğindeki canlı buzul cephesi.'],
    ['ar-dp-3', 'Arjantin — Ushuaia ("Dünyanın Sonu"), Tierra del Fuego ve Beagle Kanalı', 'Ushuaia, Arjantin', -54.8019, -68.3030, 'doga', '1 Gün', 'Güney Amerika’nın en güney ucu, Dünyanın Sonu Treni, Les Éclaireurs Deniz Feneri ve Macellan penguenleri.'],
    ['cl-dp-1', 'Şili — Torres del Paine Milli Parkı ve Atacama Çölü (Valle de la Luna & Gayzerler)', 'Şili', -50.9423, -73.4068, 'doga', '3 Gün', 'Güneyde granit kuleler ve turkuaz buzul gölleri; kuzeyde ise dünyanın en kurak çölünde El Tatio gayzerleri ve yıldız gözlemi.'],
    ['co-dp-1', 'Kolombiya — Cartagena Surlu Şehir, Medellín (Comuna 13 & Guatapé) ve Cocora Vadisi', 'Kolombiya', 10.4236, -75.5503, 'kultur', '2 Gün', 'Gabriel García Márquez’in büyülü gerçekçilik sokakları, 740 basamaklı El Peñol kayası ve 60 metrelik dev balmumu palmiyeleri.'],
    ['ca-dp-1', 'Kanada — Banff ve Jasper Milli Parkları (Lake Louise ve Moraine Gölü)', 'Alberta, Kanada', 51.3217, -116.1860, 'doga', '2 Gün', 'Kanada Kayalık Dağları’nda (Rockies) On Zirve Vadisi’nin önünde parlayan gerçeküstü turkuaz buzul gölleri ve Icefields Parkway.'],
    ['ca-dp-2', 'Kanada — Niagara Şelaleleri, Toronto CN Kule ve Québec Eski Şehir (Château Frontenac)', 'Ontario / Québec, Kanada', 43.0799, -79.0747, 'doga', '2 Gün', 'At Nalı Şelalesi’nin altına tekneyle yaklaşma deneyimi ve Kuzey Amerika’nın tek surlu Fransız mirası şehri Eski Québec.']
  ]
});

export const COUNTRY_DEEP_PACKS_2 = [
  ...RUSYA_PACK,
  ...BALKANLAR_PACK,
  ...ISKANDINAVYA_PACK,
  ...ASYA_DEEP_PACK,
  ...DUNYA_EXTRA_DEEP_PACK
];
