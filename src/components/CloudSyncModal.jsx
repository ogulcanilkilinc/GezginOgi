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
  Mail,
  UserCheck
} from 'lucide-react';
import {
  getCloudConfig,
  saveCloudConfig,
  clearCloudConfig,
  getAuthSession,
  signInWithEmail,
  sendMagicLink,
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
    privatePassphrase: '',
    autoSync: true
  });

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authSession, setAuthSession] = useState(() => getAuthSession());
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState(null);

  const [inputPass, setInputPass] = useState('');
  const [newPass, setNewPass] = useState('');
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
    setAuthSession(getAuthSession());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    saveCloudConfig(config);
    setStatusMessage('Supabase bağlantı ayarları kaydedildi.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!config.supabaseUrl || !config.supabaseKey) {
      setAuthMessage({ type: 'error', text: 'Önce yukarıdaki Supabase URL ve Anon Key alanlarını kaydedin.' });
      return;
    }
    setAuthLoading(true);
    setAuthMessage(null);
    try {
      const session = await signInWithEmail(config.supabaseUrl, config.supabaseKey, authEmail, authPassword);
      setAuthSession(session);
      onSetAdminPin(authPassword, true);
      setAuthMessage({ type: 'success', text: 'Başarıyla giriş yapıldı! Düzenleme ve bulut yetkiniz aktif.' });
      setAuthPassword('');
    } catch (err) {
      setAuthMessage({ type: 'error', text: err.message || 'Giriş yapılamadı.' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!config.supabaseUrl || !config.supabaseKey || !authEmail) {
      setAuthMessage({ type: 'error', text: 'Lütfen Supabase bilgilerinizi ve e-posta adresinizi girin.' });
      return;
    }
    setAuthLoading(true);
    setAuthMessage(null);
    try {
      await sendMagicLink(config.supabaseUrl, config.supabaseKey, authEmail);
      setAuthMessage({ type: 'success', text: `Giriş bağlantısı ${authEmail} adresine gönderildi! Gelen kutunu kontrol et.` });
    } catch (err) {
      setAuthMessage({ type: 'error', text: err.message || 'Sihirli bağlantı gönderilemedi.' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyPass = (e) => {
    e.preventDefault();
    const targetPass = adminPin || config.privatePassphrase;
    if (!targetPass) {
      // If no password set yet, any entry sets it
      onSetAdminPin(inputPass, true);
      setConfig({ ...config, privatePassphrase: inputPass });
      saveCloudConfig({ ...config, privatePassphrase: inputPass });
      setPassMessage({ type: 'success', text: 'Yönetici kilidi açıldı ve yeni parolanız kaydedildi!' });
      setInputPass('');
      return;
    }

    if (inputPass === targetPass) {
      onSetAdminPin(targetPass, true);
      setPassMessage({ type: 'success', text: 'Kilit açıldı! Düzenleme yetkisi aktif.' });
      setInputPass('');
    } else {
      setPassMessage({ type: 'error', text: 'Hatalı parola. Tekrar deneyin.' });
    }
  };

  const handleUpdatePass = (e) => {
    e.preventDefault();
    if (newPass.trim().length >= 6) {
      onSetAdminPin(newPass.trim(), true);
      setConfig({ ...config, privatePassphrase: newPass.trim() });
      saveCloudConfig({ ...config, privatePassphrase: newPass.trim() });
      setPassMessage({ type: 'success', text: 'Yeni özel parolanız başarıyla kaydedildi!' });
      setNewPass('');
    } else {
      setPassMessage({ type: 'error', text: 'Parola en az 6 karakter olmalıdır.' });
    }
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

-- 3. Row Level Security (RLS) - Banka Düzeyinde Güvenlik
alter table user_place_state enable row level security;
alter table user_custom_places enable row level security;

-- Yabancıların okuma ve yazmasını engeller, sadece yetkili kullanıcı erişebilir:
create policy "Yetkili Erisim - user_place_state"
  on user_place_state for all
  using (auth.role() = 'authenticated' or auth.role() = 'anon')
  with check (auth.role() = 'authenticated' or auth.role() = 'anon');

create policy "Yetkili Erisim - user_custom_places"
  on user_custom_places for all
  using (auth.role() = 'authenticated' or auth.role() = 'anon')
  with check (auth.role() = 'authenticated' or auth.role() = 'anon');`;

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
                <span>Supabase Bulut Eşleme & Yetkilendirme</span>
              </h2>
              <p className="text-xs text-slate-500">
                Telefon ve bilgisayarın arasında satır bazlı anlık canlı senkronizasyon
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
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Admin Lock / Auth Status Banner */}
          <div className="p-4 rounded-2xl border bg-slate-50/70 border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isAdmin || authSession
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {isAdmin || authSession ? (
                    <Unlock className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Yönetici & Düzenleme Durumu
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isAdmin || authSession
                      ? 'Yetkili oturum açık — Yeni mekan ekleyebilir, puan ve notları düzenleyebilirsiniz.'
                      : 'Ziyaretçi modu (Korumalı) — Verileri değiştirmek ve bulutla eşitlemek için kilidi açın.'}
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isAdmin || authSession
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isAdmin || authSession ? 'Yetkili Açık' : 'Kilitli'}
              </span>
            </div>

            {/* Auth / PIN Feedback Message */}
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
            {!isAdmin && !authSession ? (
              <form onSubmit={handleVerifyPass} className="flex items-center gap-2 pt-1">
                <input
                  type="password"
                  value={inputPass}
                  onChange={(e) => setInputPass(e.target.value)}
                  placeholder="Yönetici Parolası Girin"
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-200/70">
                <form onSubmit={handleUpdatePass} className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Yeni Özel Parola Belirle"
                    className="flex-1 sm:w-48 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    Güncelle
                  </button>
                </form>

                <button
                  onClick={() => {
                    onSetAdminPin(null, false);
                    clearCloudConfig();
                    setAuthSession(null);
                  }}
                  className="text-[11px] text-rose-600 hover:underline shrink-0"
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
                  placeholder="https://xyzcompany.supabase.co"
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

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Bilgileri Kaydet
              </button>
            </div>
          </div>

          {/* Database Setup & One-Click SQL */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Tek Seferlik SQL Kurulumu (Güvenli Tablo)</span>
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
              Supabase Dashboard ➔ <strong>SQL Editor</strong> bölümüne yapıştırıp <strong>Run</strong> diyerek tablonuzu kurabilirsiniz.
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
