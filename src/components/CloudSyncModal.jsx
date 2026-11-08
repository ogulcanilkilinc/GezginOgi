import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  RefreshCw,
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  Database,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ArrowUpCircle,
  ArrowDownCircle,
  Sparkles
} from 'lucide-react';
import {
  getCloudConfig,
  saveCloudConfig,
  clearCloudConfig,
  pushPlacesToCloud,
  pullPlacesFromCloud,
  syncPassHeader
} from '../services/cloudSyncService';

export default function CloudSyncModal({
  isOpen,
  onClose,
  places,
  onUpdatePlaces,
  isAdmin,
  onSetAdminPin,
  adminPin
}) {
  const [config, setConfig] = useState(() => getCloudConfig() || {
    supabaseUrl: '',
    supabaseKey: '',
    privatePassphrase: '',
    autoSync: true
  });

  const [inputPass, setInputPass] = useState('');
  const [passMessage, setPassMessage] = useState(null);

  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    const saved = getCloudConfig();
    if (saved) {
      setConfig({
        supabaseUrl: saved.supabaseUrl || '',
        supabaseKey: saved.supabaseKey || '',
        privatePassphrase: saved.privatePassphrase || '',
        autoSync: saved.autoSync !== false
      });
      if (saved.lastSync) setLastSyncTime(saved.lastSync);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerateStrongPass = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let res = 'Atlas!';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setConfig({ ...config, privatePassphrase: res });
    saveCloudConfig({ ...config, privatePassphrase: res });
    onSetAdminPin(res, true);
    setPassMessage({ type: 'success', text: `Yeni 16 haneli güçlü parola oluşturuldu!` });
  };

  const handleSaveConfig = () => {
    saveCloudConfig(config);
    if (config.privatePassphrase) {
      onSetAdminPin(config.privatePassphrase, true);
    }
    setStatusMessage('Ayarlar başarıyla kaydedildi.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleVerifyPass = (e) => {
    e.preventDefault();
    const targetPass = adminPin || config.privatePassphrase;
    if (!targetPass) {
      onSetAdminPin(inputPass, true);
      setConfig({ ...config, privatePassphrase: inputPass });
      saveCloudConfig({ ...config, privatePassphrase: inputPass });
      setPassMessage({ type: 'success', text: 'Yönetici kilidi açıldı ve parolanız kaydedildi!' });
      setInputPass('');
      return;
    }

    if (inputPass === targetPass) {
      onSetAdminPin(targetPass, true);
      setPassMessage({ type: 'success', text: 'Kilit açıldı! Düzenleme ve bulut yetkiniz aktif.' });
      setInputPass('');
    } else {
      setPassMessage({ type: 'error', text: 'Hatalı parola. Lütfen tekrar deneyin.' });
    }
  };

  const handleSyncPush = async () => {
    if (!config.privatePassphrase) {
      setSyncStatus('error');
      setStatusMessage('Lütfen önce veritabanınızı koruyacak gizli parolanızı belirleyin.');
      return;
    }
    setSyncStatus('syncing');
    setStatusMessage('Değişiklikler şifreli başlıkla buluta gönderiliyor...');
    try {
      const res = await pushPlacesToCloud(places, config);
      const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(nowStr);
      saveCloudConfig({ ...config, lastSync: nowStr });
      setSyncStatus('success');
      setStatusMessage(`Harika! ${res.syncedStatesCount} işaretli mekan durumu ve ${res.syncedCustomCount} özel keşif buluta eşitlendi.`);
    } catch (err) {
      setSyncStatus('error');
      setStatusMessage(err.message || 'Bulut eşitleme hatası');
    }
  };

  const handleSyncPull = async () => {
    if (!config.privatePassphrase) {
      setSyncStatus('error');
      setStatusMessage('Lütfen önce veritabanınızı koruyacak gizli parolanızı girin.');
      return;
    }
    setSyncStatus('syncing');
    setStatusMessage('Buluttan güncel durumlar çekiliyor...');
    try {
      const res = await pullPlacesFromCloud(places, config);
      if (res && res.places) {
        onUpdatePlaces(res.places);
        const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        setLastSyncTime(nowStr);
        saveCloudConfig({ ...config, lastSync: nowStr });
        setSyncStatus('success');
        setStatusMessage(`Harika! Buluttan ${res.statesCount} mekan durumu alındı ve cihazlar eşitlendi.`);
      } else {
        setSyncStatus('idle');
        setStatusMessage('Bulutta henüz kayıtlı veri bulunamadı.');
      }
    } catch (err) {
      setSyncStatus('error');
      setStatusMessage(err.message || 'Buluttan çekme hatası');
    }
  };

  // Same value the app sends in the x-sync-pass header; quotes doubled for the SQL literal
  const activePass = config.privatePassphrase
    ? syncPassHeader(config.privatePassphrase).replace(/'/g, "''")
    : 'BURAYA_12_16_HANELI_GIZLI_PAROLANIZI_YAZIN';

  const sqlSnippet = `-- 1. Kullanıcı Durumları Tablosu (Gittim, Notlar, Favori, Puan, Fotoğraflar & Çanta)
create table if not exists user_place_state (
  place_id text primary key,
  visited boolean default false,
  visited_date text,
  favorite boolean default false,
  user_rating int default 0,
  user_notes text,
  user_photos jsonb default '[]'::jsonb,
  checklist jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- Var olan tablonuz varsa bu iki sütunu ekler (hata vermez):
alter table user_place_state add column if not exists user_photos jsonb default '[]'::jsonb;
alter table user_place_state add column if not exists checklist jsonb default '[]'::jsonb;

-- 2. Özel Eklenen Mekanlar Tablosu
create table if not exists user_custom_places (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 3. Row Level Security (RLS) - Gerçek Veritabanı Düzeyinde Koruma
alter table user_place_state enable row level security;
alter table user_custom_places enable row level security;

-- 4. Gizli Parola Kuralı:
-- Sadece x-sync-pass başlığı bu parola ile eşleşen isteklere izin verilir.
-- Parolayı bilmeyen hiç kimse veritabanını okuyamaz, değiştiremez veya silemez!
drop policy if exists "Guvenli Parola - user_place_state" on user_place_state;
create policy "Guvenli Parola - user_place_state"
  on user_place_state
  for all
  using (coalesce(current_setting('request.headers', true)::json->>'x-sync-pass', '') = '${activePass}')
  with check (coalesce(current_setting('request.headers', true)::json->>'x-sync-pass', '') = '${activePass}');

drop policy if exists "Guvenli Parola - user_custom_places" on user_custom_places;
create policy "Guvenli Parola - user_custom_places"
  on user_custom_places
  for all
  using (coalesce(current_setting('request.headers', true)::json->>'x-sync-pass', '') = '${activePass}')
  with check (coalesce(current_setting('request.headers', true)::json->>'x-sync-pass', '') = '${activePass}');

-- 5. Fotoğraf Deposu (Storage): fotoğraflar tarayıcı hafızasını doldurmasın diye buluta yüklenir.
-- Dosya adları tahmin edilemez rastgele kodlardır; yükleme ve silme yalnızca parolayla yapılabilir.
insert into storage.buckets (id, name, public)
values ('user_photos', 'user_photos', true)
on conflict (id) do nothing;

drop policy if exists "Guvenli Parola - user_photos yukleme" on storage.objects;
drop policy if exists "Guvenli Parola - user_photos" on storage.objects;
create policy "Guvenli Parola - user_photos"
  on storage.objects
  for all
  using (
    bucket_id = 'user_photos'
    and coalesce(current_setting('request.headers', true)::json->>'x-sync-pass', '') = '${activePass}'
  )
  with check (
    bucket_id = 'user_photos'
    and coalesce(current_setting('request.headers', true)::json->>'x-sync-pass', '') = '${activePass}'
  );`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50/80 via-white to-sky-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Supabase Bulut Eşleme & Korumalı Senkronizasyon</span>
              </h2>
              <p className="text-xs text-slate-500">
                Telefon ve bilgisayarın arasında satır bazlı, parolanla korunan canlı senkronizasyon
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Admin Lock / Auth Status Banner */}
          <div className="p-4 rounded-2xl border bg-slate-50 border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isAdmin
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {isAdmin ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Yönetici & Düzenleme Durumu
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isAdmin
                      ? 'Yetkili oturum açık — Yeni mekan ekleyebilir, puan/notları ve bulutu yönetebilirsiniz.'
                      : 'Ziyaretçi modu (Salt-okunur) — Not ve işaretlemeleri yönetmek için kilidi açın.'}
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isAdmin
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isAdmin ? 'Yetkili Açık' : 'Kilitli'}
              </span>
            </div>

            {/* Auth Message */}
            {passMessage && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  passMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {passMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{passMessage.text}</span>
              </div>
            )}

            {/* Unlock Form if locked */}
            {!isAdmin ? (
              <form onSubmit={handleVerifyPass} className="flex items-center gap-2 pt-1">
                <input
                  type="password"
                  value={inputPass}
                  onChange={(e) => setInputPass(e.target.value)}
                  placeholder="Gizli Parolanızı Girin"
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 shadow-inner"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Kilidi Aç
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-emerald-700 font-medium">
                  ✓ Bu tarayıcıda yönetici yetkisi aktif
                </span>
                <button
                  onClick={() => {
                    onSetAdminPin(null, false);
                    clearCloudConfig();
                  }}
                  className="text-[11px] text-rose-600 hover:underline"
                >
                  Kilitle & Çıkış Yap
                </button>
              </div>
            )}
          </div>

          {/* Supabase Connection Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-sky-600" />
                <span>Supabase Proje Bilgileri</span>
              </h3>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Project URL</label>
                <input
                  type="text"
                  value={config.supabaseUrl}
                  onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value.trim() })}
                  placeholder="https://abcdefgh.supabase.co"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Anon Public Key</label>
                <input
                  type="password"
                  value={config.supabaseKey}
                  onChange={(e) => setConfig({ ...config, supabaseKey: e.target.value.trim() })}
                  placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Secret Passphrase for Database Enforcement */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <span>Gizli Senkronizasyon Parolanız (En Az 12-16 Karakter)</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateStrongPass}
                  className="text-[10px] text-amber-800 font-bold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Güçlü Parola Üret</span>
                </button>
              </div>

              <input
                type="text"
                value={config.privatePassphrase}
                onChange={(e) => setConfig({ ...config, privatePassphrase: e.target.value.trim() })}
                placeholder="Örn: OgiAtlas2026!SecuRe"
                className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500 shadow-inner"
              />
              <p className="text-[10px] text-slate-500">
                Bu parola kodda ASLA yer almaz. Sadece tarayıcında ve Supabase veritabanındaki güvenlik kuralında yaşar.
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Bilgileri ve Parolayı Kaydet
              </button>
            </div>
          </div>

          {/* Database Setup & One-Click SQL */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Tek Seferlik SQL Kurulumu (Parola Korumalı RLS)</span>
              </div>
              <button
                onClick={handleCopySql}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSql ? 'Kopyalandı!' : 'SQL Kopyala'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Yukarıdaki parolan otomatik olarak aşağıdaki SQL koduna gömülür. Supabase Dashboard ➔ <strong>SQL Editor</strong> bölümüne yapıştırıp <strong>Run</strong> diyerek tablonuzu kurabilirsiniz.
            </p>
          </div>

          {/* Synchronization Actions */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/60 to-emerald-50/60 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  <span>Cihazlar Arası Canlı Eşitleme</span>
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Son Başarılı Eşitleme: <strong>{lastSyncTime || 'Henüz yapılmadı'}</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleSyncPush}
                disabled={syncStatus === 'syncing'}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-50"
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>Buluta Gönder (Değişiklikleri Yükle)</span>
              </button>

              <button
                onClick={handleSyncPull}
                disabled={syncStatus === 'syncing'}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-50"
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>Buluttan Çek (Telefondaki/Diğerini Al)</span>
              </button>
            </div>

            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  syncStatus === 'error'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-white text-slate-800 border border-amber-200'
                }`}
              >
                {syncStatus === 'syncing' && <RefreshCw className="w-4 h-4 shrink-0 text-amber-600 animate-spin" />}
                {syncStatus === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
                {syncStatus === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                <span>{statusMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
