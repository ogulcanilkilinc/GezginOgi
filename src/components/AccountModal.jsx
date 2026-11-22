import React, { useEffect, useRef, useState } from 'react';
import { X, Mail, LogOut, Cloud, ShieldCheck, Check, XCircle, Image as ImageIcon } from 'lucide-react';
import {
  PHOTO_QUOTA,
  countPrivatePhotos,
  getAccount,
  isLegacyPhoto,
  migrateLegacyPhoto,
  sendLoginLink,
  signOutAccount,
  startGoogleLogin,
  takeAuthError,
  clearLocalPersonalData
} from '../services/account';
import { approveSuggestion, checkIsAdmin, listMySuggestions, listPendingSuggestions, rejectSuggestion, EDITABLE_FIELDS } from '../services/suggestions';

const STATUS_TEXT = { pending: 'Bekliyor', approved: 'Onaylandı', rejected: 'Reddedildi' };
const STATUS_CLASS = { pending: 'text-amber-300', approved: 'text-emerald-300', rejected: 'text-rose-300' };

function SuggestionSummary({ s }) {
  if (s.kind === 'new_place') {
    return <span>Yeni yer: <strong>{s.payload?.name}</strong> ({s.payload?.city || s.payload?.country || ''})</span>;
  }
  const fields = Object.keys(s.payload || {}).map((k) => EDITABLE_FIELDS[k] || k);
  return <span>Düzeltme ({s.place_id}): {fields.join(', ')}</span>;
}

