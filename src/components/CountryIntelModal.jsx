// src/components/CountryIntelModal.jsx
// Practical Country Intel Modal for travelers (Visa status, Currency, Plugs, Tipping, Emergencies, Local Phrases)

import React, { useState, useEffect } from 'react';
import { getCountryIntel } from '../data/countryIntelData';
import { getCountryVisaInfo } from '../data/visaData';
import {
  X,
  Globe,
  Zap,
  Coins,
  ShieldAlert,
  Clock,
  Car,
  Droplets,
  Languages,
  Info,
  CheckCircle2,
  AlertTriangle,
  PhoneCall
} from 'lucide-react';

export default function CountryIntelModal({ isOpen, onClose, countryName, onOpenVisaDetails }) {
  if (!isOpen || !countryName) return null;

  const intel = getCountryIntel(countryName);
  const visa = getCountryVisaInfo(countryName);

  return (
    <div className="fixed inset-0 z-[1100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-white to-sky-500/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl shadow-xs">{intel?.flag || '🌍'}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900">
                  {intel?.country || countryName} Pratik Gezi Rehberi
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Başkent: <strong className="text-slate-700">{intel?.capital || '—'}</strong> · Türk Gezginler İçin Sahadan Bilgiler
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/50 text-slate-800 text-xs">
          {/* Top Visa Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">{visa.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">Türk Pasaportu Vize Durumu:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs border ${visa.badgeClass}`}>
                    {visa.label}
                  </span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  {visa.notes}
                </p>
                <div className="text-[10px] text-slate-400 mt-2 font-medium flex items-center gap-1 border-t border-slate-100 pt-1.5">
                  <span>🏛️</span>
                  <span>{visa.source || 'Kaynak: T.C. Dışişleri Bakanlığı (mfa.gov.tr) & konsolosluk.gov.tr · Kontrol: Kasım 2026'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid of Key Info: Currency, Plug, Time Diff, Emergencies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Currency Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold">
                <Coins className="w-4 h-4" />
                <span>Para Birimi & Harcama</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {intel?.currency?.name} ({intel?.currency?.symbol} {intel?.currency?.code})
              </div>
              {intel?.currency?.approxTry && (
                <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  Tahmini Kur: {intel?.currency?.approxTry}
                </div>
              )}
              <p className="text-slate-500 text-[11px]">
                Çoğu turistik noktada temassız kredi kartları yaygın olarak geçerlidir.
              </p>
            </div>

            {/* Plug & Socket Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-700 font-bold">
                  <Zap className="w-4 h-4" />
                  <span>Priz & Elektrik</span>
                </div>
                {intel?.plug?.needsAdapter ? (
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
                    ⚠️ Adaptör Şart!
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    ✓ Türkiye Uyumlu
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-slate-900">
                Priz Tipleri: {intel?.plug?.types?.join(', ') || 'C, F'} ({intel?.plug?.voltage || '230V'})
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {intel?.plug?.summary}
              </p>
            </div>

            {/* Tipping Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <Info className="w-4 h-4" />
                <span>Bahşiş Kültürü</span>
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                {intel?.tipping || 'Restoranlarda %10 civarı bahşiş standarttır.'}
              </p>
            </div>

            {/* Emergency & Traffic Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Acil Durum & Trafik</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-700">
                <span>🚨 Genel Acil: <strong className="font-mono text-slate-950 font-bold">{intel?.emergency?.general || '112'}</strong></span>
                <span>🚓 Polis: <strong className="font-mono text-slate-950 font-bold">{intel?.emergency?.police || '112'}</strong></span>
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600">
                <Car className="w-3.5 h-3.5 text-slate-500" />
                <span>Trafik Akışı: <strong>{intel?.drivingSide || 'Sağ'}</strong></span>
                <span>·</span>
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Saat Farkı: <strong>{intel?.timeDiff}</strong></span>
              </div>
            </div>
          </div>

          {/* Water Drinkability & Local Etiquette */}
          {(intel?.waterDrinkable || intel?.localTips) && (
            <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <Droplets className="w-4 h-4 text-amber-700" />
                <span>Çeşme Suyu & Yerel Adetler</span>
              </div>
              {intel?.waterDrinkable && (
                <div className="text-slate-700 text-[11px] leading-relaxed">
                  💧 <strong>Musluk Suyu:</strong> {intel?.waterDrinkable}
                </div>
              )}
              {intel?.localTips && (
                <div className="text-slate-700 text-[11px] leading-relaxed">
                  💡 <strong>Önemli İpucu:</strong> {intel?.localTips}
                </div>
              )}
            </div>
          )}

          {/* Essential Travel Phrases */}
          {intel?.phrases && intel.phrases.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Languages className="w-4 h-4 text-emerald-600" />
                  <span>5 Hayat Kurtaran Yerel Kelime</span>
                </div>
                <span className="text-[10px] text-slate-400">Türkçe Okunuşlarıyla</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {intel.phrases.map((phrase, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">{phrase.tr}</div>
                      <div className="text-xs font-bold text-slate-900">{phrase.local}</div>
                    </div>
                    {phrase.phonetic && (
                      <span className="text-[10px] text-amber-800 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        "{phrase.phonetic}"
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
