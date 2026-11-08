import React, { useState } from 'react';
import { X, PhoneCall, ShieldAlert, AlertCircle, MapPin, Mail, ExternalLink, HelpCircle } from 'lucide-react';
import {
  DISISLERI_GLOBAL_HOTLINE,
  CONSULATE_DIRECTORY,
  EMERGENCY_STEPS_IF_PASSPORT_LOST
} from '../data/consulateData';

export default function EmergencyConsulateModal({ isOpen, onClose }) {
  const [selectedCountry, setSelectedCountry] = useState(CONSULATE_DIRECTORY[0].country);
  const [activeTab, setActiveTab] = useState('missions'); // 'missions' or 'lostPassport'

  if (!isOpen) return null;

  const currentCountry =
    CONSULATE_DIRECTORY.find((c) => c.country === selectedCountry) || CONSULATE_DIRECTORY[0];

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-xl shadow-inner">
              🚨
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Acil Durum & T.C. Konsolosluk Rehberi</span>
              </h2>
              <p className="text-xs text-slate-400">
                Balkanlar ve Avrupa’da 7/24 Türk Dışişleri acil hatları, polis ve yol yardımı
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global 7/24 Hotline Red Banner */}
        <div className="bg-rose-950/70 border-b border-rose-500/30 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <PhoneCall className="w-5 h-5 text-rose-400 animate-pulse shrink-0" />
            <div>
              <strong className="text-xs sm:text-sm text-white font-bold block">
                {DISISLERI_GLOBAL_HOTLINE.name}
              </strong>
              <span className="text-[11px] text-rose-200/90">{DISISLERI_GLOBAL_HOTLINE.desc}</span>
            </div>
          </div>
          <a
            href={`tel:${DISISLERI_GLOBAL_HOTLINE.phone.replace(/\s+/g, '')}`}
            className="bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95 shrink-0"
          >
            <span>Hemen Ara: {DISISLERI_GLOBAL_HOTLINE.phone}</span>
          </a>
        </div>

        {/* Tabs Bar */}
        <div className="bg-slate-950/90 px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('missions')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'missions'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              <span>🏛️ Temsilcilikler & Acil Numaralar</span>
            </button>
            <button
              onClick={() => setActiveTab('lostPassport')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'lostPassport'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Pasaport Kaybolursa Ne Yapılır?</span>
            </button>
          </div>

          {activeTab === 'missions' && (
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none"
            >
              {CONSULATE_DIRECTORY.map((c) => (
                <option key={c.country} value={c.country}>
                  {c.flag} {c.country}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'missions' ? (
            <div className="space-y-6">
              {/* Local Emergency Numbers Grid */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <span>{currentCountry.flag}</span>
                  <span>{currentCountry.country} Yerel Acil Yardım Hatları</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 block">🚔 Polis</span>
                    <strong className="text-sm font-extrabold text-white mt-0.5 block">
                      {currentCountry.police}
                    </strong>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 block">🚑 Ambulans</span>
                    <strong className="text-sm font-extrabold text-white mt-0.5 block">
                      {currentCountry.ambulance}
                    </strong>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 block">🚒 İtfaiye</span>
                    <strong className="text-sm font-extrabold text-white mt-0.5 block">
                      {currentCountry.fire}
                    </strong>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 block">🚗 Yol Yardım</span>
                    <strong className="text-xs font-bold text-amber-300 mt-0.5 block truncate">
                      {currentCountry.roadAssistance}
                    </strong>
                  </div>
                </div>
              </div>

              {/* T.C. Embassies & Consulates in Country */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {currentCountry.country} T.C. Dış Temsilcilikleri:
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {currentCountry.missions.map((mission, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>🇹🇷</span>
                          <span>{mission.title}</span>
                        </h4>
                        <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                          7/24 Acil Nöbetçi
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1.5">
                          <div className="flex items-start gap-2 text-slate-300">
                            <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            <span>{mission.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-300">
                            <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{mission.email}</span>
                          </div>
                        </div>

                        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                          <div className="text-[11px] text-slate-400">Santral: {mission.phone}</div>
                          <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                            <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                            <span>Acil Nöbet: {mission.emergencyPhone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* PASSPORT LOST RESCUE GUIDE TAB */
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200">
                <strong>Sakin olun!</strong> Yurt dışındayken pasaport kaybı veya hırsızlığı durumunda Türk konsoloslukları aynı gün içinde Türkiye’ye dönüş için geçerli tek yönlü <strong>"Geçici Pasaport (Seyahat Belgesi)"</strong> düzenler.
              </div>

              <div className="space-y-3">
                {EMERGENCY_STEPS_IF_PASSPORT_LOST.map((st) => (
                  <div
                    key={st.step}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3.5"
                  >
                    <span className="w-8 h-8 rounded-xl bg-rose-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                      {st.step}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{st.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{st.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