export default function AccountModal({ isOpen, onClose, places, onUpdatePlaces, syncStatus, syncMessage, onOpenLegacy }) {
  const account = getAccount();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [photoCount, setPhotoCount] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [mine, setMine] = useState([]);
  const [pending, setPending] = useState([]);
  const [migrating, setMigrating] = useState(null);
  const [reviewNote, setReviewNote] = useState({});
  const autoTried = useRef(false);

  const legacyCount = (places || []).reduce((n, p) => n + (p.userPhotos || []).filter(isLegacyPhoto).length, 0);

  const reload = async () => {
    if (!getAccount()) return;
    countPrivatePhotos().then(setPhotoCount).catch(() => {});
    listMySuggestions().then(setMine).catch(() => {});
    const admin = await checkIsAdmin();
    setIsOwner(admin);
    if (admin) listPendingSuggestions().then(setPending).catch(() => {});
  };

  // Photos from before signing in move to the private folder on their own, once
  useEffect(() => {
    if (isOpen && account && legacyCount > 0 && !migrating && !autoTried.current) {
      autoTried.current = true;
      handleMigratePhotos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, legacyCount]);

  useEffect(() => {
    if (isOpen) {
      const authError = takeAuthError();
      if (authError) setError(`Giriş tamamlanamadı: ${authError}`);
      reload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await sendLoginLink(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleMigratePhotos = async () => {
    setError('');
    const total = legacyCount;
    let done = 0;
    setMigrating({ done, total });
    const next = [];
    try {
      for (const p of places) {
        if (!(p.userPhotos || []).some(isLegacyPhoto)) {
          next.push(p);
          continue;
        }
        const photos = [];
        for (const src of p.userPhotos) {
          if (isLegacyPhoto(src)) {
            photos.push(await migrateLegacyPhoto(src, p.id));
            done += 1;
            setMigrating({ done, total });
          } else photos.push(src);
        }
        next.push({ ...p, userPhotos: photos });
      }
      onUpdatePlaces(next);
      reload();
    } catch (err) {
      setError(`${err.message} (${done}/${total} fotoğraf taşındı; tekrar deneyebilirsin.)`);
      // keep what was moved so far
      onUpdatePlaces(
        places.map((p) => {
          const moved = next.find((n) => n.id === p.id);
          return moved || p;
        })
      );
    } finally {
      setMigrating(null);
    }
  };

  const decide = async (s, approve) => {
    setError('');
    try {
      if (approve) await approveSuggestion(s);
      else await rejectSuggestion(s, reviewNote[s.id] || '');
      setPending((list) => list.filter((x) => x.id !== s.id));
    } catch (err) {
      setError(err.message);
    }
  };

  const statusLabel = { ok: 'Bulut ile eşit', syncing: 'Eşitleniyor…', pending: 'Gönderilmeyi bekleyen değişiklik var', error: syncMessage || 'Eşitleme hatası', off: 'Kapalı' }[syncStatus] || '';

  return (
    <div className="fixed inset-0 z-[620] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">{account ? 'Hesabım' : 'Giriş yap / Hesap aç'}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800" aria-label="Kapat">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {error && <div className="bg-rose-500/10 border border-rose-500/40 text-rose-200 rounded-xl p-3 text-xs">{error}</div>}

          {!account ? (
            <>
              <p className="text-slate-300 text-xs leading-relaxed">
                Hesapla gittiğin yerlerin, notların ve fotoğrafların bulutta saklanır; telefonda ve bilgisayarda aynı veriyi görürsün. Verilerin yalnızca sana aittir; başka kullanıcılar göremez.
                Rehberi girişsiz de gezebilirsin.
              </p>
              {sent ? (
                <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 rounded-xl p-4 text-xs leading-relaxed">
                  <strong>{email}</strong> adresine bir giriş bağlantısı gönderdik. E-postandaki bağlantıya bu cihazda tıkla; spam klasörüne de bak.
                  <button onClick={() => setSent(false)} className="block mt-2 underline text-emerald-300">Başka adres dene</button>
                </div>
              ) : (
                <form onSubmit={handleSend} className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400">E-posta adresin</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@eposta.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    disabled={busy}
                    className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl py-2.5 text-sm flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" /> {busy ? 'Gönderiliyor…' : 'Giriş bağlantısı gönder'}
                  </button>
                  <p className="text-[11px] text-slate-500">Parola yok: e-postandaki bağlantıya tıklayınca giriş yaparsın. Hesabın yoksa otomatik açılır.</p>
                </form>
              )}
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex-1 border-t border-slate-800" /> veya <span className="flex-1 border-t border-slate-800" />
              </div>
              <button
                onClick={startGoogleLogin}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl py-2.5 text-sm flex items-center justify-center gap-2"
              >
                <span className="font-bold">G</span> Google ile devam et
              </button>
              {onOpenLegacy && (
                <button onClick={onOpenLegacy} className="text-[11px] text-slate-500 underline">
                  Eski parola eşlemesini kullan (gelişmiş)
                </button>
              )}
            </>
          ) : (
            <>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400">Giriş yapılan hesap</div>
                    <div className="font-semibold text-white truncate">{account.email}</div>
                  </div>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Çıkış yapınca bu cihazdaki kişisel verilerin (işaretler, notlar, fotoğraflar) silinir; hesabında kayıtlı kalır ve tekrar girince geri gelir. Devam edilsin mi?')) return;
                      if (syncStatus === 'pending' && !window.confirm('Buluta henüz gönderilmemiş değişiklikler var; çıkarsan kaybolabilir. Yine de çıkılsın mı?')) return;
                      await signOutAccount();
                      await clearLocalPersonalData();
                      window.location.reload();
                    }}
                    className="shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Çıkış yap
                  </button>
                </div>
                <div className="text-[11px] text-slate-400">
                  Eşitleme: <span className="text-slate-200">{statusLabel}</span>
                  {isOwner && <span className="ml-2 inline-flex items-center gap-1 text-amber-300"><ShieldCheck className="w-3 h-3" /> Yönetici</span>}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300"><ImageIcon className="w-4 h-4 text-sky-400" /> Fotoğraf alanın</div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-sky-500" style={{ width: `${Math.min(100, ((photoCount || 0) / PHOTO_QUOTA) * 100)}%` }} />
                </div>
                <div className="text-[11px] text-slate-400">{photoCount == null ? '…' : photoCount} / {PHOTO_QUOTA} fotoğraf (özel depoda, yalnızca sen görürsün)</div>
                {legacyCount > 0 && (
                  <button
                    onClick={handleMigratePhotos}
                    disabled={!!migrating}
                    className="mt-1 w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white rounded-lg py-2 text-xs font-bold"
                  >
                    {migrating ? `Taşınıyor… ${migrating.done}/${migrating.total}` : `Fotoğraflarını özel buluta taşı (${legacyCount})`}
                  </button>
                )}
              </div>

              {isOwner && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">Bekleyen öneriler ({pending.length})</div>
                  {pending.length === 0 && <div className="text-xs text-slate-500">Bekleyen öneri yok.</div>}
                  {pending.map((s) => (
                    <div key={s.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
                      <SuggestionSummary s={s} />
                      {s.note && <p className="text-slate-400">Not: {s.note}</p>}
                      <pre className="whitespace-pre-wrap break-words text-[11px] text-slate-400 max-h-32 overflow-y-auto bg-slate-900 rounded-lg p-2">
                        {Object.entries(s.payload || {}).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' | ') : v}`).join('\n')}
                      </pre>
                      <input
                        value={reviewNote[s.id] || ''}
                        onChange={(e) => setReviewNote({ ...reviewNote, [s.id]: e.target.value })}
                        placeholder="Reddedersen kısa gerekçe (isteğe bağlı)"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px]"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => decide(s, true)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-1.5 font-bold flex items-center justify-center gap-1"><Check className="w-3.5 h-3.5" /> Onayla</button>
                        <button onClick={() => decide(s, false)} className="flex-1 bg-rose-700 hover:bg-rose-600 text-white rounded-lg py-1.5 font-bold flex items-center justify-center gap-1"><XCircle className="w-3.5 h-3.5" /> Reddet</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gönderdiğim öneriler</div>
                {mine.length === 0 ? (
                  <div className="text-xs text-slate-500">Henüz öneri göndermedin. Bir yerin detayından "Düzeltme öner" ya da kendi eklediğin bir yerden "Rehbere öner" diyebilirsin.</div>
                ) : (
                  mine.slice(0, 15).map((s) => (
                    <div key={s.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs flex items-start justify-between gap-2">
                      <SuggestionSummary s={s} />
                      <span className={`shrink-0 font-semibold ${STATUS_CLASS[s.status]}`}>{STATUS_TEXT[s.status]}</span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
