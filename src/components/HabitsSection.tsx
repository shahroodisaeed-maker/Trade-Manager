import React, { useState, useEffect, useRef } from 'react';
import { Habit, DayTask, GeneralReminder } from '../types';
import { 
  Plus, Check, Trash2, Calendar, Clock, Bell, 
  BellRing, Award, ShieldAlert, Sparkles, AlertTriangle, X,
  Activity, ArrowLeft, ArrowRight, Zap, Info, Archive, History, CheckSquare
} from 'lucide-react';

interface HabitsSectionProps {
  habits: Habit[];
  tasks: DayTask[];
  reminders: GeneralReminder[];
  onAddHabit: (
    title: string, 
    frequency: 'daily' | 'weekly',
    time?: string,
    deadlineTime?: string,
    alarmType?: 'math' | 'normal' | 'notification' | 'none'
  ) => void;
  onToggleHabit: (id: string, date: string) => void;
  onDeleteHabit: (id: string) => void;
  onAddTask: (task: Omit<DayTask, 'id' | 'completed' | 'missed' | 'createdAt'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddReminder: (reminder: Omit<GeneralReminder, 'id' | 'completed'>) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onArchiveTodayTasks: () => void;
  onTriggerAlarm?: (task: DayTask) => void;
  onTriggerHabitAlarm?: (h: Habit) => void;
  darkMode?: boolean;
}

export default function HabitsSection({
  habits,
  tasks,
  reminders,
  onAddHabit,
  onToggleHabit,
  onDeleteHabit,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
  onArchiveTodayTasks,
  onTriggerAlarm,
  onTriggerHabitAlarm,
  darkMode = false
}: HabitsSectionProps) {
  // Toggle for registration panel
  const [showRegisterPanel, setShowRegisterPanel] = useState(false);

  // Habit registration state
  const [habitTitle, setHabitTitle] = useState('');
  const [habitTime, setHabitTime] = useState('');
  const [habitDeadlineTime, setHabitDeadlineTime] = useState('');
  const [habitAlarmSelection, setHabitAlarmSelection] = useState<'none' | 'notification' | 'normal' | 'math'>('none');
  
  // Task registration state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDay, setTaskDay] = useState<'today' | 'tomorrow'>('today');
  const [taskTime, setTaskTime] = useState('');
  const [alarmSelection, setAlarmSelection] = useState<'none' | 'notification' | 'normal' | 'math'>('none');
  const [deadlineTime, setDeadlineTime] = useState('');

  // Reminder state
  const [remTitle, setRemTitle] = useState('');
  const [remDate, setRemDate] = useState('');
  const [remTime, setRemTime] = useState('');

  // Performance Month Selection state (defaults to May 2026)
  const [selectedMonth, setSelectedMonth] = useState('2026-05');



  const handleAddHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    onAddHabit(
      habitTitle.trim(),
      'daily',
      habitTime || undefined,
      habitDeadlineTime || undefined,
      habitAlarmSelection
    );
    setHabitTitle('');
    setHabitTime('');
    setHabitDeadlineTime('');
    setHabitAlarmSelection('none');
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    onAddTask({
      title: taskTitle.trim(),
      day: taskDay,
      time: taskTime || undefined,
      hasAlarm: alarmSelection !== 'none',
      alarmType: alarmSelection,
      deadlineTime: deadlineTime || undefined
    });
    setTaskTitle('');
    setTaskTime('');
    setAlarmSelection('none');
    setDeadlineTime('');
  };

