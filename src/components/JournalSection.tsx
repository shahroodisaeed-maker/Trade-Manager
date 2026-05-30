import React, { useState } from 'react';
import { TradeLog } from '../types';
import { 
  Plus, Calendar, Clock, TrendingUp, Layers, HelpCircle, 
  Upload, CheckCircle, XCircle, MinusCircle, Trash2, Edit3, 
  Download, ChevronRight, Calculator, RefreshCw, BarChart2, BookOpen
} from 'lucide-react';

interface JournalSectionProps {
  trades: TradeLog[];
  onAddTrade: (trade: Omit<TradeLog, 'id'>) => void;
  onUpdateTrade: (id: string, trade: Partial<TradeLog>) => void;
  onDeleteTrade: (id: string) => void;
  darkMode?: boolean;
}

export default function JournalSection({
  trades,
  onAddTrade,
  onUpdateTrade,
  onDeleteTrade,
  darkMode = false
}: JournalSectionProps) {
  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [pair, setPair] = useState('EURUSD');
  const [timeframe, setTimeframe] = useState('M15');
  const [strategy, setStrategy] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [result, setResult] = useState<'profit' | 'loss' | 'breakeven'>('profit');
  const [gainLossAmount, setGainLossAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);

  // Position Calculator state
  const [calcBalance, setCalcBalance] = useState('10000');
  const [calcRisk, setCalcRisk] = useState('1');
  const [calcSlPips, setCalcSlPips] = useState('20');
  const [calcPair, setCalcPair] = useState('EURUSD');
  const [calcResult, setCalcResult] = useState<number | null>(null);

  // Active filter
  const [selectedArchive, setSelectedArchive] = useState<'all' | string>('all'); // "YYYY-MM" or "all"
  const [resultFilter, setResultFilter] = useState<'all' | 'profit' | 'loss' | 'breakeven'>('all'); // Filter by trade results
  const [pairFilter, setPairFilter] = useState<string>('all');
  const [weekdayFilter, setWeekdayFilter] = useState<string>('all');

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit trade
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !pair || !strategy || !entryPrice || !stopLoss || !gainLossAmount) {
      alert('لطفاً فیلدهای ستاره‌دار را پر کنید.');
      return;
    }

    const tradeData = {
      dateTime: `${date}T${time || '00:00'}`,
      pair,
      timeframe,
      strategy,
      entryPrice: Number(entryPrice),
      stopLoss: Number(stopLoss),
      takeProfit: takeProfit ? Number(takeProfit) : undefined,
      result,
      gainLossAmount: Number(gainLossAmount) * (result === 'loss' ? -1 : 1),
      notes,
      image
    };

    if (editingTradeId) {
      onUpdateTrade(editingTradeId, tradeData);
      setEditingTradeId(null);
    } else {
      onAddTrade(tradeData);
    }

    // Reset Form
    resetForm();
  };

  const resetForm = () => {
    setDate('');
    setTime('');
    setPair('EURUSD');
    setTimeframe('M15');
    setStrategy('');
    setEntryPrice('');
    setStopLoss('');
    setTakeProfit('');
    setResult('profit');
    setGainLossAmount('');
    setNotes('');
    setImage(undefined);
    setShowAddForm(false);
    setEditingTradeId(null);
  };

  const handleEdit = (trade: TradeLog) => {
    const [d, t] = trade.dateTime.split('T');
    setDate(d || '');
    setTime(t || '');
    setPair(trade.pair);
    setTimeframe(trade.timeframe);
    setStrategy(trade.strategy);
    setEntryPrice(trade.entryPrice.toString());
    setStopLoss(trade.stopLoss.toString());
    setTakeProfit(trade.takeProfit ? trade.takeProfit.toString() : '');
    setResult(trade.result);
    setGainLossAmount(Math.abs(trade.gainLossAmount).toString());
    setNotes(trade.notes);
    setImage(trade.image);
    setEditingTradeId(trade.id);
    setShowAddForm(true);
  };

  // Expanded trading pairs list
  const tradingPairs = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 
    'NZDUSD', 'EURJPY', 'GBPJPY', 'XAUUSD', 'BTCUSD', 'ETHUSD',
    'GBPCHF', 'EURGBP', 'EURAUD', 'EURNZD', 'AUDJPY', 'CADJPY', 'CHFJPY', 
    'XAGUSD', 'US30', 'NDAQ', 'SOLUSD', 'USOIL'
  ];

  // Calculate position size for Forex
  const handleCalculatePosition = () => {
    const bal = Number(calcBalance) || 0;
    const rsk = Number(calcRisk) || 0;
    const sl = Number(calcSlPips) || 1;
    
    // Amount we are willing to lose in dollars
    const riskAmountStr = (bal * (rsk / 100));
    
    let pipValue = 10; // Standard pip value in USD per lot
    if (calcPair.endsWith('JPY')) {
      pipValue = 9.1;
    } else if (calcPair.includes('CAD')) {
      pipValue = 7.3;
    } else if (calcPair.includes('CHF')) {
      pipValue = 11.2;
    }

    // Lots = Risk Amount / (SL Pips * Pip Value)
    const lots = riskAmountStr / (sl * pipValue);
    setCalcResult(Math.round(lots * 100) / 100);
  };

  // Archive filters extraction
  const getArchiveGroups = () => {
    const months = new Set<string>();
    trades.forEach(t => {
      const yearMonth = t.dateTime.slice(0, 7); // YYYY-MM
      months.add(yearMonth);
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  };

  // Filtered trades list (incorporating time filter + result filter + pair filter + weekday filter)
  const daysOfWeekPersian = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];

  const filteredTrades = trades.filter(t => {
    const archiveMatch = selectedArchive === 'all' || t.dateTime.startsWith(selectedArchive);
    const resultMatch = resultFilter === 'all' || t.result === resultFilter;
    const pairMatch = pairFilter === 'all' || t.pair === pairFilter;

    let weekdayMatch = true;
    if (weekdayFilter !== 'all') {
      const parts = t.dateTime.split('T')[0];
      const parsedDate = new Date(parts + 'T00:00:00');
      const dayIndex = parsedDate.getDay();
      const dayName = daysOfWeekPersian[dayIndex];
      weekdayMatch = (dayName === weekdayFilter);
    }

    return archiveMatch && resultMatch && pairMatch && weekdayMatch;
  });

  // Calculate stats for CURRENTLY active filter
  const totalTradesCount = filteredTrades.length;
  const profitableTrades = filteredTrades.filter(t => t.result === 'profit').length;
  const losingTrades = filteredTrades.filter(t => t.result === 'loss').length;
  const winRate = totalTradesCount > 0 ? Math.round((profitableTrades / totalTradesCount) * 100) : 0;
  const totalGainLoss = filteredTrades.reduce((sum, curr) => sum + curr.gainLossAmount, 0);

  // Export to CSV Function
  const exportToCSV = () => {
    const headers = ['id', 'تاریخ و ساعت', 'جفت ارز', 'تایم فریم', 'استراتژی', 'قیمت ورود', 'حد ضرر', 'حد سود', 'نتیجه معامله', 'سود/زیان مادی ($)', 'یادداشت‌ ها'];
    const rows = filteredTrades.map(t => [
      t.id,
      t.dateTime,
      t.pair,
      t.timeframe,
      t.strategy,
      t.entryPrice,
      t.stopLoss,
      t.takeProfit || '',
      t.result === 'profit' ? 'سود' : (t.result === 'loss' ? 'ضرر' : 'سر‌به‌سر'),
      t.gainLossAmount,
      `"${t.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trading_journal_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper translations for calendar
  const getPersianMonthName = (yearMonthStr: string) => {
    const [year, month] = yearMonthStr.split('-');
    const m = parseInt(month, 10);
    const months = [
      'ژانویه (دی/بهمن)', 'فوریه (بهمن/اسفند)', 'مارس (اسفند/فروردین)', 
      'آوریل (فروردین/اردیبهشت)', 'می (اردیبهشت/خرداد)', 'ژوئن (خرداد/تیر)', 
      'جولای (تیر/مرداد)', 'اوت (مرداد/شهریور)', 'سپتامبر (شهریور/مهر)', 
      'اکتبر (مهر/آبان)', 'نوامبر (آبان/آذر)', 'دسامبر (آذر/دی)'
    ];
    return `${months[m - 1]} ${year}`;
  };

  // Render performance chart
  const renderPerformanceChart = () => {
    const monthlySummary: { [month: string]: { profit: number; loss: number; total: number } } = {};
    const sortedTrades = [...trades].sort((a,b) => a.dateTime.localeCompare(b.dateTime));
    
    sortedTrades.forEach(t => {
      const month = t.dateTime.slice(0, 7); // "YYYY-MM"
      if (!monthlySummary[month]) {
        monthlySummary[month] = { profit: 0, loss: 0, total: 0 };
      }
      if (t.result === 'profit') {
        monthlySummary[month].profit += Math.abs(t.gainLossAmount);
      } else if (t.result === 'loss') {
        monthlySummary[month].loss += Math.abs(t.gainLossAmount);
      }
      monthlySummary[month].total += t.gainLossAmount;
    });

    const monthsKeys = Object.keys(monthlySummary).sort().slice(-6); // Last 6 months
    if (monthsKeys.length === 0) {
      return (
        <div className={`h-46 flex items-center justify-center font-sans text-xs border border-dashed rounded-lg p-4 text-center leading-relaxed ${
          darkMode ? 'border-slate-800 text-slate-500' : 'border-zinc-200 text-zinc-400'
        }`}>
          جهت رسم نمودار جریان نقدینگی و تحلیل عملکرد، ابتدا چند معامله در زبانه ثبت کنید.
        </div>
      );
    }

    const maxVal = Math.max(...monthsKeys.map(k => Math.max(Math.abs(monthlySummary[k].profit), Math.abs(monthlySummary[k].loss), Math.abs(monthlySummary[k].total), 100)));
    
    return (
      <div className={`p-4 rounded-xl border ${
        darkMode ? 'bg-slate-950 border-slate-800/80' : 'bg-zinc-50 border-zinc-100'
      }`}>
        <h4 className={`text-xs font-semibold mb-3 flex items-center gap-1.5 font-sans justify-end ${
          darkMode ? 'text-slate-300' : 'text-zinc-700'
        }`}>
          جریان سود و زیان ماهیانه (براساس فیلتر) <BarChart2 size={14} className="text-zinc-500" />
        </h4>
        <div className="w-full flex justify-between gap-2 overflow-x-auto pt-4 pb-2" dir="ltr">
          {monthsKeys.map(k => {
            const sum = monthlySummary[k];
            const netHeight = Math.min(120, Math.max(5, (Math.abs(sum.total) / maxVal) * 110));
            const isPositive = sum.total >= 0;

            return (
              <div key={k} className="flex-1 flex flex-col items-center min-w-[70px]">
                <div className="h-[130px] flex items-end justify-center w-full relative group">
                  <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] py-1 px-1.5 rounded shadow pointer-events-none z-10 font-mono">
                    Net: {isPositive ? '+' : ''}{sum.total.toFixed(0)}$
                  </div>
                  <div 
                    className={`w-8 rounded-t-sm transition-all duration-300 ${
                      isPositive 
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-sm' 
                        : 'bg-rose-600 hover:bg-rose-500 shadow-sm'
                    }`}
                    style={{ height: `${netHeight}px` }}
                  />
                </div>
                <span className="text-[9px] text-slate-500 mt-2 rotate-12 origin-top-left font-mono">{k}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end gap-3 text-[10px] text-slate-400 mt-3 font-sans" dir="rtl">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-600 rounded-sm inline-block"></span>سوددهی خالص</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-600 rounded-sm inline-block"></span>زیان‌دهی خالص</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-1">
        <div className={`p-4 border rounded-2xl flex items-center justify-between shadow-sm transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/95'
        }`}>
          <div>
            <span className="text-xs text-slate-505 font-medium">کل معاملات فیلترشده</span>
            <h3 className="text-2xl font-bold mt-1 font-mono tracking-tight">{totalTradesCount}</h3>
          </div>
          <BookOpen className="text-slate-400" size={22} />
        </div>

        <div className={`p-4 border rounded-2xl flex items-center justify-between shadow-sm transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/95'
        }`}>
          <div>
            <span className="text-xs text-slate-505 font-medium">نسبت پیروزی (Win Rate)</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <h3 className="text-2xl font-bold text-emerald-500 font-mono tracking-tight">{winRate}%</h3>
              <span className="text-[10px] text-slate-400 font-medium">({profitableTrades} از {totalTradesCount})</span>
            </div>
          </div>
          <TrendingUp className="text-emerald-500" size={22} />
        </div>

        <div className={`p-4 border rounded-2xl flex items-center justify-between shadow-sm transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/95'
        }`}>
          <div>
            <span className="text-xs text-slate-505 font-medium">سود/زیان کل کارنامه</span>
            <h3 className={`text-2xl font-bold mt-1 font-mono tracking-tight ${totalGainLoss >= 0 ? (darkMode ? 'text-emerald-400' : 'text-slate-900') : 'text-rose-600'}`}>
              {totalGainLoss >= 0 ? '+' : ''}{totalGainLoss.toLocaleString()}$
            </h3>
          </div>
          <div className={`p-1.5 rounded-full ${totalGainLoss >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
            <TrendingUp size={16} />
          </div>
        </div>
      </div>

      {/* DETACHED SPARK / HIGH-READABILITY FULL-WIDTH FILTER PANEL */}
      <div className={`p-4 border rounded-2xl flex flex-col justify-between shadow-sm gap-3 transition-all ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/95'
      }`}>
        <div className="flex items-center justify-between border-b pb-1.5 border-slate-100/10">
          <span className="text-[11px] text-indigo-400 font-black flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> فیلترهای چندبعدی کارنامه معاملاتی
          </span>
          <Calendar className="text-slate-450" size={15} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-right">
          <div>
            <span className="text-[10px] text-slate-405 block font-bold mb-1.5">بایگانی ماه</span>
            <select 
              className={`w-full p-2 border rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold cursor-pointer ${
                darkMode ? 'text-slate-200 border-slate-800 bg-slate-950' : 'text-slate-700 border-slate-200 bg-white'
              }`}
              value={selectedArchive}
              onChange={(e) => setSelectedArchive(e.target.value)}
            >
              <option value="all">همه ماه‌ها</option>
              {getArchiveGroups().map(group => (
                <option key={group} value={group}>{getPersianMonthName(group)}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[10px] text-slate-405 block font-bold mb-1.5">جفت ارز مورد معامله</span>
            <select 
              className={`w-full p-2 border rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold cursor-pointer ${
                darkMode ? 'text-slate-200 border-slate-800 bg-slate-950' : 'text-slate-700 border-slate-200 bg-white'
              }`}
              value={pairFilter}
              onChange={(e) => setPairFilter(e.target.value)}
            >
              <option value="all">همه جفت ارزها</option>
              {Array.from(new Set(['XAUUSD', ...trades.map(t => t.pair)])).sort().map(p => (
                <option key={p} value={p}>{p === 'XAUUSD' ? 'GOLD / طلا (XAUUSD)' : p}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[10px] text-slate-405 block font-bold mb-1.5">روز هفته معامله</span>
            <select 
              className={`w-full p-2 border rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold cursor-pointer ${
                darkMode ? 'text-slate-200 border-slate-800 bg-slate-950' : 'text-slate-700 border-slate-200 bg-white'
              }`}
              value={weekdayFilter}
              onChange={(e) => setWeekdayFilter(e.target.value)}
            >
              <option value="all">تمام روزها</option>
              {['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          
          <div>
            <span className="text-[10px] text-slate-405 block font-bold mb-1.5">برآیند معامله</span>
            <select 
              className={`w-full p-2 border rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold cursor-pointer ${
                darkMode ? 'text-slate-200 border-slate-800 bg-slate-950' : 'text-slate-700 border-slate-200 bg-white'
              }`}
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value as any)}
            >
              <option value="all">همه نتایج</option>
              <option value="profit">فقط سودها</option>
              <option value="loss">فقط ضررها</option>
              <option value="breakeven">فقط سربه‌سر</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main layout: Table & Sidebar Form/Calc */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Position Calculator & Performance Chart */}
        <div className="space-y-6 order-2 lg:order-1">
          {/* position calc */}
          <div className={`p-5 border rounded-2xl shadow-sm space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`text-sm font-bold flex items-center gap-1.5 font-display border-b pb-2 ${
              darkMode ? 'text-slate-100 border-slate-800' : 'text-slate-900 border-slate-100'
            }`}>
              <Calculator size={16} className="text-indigo-500" />
              محاسبه‌گر حجم پوزیشن (فارکس)
            </h3>
            
            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">دارایی حساب (USD)</label>
                <input 
                  type="number" 
                  value={calcBalance} 
                  onChange={(e) => setCalcBalance(e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-left ${
                    darkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                  }`} 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">ریسک (٪)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={calcRisk} 
                    onChange={(e) => setCalcRisk(e.target.value)}
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-left ${
                      darkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                    }`} 
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">حد ضرر (پیپ)</label>
                  <input 
                    type="number" 
                    value={calcSlPips} 
                    onChange={(e) => setCalcSlPips(e.target.value)}
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-left ${
                      darkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                    }`} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">جفت ارز مورد معامله</label>
                <select 
                  value={calcPair} 
                  onChange={(e) => setCalcPair(e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-left ${
                    darkMode ? 'bg-slate-950 border-slate-700 text-slate-150' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  {tradingPairs.map(p => (
                    <option key={p} value={p}>{p === 'XAUUSD' ? 'GOLD / طلا (XAUUSD)' : p}</option>
                  ))}
                </select>
              </div>

              <button 
                type="button"
                onClick={handleCalculatePosition}
                className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                محاسبه حجم به لات <RefreshCw size={13} />
              </button>

              {calcResult !== null && (
                <div className={`p-3 rounded-xl border text-center space-y-1 mt-2 ${
                  darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="text-[10px] text-slate-400 font-medium">اندازه پیشنهادی پوزیشن</div>
                  <div className="text-xl font-bold font-mono text-indigo-500">{calcResult} Lot</div>
                  <div className="text-[9px] text-slate-400 leading-tight">
                    ریسک مالی: {((Number(calcBalance) * Number(calcRisk)) / 100).toFixed(1)}$ | هر یک پیپ حرکت روی این حجم تقریباً {(calcResult * (calcPair.endsWith('JPY') ? 9.1 : 10)).toFixed(1)}$ تغییر خواهد داد.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* charts rendered here */}
          <div className={`p-5 border rounded-2xl shadow-sm ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {renderPerformanceChart()}
          </div>
        </div>

        {/* Right column: Trade table & Register forms */}
        <div className="lg:col-span-2 space-y-4 order-1 lg:order-2">
          
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold font-display ${
              darkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>تاریخچه و کارنامه معاملاتی</h3>
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className={`px-3 py-1.5 border rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer ${
                  darkMode ? 'border-slate-800 bg-slate-900 text-slate-350 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Download size={13} /> خروجی اکسل (CSV)
              </button>
              
              <button
                onClick={() => {
                  if (showAddForm) resetForm();
                  else setShowAddForm(true);
                }}
                className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all text-xs flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <Plus size={14} /> معامله جدید
              </button>
            </div>
          </div>

          {/* New/Edit Trade form view if active */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className={`p-5 border rounded-2xl shadow-inner space-y-4 transition-colors ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <h4 className="text-xs font-bold">
                {editingTradeId ? 'ویرایش اطلاعات معامله انتخابی' : 'ثبت معامله جدید'}
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">تاریخ معامله *</label>
                  <input 
                    type="date" 
                    required
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 ${
                      darkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-200'
                    }`} 
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">ساعت ورود *</label>
                  <input 
                    type="time" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)} 
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-505 ${
                      darkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-200'
                    }`} 
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">جفت ارز / کالا *</label>
                  <select 
                    value={pair} 
                    onChange={(e) => setPair(e.target.value)} 
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 font-mono ${
                      darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-200'
                    }`}
                  >
                    {tradingPairs.map(p => (
                      <option key={p} value={p}>{p === 'XAUUSD' ? 'GOLD / طلا (XAUUSD)' : p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">تایم فریم *</label>
                  <select 
                    value={timeframe} 
                    onChange={(e) => setTimeframe(e.target.value)} 
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 font-mono ${
                      darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-200'
                    }`}
                  >
                    {['M1', 'M3', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">نام یا شناسه استراتژی *</label>
                  <input 
                    type="text" 
                    placeholder="مانند: RTM Supply, ICT Orderblock"
                    required
                    value={strategy} 
                    onChange={(e) => setStrategy(e.target.value)} 
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-505 ${
                      darkMode ? 'bg-slate-950 border-slate-700 text-slate-105' : 'bg-white border-slate-200'
                    }`} 
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">قیمت ورود *</label>
                  <input 
                    type="number" 
                    step="any"
                    required
                    value={entryPrice} 
                    onChange={(e) => setEntryPrice(e.target.value)} 
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-505 font-mono text-left ${
                      darkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-200'
                    }`} 
                    placeholder="1.0850"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">قیمت حد ضرر (SL) *</label>
                  <input 
                    type="number" 
                    step="any"
                    required
                    value={stopLoss} 
                    onChange={(e) => setStopLoss(e.target.value)} 
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-550 font-mono text-left ${
                      darkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-200'
                    }`} 
                    placeholder="1.0830"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">قیمت هدف سود (TP)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={takeProfit} 
                    onChange={(e) => setTakeProfit(e.target.value)} 
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-left ${
                      darkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-200'
                    }`} 
                    placeholder="1.0890"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">برآیند خروج *</label>
                  <select 
                    value={result} 
                    onChange={(e) => setResult(e.target.value as any)} 
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 font-sans ${
                      darkMode ? 'bg-slate-955 border-slate-700 text-white' : 'bg-white border-slate-200'
                    }`}
                  >
                    <option value="profit">سود (Profit)</option>
                    <option value="loss">زیان (Loss)</option>
                    <option value="breakeven">سربه‌سر (Breakeven)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">مبلغ سود/زیان دلاری *</label>
                  <input 
                    type="number" 
                    required
                    value={gainLossAmount} 
                    onChange={(e) => setGainLossAmount(e.target.value)} 
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-505 font-mono text-left ${
                      darkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-200'
                    }`} 
                    placeholder="مثال: 55"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">تصویر معامله (پیوست)</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                    />
                    <div className={`w-full p-2 border rounded-lg text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      darkMode ? 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-100'
                    }`}>
                      <Upload size={14} /> بارگذاری تصویر
                    </div>
                  </div>
                </div>
              </div>

              {image && (
                <div className="mt-2 text-center relative max-w-sm mx-auto">
                  <img src={image} className={`max-h-32 object-contain rounded-lg border mx-auto ${
                    darkMode ? 'border-slate-760' : 'border-slate-200'
                  }`} alt="Preview" />
                  <button 
                    type="button" 
                    onClick={() => setImage(undefined)} 
                    className="absolute -top-2 -right-2 bg-slate-800 text-white p-1 rounded-full text-xs hover:bg-slate-700"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="text-xs">
                <label className="block text-slate-400 mb-1 font-medium">توضیحات زبانی / نکات روانشناسی یادگیری</label>
                <textarea 
                  rows={2}
                  placeholder="دلایل خروج زودهنگام، احساس طمع بر ران ترید یا پایبندی به پلن..."
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 font-sans ${
                    darkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-200'
                  }`} 
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className={`px-4 py-1.5 border rounded-lg transition-colors text-xs cursor-pointer ${
                    darkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  انصراف
                </button>
                <button 
                  type="submit"
                  className="px-5 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-xs cursor-pointer shadow-sm"
                >
                  {editingTradeId ? 'ذخیره تغییرات' : 'ثبت معامله'}
                </button>
              </div>
            </form>
          )}

          {/* Trade Grid Gallery list */}
          <div>
            {filteredTrades.length === 0 ? (
              <div className={`p-10 border rounded-2xl text-center text-slate-500 text-xs leading-relaxed ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                معامله‌ای منطبق با فیلتر فعال انتخاب شده وجود ندارد یا ثبت نشده است. می‌توانید با زدن کلید «معامله جدید»، معامله‌ای ثبت کنید.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredTrades.map(trade => {
                  const [tDate, tTime] = trade.dateTime.split('T');
                  return (
                    <div 
                      key={trade.id} 
                      className={`border rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between transition-all group duration-300 ${
                        darkMode 
                          ? 'bg-slate-900 border-slate-800/80 hover:border-indigo-500/35 hover:bg-slate-900/95' 
                          : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'
                      }`}
                    >
                      {/* Interactive Screenshot Box */}
                      <div className="relative h-44 overflow-hidden bg-slate-950 flex items-center justify-center border-b border-slate-100/10">
                        {trade.image ? (
                          <>
                            <img 
                              src={trade.image} 
                              alt={`${trade.pair} Chart`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04] cursor-pointer"
                              title="کلیک جهت نمایش سایز بزرگ تصویر"
                              onClick={() => setActiveLightboxImage(trade.image || null)}
                            />
                            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <span className="bg-slate-950/80 text-white text-[10px] px-2.5 py-1 rounded bg-blur font-bold font-sans">🔎 مشاهده جزئیات چارت</span>
                            </div>
                          </>
                        ) : (
                          <div className={`w-full h-full flex flex-col items-center justify-center p-4 select-none ${
                            darkMode ? 'bg-gradient-to-br from-slate-950 to-slate-900' : 'bg-gradient-to-br from-slate-100 to-indigo-50/20'
                          }`}>
                            <TrendingUp size={30} className={`${darkMode ? 'text-slate-800' : 'text-indigo-200'} mb-1.5`} />
                            <span className={`text-[10px] font-bold ${darkMode ? 'text-slate-600' : 'text-indigo-300/80'}`}>تصویر چارت ثبت نشده</span>
                            <span className={`text-[11px] font-mono font-black mt-1 uppercase ${darkMode ? 'text-slate-500/60' : 'text-indigo-400/60'}`}>{trade.pair} | {trade.timeframe}</span>
                          </div>
                        )}
                        
                        {/* Floating Outcome Badge */}
                        <div className="absolute top-2.5 right-2.5">
                          {trade.result === 'profit' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500 text-white font-bold text-[10px] shadow-lg leading-none">
                              <CheckCircle size={10} /> سودده ({trade.gainLossAmount >= 0 ? '+' : ''}{trade.gainLossAmount}$)
                            </span>
                          )}
                          {trade.result === 'loss' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500 text-white font-bold text-[10px] shadow-lg leading-none">
                              <XCircle size={10} /> ضررده ({trade.gainLossAmount}$)
                            </span>
                          )}
                          {trade.result === 'breakeven' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-600 text-white font-bold text-[10px] rounded-full shadow-lg leading-none">
                              <MinusCircle size={10} /> بی‌ضرر
                            </span>
                          )}
                        </div>

                        {/* Timing Floating Header */}
                        <div className="absolute bottom-2.5 right-2.5 bg-slate-950/70 backdrop-blur-md px-2 py-0.5 rounded text-[8.5px] font-mono text-slate-300 pointer-events-none">
                          {tDate} • {tTime || '00:00'}
                        </div>
                      </div>

                      {/* Info & Parameters Grid */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-2.5">
                          {/* Title and Strategy */}
                          <div className="flex justify-between items-center border-b pb-1.5 border-slate-100/10">
                            <div>
                              <h4 className={`text-xs font-black font-mono tracking-wide ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                                {trade.pair} <span className="text-[10px] font-medium text-slate-505">({trade.timeframe})</span>
                              </h4>
                            </div>
                            <span className={`text-[9.5px] font-sans font-bold px-2 py-0.5 rounded ${
                              darkMode ? 'bg-slate-950 text-indigo-400 border border-slate-800' : 'bg-indigo-50/50 text-indigo-750'
                            }`}>
                              {trade.strategy || 'استراتژی ثبت نشده'}
                            </span>
                          </div>

                          {/* Trading parameters metric panels */}
                          <div className="grid grid-cols-2 gap-1.5 text-[9.5px] font-mono text-right" dir="ltr">
                            <div className={`p-2 rounded-xl border flex flex-col justify-between opacity-90 ${darkMode ? 'bg-slate-955 border-slate-850' : 'bg-slate-50/60 border-slate-100'}`}>
                              <span className="text-[8px] text-slate-500 font-sans leading-none mb-1">Entry Price</span>
                              <span className={`font-extrabold text-[11px] leading-tight ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{trade.entryPrice}</span>
                            </div>
                            <div className={`p-2 rounded-xl border flex flex-col justify-between opacity-90 ${darkMode ? 'bg-slate-955 border-slate-850' : 'bg-slate-50/60 border-slate-100'}`}>
                              <span className="text-[8px] text-slate-500 font-sans leading-none mb-1">Gain / Loss</span>
                              <span className={`font-black text-[12px] leading-tight ${trade.gainLossAmount >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {trade.gainLossAmount >= 0 ? '+' : ''}{trade.gainLossAmount}$
                              </span>
                            </div>
                            <div className={`p-2 rounded-xl border flex flex-col justify-between opacity-95 ${darkMode ? 'bg-slate-955 border-slate-850' : 'bg-slate-50/60 border-slate-100'}`}>
                              <span className="text-[8px] text-slate-500 font-sans leading-none mb-1">Stop Loss (SL)</span>
                              <span className="font-extrabold text-[11px] text-rose-500 leading-tight">{trade.stopLoss}</span>
                            </div>
                            <div className={`p-2 rounded-xl border flex flex-col justify-between opacity-95 ${darkMode ? 'bg-slate-955 border-slate-850' : 'bg-slate-50/60 border-slate-100'}`}>
                              <span className="text-[8px] text-slate-500 font-sans leading-none mb-1">Take Profit (TP)</span>
                              <span className="font-extrabold text-[11px] text-emerald-500 leading-tight">{trade.takeProfit || '-'}</span>
                            </div>
                          </div>

                          {/* Notes/Lesson Description */}
                          {trade.notes && (
                            <div className={`p-2 rounded-xl max-h-[80px] overflow-y-auto leading-relaxed border ${
                              darkMode ? 'bg-slate-950/40 border-slate-850 text-slate-300' : 'bg-amber-50/15 border-amber-100/20 text-slate-650'
                            }`}>
                              <div className="font-bold text-[8.5px] text-slate-400 mb-0.5 flex items-center gap-1 font-sans">
                                🧠 یادداشت و جزئیات تکنیکال روانشناسی:
                              </div>
                              <p className="font-sans text-[10px] whitespace-pre-wrap">{trade.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Interactive operations links */}
                        <div className="flex gap-2 pt-2 border-t border-slate-100/5 items-center justify-end">
                          <button 
                            onClick={() => handleEdit(trade)}
                            className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              darkMode 
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-indigo-400' 
                                : 'bg-slate-100 text-slate-600 hover:bg-indigo-50/60 hover:text-indigo-650'
                            }`}
                          >
                            <Edit3 size={11} /> ویرایش
                          </button>
                          {deleteConfirmId === trade.id ? (
                            <div className="flex items-center gap-1.5 animate-pulse" dir="rtl">
                              <span className="text-[9px] text-rose-500 font-bold ml-1">حذف شود؟</span>
                              <button 
                                onClick={() => {
                                  onDeleteTrade(trade.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[8.5px] font-bold transition-all cursor-pointer"
                              >
                                بله
                              </button>
                              <button 
                                onClick={() => setDeleteConfirmId(null)}
                                className={`px-2 py-1 rounded text-[8.5px] font-bold transition-all cursor-pointer ${
                                  darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-705' : 'bg-slate-200 text-slate-700 hover:bg-slate-250'
                                }`}
                              >
                                لغو
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setDeleteConfirmId(trade.id)}
                              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                darkMode 
                                  ? 'bg-slate-850 text-slate-500 hover:bg-rose-950/30 hover:text-rose-450' 
                                  : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                              }`}
                            >
                              <Trash2 size={11} /> حذف
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Pop-up Interactive Lightbox for full chart analysis */}
      {activeLightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 flex flex-col items-center justify-center p-4 backdrop-blur-md transition-all animate-in fade-in duration-300"
          onClick={() => setActiveLightboxImage(null)}
        >
          <button 
            type="button"
            className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-full transition-colors font-sans text-xs font-bold shadow-2xl z-50 cursor-pointer"
            onClick={() => setActiveLightboxImage(null)}
          >
            ✕ بستن پیوست چارت
          </button>
          
          <div className="relative max-w-5xl max-h-[85vh] overflow-hidden flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={activeLightboxImage} 
              alt="Trading Chart Screen" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl border border-slate-800 shadow-2xl"
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-3 font-semibold text-center leading-none select-none">کلیک بیرون از کادر تصویر جهت خروج سریع</div>
        </div>
      )}
    </div>
  );
}
