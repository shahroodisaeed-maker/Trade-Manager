import React, { useState } from 'react';
import { 
  Sparkles, Award, BookOpen, DollarSign, StickyNote, 
  TrendingUp, TrendingDown, CheckCircle2, Circle, AlertCircle, 
  ChevronLeft, Plus, Zap, Clock, Wallet,
  Check, Heart, ArrowUpRight, CheckSquare, Calendar, CalendarDays
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
  onToggleHabit?: (id: string, date: string) => void;
  onToggleTask?: (id: string) => void;
}

export default function DashboardSection({
  trades,
  transactions,
  assets,
  loans,
  debtClaims,
  habits,
  tasks,
  ideas,
  darkMode,
  onNavigate,
  onAddTask,
  onToggleHabit,
  onToggleTask
}: DashboardSectionProps) {
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const now = new Date();
  const todayISO = now.toISOString().slice(0, 10);

  // 1. Trading Calculations (Minimal)
  const totalTradesCount = trades.length;
  const winTrades = trades.filter(t => t.result === 'profit');
  const breakevenTrades = trades.filter(t => t.result === 'breakeven');
  const winRate = totalTradesCount > 0 ? Math.round((winTrades.length / (totalTradesCount - breakevenTrades.length || totalTradesCount)) * 105) : 0;
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

  // 3. Today's Tasks & Habits combined state
  const todayTasks = tasks.filter(t => t.day === 'today' && !t.archived);
  const completedTasksCount = todayTasks.filter(t => t.completed).length;

  const completedHabitsTodayCount = habits.filter(h => !!h.history[todayISO]).length;
  
  const totalItemsCount = todayTasks.length + habits.length;
  const totalCompletedCount = completedTasksCount + completedHabitsTodayCount;
  const overallDayProgressPercent = totalItemsCount > 0 ? Math.round((totalCompletedCount / totalItemsCount) * 100) : 0;

  // Active / Running idea timers
  const runningIdeas = ideas.filter(i => i.status === 'running' || i.isRunning);

  // Quick Action Form Submission
  const handleQuickAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    onAddTask(quickTaskTitle.trim(), 'today', undefined, undefined, 'none');
    setQuickTaskTitle('');
    triggerStatusMessage('✓ تسک جدید با موفقیت به لیست دستور کار امروز متصل شد!');
  };

  const triggerStatusMessage = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
  };

  // Quotes based on weekday
  const dayOfWeek = now.getDay();
  const quotes = [
    { text: "انضباط، تفاوت بیهودگی و موفقیت معنادار است.", author: "استاد ذن" },
    { text: "هر معامله سودمند حاصل صبوری و تماشای هوشمندانه است.", author: "معامله‌گر کهنه‌کار" },
    { text: "دارایی بزرگ شما تمرکز امروز شماست.", author: "بینش زنیت" },
    { text: "ریسک‌‌ها را بشناسید، نظم شخصی سپر معامله‌گران باهوش است.", author: "کابین سرمایه" }
  ];
  const activeQuote = quotes[dayOfWeek % quotes.length];

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      
      {/* 1. Minimal Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-150/15">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-150 tracking-tight flex items-center gap-2">
            <span>درود؛ به اتاق کار زنیت خوش آمدید</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          </h2>
        </div>

        {/* Quote of the Day - minimal pill */}
        <div className={`p-2.5 px-4 rounded-2xl border text-[10px] leading-relaxed max-w-xs transition-colors shrink-0 ${
          darkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-zinc-50 border-zinc-150 text-slate-600'
        }`}>
          <span className="italic">« {activeQuote.text} »</span>
          <span className="block text-left text-[8px] opacity-60 mt-0.5 font-bold">— {activeQuote.author}</span>
        </div>
      </div>

      {/* Trigger Notification Toast */}
      {statusMessage && (
        <div className="p-3 rounded-xl text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-center animate-fade-in">
          {statusMessage}
        </div>
      )}

      {/* Main Core Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* RIGHT COLUMN: Today's Interactive Checklist & Quick Add (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between ${
            darkMode ? 'bg-slate-900/40 border-slate-850/80' : 'bg-white border-zinc-150 shadow-sm'
          }`}>
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-150/10 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-indigo-505" size={18} />
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-150">لیست کارها و عادات امروزم</h3>
              </div>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-500 font-black px-2.5 py-1 rounded-xl">
                {totalCompletedCount} از {totalItemsCount} کلید حل شد
              </span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              
              {/* Combine Today's Tasks */}
              {todayTasks.length === 0 && habits.length === 0 ? (
                <div className="p-8 rounded-2xl text-center text-xs text-slate-400 bg-slate-100/30 dark:bg-slate-950/20">
                  هیچ کار یا عادتی برای امروز تنظیم نشده است. از منبع بالا کارهای جدید اضافه کنید!
                </div>
              ) : (
                <>
                  {/* Habits list rendered */}
                  {habits.map(h => {
                    const isCompleted = !!h.history[todayISO];
                    return (
                      <div 
                        key={`habit-${h.id}`}
                        onClick={() => onToggleHabit && onToggleHabit(h.id, todayISO)}
                        className={`p-3 rounded-2xl flex items-center justify-between border text-xs font-sans transition-all duration-300 cursor-pointer select-none group ${
                          isCompleted
                            ? 'opacity-60 bg-slate-100/10 dark:bg-slate-950/10 border-slate-200/50 dark:border-slate-900 line-through text-slate-400' 
                            : 'border-amber-500/10 bg-amber-500/[0.02] hover:bg-amber-500/[0.05] border-zinc-150/80 hover:border-amber-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors border ${
                            isCompleted 
                              ? 'bg-amber-500 border-amber-600 text-white' 
                              : 'bg-white dark:bg-slate-950 border-zinc-300 dark:border-slate-800 text-transparent group-hover:border-amber-500'
                          }`}>
                            <Check size={11} strokeWidth={3} />
                          </div>
                          <div>
                            <span className="font-bold truncate max-w-[210px] block">{h.title}</span>
                            <span className="text-[9px] text-amber-500 dark:text-amber-400/80 font-medium font-sans">عادت روزانه مستمر</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {h.time && (
                            <span className="px-2 py-0.5 rounded-lg font-mono text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Clock size={10} />
                              {h.time}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold ${isCompleted ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {isCompleted ? 'انجام شد' : 'مستمر روزانه'}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Non-archived Tasks list rendered */}
                  {todayTasks.map(t => (
                    <div 
                      key={`task-${t.id}`}
                      onClick={() => onToggleTask && onToggleTask(t.id)}
                      className={`p-3 rounded-2xl flex items-center justify-between border text-xs font-sans transition-all duration-300 cursor-pointer select-none group ${
                        t.completed
                          ? 'opacity-60 bg-slate-100/10 dark:bg-slate-950/10 border-slate-200/50 dark:border-slate-900 line-through text-slate-400' 
                          : 'border-indigo-500/10 bg-indigo-500/[0.02] hover:bg-indigo-500/[0.05] border-zinc-150/80 hover:border-indigo-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors border ${
                          t.completed 
                            ? 'bg-indigo-500 border-indigo-600 text-white' 
                            : 'bg-white dark:bg-slate-950 border-zinc-300 dark:border-slate-800 text-transparent group-hover:border-indigo-500'
                        }`}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <div>
                          <span className="font-bold truncate max-w-[210px] block">{t.title}</span>
                          <span className="text-[9px] text-indigo-500 dark:text-indigo-400/80 font-medium font-sans">تسک امروز</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {t.time && (
                          <span className="px-2 py-0.5 rounded-lg font-mono text-[9px] font-bold bg-indigo-500/10 text-indigo-650 dark:text-indigo-300 flex items-center gap-1">
                            <Clock size={10} />
                            {t.time}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold ${t.completed ? 'text-emerald-500' : 'text-indigo-500'}`}>
                          {t.completed ? 'کامل شده' : 'در انتظار'}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}

            </div>
          </div>
        </div>

        {/* LEFT COLUMN: Critical Minimal Highlights & Timers (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* NET WORTH & FINANCIAL POSITION */}
          <div 
            onClick={() => onNavigate('financial')}
            className={`p-5 rounded-3xl border cursor-pointer hover:border-emerald-500/20 hover:scale-[1.01] transition-all relative overflow-hidden flex flex-col justify-between ${
              darkMode ? 'bg-slate-900/40 border-slate-850/80' : 'bg-white border-zinc-150 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">تراز کل مالی</span>
              <span className="text-[9px] px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-bold">ارزیابی مالی</span>
            </div>

            <div className="space-y-1 my-2">
              <span className="text-xs text-slate-450 dark:text-slate-400 block">مرور خالص دارایی (Net Worth):</span>
              <div className={`text-2xl font-black font-mono tracking-tight leading-none ${netWorth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} dir="ltr">
                {netWorth >= 0 ? '+' : ''}{netWorth.toLocaleString()} ت
              </div>
              <p className="text-[9px] text-slate-400 mt-1">پس از کسر بدهی‌های معوقه و اقساط وام‌های بانکی</p>
            </div>

            <div className="border-t border-slate-150/10 pt-3 mt-1 flex justify-between text-[10px]">
              <div>
                <span className="text-slate-400 block pb-0.5">کل دارایی فیزیکی:</span>
                <strong className="font-mono text-slate-700 dark:text-slate-200">{totalAssetsValue.toLocaleString()} ت</strong>
              </div>
              <div className="text-left">
                <span className="text-slate-400 block pb-0.5">تعهد وام باقی‌مانده:</span>
                <strong className="font-mono text-rose-500">{totalRemainingLoansValue.toLocaleString()} ت</strong>
              </div>
            </div>
          </div>

          {/* TRADING STATUS CARD */}
          <div 
            onClick={() => onNavigate('journal')}
            className={`p-5 rounded-3xl border cursor-pointer hover:border-indigo-500/20 hover:scale-[1.01] transition-all relative overflow-hidden flex flex-col justify-between ${
              darkMode ? 'bg-slate-900/40 border-slate-850/80' : 'bg-white border-zinc-150 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">عملکرد معامله‌گری</span>
              <span className="text-[9px] px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold">ژورنال معملات</span>
            </div>

            <div className="space-y-1 my-2">
              <span className="text-xs text-slate-450 dark:text-slate-400 block">سود و زیان کل معاملات:</span>
              <div className={`text-xl font-black font-mono tracking-tight ${totalGainLoss >= 0 ? 'text-indigo-500' : 'text-rose-500'}`} dir="ltr">
                {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString()}
              </div>
              <p className="text-[9px] text-slate-400 mt-1">تعداد کل معاملات ثبت‌شده: {totalTradesCount} معامله</p>
            </div>

            <div className="space-y-1 pt-3.5 border-t border-slate-150/10">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-slate-400">نرخ برد سودده (Win Rate):</span>
                <span className="font-extrabold text-indigo-500 font-mono">{winRate}%</span>
              </div>
              <div className="w-full bg-slate-200/40 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, winRate)}%` }}
                />
              </div>
            </div>
          </div>

          {/* MINIMAL TODAY PRODUCTIVITY PROGRESS */}
          <div className={`p-5 rounded-3xl border ${
            darkMode ? 'bg-slate-900/40 border-slate-850/80' : 'bg-white border-zinc-150 shadow-sm'
          }`}>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">راندمان پایش انضباط فردی</span>
            
            <div className="flex items-center gap-4 py-1">
              {/* Radial circle simulated via styled div borders */}
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full border-4 border-slate-150 dark:border-slate-800/80" />
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-l-transparent border-b-transparent animate-spin-slow" />
                <span className="text-[11px] font-mono font-black text-indigo-505">{overallDayProgressPercent}%</span>
              </div>

              <div>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">انضباط کل امروزی شما</span>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                  شامل تمام عادت‌های تعهدآور بیداری و وظایف معین‌شده پیش‌رفته.
                </p>
              </div>
            </div>
          </div>

          {/* ACTIVE RUNNING IDEAS (TIMERS) */}
          {runningIdeas.length > 0 && (
            <div className={`p-5 rounded-3xl border divide-y divide-slate-150/10 ${
              darkMode ? 'bg-slate-900/40 border-slate-850/80' : 'bg-white border-zinc-150 shadow-sm'
            }`}>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block mb-2">ایده‌های زمان‌سنج فعال در کارگاه:</span>
              
              {runningIdeas.map(i => (
                <div 
                  key={i.id} 
                  className="pt-2 text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="font-bold">{i.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-amber-500 font-bold font-mono">
                      {(i.elapsedSeconds / 3600).toFixed(2)} ساعت مصرفی
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-950 text-amber-400 font-black rounded-lg">درحال ثبت</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
