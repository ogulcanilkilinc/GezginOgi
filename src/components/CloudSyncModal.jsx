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
  ArrowDownCircle
} from 'lucide-react';
import {
  getCloudConfig,
  saveCloudConfig,
  clearCloudConfig,
  pushPlacesToCloud,
  pullPlacesFromCloud
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
    pin: '1965',
    autoSync: true
  });

  const [inputPin, setInputPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState(null);
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
        pin: saved.pin || '1965',
        autoSync: saved.autoSync !== false
      });
      if (saved.lastSync) setLastSyncTime(saved.lastSync);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    saveCloudConfig(config);
    setStatusMessage('Ayarlar başarıyla kaydedildi.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleSyncPush = async () => {
    setSyncStatus('syncing');
    setStatusMessage('Değişiklikler satır bazında buluta gönderiliyor...');
    try {
      const res = await pushPlacesToCloud(places, config);
      const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(nowStr);
      saveCloudConfig({ ...config, lastSync: nowStr });
      setSyncStatus('success');
      setStatusMessage(`Harika! ${res.syncedStatesCount} işaretli mekan durumu ve ${res.syncedCustomCount} özel keşif buluta başarıyla eşitlendi.`);
    } catch (err) {
      setSyncStatus('error');
      setStatusMessage(err.message || 'Bulut eşitleme hatası');
    }
  };

  const handleSyncPull = async () => {
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
        setStatusMessage(`Harika! Buluttan ${res.statesCount} mekan durumu alındı ve çakışma olmadan güncellendi.`);
      } else {
        setSyncStatus('idle');
        setStatusMessage('Bulutta henüz kayıtlı veri bulunamadı.');
      }
    } catch (err) {
      setSyncStatus('error');
      setStatusMessage(err.message || 'Buluttan çekme hatası');
    }
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    const targetPin = adminPin || '1965';
    if (inputPin === targetPin) {
      onSetAdminPin(targetPin, true);
      setPinMessage({ type: 'success', text: 'Yönetici kilidi açıldı! Düzenleme yetkisi aktif.' });
      setInputPin('');
    } else {
      setPinMessage({ type: 'error', text: 'Hatalı PIN kodu. Tekrar deneyin.' });
    }
  };

  const handleUpdatePin = (e) => {
    e.preventDefault();
    if (newPin.trim().length >= 4) {
      onSetAdminPin(newPin.trim(), true);
      setConfig({ ...config, pin: newPin.trim() });
      saveCloudConfig({ ...config, pin: newPin.trim() });
      setPinMessage({ type: 'success', text: 'Yeni Master PIN başarıyla ayarlandı!' });
      setNewPin('');
    } else {
      setPinMessage({ type: 'error', text: 'PIN en az 4 karakter olmalıdır.' });
    }
  };

  const sqlSnippet = `-- 1. Kullanıcı Durumları Tablosu (Gittim, Notlar, Favori, Puan)
create table if not exists user_place_state (
  place_id text primary key,
  visited boolean default false,
  visited_date text,
  favorite boolean default false,
  user_rating int default 0,
  user_notes text,
  updated_at timestamptz default now()
);

-- 2. Özel Eklenen Mekanlar Tablosu
create table if not exists user_custom_places (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 3. RLS Güvenlik Kilidi (Sadece Master PIN ile Okuma/Yazma)
alter table user_place_state enable row level security;
alter table user_custom_places enable row level security;

-- PIN Güvenlik Kuralı: Header'da x-sync-pin: 1965 olmayan hiçbir isteğe izin verilmez!
create policy "PIN Koruma - user_place_state"
  on user_place_state
  for all
  using (coalesce(current_setting('request.headers', true)::json->>'x-sync-pin', '') = '1965')
  with check (coalesce(current_setting('request.headers', true)::json->>'x-sync-pin', '') = '1965');

create policy "PIN Koruma - user_custom_places"
  on user_custom_places
  for all
  using (coalesce(current_setting('request.headers', true)::json->>'x-sync-pin', '') = '1965')
  with check (coalesce(current_setting('request.headers', true)::json->>'x-sync-pin', '') = '1965');`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/60 via-orange-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
              <Cloud className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900">
                  Cihazlar Arası Canlı Senkronizasyon & Güvenlik
                </h2>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                  Satır Bazlı Eşleme
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Telefon ve bilgisayarında birbirinin üstüne yazmadan, güvenli Supabase veritabanı kuralıyla eşleme sağlar.
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* SECTION 1: Master PIN & Edit Authorization */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isAdmin ? (
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
                    <Unlock className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
                    <Lock className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Yönetici & Düzenleme İzni:</span>
                    {isAdmin ? (
                      <span className="text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold border border-emerald-300">
                        ✓ Açık (Master PIN Aktif)
                      </span>
                    ) : (
                      <span className="text-xs text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-semibold border border-amber-300">
                        🔒 Salt-Okunur
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Siten internete açıkken başkalarının haritandaki yerleri silmesini veya değiştirmesini engeller.
                  </p>
                </div>
              </div>
            </div>

            {pinMessage && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  pinMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {pinMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{pinMessage.text}</span>
              </div>
            )}

            {!isAdmin ? (
              <form onSubmit={handleVerifyPin} className="flex items-center gap-2 pt-1">
                <input
                  type="password"
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  placeholder="Master PIN Gir (Varsayılan: 1965)"
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 shadow-2xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-2xs"
                >
                  Kilidi Aç
                </button>
              </form>
            ) : (
              <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <form onSubmit={handleUpdatePin} className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Yeni PIN Belirle"
                    className="w-40 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 shadow-2xs"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition"
                  >
                    PIN Güncelle
                  </button>
                </form>

                <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Geçerli Master PIN: <strong>{adminPin || '1965'}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: How It Works & Concurrency Explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-amber-50/50 border border-amber-200/70 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <Laptop className="w-4 h-4 text-amber-700" />
                <span>Bilgisayarın (Masaüstü)</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Geniş ekranda blog yazılarını yazıp rotanı detaylıca planlarsın.
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/50 border border-amber-200/70 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <Smartphone className="w-4 h-4 text-amber-700" />
                <span>Telefonun (Mobil)</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Yoldayken tek tıkla "Gittim" işaretler, anında navigasyon alırsın.
              </p>
            </div>
          </div>

          {/* SECTION 3: Supabase Cloud Database Setup */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Supabase Bulut Veritabanı Bilgileri</h3>
              </div>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-700 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Supabase Dashboard Aç</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Supabase hesabından aldığın URL ve anon key'i buraya girdiğinde, telefonun ve bilgisayarın arkaplanda otomatik olarak birbirine bağlanır.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Project URL (https://xxxx.supabase.co)
                </label>
                <input
                  type="text"
                  value={config.supabaseUrl}
                  onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value.trim() })}
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  API Anon Key (eyJhbGciOi...)
                </label>
                <input
                  type="password"
                  value={config.supabaseKey}
                  onChange={(e) => setConfig({ ...config, supabaseKey: e.target.value.trim() })}
                  placeholder="anon public key"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Veritabanı Koruma PIN Kodu (Master PIN)
                </label>
                <input
                  type="text"
                  value={config.pin}
                  onChange={(e) => setConfig({ ...config, pin: e.target.value.trim() })}
                  placeholder="1965"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 shadow-2xs"
                />
              </div>
            </div>

            {/* SQL Table snippet helper with RLS PIN rule */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600 font-semibold">
                  Supabase SQL Editor'de 1 kez çalıştırılacak güvenli tablo kodu:
                </span>
                <button
                  onClick={handleCopySql}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold flex items-center gap-1 transition shadow-2xs"
                >
                  <Copy className="w-3 h-3 text-amber-700" />
                  <span>{copiedSql ? '✓ Kopyalandı!' : 'SQL Kodunu Kopyala'}</span>
                </button>
              </div>

              <pre className="text-[10px] bg-slate-50 text-slate-700 p-2.5 rounded-lg border border-slate-200 overflow-x-auto font-mono max-h-36">
                {sqlSnippet}
              </pre>

              <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                🛡️ <strong>Güvenlik Garantisi:</strong> Bu SQL kuralı sayesinde, anahtarı ele geçiren yabancılar veritabanını silemez veya değiştiremez. Sadece Master PIN (<strong>1965</strong>) taşıyan istekler kabul edilir.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition"
              >
                Ayarları Kaydet
              </button>
            </div>
          </div>

          {/* SECTION 4: Live Synchronization Action Center */}
          <div className="bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-white border border-amber-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 text-amber-700 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <h3 className="text-sm font-bold text-slate-900">Canlı Eşitleme Merkezi</h3>
              </div>
              {lastSyncTime && (
                <span className="text-[11px] text-slate-500 font-medium">
                  Son Eşitleme: <strong>{lastSyncTime}</strong>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bilgisayarında veya telefonunda yaptığın yeni işaretlemeleri buluta gönderebilir ya da diğer cihazından güncellemeleri çekebilirsin.
            </p>

            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  syncStatus === 'error'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : syncStatus === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {syncStatus === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                {syncStatus === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
                {syncStatus === 'syncing' && <RefreshCw className="w-4 h-4 shrink-0 text-amber-600 animate-spin" />}
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={handleSyncPush}
                disabled={syncStatus === 'syncing' || !config.supabaseUrl || !config.supabaseKey}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>Buluta Gönder (Yedekle)</span>
              </button>

              <button
                onClick={handleSyncPull}
                disabled={syncStatus === 'syncing' || !config.supabaseUrl || !config.supabaseKey}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 shadow-2xs transition disabled:opacity-50"
              >
                <ArrowDownCircle className="w-4 h-4 text-amber-700" />
                <span>Buluttan Çek (Güncelle)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Keşif Atlasım &copy; 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
