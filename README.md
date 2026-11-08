# 🧭 Keşif Atlasım (Gezgin Ogi & Dünya Seyahat Rehberi)

**Keşif Atlasım**, kişisel seyahat rotaları, 1.211 doğrulanmış keşif noktası, 12 ay mevsimsel seyahat önerileri, Türk vatandaşları için güncel vize rehberi, Ankara çıkışlı gerçekçi mesafe/ulaşım süreleri, offline (internetsiz) PWA çalışma kabiliyeti ve uçtan uca cihazlar arası bulut eşleme sunan modern, hızlı bir interaktif web uygulamasıdır.

- **Canlı Site:** [https://ogulcanilkilinc.github.io/kesif-atlasim/](https://ogulcanilkilinc.github.io/kesif-atlasim/)
- **GitHub Deposu:** [https://github.com/ogulcanilkilinc/kesif-atlasim](https://github.com/ogulcanilkilinc/kesif-atlasim)

---

## 🌟 Temel Özellikler

### 1. 🗺️ Harita & Keşif Deneyimi
- **Çoklu Harita Katmanları:** Detaylı Türkçe sokak haritası, Google Uydu/Hibrit arazi modu ve OpenStreetMap.
- **1.211 Doğrulanmış Mekan:** Ankara (90+), Türkiye geneli ve Dünya genelinde tüm mükerrer kayıtlar taranıp temizlenmiş, yüksek kaliteli küratörlü arşiv.
- **Yüksek Çözünürlüklü Wikimedia Fotoğrafları:** 960px optimize edilmiş lisanslı görseller, yazar ve telif bilgileri (`photos.json`).
- **Ankara Ulaşım Bilgisi:** Her mekan için Ankara çıkışlı araç sürüş süresi (ör. "51 dk araçla", "2 sa 15 dk araçla"), YHT hızlı tren süreleri ve gerçekçi aktarmalı uçuş süreleri.

### 2. 🛂 Vize & Güvenlik Bilgisi (Kasım 2026 Güncel)
- **Türk Pasaportu Vize Durumu:** Kimlikle, Vizesiz (30/60/90 gün), Kapıda Vize / e-Vize, Schengen ve Özel Vize şartları.
- **Dışişleri Bakanlığı Seyahat Uyarıları:** Yemen (Sokotra), Afganistan, Suriye, Venezuela ve İsrail/Filistin gibi riskli bölgeler için resmi seyahat güvenlik notları.
- **"Sadece Vizesiz" & "Hafta Sonu Kaçamağı" Filtreleri:** Tek tıkla Türkiye + vizesiz yerleri veya Ankara'dan < 4.5 saat mesafedeki rotaları süzme.

### 3. 📱 Çevrimdışı (Offline PWA) & Service Worker
- İnternet bağlantısı kesildiğinde bile tüm arayüz, harita stilleri, mekan bilgileri ve kişisel notlar yerel önbellekten (Service Worker) kesintisiz çalışır.
- Dinamik `CACHE_NAME` derleme numarası sayesinde eski JavaScript ve CSS paketleri yeni sürümlerde otomatik olarak silinir.
- Yeni sürüm yayına girdiğinde ekranda beliren bildirimle tek tıkla canlı güncelleme imkanı.

### 4. ☁️ Bulut Senkronizasyonu & Güvenlik (Supabase)
- **Cihazlar Arası Canlı Eşleme:** Telefon ve bilgisayar arasında "Gittiklerim", puanlar, favoriler ve kişisel gezi günlüğü notları eşzamanlanır.
- **Fotoğraf Optimizasyonu:** Telefondan yüklenen 8–15 MB fotoğraflar istemci tarafında `<canvas>` ile anında maks. 1200px JPEG kalitesine (~120 KB) sıkıştırılır; yerel hafıza dolum koruması mevcuttur.
- **Supabase Storage Desteği:** İsteğe bağlı Supabase bağlantısı ile kullanıcı fotoğrafları doğrudan bulut depolama alanına yüklenir.
- **Row-Level Security (RLS) & PIN Koruması:** Özel `x-sync-pass` parolasıyla veritabanı doğrudan korunur.

### 5. 🎒 Gezgin Alet Çantası (Araçlar)
- **Balkan Sınır Kapıları & Vinyet Rehberi:** Canlı kapı yoğunlukları, taktikler ve otoyol pulu bilgileri.
- **Yolun Şarkıları & Ambiyans Çalar:** Sevdalinka, Akdeniz ezgileri ve canlı yağmur/fırtına sesleri.
- **İnteraktif Rota Simülatörü:** Seçilen duraklar arasında canlı yol animasyonu ve toplam km hesabı.
- **Yakındaki Noktalar (GPS Radar):** Mevcut konuma göre en yakın keşif noktalarını sıralayan pusula.
- **12 Ay Mevsim Rehberi ("Bu Ay Nereye Gitsem?"):** Ay ay hava durumu ve ideal kaçış rotaları.
- **Kazı-Kazan Dünya & Fetih Atlası:** Gezilen ülkelerin fetih oranları ve seyahat karnesi.

---

## 🏗️ Mimari & Teknoloji Yığını

- **Frontend:** React 18, Vite 5, Tailwind CSS 3
- **Harita Kütüphanesi:** Leaflet 1.9, React-Leaflet
- **İkonlar & Animasyonlar:** Lucide React, Canvas Confetti
- **Veri Saklama:** `public/data/places.json`, `public/data/photos.json`, LocalStorage (Granular delta overrides)
- **Backend / Bulut (Opsiyonel):** Supabase REST API (PostgreSQL + RLS + Supabase Storage)
- **CI/CD:** GitHub Actions `.github/workflows/deploy.yml` -> GitHub Pages

---

## 🚀 Yerel Kurulum & Çalıştırma

Projeyi başka bir bilgisayara veya klasöre aktardığınızda çalıştırmak için:

```bash
# 1. Proje dizinine girin
cd gezi-haritam

# 2. Bağımlılıkları yükleyin
npm install

# 3. Geliştirme sunucusunu başlatın (http://localhost:5173/)
npm run dev

# 4. Üretim (Production) derlemesi ve Service Worker injeksiyonu
npm run build

# 5. Üretim sürümünü yerel olarak önizleyin
npm run preview
```

---

## 📁 Proje Dosya Yapısı

```
gezi-haritam/
├── public/
│   ├── data/
│   │   ├── places.json          # 1.211 mekan verisi (koordinat, blog, kategori, vize, mesafe)
│   │   └── photos.json          # Lisanslı görsel meta verileri (yazar, telif, kaynak URL)
│   ├── favicon.svg              # Pusula logolu vektörel favicon
│   ├── manifest.json            # PWA ana ekrana ekleme manifestosu
│   └── sw.js                    # Offline Service Worker (precache ve dinamik önbellekleme)
├── src/
│   ├── components/              # Modallar, paneller, harita ve filtre bileşenleri
│   │   ├── PlaceDetailPanel.jsx # Katlanabilir akordiyonlu detay paneli & fotoğraf yükleme
│   │   ├── TravelMap.jsx        # Leaflet harita entegrasyonu ve marker filtreleme
│   │   ├── CloudSyncModal.jsx   # Supabase PIN ve SQL şema paneli
│   │   └── ...                  # Sınır kapıları, ses çalar, radar, pasaport modalları
│   ├── data/
│   │   ├── metadata.js          # Kategoriler, mevsimler ve bölgeler
│   │   ├── visaData.js          # Ülke vize kuralları ve Dışişleri uyarıları
│   │   ├── ankaraDistance.js    # Ankara çıkışlı sürüş ve uçuş hesaplayıcısı
│   │   ├── phrasebookData.js    # Yabancı diller için pratik gezi sözlükleri
│   │   └── curatedPhotoResolver.js
│   ├── services/
│   │   └── cloudSyncService.js  # Supabase Auth, Storage ve REST senkronizasyon servisi
│   ├── App.jsx                  # Ana uygulama konteyneri, filtre çubuğu ve güncelleyici
│   └── main.jsx
├── scripts/                     # Veri zenginleştirme, fotoğraf eşleme ve derleme betikleri
│   ├── enrich-places-metadata.mjs # Mesafe ve vize verilerini places.json'a işler
│   ├── inject-sw-assets.mjs     # Derlenen chunk'ları ve yeni Cache ID'yi sw.js'e enjekte eder
│   ├── execute-clean-merge.mjs  # Mükerrer mekan birleştirme aracı
│   └── ...
├── .github/workflows/deploy.yml # GitHub Pages otomatik dağıtım iş akışı
├── package.json                 # Bağımlılıklar ve derleme komutları
└── vite.config.js               # Vite yapılandırması (Görsel ve kütüphane optimizasyonları)
```

---

## 🔒 Lisans & Telif

Mekan meta verileri ve fotoğraflar CC BY-SA lisansı ile Wikimedia Commons üzerinden temin edilmiştir; her görselin hak sahibi ilgili mekan kartında ve `photos.json` dosyasında belirtilmiştir.
