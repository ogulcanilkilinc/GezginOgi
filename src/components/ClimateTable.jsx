import React, { useState } from 'react';
import { Thermometer } from 'lucide-react';

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const YEARS = 5;
const cache = new Map(); // "lat,lng" -> monthly averages

// Monthly averages from the last 5 full years of Open-Meteo's historical weather archive
async function loadClimate(lat, lng) {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  if (cache.has(key)) return cache.get(key);
  const endYear = new Date().getFullYear() - 1;
  const url =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}` +
    `&start_date=${endYear - YEARS + 1}-01-01&end_date=${endYear}-12-31` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`İklim verisi alınamadı (${res.status})`);
  const { daily } = await res.json();
  const acc = MONTHS.map(() => ({ max: 0, min: 0, n: 0, rain: 0, rainyDays: 0 }));
  daily.time.forEach((day, i) => {
    const m = Number(day.slice(5, 7)) - 1;
    const tmax = daily.temperature_2m_max[i];
    const tmin = daily.temperature_2m_min[i];
    const rain = daily.precipitation_sum[i];
    if (tmax == null || tmin == null) return;
    acc[m].max += tmax;
    acc[m].min += tmin;
    acc[m].n += 1;
    acc[m].rain += rain || 0;
    if ((rain || 0) >= 1) acc[m].rainyDays += 1;
  });
  const result = acc.map((a) => ({
    max: a.n ? Math.round(a.max / a.n) : null,
    min: a.n ? Math.round(a.min / a.n) : null,
    rain: Math.round(a.rain / YEARS),
    rainyDays: Math.round(a.rainyDays / YEARS)
  }));
  cache.set(key, result);
  return result;
}

const tempColor = (t) =>
  t == null ? '' : t >= 30 ? 'bg-rose-100 text-rose-800' : t >= 22 ? 'bg-orange-100 text-orange-800' : t >= 14 ? 'bg-amber-50 text-amber-800' : t >= 5 ? 'bg-sky-50 text-sky-800' : 'bg-indigo-100 text-indigo-800';

export default function ClimateTable({ coords }) {
  const [data, setData] = useState(null);
  const [state, setState] = useState('idle'); // idle | loading | error
  const [error, setError] = useState('');
  const thisMonth = new Date().getMonth();

  if (!coords || coords.length !== 2) return null;

  const handleLoad = async () => {
    setState('loading');
    try {
      setData(await loadClimate(coords[0], coords[1]));
      setState('idle');
    } catch (e) {
      setError(e.message);
      setState('error');
    }
  };

  if (!data) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-slate-500">
          Son {YEARS} yılın gerçek hava kayıtlarından aylık ortalama sıcaklık ve yağış.
        </p>
        <button
          onClick={handleLoad}
          disabled={state === 'loading'}
          className="bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5"
        >
          <Thermometer className="w-3.5 h-3.5" />
          {state === 'loading' ? 'Yükleniyor…' : 'Aylık iklim tablosunu göster'}
        </button>
        {state === 'error' && <p className="text-xs text-rose-600">⚠️ {error}. İnternet bağlantını kontrol edip tekrar dene.</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full min-w-[520px] text-[11px] text-center border-separate border-spacing-0.5">
          <thead>
            <tr className="text-slate-500">
              <th className="text-left font-semibold pr-1"></th>
              {MONTHS.map((m, i) => (
                <th key={m} className={`font-semibold ${i === thisMonth ? 'text-sky-700 underline' : ''}`}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-left text-slate-500 pr-1 whitespace-nowrap">En yüksek</td>
              {data.map((d, i) => <td key={i} className={`rounded font-semibold py-1 ${tempColor(d.max)}`}>{d.max}°</td>)}
            </tr>
            <tr>
              <td className="text-left text-slate-500 pr-1 whitespace-nowrap">En düşük</td>
              {data.map((d, i) => <td key={i} className={`rounded py-1 ${tempColor(d.min)}`}>{d.min}°</td>)}
            </tr>
            <tr>
              <td className="text-left text-slate-500 pr-1 whitespace-nowrap">Yağış</td>
              {data.map((d, i) => <td key={i} className="rounded py-1 bg-slate-50 text-slate-700">{d.rain}<span className="text-slate-400">mm</span></td>)}
            </tr>
            <tr>
              <td className="text-left text-slate-500 pr-1 whitespace-nowrap">Yağışlı gün</td>
              {data.map((d, i) => <td key={i} className="rounded py-1 bg-slate-50 text-slate-700">{d.rainyDays}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-slate-400">Kaynak: Open-Meteo tarihsel hava arşivi · bu ay altı çizili.</p>
    </div>
  );
}
