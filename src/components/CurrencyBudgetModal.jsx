import React, { useState, useEffect, useMemo } from 'react';
import { useDocSync } from '../services/useDocSync';
import { X, Wallet, ArrowRightLeft, Plus, Trash2, PieChart, TrendingUp, AlertCircle, Check } from 'lucide-react';

const STORAGE_KEY = 'kesif_atlasim_budget_v1';

const CURRENCIES = [
  { code: 'EUR', name: 'Euro (€)', symbol: '€', rateToEur: 1.0, flag: '🇪🇺' },
  { code: 'TRY', name: 'Türk Lirası (₺)', symbol: '₺', rateToEur: 38.5, flag: '🇹🇷' },
  { code: 'BAM', name: 'Bosna Markı (KM)', symbol: 'KM', rateToEur: 1.95583, flag: '🇧🇦' },
  { code: 'RSD', name: 'Sırp Dinarı (RSD)', symbol: 'дин', rateToEur: 117.2, flag: '🇷🇸' },
  { code: 'ALL', name: 'Arnavut Leki (Lek)', symbol: 'L', rateToEur: 100.5, flag: '🇦🇱' },
  { code: 'MKD', name: 'Makedon Dinarı (ден)', symbol: 'ден', rateToEur: 61.5, flag: '🇲🇰' },
  { code: 'USD', name: 'ABD Doları ($)', symbol: '$', rateToEur: 1.08, flag: '🇺🇸' },
];

const EXPENSE_CATEGORIES = [
  { id: 'yemek', label: 'Yemek & Kafe', icon: '🍽️' },
  { id: 'konaklama', label: 'Konaklama & Otel', icon: '🏨' },
  { id: 'ulasim', label: 'Ulaşım, Yakıt & Otoyol', icon: '⛽' },
  { id: 'muze', label: 'Müze & Giriş Bileti', icon: '🎟️' },
  { id: 'alisveris', label: 'Alışveriş & Hatıra', icon: '🛍️' },
  { id: 'diger', label: 'Diğer / Çeşitli', icon: '📦' },
];

