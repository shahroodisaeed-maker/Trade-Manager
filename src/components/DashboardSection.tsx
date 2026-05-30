import React, { useState } from 'react';
import { 
  Sparkles, Award, BookOpen, DollarSign, StickyNote, Gamepad2, 
  TrendingUp, TrendingDown, CheckCircle2, Circle, AlertCircle, 
  ChevronLeft, Plus, Zap, User, Clock, Wallet, ShieldAlert, BadgeInfo
} from 'lucide-react';
import { DayTask, Habit, TradeLog, ExpenseIncomeItem, AssetRecord, LoanItem, DebtClaimItem, StickyIdea, GameItem, SerialMovieItem } from '../types';

interface DashboardSectionProps {
  trades: TradeLog[];
  transactions: ExpenseIncomeItem[];
  assets: AssetRecord[];
  loans: LoanItem[];
  debtClaims: DebtClaimItem[];
  habits: Habit[];
  tasks: DayTask[];
  reminders: any[];
  ideas: StickyIdea[];
  games: GameItem[];
  serials: SerialMovieItem[];
  darkMode: boolean;
  onNavigate: (tab: 'journal' | 'focus' | 'financial' | 'habits' | 'ideas' | 'games' | 'settings') => void;
  onAddTask: (title: string, day: 'today' | 'tomorrow', time?: string, deadlineTime?: string, alarmType?: 'none' | 'notification' | 'normal' | 'math') => void;
  onAddIdea: (title: string, description: string, estimatedHours: number) => void;
}

