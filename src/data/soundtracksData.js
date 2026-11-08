// ==========================================
// YOLUN ŞARKILARI & SEYAHAT ÇALMA LİSTELERİ
// Her coğrafyanın ruhunu hissettiren ikonik eserler ve ambiyans müzikleri
// ==========================================

export const TRAVEL_SOUNDTRACKS = [
  {
    id: 'balkan-sevdah',
    region: 'Balkanlar',
    title: 'Balkan Rüzgarı & Sevdalinka Ezgileri',
    subtitle: 'Neretva kıyısında, Kotor virajlarında ve Saraybosna çınaraltında dinlenecek başyapıtlar',
    cover: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    spotifyQuery: 'Balkan Sevdalinka Goran Bregovic Dino Merlin',
    tracks: [
      { name: 'Ederlezi / Çingeneler Zamanı', artist: 'Goran Bregović', mood: 'Melankolik & Coşkulu' },
      { name: 'Sarajevo', artist: 'Dino Merlin', mood: 'Şehir Marşı & Nostalji' },
      { name: 'Moj Dilbere', artist: 'Amira Medunjanin', mood: 'Geleneksel Boşnak Sevdalinkası' },
      { name: 'Bella Ciao (Balkan Brass Band)', artist: 'Goran Bregović Wedding & Funeral Band', mood: 'Yol Enerjisi' },
      { name: 'Kad Ja Pođoh Na Bembašu', artist: 'Geleneksel Saraybosna Türküsü', mood: 'Tarihi Doku' },
      { name: 'Lane Moje', artist: 'Željko Joksimović', mood: 'Balkan Romantizmi' }
    ]
  },
  {
    id: 'aegean-greek',
    region: 'Ege & Akdeniz',
    title: 'Ege Rüzgarı, Sirtaki & Selanik Geceleri',
    subtitle: 'Beyaz Kule sahilinde, Meteora eteklerinde ve taverna mezesi eşliğinde',
    cover: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
    spotifyQuery: 'Greek Zorba Sirtaki Haris Alexiou',
    tracks: [
      { name: 'Zorba’s Dance (Sirtaki)', artist: 'Mikis Theodorakis', mood: 'Coşku & Dans' },
      { name: 'Ola Se Thimizoun (Bana Bir Masal Anlat Baba)', artist: 'Haris Alexiou & Manos Loïzos', mood: 'Hüzün & Deniz Meltemi' },
      { name: 'To Zeimbekiko Tis Evdokias', artist: 'Manos Hatzidakis', mood: 'Zeybek Ruhu' },
      { name: 'Pes Mou Pos Ginetai', artist: 'Nikos Vertis', mood: 'Modern Akdeniz Popu' }
    ]
  },
  {
    id: 'italy-tuscany',
    region: 'İtalya',
    title: 'Toskana Tepeleri & Roma Günbatımı',
    subtitle: 'Val d’Orcia servi yollarında, Amalfi virajlarında ve Kolezyum gölgesinde',
    cover: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=80',
    spotifyQuery: 'Italian Road Trip Andrea Bocelli Ennio Morricone',
    tracks: [
      { name: 'Con te partirò (Time to Say Goodbye)', artist: 'Andrea Bocelli', mood: 'Görkemli Vokal' },
      { name: 'Cinema Paradiso (Love Theme)', artist: 'Ennio Morricone', mood: 'Sinematik Şaheser' },
      { name: 'Volare (Nel blu dipinto di blu)', artist: 'Domenico Modugno', mood: 'Neşeli Yol Klasiği' },
      { name: 'That’s Amore', artist: 'Dean Martin', mood: 'Napoli Pizzacı Havası' },
      { name: 'Tu vuò fà l’americano', artist: 'Renato Carosone', mood: 'Akdeniz Ritmi' }
    ]
  },
  {
    id: 'france-paris',
    region: 'Fransa',
    title: 'Paris Kaldırımları & Fransız Nostaljisi',
    subtitle: 'Montmartre kafelerinde, Seine kıyısında ve Alsas köylerinde akordeon tınıları',
    cover: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
    spotifyQuery: 'French Cafe Edith Piaf Yann Tiersen Amelie',
    tracks: [
      { name: 'La Valse d’Amélie (Akordeon)', artist: 'Yann Tiersen', mood: 'Büyülü & Masalsı' },
      { name: 'La Vie en Rose', artist: 'Édith Piaf', mood: 'Zamanın Ötesinde Romantizm' },
      { name: 'Je Veux', artist: 'Zaz', mood: 'Sokak Enerjisi & Özgürlük' },
      { name: 'La Bohème', artist: 'Charles Aznavour', mood: 'Ressamlar Tepesi Melankolisi' },
      { name: 'Sous le Ciel de Paris', artist: 'Yves Montand', mood: 'Seine Kenarı Yürüyüşü' }
    ]
  },
  {
    id: 'spain-flamenco',
    region: 'İspanya',
    title: 'Endülüs Tutkusu & Flamenko Ritimleri',
    subtitle: 'Elhamra bahçelerinde, Sevilla dar sokaklarında ve Barselona sahillerinde',
    cover: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=600&q=80',
    spotifyQuery: 'Spanish Flamenco Guitar Paco de Lucia Gipsy Kings',
    tracks: [
      { name: 'Entre dos aguas (Gitar Konçertosu)', artist: 'Paco de Lucía', mood: 'Akustik Gitar Dehası' },
      { name: 'Bamboléo', artist: 'Gipsy Kings', mood: 'Ateşli Rumba' },
      { name: 'Malamente', artist: 'Rosalía', mood: 'Yeni Nesil Flamenko' },
      { name: 'Recuerdos de la Alhambra', artist: 'Francisco Tárrega', mood: 'Endülüs Zarafeti' }
    ]
  },
  {
    id: 'portugal-fado',
    region: 'Portekiz',
    title: 'Lizbon Rüzgarı & Melankolik Fado',
    subtitle: 'Alfama sokak lambaları altında ve Douro Nehri köprülerinde saudade duygusu',
    cover: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    spotifyQuery: 'Portuguese Fado Mariza Amalia Rodrigues',
    tracks: [
      { name: 'Chuva', artist: 'Mariza', mood: 'Derin Saudade & Yağmur' },
      { name: 'Uma Casa Portuguesa', artist: 'Amália Rodrigues', mood: 'Fado Kraliçesi' },
      { name: 'O Pastor', artist: 'Madredeus', mood: 'Ruhani Okyanus Tınıları' }
    ]
  }
];