  const handleAddRemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle.trim() || !remDate || !remTime) return;
    onAddReminder({
      title: remTitle.trim(),
      date: remDate,
      time: remTime
    });
    setRemTitle('');
    setRemDate('');
    setRemTime('');
  };

  // Current YYYY-MM-DD
  const todayISO = new Date().toISOString().slice(0, 10);
  const totalHabits = habits.length;
  const completedHabitsToday = habits.filter(h => h.history[todayISO]).length;
  const habitCompletionRate = totalHabits > 0 
    ? Math.round((completedHabitsToday / totalHabits) * 100) 
    : 0;

  // Render Days of the Selected Month dynamically
  const getDaysInSelectedMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 0); // Last date of prior month is days count
    return date.getDate();
  };

  const renderMonthPerformanceGrid = () => {
    const daysCount = getDaysInSelectedMonth();
    const list = Array.from({ length: daysCount }, (_, i) => i + 1);

    const totalOnEachDay = habits.length;

    // Compute actual daily success rates (0.0 to 1.0)
    const dailyRates = list.map(dayNum => {
      const dayStr = dayNum.toString().padStart(2, '0');
      const targetDateStr = `${selectedMonth}-${dayStr}`;
      const completedOnThisDay = habits.filter(h => h.history[targetDateStr]).length;
      return totalOnEachDay > 0 ? (completedOnThisDay / totalOnEachDay) : 0;
    });

    // Compute weekly averages dynamically
    const weeks = [
      { name: 'هفته اول', days: [1, 2, 3, 4, 5, 6, 7] },
      { name: 'هفته دوم', days: [8, 9, 10, 11, 12, 13, 14] },
      { name: 'هفته سوم', days: [15, 16, 17, 18, 19, 20, 21] },
      { name: 'هفته چهارم', days: [22, 23, 24, 25, 26, 27, 28] },
      { name: 'هفته پنجم', days: [29, 30, 31].filter(d => d <= daysCount) }
    ];

    const weeklyAverages = weeks.map(w => {
      const dayRatesForWeek = w.days.map(d => dailyRates[d - 1] || 0);
      const avg = dayRatesForWeek.reduce((sum, r) => sum + r, 0) / Math.max(1, dayRatesForWeek.length);
      return {
        name: w.name,
        percentage: Math.round(avg * 100) || 0
      };
    });

    // Generate SVG Sparkline points for continuous daily progress trend chart
    const graphWidth = 280;
    const graphHeight = 44;
    const pointsCoord = dailyRates.map((rate, idx) => {
      const x = (idx / (daysCount - 1)) * graphWidth;
      const y = graphHeight - (rate * (graphHeight - 6)) - 3;
      return `${x},${y}`;
    });
    const polylinePoints = pointsCoord.join(' ');
    const areaPoints = `0,${graphHeight} ${polylinePoints} ${graphWidth},${graphHeight}`;

    return (
      <div className="space-y-4 text-right">
        {/* Month Selector Dropdown */}
        <div className="flex items-center justify-between gap-1 border-b border-indigo-150/10 pb-2">
          <span className="text-[10px] text-slate-450 font-extrabold flex items-center gap-1">
            <Activity size={12} className="text-indigo-400" /> بایگانی و تقویم فرآیند عادات
          </span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={`text-[10px] font-bold p-1 bg-transparent border-b focus:outline-none ${
              darkMode ? 'text-indigo-300 border-slate-700 bg-slate-900' : 'text-slate-800 border-zinc-200 bg-white'
            }`}
          >
            <option value="2026-12">آذر ۱۴۰۵ (December 2026)</option>
            <option value="2026-11">آبان ۱۴۰۵ (November 2026)</option>
            <option value="2026-10">مهر ۱۴۰۵ (October 2026)</option>
            <option value="2026-09">شهریور ۱۴۰۵ (September 2026)</option>
            <option value="2026-08">مرداد ۱۴۰۵ (August 2026)</option>
            <option value="2026-07">تیر ۱۴۰۵ (July 2026)</option>
            <option value="2026-06">خرداد ۱۴۰۵ (June 2026)</option>
            <option value="2026-05">اردیبهشت ۱۴۰۵ (May 2026)</option>
            <option value="2026-04">فروردین ۱۴۰۵ (April 2026)</option>
            <option value="2026-03">اسفند ۱۴۰۴ (March 2026)</option>
            <option value="2026-02">بهمن ۱۴۰۴ (February 2026)</option>
            <option value="2026-01">دی ۱۴۰۴ (January 2026)</option>
            <option value="2025-12">آذر ۱۴۰۴ (December 2025)</option>
            <option value="2025-11">آبان ۱۴۰۴ (November 2025)</option>
            <option value="2025-10">مهر ۱۴۰۴ (October 2025)</option>
          </select>
        </div>

        {/* Dynamic Weekly Performance Trend - BOXES layout requested by user */}
        <div className="grid grid-cols-5 gap-1 pt-1">
          {weeklyAverages.map((wk, idx) => {
            const isHigh = wk.percentage >= 70;
            const isLow = wk.percentage < 40;
            return (
              <div 
                key={idx} 
                className={`p-1.5 border rounded-lg text-center transition-all ${
                  darkMode 
                    ? 'bg-slate-950/40 border-slate-850' 
                    : 'bg-slate-50 border-zinc-150'
                }`}
              >
                <div className="text-[8px] text-slate-450 font-bold truncate">{wk.name}</div>
                <div className={`text-xs font-bold font-mono tracking-tight mt-0.5 ${
                  isHigh ? 'text-indigo-500' : isLow ? 'text-rose-500' : 'text-amber-500'
                }`}>
                  {wk.percentage}%
                </div>
                <div className="w-full bg-slate-200/40 h-0.5 rounded-full mt-1 overflow-hidden">
                  <div 
                    className={`h-full ${isHigh ? 'bg-indigo-500' : isLow ? 'bg-rose-500' : 'bg-amber-500'}`} 
                    style={{ width: `${wk.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic SVG Sparkline Line Chart of Daily Progress rates - requested by user */}
        <div className={`p-2.5 border rounded-xl flex flex-col justify-between ${
          darkMode ? 'bg-slate-950/20 border-slate-850' : 'bg-zinc-50/50 border-zinc-100'
        }`}>
          <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold pb-1">
            <span>روند خطی پیشرفت روز‌های ماه</span>
            <span className="font-mono text-indigo-455">نوسان عملکرد</span>
          </div>
          
          <div className="relative w-full h-11" dir="ltr">
            <svg className="w-full h-full" viewBox={`0 0 ${graphWidth} ${graphHeight}`}>
              {/* Grid Lines */}
              <line x1="0" y1={graphHeight/2} x2={graphWidth} y2={graphHeight/2} stroke={darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"} />
              
              {/* Shaded Area */}
              <polygon
                points={areaPoints}
                className={darkMode ? "fill-indigo-500/10" : "fill-indigo-100/45"}
              />
              {/* Continuous Trend Line */}
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="1.5"
                points={polylinePoints}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Markers for days */}
              {dailyRates.map((rate, i) => {
                const x = (i / (daysCount - 1)) * graphWidth;
                const y = graphHeight - (rate * (graphHeight - 6)) - 3;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="1.5"
                    className="fill-indigo-600 hover:r-3.5 transition-all text-white"
                    style={{ cursor: 'pointer' }}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Traditional Heat-map visual grid for chosen month */}
        <div className="space-y-1.5">
          <div className="text-[8px] text-slate-500 font-bold">نقشه حرارتی فعالیت کل ماه:</div>
          <div className="grid grid-cols-7 gap-1" dir="ltr">
            {list.map(dayNum => {
              const dayStr = dayNum.toString().padStart(2, '0');
              const targetDateStr = `${selectedMonth}-${dayStr}`;
              
              const completedOnThisDay = habits.filter(h => h.history[targetDateStr]).length;
              const rate = totalOnEachDay > 0 ? (completedOnThisDay / totalOnEachDay) : 0;

              let bgColor = 'bg-slate-100'; 
              let tooltip = `روز ${dayNum}ام: بدون فعالیت`;

              if (darkMode) {
                bgColor = 'bg-slate-950 border border-slate-900';
              }

              if (totalOnEachDay > 0) {
                if (rate === 0) {
                  bgColor = darkMode ? 'bg-rose-950/20 border border-rose-900/30 text-rose-500' : 'bg-rose-50 border border-rose-100/40 text-rose-600';
                  tooltip = `روز ${dayNum}ام: درصد موفقیت ۰٪`;
                } else if (rate <= 0.4) {
                  bgColor = 'bg-indigo-100 text-indigo-700';
                  tooltip = `روز ${dayNum}ام: درصد موفقیت ${Math.round(rate * 100)}٪`;
                } else if (rate <= 0.7) {
                  bgColor = 'bg-indigo-300 text-indigo-950';
                  tooltip = `روز ${dayNum}ام: درصد موفقیت ${Math.round(rate * 100)}٪`;
                } else {
                  bgColor = 'bg-indigo-600 text-white';
                  tooltip = `روز ${dayNum}ام: درصد موفقیت ۱۰۰٪ کامل`;
                }
              }

              return (
                <div 
                  key={dayNum} 
                  className={`h-5 rounded flex items-center justify-center text-[7px] font-mono font-bold transition-all cursor-pointer select-none ${bgColor}`}
                  title={tooltip}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[8px] text-slate-400 mt-2 font-display">
          <div className="flex gap-2">
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-sm inline-block ${darkMode ? 'bg-slate-950 border border-slate-900' : 'bg-slate-100'}`} /> صفر درصد
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-indigo-300 inline-block" /> ۴۰ تا ۷۰ درصد
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-indigo-600 inline-block" /> ۱۰۰ درصد کامل
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Modern Collapsible registration panel for defining and creating tasks/habits */}
      <div className={`p-4 rounded-3xl border mb-3 transition-all ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-indigo-50/20 border-indigo-100'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-500 animate-pulse shrink-0" size={18} />
            <div className="text-right">
              <h3 className={`text-xs font-black ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>ثبت آلارم‌ها، تسک‌ها و عادات جدید</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-sans leading-relaxed">کلید زیر را برای باز کردن پنل ثبت کارهای جدید یا تعاریف عادات روزانه فشار دهید.</p>
            </div>
          </div>
          <button
            onClick={() => setShowRegisterPanel(!showRegisterPanel)}
            className={`flex items-center gap-1.5 px-4 h-9 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border ${
              showRegisterPanel 
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20' 
                : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700'
            }`}
          >
            {showRegisterPanel ? (
              <>
                <X size={14} /> بستن فرآیند تعریف کارها
              </>
            ) : (
              <>
                <Plus size={14} /> تعریف تسک جدید و عادات روزانه
              </>
            )}
          </button>
        </div>

        {/* Collapsible content forms with beautiful seamless CSS transitions */}
        <div className={`transition-all duration-300 overflow-hidden ${
          showRegisterPanel ? 'max-h-[850px] opacity-100 mt-4 border-t pt-4 border-slate-200/5' : 'max-h-0 opacity-0 pointer-events-none'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-right">
            
            {/* Form A: Everyday Recurring Habits */}
            <div className={`p-4 border rounded-2xl space-y-3 shadow-inner ${
              darkMode ? 'bg-slate-950/40 border-slate-850' : 'bg-white border-zinc-150'
            }`}>
              <div className="flex items-center gap-1.5 border-b pb-2 border-indigo-100/10">
                <Award className="text-indigo-550" size={16} />
                <h4 className={`text-xs font-black ${darkMode ? 'text-indigo-400' : 'text-slate-800'}`}>۱. ثبت عادت تکرارشونده همیشگی (ساعات ثابت)</h4>
              </div>

              <form onSubmit={handleAddHabitSubmit} className="space-y-3">
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1 font-semibold">شرح عادت تکرارشونده روزانه *</label>
                  <input 
                    type="text" 
                    placeholder="مثلا: پیاده‌روی صبحگاهی، بک تست چارت طلا، مدیتیشن..."
                    required
                    value={habitTitle}
                    onChange={(e) => setHabitTitle(e.target.value)}
                    className={`w-full p-2.5 border rounded-lg text-xs focus:outline-none focus:border-indigo-500 ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white font-sans' : 'bg-white border-zinc-200 text-slate-905'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-[9px]">
                  <div>
                    <label className="block text-slate-400 mb-1">ساعت انجام</label>
                    <input 
                      type="time" 
                      value={habitTime}
                      onChange={(e) => setHabitTime(e.target.value)}
                      className={`w-full p-1.5 border rounded focus:outline-none font-mono text-center ${
                        darkMode ? 'bg-slate-950 border-slate-705 text-white' : 'bg-white border-zinc-200 text-slate-950'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">ددلاین مهار</label>
                    <input 
                      type="time" 
                      value={habitDeadlineTime}
                      onChange={(e) => setHabitDeadlineTime(e.target.value)}
                      className={`w-full p-1.5 border rounded focus:outline-none font-mono text-center ${
                        darkMode ? 'bg-slate-950 border-slate-705 text-white' : 'bg-white border-zinc-200 text-slate-950'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">خواب‌شکن</label>
                    <select
                      value={habitAlarmSelection}
                      onChange={(e: any) => setHabitAlarmSelection(e.target.value)}
                      className={`w-full p-1.5 border rounded focus:outline-none font-sans text-center text-[10px] ${
                        darkMode ? 'bg-slate-950 border-slate-705 text-slate-205' : 'bg-white border-zinc-200 text-slate-705'
                      }`}
                    >
                      <option value="none">بدون آلارم</option>
                      <option value="notification">نوتیفیکیشن</option>
                      <option value="normal">آلارم معمولی</option>
                      <option value="math">آلارم ریاضی</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                  >
                    ذخیره و ثبت عادت همیشگی
                  </button>
                </div>
              </form>
            </div>

            {/* Form B: Once-off Today/Tomorrow Tasks */}
            <div className={`p-4 border rounded-2xl space-y-3 shadow-inner ${
              darkMode ? 'bg-slate-950/40 border-slate-850' : 'bg-white border-zinc-150'
            }`}>
              <div className="flex items-center justify-between border-b pb-2 border-indigo-100/10">
                <div className="flex items-center gap-1.5">
                  <Calendar className="text-indigo-455" size={16} />
                  <h4 className={`text-xs font-black ${darkMode ? 'text-indigo-400' : 'text-slate-800'}`}>۲. ثبت وظیفه کاری موقت (امروز یا فردا)</h4>
                </div>
                <div className="flex border rounded-lg p-0.5 bg-slate-900/10" dir="ltr">
                  <button 
                    type="button"
                    onClick={() => setTaskDay('today')}
                    className={`px-2.5 py-0.5 rounded text-[9px] font-black transition-all cursor-pointer ${
                      taskDay === 'today' ? 'bg-indigo-600 text-white shadow' : 'text-slate-450 hover:text-slate-200'
                    }`}
                  >
                    امروز
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTaskDay('tomorrow')}
                    className={`px-2.5 py-0.5 rounded text-[9px] font-black transition-all cursor-pointer ${
                      taskDay === 'tomorrow' ? 'bg-indigo-600 text-white shadow' : 'text-slate-455 hover:text-slate-200'
                    }`}
                  >
                    فردا
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddTaskSubmit} className="space-y-3">
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1 font-semibold">شرح فعالیت یا کار مجزا *</label>
                  <input 
                    type="text" 
                    placeholder="مثلا: پرداخت صورت حساب، تحویل مستندات به مهندس معامله‌گر..."
                    required
                    value={taskTitle} 
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className={`w-full p-2.5 border rounded-lg text-xs focus:outline-none focus:border-indigo-500 ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-zinc-200'
                    }`} 
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-[9px]">
                  <div>
                    <label className="block text-slate-400 mb-1">ساعت انجام</label>
                    <input 
                      type="time" 
                      value={taskTime} 
                      onChange={(e) => setTaskTime(e.target.value)}
                      className={`w-full p-1.5 border rounded-lg focus:outline-none font-mono text-center text-xs ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-zinc-200 text-slate-900'
                      }`} 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">ددلاین مهار</label>
                    <input 
                      type="time" 
                      value={deadlineTime} 
                      onChange={(e) => setDeadlineTime(e.target.value)}
                      className={`w-full p-1.5 border rounded-lg focus:outline-none font-mono text-center text-xs ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-zinc-200 text-slate-900'
                      }`} 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">آلارم تلفن همراه</label>
                    <select
                      value={alarmSelection}
                      onChange={(e: any) => setAlarmSelection(e.target.value)}
                      className={`w-full p-1.5 border rounded-lg focus:outline-none font-sans text-[10px] text-center ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-slate-205' : 'bg-white border-zinc-200 text-slate-705'
                      }`}
                    >
                      <option value="none">بدون آلارم</option>
                      <option value="notification">ثبت اعلان</option>
                      <option value="normal">آلارم معمولی</option>
                      <option value="math">آلارم ریاضی</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    ذخیره و ثبت تسک مجزا
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Module 1: Daily Habits Completion stats & calendar performance */}
        <div className={`p-5 border rounded-2xl shadow-sm space-y-4 flex flex-col justify-between transition-colors ${
          darkMode ? 'bg-slate-905 border-slate-800' : 'bg-white border-zinc-150'
        }`}>
          <div className="space-y-4">
            <div className={`border-b pb-2 flex justify-between items-center ${
              darkMode ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <h3 className="text-sm font-bold font-display">کارنامه تعهد و تقویم انضباط</h3>
              <span className="text-[10px] text-slate-400 font-mono">امروز: {todayISO}</span>
            </div>

            {/* Quick Completion Stats */}
            <div className={`p-3.5 border rounded-xl flex items-center justify-between transition-colors ${
              darkMode ? 'bg-slate-950/60 border-slate-850' : 'bg-zinc-50 border-zinc-100'
            }`}>
              <div>
                <span className="text-[10px] text-slate-455 font-bold block">پیشرفت کل عادات امروز</span>
                <span className="text-xs text-slate-400">{completedHabitsToday} از {totalHabits} عادت تکراری</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-indigo-500 font-mono">{habitCompletionRate}%</span>
              </div>
            </div>
          </div>

          {/* Minimalist Grid indicator showing dynamic monthly performance calendar */}
          <div className={`pt-3 border-t transition-colors ${darkMode ? 'border-slate-800' : 'border-zinc-101'}`}>
            {renderMonthPerformanceGrid()}
          </div>
        </div>

        {/* Module 2: Today and Tomorrow tasks list & alarms scheduler */}
        <div className={`lg:col-span-2 p-5 border rounded-2xl shadow-sm space-y-4 transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-zinc-150'
        }`}>
          <div className={`border-b pb-2 flex justify-between items-center ${
            darkMode ? 'border-slate-800' : 'border-zinc-105'
          }`}>
            <h3 className="text-sm font-bold font-display">لیست کارهای روزانه (امروز و فردا)</h3>
            <span className="text-[10px] text-slate-452 font-semibold">تعهد همیشگی با آلارم</span>
          </div>

          {/* Render Active Cards with Today and Tomorrow tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
            
            {/* TODAY COLUMN */}
            <div className={`p-3 border rounded-xl transition-all shadow-md ${
              darkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-zinc-50/20 border-zinc-150'
            }`}>
              <div className="flex items-center justify-between border-b pb-1.5 mb-2.5">
                <h4 className={`text-xs font-black flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                  ☀️ لیست کارهای امروز
                </h4>
                
                {tasks.filter(t => t.day === 'today' && !t.archived).length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('آیا از اتمام روز و انتقال تسک‌های امروز به بایگانی نهایی مطمئن هستید؟')) {
                        onArchiveTodayTasks();
                      }
                    }}
                    className="flex items-center gap-1 text-[9px] px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-500 border border-emerald-500/20 rounded-lg transition-all font-bold cursor-pointer"
                    title="بایگانی تاریخی تسک‌های امروز با ساعات انجام"
                  >
                    <Archive size={10} /> پایان تسک‌های امروز
                  </button>
                )}
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto">
                {/* Subsection A: Once-off Tasks */}
                <div>
                  <div className="text-[10px] text-slate-450 font-bold mb-1.5 flex items-center gap-1">
                    <CheckSquare size={10} className="text-indigo-400" />
                    <span>کارهای روزانه موقت:</span>
                  </div>
                  
                  {tasks.filter(t => t.day === 'today' && !t.archived).length === 0 ? (
                    <div className="p-3 text-center text-slate-500 text-[10px] bg-slate-500/5 rounded-lg border border-dashed border-slate-500/10">امروز کار موقتی ثبت نشده است.</div>
                  ) : (
                    <div className="space-y-1.5">
                      {tasks.filter(t => t.day === 'today' && !t.archived).map(task => (
                        <div 
                          key={task.id} 
                          className={`p-2.5 rounded-lg border text-xs flex justify-between items-center transition-all ${
                            task.completed 
                              ? (darkMode ? 'bg-slate-900/60 border-slate-850 opacity-50' : 'bg-slate-50 border-slate-100 opacity-60')
                              : task.missed 
                                ? 'bg-red-500/10 border-red-550/20 text-rose-500' 
                                : (darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-zinc-200')
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onToggleTask(task.id)}
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                                task.completed 
                                  ? 'bg-indigo-650 border-indigo-600 text-white' 
                                  : task.missed
                                    ? 'border-rose-450 bg-rose-500/10 text-rose-500 hover:bg-emerald-500/10 hover:border-emerald-450 hover:text-emerald-500'
                                    : (darkMode ? 'border-slate-700 bg-slate-950 hover:border-slate-500' : 'border-zinc-350 bg-white hover:border-zinc-850')
                              }`}
                              title={task.missed ? 'ثبت و تکمیل تسک منقضی شده' : 'تغییر وضعیت انجام تسک'}
                            >
                              {task.completed ? <Check size={10} /> : task.missed ? <span className="font-extrabold text-[7px]">✖</span> : null}
                            </button>
                            
                            <div>
                              <div className={`font-semibold ${task.completed ? 'line-through text-slate-500' : (darkMode ? 'text-slate-200' : 'text-slate-800')}`}>
                                {task.title}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-slate-450 mt-0.5">
                                {task.time && <span className="font-mono">ساعت {task.time}</span>}
                                {task.deadlineTime && <span className="font-mono text-zinc-500 font-bold">مهلت: {task.deadlineTime}</span>}
                                {task.completed && task.completedAt && (
                                  <span className="text-emerald-500 bg-emerald-500/10 px-1 rounded-md font-bold font-mono">
                                    ✓ تایید: {task.completedAt}
                                  </span>
                                )}
                                {task.alarmType && task.alarmType !== 'none' && (
                                  <span className="text-indigo-400 font-bold">
                                    • زنگ {task.alarmType === 'math' ? 'محاسباتی' : task.alarmType === 'normal' ? 'معمولی' : 'اعلان'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {task.missed && (
                              <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-500 rounded text-[9px] font-bold">
                                ✖ منقضی
                              </span>
                            )}
                            
                            {!task.completed && !task.missed && task.alarmType && task.alarmType !== 'none' && (
                              <button
                                onClick={() => onTriggerAlarm?.(task)}
                                className={`p-1 px-1.5 rounded text-[9px] flex items-center gap-0.5 transition-colors cursor-pointer ${
                                  darkMode ? 'bg-slate-850 hover:bg-slate-800 text-indigo-400' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-705'
                                }`}
                                title="شبیه‌سازی نواختن زنگ هشدار تنظیم گوشی"
                              >
                                <BellRing size={10} /> زنگ
                              </button>
                            )}

                            <button 
                              onClick={() => {
                                if (!task.completed) {
                                  alert('امکان حذف تسک‌های غیرآماده (منقضی شده یا فعال) قبل از ثبت نهایی وجود ندارد! برای انضباط شخصی، شما موظف هستید ابتدا تسک را با زدن تیک، وضعیت آن را به ثبت/تکمیل نهایی تغییر دهید تا منوی حذف برای آن فعال گردد.');
                                  return;
                                }
                                onDeleteTask(task.id);
                              }}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                !task.completed
                                  ? 'text-slate-350/30 dark:text-slate-700/30 cursor-not-allowed opacity-40'
                                  : (darkMode ? 'text-slate-500 hover:text-rose-500' : 'text-slate-400 hover:text-rose-500')
                              }`}
                              title={!task.completed ? 'تنها تسک‌های ثبت و تکمیل شده قابل حذف هستند' : 'حذف این تسک'}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subsection B: Everyday Recurring Habits */}
                <div className="border-t pt-2.5 border-slate-200/10 dark:border-slate-800/60 text-right">
                  <div className="text-[10px] text-slate-450 font-bold mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Zap size={10} className="text-amber-500" />
                      <span>عادت‌های روزانه همیشگی (ثابت امروز):</span>
                    </div>
                    {habits.length > 0 && (
                      <span className="text-[9px] text-indigo-400 font-mono">
                        {completedHabitsToday} از {totalHabits} کامل
                      </span>
                    )}
                  </div>

                  {habits.length === 0 ? (
                    <div className="p-3 text-center text-slate-500 text-[10px] bg-slate-500/5 rounded-lg border border-dashed border-slate-500/10">هیچ عادت همیشگی ثبت نشده است.</div>
                  ) : (
                    <div className="space-y-1.5 font-sans">
                      {habits.map(h => {
                        const isCompleted = !!h.history[todayISO];
                        const now = new Date();
                        const currentHourMin = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                        const isMissed = !isCompleted && h.deadlineTime && (currentHourMin > h.deadlineTime);

                        return (
                          <div 
                            key={h.id} 
                            className={`p-2.5 rounded-lg border text-xs flex justify-between items-center transition-all ${
                              isCompleted 
                                ? (darkMode ? 'bg-slate-900/40 border-slate-900 text-slate-500 opacity-60' : 'bg-slate-50/50 border-slate-100 text-slate-500 opacity-65')
                                : isMissed 
                                  ? 'bg-rose-500/10 border-rose-550/20 text-rose-500' 
                                  : (darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-zinc-200 text-slate-850')
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onToggleHabit(h.id, todayISO)}
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                                  isCompleted 
                                    ? 'bg-indigo-650 border-indigo-600 text-white' 
                                    : isMissed
                                      ? 'border-rose-450 bg-rose-500/10 text-rose-500 hover:bg-emerald-500/10 hover:border-emerald-450 hover:text-emerald-500'
                                      : (darkMode ? 'border-slate-700 bg-slate-950 hover:border-slate-500' : 'border-zinc-350 bg-white hover:border-zinc-850')
                                }`}
                                title={isMissed ? 'ثبت و تکمیل عادت منقضی شده امروز' : 'تغییر وضعیت انجام عادت امروز'}
                              >
                                {isCompleted ? <Check size={10} /> : isMissed ? <span className="font-extrabold text-[7px]">✖</span> : null}
                              </button>
                              
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-semibold ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                                    {h.title}
                                  </span>
                                  {h.streak > 0 && (
                                    <span className="text-[9px] bg-amber-500/15 text-amber-500 px-1 rounded font-bold font-mono" title={`توالی تکرار موفق: ${h.streak} روز`}>
                                      🔥 {h.streak}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-slate-455 mt-0.5 font-mono">
                                  {h.time && <span>ساعت {h.time}</span>}
                                  {h.deadlineTime && <span className="text-zinc-500 font-bold">مهلت مهار: {h.deadlineTime}</span>}
                                  {h.alarmType && h.alarmType !== 'none' && (
                                    <span className="text-indigo-400 font-bold font-sans">
                                      • زنگ ({h.alarmType === 'math' ? 'ریاضی' : h.alarmType === 'normal' ? 'معمولی' : 'اعلان'})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {isMissed && (
                                <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-500 rounded text-[9px] font-bold">
                                  ✖ ناقص
                                </span>
                              )}

                              {!isCompleted && !isMissed && h.alarmType && h.alarmType !== 'none' && (
                                <button
                                  onClick={() => onTriggerHabitAlarm?.(h)}
                                  className={`p-1 px-1.5 rounded text-[9px] flex items-center gap-0.5 transition-colors cursor-pointer ${
                                    darkMode ? 'bg-slate-850 hover:bg-slate-800 text-indigo-400' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-705'
                                  }`}
                                  title="نواختن زنگ هشدار برای این عادت"
                                >
                                  <BellRing size={10} /> زنگ
                                </button>
                              )}

                              <button 
                                onClick={() => {
                                  if (confirm(`آیا مطمئن هستید که می‌خواهید عادت همیشگی «${h.title}» را به طور کلی حذف کنید؟`)) {
                                    onDeleteHabit(h.id);
                                  }
                                }}
                                className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                title="حذف کلی این عادت"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TOMORROW COLUMN */}
            <div className={`p-3 border rounded-xl transition-all shadow-md ${
              darkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-zinc-50/20 border-zinc-150'
            }`}>
              <div className="border-b pb-1.5 mb-2.5">
                <h4 className={`text-xs font-black flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                  🌙 لیست کارهای فردا
                </h4>
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto">
                {/* Subsection A: Once-off Tasks */}
                <div>
                  <div className="text-[10px] text-slate-455 font-bold mb-1.5 flex items-center gap-1">
                    <CheckSquare size={10} className="text-indigo-400" />
                    <span>کارهای روزانه موقت:</span>
                  </div>

                  {tasks.filter(t => t.day === 'tomorrow' && !t.archived).length === 0 ? (
                    <div className="p-3 text-center text-slate-555 text-[10px] bg-slate-500/5 rounded-lg border border-dashed border-slate-500/10">فردا کار موقتی ثبت نشده است.</div>
                  ) : (
                    <div className="space-y-1.5">
                      {tasks.filter(t => t.day === 'tomorrow' && !t.archived).map(task => (
                        <div 
                          key={task.id} 
                          className={`p-2.5 rounded-lg border text-xs flex justify-between items-center transition-all ${
                            task.completed 
                              ? (darkMode ? 'bg-slate-900 border-slate-855 opacity-55' : 'bg-slate-50 border-slate-100 opacity-60')
                              : (darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-zinc-200')
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onToggleTask(task.id)}
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                                task.completed 
                                  ? 'bg-indigo-650 border-indigo-600 text-white' 
                                  : task.missed
                                    ? 'border-rose-450 bg-rose-500/10 text-rose-505 hover:bg-emerald-500/10 hover:border-emerald-450 hover:text-emerald-500'
                                    : (darkMode ? 'border-slate-700 bg-slate-950 hover:border-slate-500' : 'border-zinc-300 bg-white hover:border-zinc-800')
                              }`}
                              title={task.missed ? 'ثبت و تکمیل تسک منقضی شده' : 'تغییر وضعیت انجام تسک'}
                            >
                              {task.completed ? <Check size={10} /> : task.missed ? <span className="font-extrabold text-[7px]">✖</span> : null}
                            </button>
                            
                            <div>
                              <div className={`font-semibold ${task.completed ? 'line-through text-slate-505' : (darkMode ? 'text-slate-205' : 'text-slate-800')}`}>
                                {task.title}
                              </div>
                              <div className="flex items-center gap-1 text-[9px] text-slate-450 mt-0.5 font-mono">
                                {task.time && <span>ساعت {task.time}</span>}
                                {task.alarmType && task.alarmType !== 'none' && <span className="font-semibold text-indigo-400">• زنگ‌دار ({task.alarmType})</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <button 
                              onClick={() => {
                                if (!task.completed) {
                                  alert('امکان حذف تسک‌های غیرآماده (منقضی شده یا فعال) قبل از ثبت نهایی وجود ندارد! برای انضباط شخصی، شما موظف هستید ابتدا تسک را با زدن تیک، وضعیت آن را به ثبت/تکمیل نهایی تغییر دهید تا منوی حذف برای آن فعال گردد.');
                                  return;
                                }
                                onDeleteTask(task.id);
                              }}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                !task.completed
                                  ? 'text-slate-350/30 dark:text-slate-700/30 cursor-not-allowed opacity-40'
                                  : (darkMode ? 'text-slate-505 hover:text-rose-550' : 'text-slate-400 hover:text-rose-500')
                              }`}
                              title={!task.completed ? 'تنها تسک‌های ثبت و تکمیل شده قابل حذف هستند' : 'حذف این تسک'}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subsection B: Everyday Recurring Habits (Tomorrow) */}
                <div className="border-t pt-2.5 border-slate-200/10 dark:border-slate-800/60 text-right">
                  <div className="text-[10px] text-slate-455 font-bold mb-1.5 flex items-center gap-1">
                    <Zap size={10} className="text-amber-500" />
                    <span>عادت‌های روتین برنامه‌ریزی شده فردا:</span>
                  </div>

                  {habits.length === 0 ? (
                    <div className="p-3 text-center text-slate-500 text-[10px] bg-slate-500/5 rounded-lg border border-dashed border-slate-500/10">عادت روتینی ثبت نشده است.</div>
                  ) : (
                    <div className="space-y-1.5 font-sans">
                      {habits.map(h => (
                        <div 
                          key={h.id} 
                          className={`p-2.5 rounded-lg border text-xs flex justify-between items-center opacity-75 ${
                            darkMode ? 'bg-slate-900/30 border-slate-855/65 text-slate-405' : 'bg-slate-50/30 border-slate-100 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border border-dashed border-slate-400/40 flex items-center justify-center text-[8px] text-slate-400/40 select-none cursor-not-allowed" title="پس از آغاز فردا فعال می‌شود">
                              ⏱️
                            </div>
                            
                            <div>
                              <div className="font-semibold text-slate-700 dark:text-slate-305">
                                {h.title}
                              </div>
                              <div className="flex items-center gap-1 text-[9px] text-slate-450 mt-0.5 font-mono">
                                {h.time && <span>طرح اولیه: {h.time}</span>}
                                {h.deadlineTime && <span className="opacity-80">مهلت مهار: {h.deadlineTime}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <button 
                              onClick={() => {
                                if (confirm(`آیا مطمئن هستید که می‌خواهید عادت همیشگی «${h.title}» را به طور کلی حذف کنید؟`)) {
                                  onDeleteHabit(h.id);
                                }
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                              title="حذف کلی این عادت"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* HISTORICAL WORK ARCHIVE PANEL */}
          <div className={`p-4 border rounded-2xl transition-all shadow-md ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/95'
          } mt-4 text-right`} dir="rtl">
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <Archive className="text-emerald-500 shrink-0" size={15} />
                <h4 className={`text-xs font-black ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  بایگانی تاریخی تسک‌های خاتمه یافته (طرح کارنامه موفقیت)
                </h4>
              </div>
              <span className="text-[10px] text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-lg font-bold font-mono">
                {tasks.filter(t => t.archived).length} تسک کل آرشیو شده
              </span>
            </div>

            {tasks.filter(t => t.archived).length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-[11px] leading-relaxed">
                <History size={26} className="mx-auto text-slate-500 mb-2 opacity-50 animate-pulse" />
                هیچ تسکی هنوز آرشیو نشده است. در انتهای روز با لمس کلید <span className="font-bold text-emerald-500">«پایان تسک‌های امروز»</span> در کادر کارهای روزانه، تمام موارد خاتمه‌یافته یا منقضی شده همراه با <span className="font-bold text-indigo-400">ساعت دقیق تایید تیک کاربر</span> در این کادر جاودانه ثبت می‌شوند.
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-0.5">
                {Object.entries(
                  tasks.filter(t => t.archived).reduce<{ [date: string]: DayTask[] }>((acc, task) => {
                    const dateKey = task.archivedAt || task.createdAt || 'ناشناس';
                    if (!acc[dateKey]) acc[dateKey] = [];
                    acc[dateKey].push(task);
                    return acc;
                  }, {})
                ).sort((a, b) => b[0].localeCompare(a[0]))
                .map(([archiveDate, groupTasks]) => (
                  <div key={archiveDate} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 mb-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      آرشیو تاریخ: <span className="font-mono text-indigo-400">{archiveDate}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {groupTasks.map(t => (
                        <div 
                          key={t.id}
                          className={`p-2.5 rounded-xl border text-[11px] flex justify-between items-center transition-all ${
                            t.completed 
                              ? (darkMode ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-300' : 'bg-emerald-50/40 border-emerald-100 text-slate-800')
                              : (darkMode ? 'bg-rose-950/20 border-rose-900/40 text-slate-350' : 'bg-rose-50/40 border-rose-100 text-slate-800')
                          }`}
                        >
                          <div className="flex flex-col gap-0.5 leading-relaxed">
                            <span className={`font-semibold ${t.completed ? 'line-through text-slate-450 dark:text-slate-500' : ''}`}>
                              {t.title}
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5 text-[8.5px] text-slate-400 mt-0.5">
                              {t.time && <span className="font-mono">ساعت {t.time}</span>}
                              {t.deadlineTime && <span className="font-mono font-bold text-rose-500/70">مهلت مهار: {t.deadlineTime}</span>}
                              {t.alarmType && t.alarmType !== 'none' && (
                                <span className="font-bold text-indigo-400">هشدار ({t.alarmType === 'math' ? 'ریاضی' : 'معمولی'})</span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0 text-[10px] font-black">
                            {t.completed ? (
                              <div className="flex flex-col items-end">
                                <span className="text-emerald-500 flex items-center gap-0.5">
                                  ✓ موفق
                                </span>
                                {t.completedAt && (
                                  <span className="text-[8px] font-mono text-emerald-500 mt-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">
                                    تایید: {t.completedAt}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-rose-500 flex items-center gap-0.5">
                                ✖ منقضی شده
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Module 3: Historical Reminder Log */}
          <div className={`pt-4 border-t transition-colors ${darkMode ? 'border-slate-800' : 'border-zinc-100'}`}>
            <h4 className={`text-xs font-bold mb-3 ${darkMode ? 'text-slate-200' : 'text-zinc-800'}`}>سامانه یادآوری‌های زمانی اختصاصی (Reminders)</h4>
            
            <form onSubmit={handleAddRemSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
              <input 
                type="text" 
                placeholder="عنوان مثل: تمدید سرور لینوکس"
                required
                value={remTitle}
                onChange={(e) => setRemTitle(e.target.value)}
                className={`md:col-span-2 p-2 border rounded-lg focus:outline-none focus:border-indigo-500 ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white font-sans' : 'bg-white border-zinc-250 text-slate-805'
                }`}
              />
              <input 
                type="date" 
                required
                value={remDate}
                onChange={(e) => setRemDate(e.target.value)}
                className={`p-2 border rounded-lg focus:outline-none focus:border-indigo-501 ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-zinc-250 text-slate-805'
                }`}
              />
              <div className="flex gap-1.51">
                <input 
                  type="time" 
                  required
                  value={remTime}
                  onChange={(e) => setRemTime(e.target.value)}
                  className={`w-1/2 p-2 border rounded-lg focus:outline-none font-mono text-center ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-zinc-250 text-slate-805'
                  }`}
                />
                <button 
                  type="submit"
                  className="w-1/2 h-9 bg-indigo-650 hover:bg-indigo-750 text-white rounded-lg hover:bg-zinc-700 text-xs font-bold transition-all cursor-pointer shadow-sm mr-1.5"
                >
                  ثبت یادآوری
                </button>
              </div>
            </form>

            {/* List reminders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs max-h-[140px] overflow-y-auto pt-2">
              {reminders.map(rem => (
                <div key={rem.id} className={`flex justify-between items-center p-2.5 border rounded-lg transition-colors ${
                  darkMode ? 'bg-slate-950/20 border-slate-850' : 'bg-slate-50/20 border-zinc-100'
                }`}>
                  <div>
                    <h5 className={`font-semibold ${darkMode ? 'text-slate-205' : 'text-slate-800'}`}>{rem.title}</h5>
                    <span className="text-[9px] text-slate-450 font-mono" dir="ltr">{rem.date} {rem.time}</span>
                  </div>
                  <button 
                    onClick={() => onDeleteReminder(rem.id)}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      darkMode ? 'text-slate-550 hover:text-zinc-50' : 'text-slate-400 hover:text-zinc-650 hover:bg-slate-100'
                    }`}
                    title="حذف یادآور"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