export default function DashboardSection({
  trades,
  transactions,
  assets,
  loans,
  debtClaims,
  habits,
  tasks,
  reminders,
  ideas,
  games,
  serials,
  darkMode,
  onNavigate,
  onAddTask,
  onAddIdea
}: DashboardSectionProps) {
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickIdeaTitle, setQuickIdeaTitle] = useState('');
  const [quickIdeaDesc, setQuickIdeaDesc] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const now = new Date();
  const todayISO = now.toISOString().slice(0, 10);

  // 1. Trading Calculations
  const winTrades = trades.filter(t => t.result === 'profit');
  const loseTrades = trades.filter(t => t.result === 'loss');
  const breakevenTrades = trades.filter(t => t.result === 'breakeven');
  const totalTradesCount = trades.length;
  const winRate = totalTradesCount > 0 ? Math.round((winTrades.length / (totalTradesCount - breakevenTrades.length || totalTradesCount)) * 100) : 0;
  const totalGainLoss = trades.reduce((sum, t) => sum + t.gainLossAmount, 0);

  // 2. Financial Net Worth Calculations
  const totalAssetsValue = assets.reduce((sum, a) => sum + a.value, 0);
  const totalClaimsValue = debtClaims.filter(c => c.type === 'claim').reduce((sum, c) => sum + c.amount, 0);
  const totalDebtsValue = debtClaims.filter(d => d.type === 'debt').reduce((sum, d) => sum + d.amount, 0);
  const totalRemainingLoansValue = loans.reduce((sum, l) => {
    const remainingInstallments = l.installmentsCount - l.installmentsPaid;
    return sum + (l.monthlyPaymentAmount * Math.max(0, remainingInstallments));
  }, 0);
  const netWorth = (totalAssetsValue + totalClaimsValue) - (totalDebtsValue + totalRemainingLoansValue);

  // 3. Today's Habits and Tasks Progress
  const todayTasks = tasks.filter(t => t.day === 'today');
  const todayTasksCompleted = todayTasks.filter(t => t.completed).length;
  const todayTasksPercent = todayTasks.length > 0 ? Math.round((todayTasksCompleted / todayTasks.length) * 100) : 0;

  const completedHabitsTodayCount = habits.filter(h => !!h.history[todayISO]).length;
  const habitsPercent = habits.length > 0 ? Math.round((completedHabitsTodayCount / habits.length) * 100) : 0;

  // Active / Running timers
  const runningIdeas = ideas.filter(i => i.status === 'running' || i.isRunning);

  // 4. Quick Actions
  const handleQuickAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    onAddTask(quickTaskTitle.trim(), 'today', undefined, undefined, 'none');
    setQuickTaskTitle('');
    triggerStatusMessage('✓ تسک ضرب‌العجلی برای «امروز» با موفقیت افزوده گردید!');
  };

  const handleQuickAddIdeaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickIdeaTitle.trim()) return;
    onAddIdea(quickIdeaTitle.trim(), quickIdeaDesc.trim() || 'ثبت فوری از داشبورد پرواز', 4);
    setQuickIdeaTitle('');
    setQuickIdeaDesc('');
    triggerStatusMessage('✓ ایده نوین با نامزدی اولیه ۴ ساعت به صندوقچه متصل شد!');
  };

  const triggerStatusMessage = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  // Inspirational quotes index based on current week day
  const dayOfWeek = now.getDay();
  const quotes = [
    { text: "تریدری یک دوی ماراتن به سمت انضباط است، نه یک دو سرعت به سمت شانس.", author: "مارک داگلاس" },
    { text: "سودهای بزرگ ناشی از نشستن روی پوزیشن‌های درست است، نه تریدهای مکرر غیرضروری.", author: "جسی لیورمور" },
    { text: "ریسک بر روی چیزی که ندارید برای به دست آوردن نالازم‌ها، بزرگترین حماقت مالی است.", author: "وارن بافت" },
    { text: "کنترل احساسات، استراتژی واقعی شماست. بازار آینه تعهد شما به صبوری و تمرکز حواس است.", author: "زنیت فایننشال" },
    { text: "برای بیدار شدن به موقع و زدن به اهداف، به یک سیستم آلارم بی‌رحم و حساب‌شده نیاز داری.", author: "هابیت مانیتور" },
    { text: "یک طرح خوب امروز، از یک طرح عالی فردا بسیار ارزشمندتر است. به اهداف امروز وفادار بمان.", author: "جورج پاتون" },
    { text: "دارایی خالص تو با مجموع کارهای منظم کوچکت در هر روز ساخته می‌شود. به تراز رشد ایمان بدار.", author: "بینش اقتصادی زنیت" }
  ];
  const activeQuote = quotes[dayOfWeek % quotes.length];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* 1. Header Hero Card */}
      <div className={`p-6 rounded-3xl relative overflow-hidden border transition-all ${
        darkMode 
          ? 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-indigo-950/20 border-slate-800' 
          : 'bg-gradient-to-br from-indigo-600/5 via-white to-indigo-50/20 border-indigo-150'
      }`}>
        {/* Glow vector back */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                مرکز مانیتورینگ پیشرفته
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[9px] text-slate-400 font-mono">2026-05-30 UTC</span>
            </div>
            
            <h2 className="text-base sm:text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">
              درود؛ به اتاق فرمان ارشد <span className="text-indigo-500 dark:text-indigo-400">Zenith Workspace</span> خوش آمدید
            </h2>
            
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              تمام ماژول‌های حیاتی کاری شما — از ترید و برنامه‌ریزی اقتصادی تا دفترچه عادات خواب‌شکن و ایده پرداز — از این زوایه به طور کامل قابل نظارت, بهینه‌سازی و ارزیابی عمیق هستند.
            </p>
          </div>

          <div className={`p-4 rounded-2xl md:max-w-xs border space-y-1.5 shrink-0 select-none ${
            darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100/50 border-slate-200'
          }`}>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-500">
              <Sparkles size={11} /> <span>اندیشه طلایی معامله‌گری امروز:</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-350 italic">
              « {activeQuote.text} »
            </p>
            <div className="text-left text-[8px] font-bold text-slate-400">— {activeQuote.author}</div>
          </div>
        </div>
      </div>

      {/* Action triggers toast */}
      {statusMessage && (
        <div className="p-3 rounded-2xl text-[10px] sm:text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center animate-bounce">
          {statusMessage}
        </div>
      )}

      {/* 2. Micro Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* CARD 1: Trading Win-rate & Volume */}
        <div 
          onClick={() => onNavigate('journal')}
          className={`p-4 rounded-2xl border cursor-pointer hover:border-indigo-500/30 hover:scale-[1.01] transition-all flex flex-col justify-between space-y-3 ${
            darkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-zinc-150'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BookOpen className="text-indigo-500" size={16} />
              <span className="text-[10px] font-extrabold text-slate-705 dark:text-slate-300">ژورنال معامله‌گری</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-bold">تریدینگ</span>
          </div>

          <div className="space-y-1">
            <div className="text-xl font-black font-mono tracking-tight" dir="ltr">
              {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString()}
            </div>
            <p className="text-[9px] text-slate-400">سود و زیان حاصل از {totalTradesCount} معامله</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px]">
              <span className="text-slate-400">نرخ برد سودده (Win Rate):</span>
              <span className="font-extrabold text-indigo-500 font-mono">{winRate}٪</span>
            </div>
            <div className="w-full bg-slate-200/40 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${winRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* CARD 2: Net Worth Panel (Calculates all assets, claims, debts, loans) */}
        <div 
          onClick={() => onNavigate('financial')}
          className={`p-4 rounded-2xl border cursor-pointer hover:border-emerald-500/30 hover:scale-[1.01] transition-all flex flex-col justify-between space-y-3 ${
            darkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-zinc-150'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <DollarSign className="text-emerald-500" size={16} />
              <span className="text-[10px] font-extrabold text-slate-705 dark:text-slate-300">خالص دارایی (Net Worth)</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-bold">جایگاه مالی</span>
          </div>

          <div className="space-y-1">
            <div className={`text-xl font-black font-mono tracking-tight ${netWorth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} dir="ltr">
              {netWorth >= 0 ? '+' : ''}{netWorth.toLocaleString()} ت
            </div>
            <p className="text-[9px] text-slate-400">تراز کلی دارایی پس از پرداخت وام و بدهی‌ها</p>
          </div>

          <div className="flex justify-between text-[9px] border-t border-slate-100 dark:border-slate-800/60 pt-2">
            <div className="text-slate-400">
              کل دارایی: <strong className="font-mono text-slate-650 dark:text-slate-200">{totalAssetsValue.toLocaleString()} ت</strong>
            </div>
            <div className="text-slate-400">
              بدهی وام: <strong className="font-mono text-rose-500">{totalRemainingLoansValue.toLocaleString()} ت</strong>
            </div>
          </div>
        </div>

        {/* CARD 3: Habits completion tracker today */}
        <div 
          onClick={() => onNavigate('habits')}
          className={`p-4 rounded-2xl border cursor-pointer hover:border-amber-500/30 hover:scale-[1.01] transition-all flex flex-col justify-between space-y-3 ${
            darkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-zinc-150'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Award className="text-amber-500" size={16} />
              <span className="text-[10px] font-extrabold text-slate-705 dark:text-slate-300">عادت‌های روزانه</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-bold">انضباط زنجیره</span>
          </div>

          <div className="space-y-1">
            <div className="text-xl font-black font-mono tracking-tight text-amber-500" dir="ltr">
              {completedHabitsTodayCount} از {habits.length}
            </div>
            <p className="text-[9px] text-slate-400">تعهد و استمرار عادت زنجیره‌وار امروز</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px]">
              <span className="text-slate-400">تکمیل عادات امروز:</span>
              <span className="font-extrabold text-amber-500 font-mono">{habitsPercent}٪</span>
            </div>
            <div className="w-full bg-slate-200/40 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${habitsPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* CARD 4: Everyday Task Progress today */}
        <div 
          onClick={() => onNavigate('habits')}
          className={`p-4 rounded-2xl border cursor-pointer hover:border-cyan-500/30 hover:scale-[1.01] transition-all flex flex-col justify-between space-y-3 ${
            darkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-zinc-150'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="text-cyan-500" size={16} />
              <span className="text-[10px] font-extrabold text-slate-755 dark:text-slate-300">وظایف کاری امروز</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-500 font-bold">بیدارباش فعال</span>
          </div>

          <div className="space-y-1">
            <div className="text-xl font-black font-mono tracking-tight text-cyan-500" dir="ltr">
              {todayTasksCompleted} از {todayTasks.length}
            </div>
            <p className="text-[9px] text-slate-400">وظایف برنامه‌ریزی شده و رویدادهای روز</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px]">
              <span className="text-slate-400">راندمان تسک‌ها:</span>
              <span className="font-extrabold text-cyan-500 font-mono">{todayTasksPercent}٪</span>
            </div>
            <div className="w-full bg-slate-200/40 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 rounded-full"
                style={{ width: `${todayTasksPercent}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COMPACT SECTION: Quick interactive Add panels (5 cols) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          {/* Quick task trigger card */}
          <div className={`p-5 rounded-3xl border flex-1 space-y-4 shadow-sm flex flex-col justify-between ${
            darkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-zinc-150'
          }`}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 border-b pb-2 border-slate-250/10 dark:border-slate-800/40">
                <Zap className="text-cyan-400 scale-95" size={16} />
                <h3 className="text-xs font-black">ثبت آنی تسک بیدارباش کاری امروز</h3>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                تسک جدید فوری خود را برای امروز بنویسید؛ بلافاصله در «دفتر عادت و تسک» قرار خواهد گرفت و نیازی به ترک داشبورد ندارید.
              </p>
            </div>

            <form onSubmit={handleQuickAddTaskSubmit} className="space-y-3 mt-2">
              <input
                type="text"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                placeholder="مثال: بررسی پوزیشن‌های پوند قبل از خبر ساعت ۱۷:۰۰ ..."
                className={`w-full p-2.5 rounded-xl text-xs text-right outline-none font-sans font-medium border ${
                  darkMode 
                    ? 'bg-slate-950 border-slate-800 focus:border-cyan-500' 
                    : 'bg-slate-50 border-zinc-200 focus:border-indigo-500'
                }`}
              />
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-indigo-650 hover:opacity-90 text-white font-black text-[10px] rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
              >
                <Plus size={13} /> فیکس کردن تسک جدید برای امروز
              </button>
            </form>
          </div>

          {/* Quick Idea sandbox trigger card */}
          <div className={`p-5 rounded-3xl border flex-1 space-y-4 shadow-sm flex flex-col justify-between mt-6 ${
            darkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-zinc-150'
          }`}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 border-b pb-2 border-slate-250/10 dark:border-slate-800/40">
                <StickyNote className="text-amber-400 scale-95" size={16} />
                <h3 className="text-xs font-black">گره‌زدن فوری ایده خام به صندوقچه ایده‌ها</h3>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                کارهای آینده‌نگرانه، پروژه‌ها و افکاری که به ذهنتان می‌رسد را فوراً نت بردارید تا با تخصیص زمان‌سنج دقیق، متعهد به پیاده‌سازی آن شوید.
              </p>
            </div>

            <form onSubmit={handleQuickAddIdeaSubmit} className="space-y-3 mt-2">
              <input
                type="text"
                value={quickIdeaTitle}
                onChange={(e) => setQuickIdeaTitle(e.target.value)}
                placeholder="عنوان ایده (مثال: تهیه فرمول اکسل مدیریت سرمایه برای پورتفولیو طلا)"
                className={`w-full p-2.5 rounded-xl text-xs text-right outline-none font-sans font-medium border ${
                  darkMode 
                    ? 'bg-slate-950 border-slate-800 focus:border-amber-500' 
                    : 'bg-slate-50 border-zinc-200 focus:border-indigo-500'
                }`}
              />
              <textarea
                value={quickIdeaDesc}
                onChange={(e) => setQuickIdeaDesc(e.target.value)}
                placeholder="توضیحات کوتاه یا گام اول پیاده‌سازی..."
                className={`w-full p-2 h-12 rounded-xl text-[10px] text-right outline-none font-sans border resize-none ${
                  darkMode 
                    ? 'bg-slate-950 border-slate-800 focus:border-amber-500' 
                    : 'bg-slate-50 border-zinc-200 focus:border-indigo-500'
                }`}
              />
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90 text-white font-black text-[10px] rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
              >
                <Plus size={13} /> ثبت در لایه ایده خام صندوقچه
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT TIMELINE/AGENDA SECTION: High Density Schedule Watch (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className={`p-5 rounded-3xl border space-y-4 shadow-sm h-full flex flex-col justify-between ${
            darkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-zinc-150'
          }`}>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between border-b pb-2 border-slate-250/10 dark:border-slate-800/40">
                <div className="flex items-center gap-2">
                  <Clock className="text-indigo-400" size={17} />
                  <h3 className="text-xs font-black">زمان‌سنج زنده و دستور کار امروز</h3>
                </div>
                <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md">رویدادها</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                تفکیک لیست کارهای موعد دار امروز، سر رسید اقساط بیداری و آلارم‌های تنظیم‌شده که ثبات انضباط شخصی شما را بررسی می‌کنند:
              </p>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto max-h-72 mt-3 pr-1">
              
              {/* 1. Alarms scheduled today */}
              {todayTasks.length === 0 ? (
                <div className="p-4 rounded-2xl text-center text-[10px] text-slate-500 bg-slate-100/30 dark:bg-slate-950/20">
                  هیچ تسک یا آلارم بیدارباشی برای امروز ثبت نشده است. مایلید یکی بسازید؟
                </div>
              ) : (
                todayTasks.map(t => (
                  <div 
                    key={t.id} 
                    className={`p-3 rounded-2xl flex items-center justify-between border text-[11px] font-sans transition-all ${
                      t.completed 
                        ? 'opacity-60 bg-slate-100/20 dark:bg-slate-950/20 border-slate-200/50 dark:border-slate-900' 
                        : (t.missed ? 'border-rose-500/30 bg-rose-500/5' : 'border-indigo-500/10 bg-indigo-500/5')
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${t.completed ? 'bg-emerald-500' : (t.missed ? 'bg-rose-500' : 'bg-indigo-500')}`} />
                      <span className="font-bold truncate max-w-[240px]">{t.title}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {t.time && (
                        <span className="px-2 py-0.5 rounded-lg font-mono text-[9px] font-bold bg-slate-950 text-indigo-300">
                          {t.time}
                        </span>
                      )}
                      
                      {t.alarmType && t.alarmType !== 'none' && (
                        <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 font-black">
                          {t.alarmType === 'math' ? 'آلارم ریاضی ضرب' : 'زنگ معمولی'}
                        </span>
                      )}

                      <span className={`text-[9px] font-bold ${t.completed ? 'text-emerald-500' : (t.missed ? 'text-rose-500' : 'text-indigo-400')}`}>
                        {t.completed ? 'کامل شده' : (t.missed ? 'منقضی شده' : 'در جریان')}
                      </span>
                    </div>
                  </div>
                ))
              )}

              {/* 2. Outstanding Active Timers or Ideas */}
              {runningIdeas.length > 0 && (
                <div className="mt-3.5 space-y-2">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ایده‌های دارای زمان‌سنج فعال در کارگاه:</div>
                  {runningIdeas.map(i => (
                    <div 
                      key={i.id} 
                      className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="font-bold">{i.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-amber-500 font-bold font-mono">
                          حجم تقطیر زمان: {(i.elapsedSeconds / 3600).toFixed(2)} / {i.estimatedHours} ساعت
                        </span>
                        <span className="text-[9px] px-2 py-0.5 bg-slate-950 text-amber-400 font-black rounded-lg">در حال تیک‌تاک</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. Upcoming Installments / Reminders list */}
              {loans.length > 0 && (
                <div className="mt-3.5 space-y-2">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">یادآور زمان وام‌ها و اقساط پیش‌رو:</div>
                  {loans.slice(0, 2).map(l => {
                    const remainingInstallments = l.installmentsCount - l.installmentsPaid;
                    return (
                      <div 
                        key={l.id} 
                        className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <Wallet className="text-emerald-500" size={13} />
                          <span className="font-semibold text-slate-600 dark:text-slate-350">{l.title}</span>
                        </div>
                        <div className="flex items-center gap-2 font-sans text-xs">
                          <span className="text-rose-400 font-bold font-mono text-[10px]">{l.monthlyPaymentAmount.toLocaleString()} ت</span>
                          <span className="text-[9px] text-slate-400">روز {l.monthlyPaymentDay} هر ماه (اقساط مانده: {remainingInstallments})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Quick action navigators foot */}
            <div className="flex items-center justify-between border-t border-slate-200/10 pt-4 text-[10px] mt-2">
              <span className="text-slate-450">نیاز دارید به ماژول ویژه‌ای مراجعه کنید؟</span>
              <button 
                onClick={() => onNavigate('settings')}
                className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-0.5 hover:underline"
              >
                کابین بکاپ و تنظیمات اندروید <ChevronLeft size={10} />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