export default function CurrencyBudgetModal({ isOpen, onClose }) {
  // Converter State
  const [convertAmount, setConvertAmount] = useState('50');
  const [fromCurrency, setFromCurrency] = useState('EUR');

  // Budget & Expenses State
  const [budgetLimitEur, setBudgetLimitEur] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && saved.budgetLimitEur !== undefined) return String(saved.budgetLimitEur);
    } catch (_) {}
    return '800';
  });
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.expenses)) {
          return parsed.expenses;
        }
      }
    } catch (_) {}
    return [
      { id: 'ex-1', title: 'Saraybosna Ferhadija Börek & Çay', amount: 15, currency: 'BAM', category: 'yemek', date: 'Nisan 2026' },
      { id: 'ex-2', title: 'Mostar Köprüsü Müzesi Girişi', amount: 10, currency: 'EUR', category: 'muze', date: 'Nisan 2026' }
    ];
  });

  // Expense form
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCurrency, setNewCurrency] = useState('EUR');
  const [newCategory, setNewCategory] = useState('yemek');

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ budgetLimitEur, expenses })
      );
    } catch (_) {}
  }, [budgetLimitEur, expenses]);

  // The budget follows the user across devices
  const budgetDoc = useMemo(() => ({ budgetLimitEur, expenses }), [budgetLimitEur, expenses]);
  useDocSync({
    id: 'budget',
    value: budgetDoc,
    setValue: (d) => {
      if (Array.isArray(d?.expenses)) setExpenses(d.expenses);
      if (d?.budgetLimitEur !== undefined) setBudgetLimitEur(String(d.budgetLimitEur));
    },
    isEmpty: () => false
  });

  if (!isOpen) return null;

  // Calculate Conversions
  const fromObj = CURRENCIES.find((c) => c.code === fromCurrency) || CURRENCIES[0];
  const numAmount = parseFloat(convertAmount) || 0;
  const inEur = fromCurrency === 'EUR' ? numAmount : numAmount / fromObj.rateToEur;

  // Calculate Expenses in EUR and TRY
  const totalSpentEur = expenses.reduce((sum, item) => {
    const curObj = CURRENCIES.find((c) => c.code === item.currency) || CURRENCIES[0];
    const itemInEur = item.currency === 'EUR' ? item.amount : item.amount / curObj.rateToEur;
    return sum + itemInEur;
  }, 0);

  const tryObj = CURRENCIES.find((c) => c.code === 'TRY') || CURRENCIES[1];
  const totalSpentTry = totalSpentEur * tryObj.rateToEur;
  const budgetNum = parseFloat(budgetLimitEur) || 0;
  const remainingEur = budgetNum - totalSpentEur;
  const budgetPercent = budgetNum > 0 ? Math.min(100, Math.round((totalSpentEur / budgetNum) * 100)) : 0;

  const handleAddExpense = (e) => {
    e.preventDefault();
    const val = parseFloat(newAmount);
    if (!newTitle.trim() || isNaN(val) || val <= 0) return;

    const newItem = {
      id: `exp-${Date.now()}`,
      title: newTitle.trim(),
      amount: val,
      currency: newCurrency,
      category: newCategory,
      date: new Date().toLocaleDateString('tr-TR')
    };

    setExpenses([newItem, ...expenses]);
    setNewTitle('');
    setNewAmount('');
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shadow-inner">
              💱
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Çoklu Para Birimi & Seyahat Bütçe Takipçisi</span>
              </h2>
              <p className="text-xs text-slate-400">
                Balkanlar döviz çevirici (BAM, RSD, ALL, MKD, EUR) ve anlık harcama defteri
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

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* SECTION 1: LIVE CURRENCY CONVERTER */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4" />
                <span>Balkanlar & Küresel Canlı Döviz Çevirici</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Sabit Peg & Güncel Referans Kurları
              </span>
            </div>

            {/* Input Row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[140px]">
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Miktar</label>
                <input
                  type="number"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(e.target.value)}
                  placeholder="Miktar gir..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="w-48">
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Kaynak Birim</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-amber-400"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Converted Currencies Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
              {CURRENCIES.map((c) => {
                const converted = inEur * c.rateToEur;
                const isSelected = c.code === fromCurrency;

                return (
                  <div
                    key={c.code}
                    className={`p-3 rounded-xl border text-center transition ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : 'bg-slate-900/90 border-slate-800/80 text-slate-200'
                    }`}
                  >
                    <div className="text-base mb-0.5">{c.flag}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{c.code}</div>
                    <div className="text-xs sm:text-sm font-extrabold mt-0.5 truncate text-white">
                      {converted.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} {c.symbol}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: BUDGET & EXPENSES TRACKER */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Summary Card */}
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>Seyahat Bütçe Durumu</span>
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span>Hedef:</span>
                    <input
                      type="number"
                      value={budgetLimitEur}
                      onChange={(e) => setBudgetLimitEur(e.target.value)}
                      className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-amber-300 font-bold text-right"
                    />
                    <span>€</span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <span className="text-[11px] text-slate-400">Toplam Harcanan:</span>
                    <div className="text-2xl font-extrabold text-emerald-400">
                      {totalSpentEur.toFixed(1)} €
                    </div>
                    <div className="text-xs text-slate-400">
                      ≈ {totalSpentTry.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-400">Bütçe Kullanımı:</span>
                      <span className={budgetPercent > 90 ? 'text-rose-400' : 'text-amber-400'}>
                        %{budgetPercent}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          budgetPercent > 90
                            ? 'bg-rose-500'
                            : 'bg-gradient-to-r from-emerald-500 to-amber-400'
                        }`}
                        style={{ width: `${budgetPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                    <span className="text-slate-400">Kalan Bütçe:</span>
                    <span
                      className={`font-bold ${
                        remainingEur < 0 ? 'text-rose-400' : 'text-slate-200'
                      }`}
                    >
                      {remainingEur.toFixed(1)} €
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 italic">
                💡 İpucu: Bosna’da Euro ile ödeme yapabilirsiniz ancak para üstünü Bosna Markı (KM) olarak verirler.
              </div>
            </div>

            {/* Right: Expenses List & Form (2 cols) */}
            <div className="lg:col-span-2 bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-200 pb-2 border-b border-slate-800 flex items-center justify-between">
                  <span>Harcama Kayıtları ({expenses.length})</span>
                  <span className="text-[11px] text-slate-400">Yerinde anlık not tut</span>
                </h3>

                {/* Add Expense Form */}
                <form onSubmit={handleAddExpense} className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Harcama açıklaması (ör: Kotor Giriş Bileti, Saraybosna Köfte)..."
                    className="flex-1 min-w-[160px] bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="number"
                    step="any"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="Tutar"
                    className="w-20 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-amber-300 font-bold focus:outline-none"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ekle</span>
                  </button>
                </form>

                {/* Expenses List */}
                <div className="mt-3 space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {expenses.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      Henüz harcama kaydı eklenmedi.
                    </div>
                  ) : (
                    expenses.map((item) => {
                      const catObj =
                        EXPENSE_CATEGORIES.find((c) => c.id === item.category) ||
                        EXPENSE_CATEGORIES[0];
                      const curObj =
                        CURRENCIES.find((c) => c.code === item.currency) || CURRENCIES[0];

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base">{catObj.icon}</span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-200 truncate">{item.title}</p>
                              <span className="text-[10px] text-slate-400">{item.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-extrabold text-amber-400">
                              {item.amount} {curObj.symbol}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteExpense(item.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
