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
  ExternalLink
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
    syncId: 'gezgin_ogi',
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
      setConfig(saved);
      if (saved.lastSync) setLastSyncTime(saved.lastSync);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    saveCloudConfig(config);
    setStatusMessage('Ayarlar kaydedildi.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleSyncPush = async () => {
    setSyncStatus('syncing');
    setStatusMessage('Veriler buluta yükleniyor...');
    try {
      await pushPlacesToCloud(places, config);
      const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(nowStr);
      saveCloudConfig({ ...config, lastSync: nowStr });
      setSyncStatus('success');
      setStatusMessage(`Başarılı! ${places.length} mekan buluta eşitlendi.`);
    } catch (err) {
      setSyncStatus('error');
      setStatusMessage(err.message || 'Bulut eşitleme hatası');
    }
  };

  const handleSyncPull = async () => {
    setSyncStatus('syncing');
    setStatusMessage('Buluttan en son veriler çekiliyor...');
    try {
      const res = await pullPlacesFromCloud(config);
      if (res && res.places) {
        onUpdatePlaces(res.places);
        const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        setLastSyncTime(nowStr);
        saveCloudConfig({ ...config, lastSync: nowStr });
        setSyncStatus('success');
        setStatusMessage(`Başarılı! ${res.places.length} mekan buluttan alındı ve güncellendi.`);
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
    if (inputPin === adminPin || (!adminPin && inputPin === '1923')) {
      onSetAdminPin(adminPin || '1923', true);
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
      setPinMessage({ type: 'success', text: 'Yeni Master PIN başarıyla ayarlandı!' });
      setNewPin('');
    } else {
      setPinMessage({ type: 'error', text: 'PIN en az 4 karakter olmalıdır.' });
    }
  };

  const sqlSnippet = `create table if not exists user_sync (
  sync_id text primary key,
  places_data jsonb not null,
  updated_at timestamptz default now()
);
alter table user_sync enable row level security;
create policy "Allow all access" on user_sync for all using (true) with check (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-white">
                  Cihazlar Arası Canlı Senkronizasyon & Güvenlik
                </h2>
                <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                  Bulut Eşleme
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Telefon ve bilgisayarında aynı veriyi görmeni sağlar, yetkisiz değişiklikleri engeller.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* SECTION 1: Master PIN & Edit Authorization */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isAdmin ? (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Unlock className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Lock className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Yönetici & Düzenleme İzni:</span>
                    {isAdmin ? (
                      <span className="text-xs text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                        ✓ Açık (Tam Yetkili)
                      </span>
                    ) : (
                      <span className="text-xs text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full font-semibold border border-amber-500/30">
                        🔒 Salt-Okunur (Korumalı Mod)
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Siten internete açıkken başkalarının haritandaki yerleri silmesini veya değiştirmesini engeller.
                  </p>
                </div>
              </div>
            </div>

            {pinMessage && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  pinMessage.type === 'success'
                    ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-950/50 text-rose-300 border border-rose-500/30'
                }`}
              >
                {pinMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
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
                  placeholder="Master PIN Gir (Varsayılan: 1923)"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  Kilidi Aç
                </button>
              </form>
            ) : (
              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <form onSubmit={handleUpdatePin} className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Yeni PIN Belirle"
                    className="w-40 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                  >
                    Değiştir
                  </button>
                </form>
                <button
                  onClick={() => onSetAdminPin(adminPin, false)}
                  className="text-xs text-slate-400 hover:text-rose-400 transition"
                >
                  Kilitle (Korumalı Moda Geç)
                </button>
              </div>
            )}
          </div>

          {/* SECTION 2: Device Sync Architecture Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Laptop className="w-4 h-4" />
                <span>Bilgisayarın (Web)</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Haritada rota çizer, geniş ekranda planlama yaparsın.
              </p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Smartphone className="w-4 h-4" />
                <span>Telefonun (Mobil)</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Yoldayken tek tıkla "Gittim" işaretler, anında navigasyon alırsın.
              </p>
            </div>
          </div>

          {/* SECTION 3: Supabase Cloud Database Setup */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Supabase Bulut Veritabanı Bilgileri</h3>
              </div>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Ücretsiz Supabase Aç</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Ücretsiz bir Supabase projesi açıp aşağıdaki bilgileri girdiğinde, telefonun ve bilgisayarın arkaplanda otomatik olarak birbirine bağlanır.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Project URL (https://xxxx.supabase.co)
                </label>
                <input
                  type="text"
                  value={config.supabaseUrl}
                  onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value.trim() })}
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  API Anon Key (eyJhbGciOi...)
                </label>
                <input
                  type="password"
                  value={config.supabaseKey}
                  onChange={(e) => setConfig({ ...config, supabaseKey: e.target.value.trim() })}
                  placeholder="anon public key"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Kişisel Senkronizasyon Kimliği (Sync ID)
                </label>
                <input
                  type="text"
                  value={config.syncId}
                  onChange={(e) => setConfig({ ...config, syncId: e.target.value.trim() })}
                  placeholder="örneğin: ogulcan_atlas"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* SQL Table snippet helper */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-semibold">
                  Supabase SQL Editor'de 1 kez çalıştırılacak tablo kodu:
                </span>
                <button
                  onClick={handleCopySql}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold flex items-center gap-1 transition"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedSql ? 'Kopyalandı!' : 'Kopyala'}</span>
                </button>
              </div>
              <pre className="text-[10px] font-mono text-slate-400 overflow-x-auto p-2 bg-slate-950 rounded-lg">
                {sqlSnippet}
              </pre>
            </div>

            {/* Sync Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveConfig}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  Ayarları Kaydet
                </button>
                <button
                  onClick={handleSyncPush}
                  disabled={syncStatus === 'syncing' || !config.supabaseUrl}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  <span>Buluta Yükle (Push)</span>
                </button>
                <button
                  onClick={handleSyncPull}
                  disabled={syncStatus === 'syncing' || !config.supabaseUrl}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span>Buluttan İndir (Pull)</span>
                </button>
              </div>

              {lastSyncTime && (
                <span className="text-[11px] text-slate-400">
                  Son Eşitleme: <strong className="text-slate-200">{lastSyncTime}</strong>
                </span>
              )}
            </div>

            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  syncStatus === 'error'
                    ? 'bg-rose-950/50 text-rose-300 border border-rose-500/30'
                    : 'bg-cyan-950/50 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                <span>{statusMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
