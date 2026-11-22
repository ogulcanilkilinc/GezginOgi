import React, { useEffect, useState } from 'react';
import { X, Send } from 'lucide-react';
import { getAccount } from '../services/account';
import { EDITABLE_FIELDS, submitSuggestion } from '../services/suggestions';

const currentValue = (place, field) => (field === 'highlights' ? (place.highlights || []).join('\n') : place[field] || '');

// "Düzeltme öner" (a correction to a guide place) or "Rehbere öner" (the user's own place)
export default function SuggestModal({ isOpen, onClose, place, mode, onOpenAccount }) {
  const [field, setField] = useState('whatAwaits');
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isOpen || !place) return;
    setField('whatAwaits');
    setValue(currentValue(place, 'whatAwaits'));
    setNote('');
    setError('');
    setDone(false);
  }, [isOpen, place?.id]);

  if (!isOpen || !place) return null;
  const signedIn = !!getAccount();

  const send = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'new') await submitSuggestion({ kind: 'new_place', placeId: place.id, payload: place, note });
      else await submitSuggestion({ kind: 'edit', placeId: place.id, payload: { [field]: value }, note });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[640] flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl text-slate-200">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">{mode === 'new' ? 'Rehbere öner' : 'Düzeltme öner'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800" aria-label="Kapat">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <p className="text-xs text-slate-400">
            <strong className="text-slate-200">{place.name}</strong> için önerin rehbere eklenmeden önce incelenir; onaylanırsa herkes görür.
          </p>
          {!signedIn ? (
            <div className="space-y-3">
              <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">Öneri göndermek için giriş yapmalısın.</p>
              <button onClick={() => { onClose(); onOpenAccount && onOpenAccount(); }} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl py-2.5">
                Giriş yap
              </button>
            </div>
          ) : done ? (
            <div className="space-y-3">
              <p className="text-xs text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">Önerin gönderildi, teşekkürler! Durumunu "Hesabım" bölümünden izleyebilirsin.</p>
              <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl py-2.5 font-semibold">Kapat</button>
            </div>
          ) : (
            <form onSubmit={send} className="space-y-3">
              {error && <div className="bg-rose-500/10 border border-rose-500/40 text-rose-200 rounded-xl p-3 text-xs">{error}</div>}
              {mode === 'new' ? (
                <p className="text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-xl p-3">
                  Bu yerin adı, konumu ve açıklamaları (fotoğraflar ve kişisel notların hariç) rehbere eklenmek üzere gönderilecek.
                </p>
              ) : (
                <>
                  <label className="block text-xs font-semibold text-slate-400">Neyi düzeltelim?</label>
                  <select
                    value={field}
                    onChange={(e) => {
                      setField(e.target.value);
                      setValue(currentValue(place, e.target.value));
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                  >
                    {Object.entries(EDITABLE_FIELDS).map(([k, label]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </select>
                  <label className="block text-xs font-semibold text-slate-400">Yeni metin</label>
                  <textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    rows={6}
                    maxLength={4000}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </>
              )}
              <label className="block text-xs font-semibold text-slate-400">Not (isteğe bağlı: neden, kaynak…)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={1000}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
              <button disabled={busy} className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl py-2.5 flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> {busy ? 'Gönderiliyor…' : 'Öneriyi gönder'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
