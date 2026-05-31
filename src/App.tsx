import React, { useState, useEffect, useRef } from 'react';
import { 
  TradeLog, ExpenseIncomeItem, AssetRecord, LoanItem, 
  DebtClaimItem, Habit, DayTask, GeneralReminder, StickyIdea, 
  GameItem, SerialMovieItem 
} from './types';
import JournalSection from './components/JournalSection';
import FocusSection from './components/FocusSection';
import FinancialSection from './components/FinancialSection';
import HabitsSection from './components/HabitsSection';
import IdeasSection from './components/IdeasSection';
import GamesSection from './components/GamesSection';
import SettingsSection from './components/SettingsSection';
import DashboardSection from './components/DashboardSection';

import { 
  BookOpen, Sparkles, DollarSign, Award, StickyNote, Gamepad2, 
  Layers, Github, Compass, ToggleLeft, ToggleRight, Info, Sun, Moon, Sliders, LayoutGrid,
  Bell, BellRing, X, Clock
} from 'lucide-react';

import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App as CapacitorApp } from '@capacitor/app';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'journal' | 'focus' | 'financial' | 'habits' | 'ideas' | 'games' | 'settings'>('dashboard');

  // Dark Mode State with localStorage persistence
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('zenith_darkMode') === 'true';
  });

  // Toggle Dark Mode
  const handleToggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('zenith_darkMode', next.toString());
      Preferences.set({ key: 'zenith_darkMode', value: next.toString() }).catch(() => {});
      return next;
    });
  };

  // Persistence Key lists
  const KEYS = {
    TRADES: 'zenith_trades',
    TXS: 'zenith_txs',
    ASSETS: 'zenith_assets',
    LOANS: 'zenith_loans',
    DEBT_CLAIMS: 'zenith_debt_claims',
    HABITS: 'zenith_habits',
    TASKS: 'zenith_tasks',
    REMINDERS: 'zenith_reminders',
    IDEAS: 'zenith_ideas',
    GAMES: 'zenith_games',
    SERIALS: 'zenith_serials'
  };

  // State Declarations with lazy local loads
  const [trades, setTrades] = useState<TradeLog[]>(() => {
    const data = localStorage.getItem(KEYS.TRADES);
    return data ? JSON.parse(data) : [
      { id: '1', dateTime: '2026-05-28T14:30', timeframe: 'H1', strategy: 'RTM Supply Zone', pair: 'EURUSD', entryPrice: 1.0854, stopLoss: 1.0840, takeProfit: 1.0890, result: 'profit', gainLossAmount: 120, notes: 'ورود بر اساس واگرایی و برخورد به ناحیه تقاضا در چارت یک ساعته' },
      { id: '2', dateTime: '2026-05-29T10:15', timeframe: 'M15', strategy: 'ICT Orderblock', pair: 'GBPUSD', entryPrice: 1.2650, stopLoss: 1.2665, takeProfit: 1.2600, result: 'loss', gainLossAmount: -45, notes: 'حد ضرر خورد. واکنش فیک به بلاک معاملاتی' }
    ];
  });

  const [transactions, setTransactions] = useState<ExpenseIncomeItem[]>(() => {
    const data = localStorage.getItem(KEYS.TXS);
    return data ? JSON.parse(data) : [
      { id: '1', type: 'expense', title: 'تمدید اشتراک بروکر ارز دیجیتال', amount: 450000, category: 'تجارت و سرمایه', date: '2026-05-20' },
      { id: '2', type: 'income', title: 'تسویه سود پوزیشن طلا', amount: 1850000, category: 'سود معامله‌گری', date: '2026-05-25' }
    ];
  });

  const [assets, setAssets] = useState<AssetRecord[]>(() => {
    const data = localStorage.getItem(KEYS.ASSETS);
    return data ? JSON.parse(data) : [
      { id: '1', name: 'طلای ۱۸ عیار آب‌شده', value: 35000000, date: '2026-05-10' },
      { id: '2', name: 'صندوق بورس هم‌وزن', value: 12000000, date: '2026-05-20' },
      { id: '3', name: 'صندوق درآمد ثابت', value: 20000000, date: '2026-05-29' }
    ];
  });

  const [loans, setLoans] = useState<LoanItem[]>(() => {
    const data = localStorage.getItem(KEYS.LOANS);
    return data ? JSON.parse(data) : [
      { id: '1', title: 'وام مسکن جوانان', amount: 120000000, installmentsCount: 36, installmentsPaid: 10, monthlyPaymentDay: 5, monthlyPaymentAmount: 3333333, notes: 'وثیقه سند ملکی پدری' }
    ];
  });

  const [debtClaims, setDebtClaims] = useState<DebtClaimItem[]>(() => {
    const data = localStorage.getItem(KEYS.DEBT_CLAIMS);
    return data ? JSON.parse(data) : [
      { id: '1', type: 'debt', person: 'علی صادقی', amount: 1500000, notes: 'قرض بابت سرویس خودرو تا دهم خرداد', date: '2026-05-24' },
      { id: '2', type: 'claim', person: 'خانم عباسی (همکار)', amount: 4800000, notes: 'طلب بابت طراحی رابط کاربری فرانت', date: '2026-05-26' }
    ];
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const data = localStorage.getItem(KEYS.HABITS);
    return data ? JSON.parse(data) : [
      { id: '1', title: 'مراقبه و تنفس عمیق ۵ دقیقه صبحگاهی', frequency: 'daily', createdAt: '2026-05-20', streak: 4, history: {} },
      { id: '2', title: 'بک‌تست ۳۰ دقیقه استراتژی قبل از بازار لندن', frequency: 'daily', createdAt: '2026-05-22', streak: 2, history: {} }
    ];
  });

  const [tasks, setTasks] = useState<DayTask[]>(() => {
    const data = localStorage.getItem(KEYS.TASKS);
    return data ? JSON.parse(data) : [
      { id: '1', title: 'تحلیل هفتگی شاخص دلار و انس طلا بر چارت دیلی', day: 'today', time: '10:00', hasAlarm: true, completed: false, missed: false, createdAt: '2026-05-29' },
      { id: '2', title: 'ثبت خروجی معاملات فروردین جهت تحویل حسابدار', day: 'tomorrow', hasAlarm: false, completed: false, missed: false, createdAt: '2026-05-29' }
    ];
  });

  const [reminders, setReminders] = useState<GeneralReminder[]>(() => {
    const data = localStorage.getItem(KEYS.REMINDERS);
    return data ? JSON.parse(data) : [
      { id: '1', title: 'پرداخت قسط وام مسكن جوانان', date: '2026-06-05', time: '12:00', completed: false }
    ];
  });

  const [ideas, setIdeas] = useState<StickyIdea[]>(() => {
    const data = localStorage.getItem(KEYS.IDEAS);
    return data ? JSON.parse(data) : [
      { id: '1', title: 'توسعه اسکریپت آلارم کراس میانگین متحرک متاتریدر', estimatedHours: 8, description: 'کدنویسی اندیکاتور با MQL5 برای جفت ارز یورو به دلار جهت ارسال سیگنال مستقیم تلگرام', status: 'idea', elapsedSeconds: 0, isRunning: false }
    ];
  });

  const [games, setGames] = useState<GameItem[]>(() => {
    const data = localStorage.getItem(KEYS.GAMES);
    return data ? JSON.parse(data) : [
      { id: '1', title: 'The Witcher 3: Wild Hunt', status: 'completed_no_achievements', notes: 'بازی حماسی فوق‌العاده. به سختی استوری لاین تمام شد.' }
    ];
  });

  const [serials, setSerials] = useState<SerialMovieItem[]>(() => {
    const data = localStorage.getItem(KEYS.SERIALS);
    return data ? JSON.parse(data) : [
      { id: '1', title: 'Breaking Bad', status: 'watched', notes: 'بی‌نقص‌ترین داستان درام و تکامل کرکتر زنده.' }
    ];
  });

  // --- Global Alarm States ---
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);
  const [mathAlarmTask, setMathAlarmTask] = useState<DayTask | null>(null);
  const [normalAlarmTask, setNormalAlarmTask] = useState<DayTask | null>(null);
  const [activeNotification, setActiveNotification] = useState<{ id: string; title: string; desc: string } | null>(null);

  // Math puzzle state
  const [mathNum1, setMathNum1] = useState(12);
  const [mathNum2, setMathNum2] = useState(7);
  const [mathUserAnswer, setMathUserAnswer] = useState('');
  const [solvedCount, setSolvedCount] = useState(0);
  const [emergencyConfirm, setEmergencyConfirm] = useState(false);
  const [rungIds, setRungIds] = useState<string[]>([]);

  const alarmAudioIntervalRef = useRef<any>(null);
  const alarmAudioCtxRef = useRef<any>(null);

  // pre-init & unlock AudioContext on any screen touch/gesture to bypass browser user gesture blocks
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          if (!alarmAudioCtxRef.current) {
            const ctx = new AudioCtxClass();
            alarmAudioCtxRef.current = ctx;
            if (ctx.state === 'suspended') {
              ctx.resume().catch(() => {});
            }
          } else if (alarmAudioCtxRef.current.state === 'suspended') {
            alarmAudioCtxRef.current.resume().catch(() => {});
          }
        }
      } catch (e) {
        console.warn('Web Audio Context unlock deferred:', e);
      }
      
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const startLoopingAlarmSound = () => {
    if (alarmAudioIntervalRef.current) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      
      let ctx = alarmAudioCtxRef.current;
      if (!ctx || ctx.state === 'closed') {
        ctx = new AudioCtxClass();
        alarmAudioCtxRef.current = ctx;
      }
      
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const playDoubleBeep = () => {
        if (!ctx || ctx.state === 'closed') return;
        
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.frequency.setValueAtTime(1046.50, ctx.currentTime);
        gain1.gain.setValueAtTime(0.5, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.2);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.25);
        gain2.gain.setValueAtTime(0.55, ctx.currentTime + 0.25);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc2.start(ctx.currentTime + 0.25);
        osc2.stop(ctx.currentTime + 0.45);
      };

      playDoubleBeep();
      alarmAudioIntervalRef.current = setInterval(playDoubleBeep, 1000);
    } catch (err) {
      console.warn('Failed to start looping alarm audio:', err);
    }
  };

  const stopLoopingAlarmSound = () => {
    if (alarmAudioIntervalRef.current) {
      clearInterval(alarmAudioIntervalRef.current);
      alarmAudioIntervalRef.current = null;
    }
    if (alarmAudioCtxRef.current && alarmAudioCtxRef.current.state === 'running') {
      try {
        alarmAudioCtxRef.current.suspend().catch(() => {});
      } catch (e) {}
    }
  };

  // Listen to active overlays and start/stop looping alarm sound
  useEffect(() => {
    if (mathAlarmTask || normalAlarmTask) {
      startLoopingAlarmSound();
    } else {
      stopLoopingAlarmSound();
    }
    return () => {
      stopLoopingAlarmSound();
    };
  }, [mathAlarmTask, normalAlarmTask]);

  // Generate a math question
  const generateMathQuestion = () => {
    const n1 = Math.floor(Math.random() * 80) + 11;
    const n2 = Math.floor(Math.random() * 7) + 3;
    setMathNum1(n1);
    setMathNum2(n2);
    setMathUserAnswer('');
  };

  // Turn Alarm sound/simulation on
  const handleTriggerAlarm = (task: DayTask) => {
    const type = task.alarmType || 'none';
    if (type === 'math') {
      setMathAlarmTask(task);
      setSolvedCount(0);
      generateMathQuestion();
    } else if (type === 'normal') {
      setNormalAlarmTask(task);
    } else if (type === 'notification') {
      setActiveNotification({
        id: task.id,
        title: 'اعلان صوتی تمرکزی فانی (Local Notification)',
        desc: `زمان انجام تسک فرا رسید: ${task.title}`
      });
    }

    // Play synthesized pitch
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {}
  };

  const handleTriggerHabitAlarm = (h: Habit) => {
    const localTodayISO = new Date().toISOString().slice(0, 10);
    const tempTask: DayTask = {
      id: h.id,
      title: `عادت: ${h.title}`,
      day: 'today',
      time: h.time,
      alarmType: h.alarmType || 'none',
      deadlineTime: h.deadlineTime,
      completed: !!h.history[localTodayISO],
      missed: false,
      hasAlarm: !!(h.alarmType && h.alarmType !== 'none'),
      createdAt: h.createdAt
    };
    handleTriggerAlarm(tempTask);
  };

  const handleVerifyAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    const correctVal = mathNum1 * mathNum2;
    if (parseInt(mathUserAnswer, 10) === correctVal) {
      const nextCount = solvedCount + 1;
      setSolvedCount(nextCount);
      if (nextCount >= 2) {
        setMathAlarmTask(null);
        alert('مسائل ریاضی با موفقیت حل شدند! زنگ خواب‌شکن خاموش گردید.');
      } else {
        generateMathQuestion();
      }
    } else {
      alert('پاسخ اشتباه است! تفکر کنید و مجدداً حساب کنید.');
      setMathUserAnswer('');
    }
  };

  // Foreground JS Timer-checker fallback
  useEffect(() => {
    const checkOverdueAndAlerts = () => {
      const now = new Date();
      const currentHourMin = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const localTodayISO = now.toISOString().slice(0, 10);
      
      // Update missed tasks if they passed the deadline time
      tasks.forEach(t => {
        if (!t.completed && !t.missed && t.day === 'today' && t.deadlineTime) {
          if (currentHourMin > t.deadlineTime) {
            t.missed = true;
          }
        }
      });

      // Automatically trigger alarm if current time matches scheduled time
      tasks.forEach(t => {
        if (!t.completed && !t.missed && t.day === 'today' && t.time && t.alarmType && t.alarmType !== 'none') {
          if (currentHourMin === t.time && !rungIds.includes(t.id)) {
            setRungIds(prev => [...prev, t.id]);
            handleTriggerAlarm(t);
          }
        }
      });

      // Automatically trigger habits alarm if current time matches scheduled time
      habits.forEach(h => {
        const isCompleted = !!h.history[localTodayISO];
        const isMissed = h.deadlineTime ? (currentHourMin > h.deadlineTime) : false;
        
        if (!isCompleted && !isMissed && h.time && h.alarmType && h.alarmType !== 'none') {
          const habitKey = `${h.id}_${localTodayISO}`;
          if (currentHourMin === h.time && !rungIds.includes(habitKey)) {
            setRungIds(prev => [...prev, habitKey]);
            handleTriggerHabitAlarm(h);
          }
        }
      });
    };

    const interval = setInterval(checkOverdueAndAlerts, 10000);
    return () => clearInterval(interval);
  }, [tasks, habits, rungIds]);

  // Asynchronous persistent Capacitor Preference Loader
  useEffect(() => {
    const loadCapacitorData = async () => {
      try {
        const darkModeVal = await Preferences.get({ key: 'zenith_darkMode' });
        if (darkModeVal.value !== null) {
          setDarkMode(darkModeVal.value === 'true');
        }

        const tradesVal = await Preferences.get({ key: KEYS.TRADES });
        if (tradesVal.value) setTrades(JSON.parse(tradesVal.value));

        const txsVal = await Preferences.get({ key: KEYS.TXS });
        if (txsVal.value) setTransactions(JSON.parse(txsVal.value));

        const assetsVal = await Preferences.get({ key: KEYS.ASSETS });
        if (assetsVal.value) setAssets(JSON.parse(assetsVal.value));

        const loansVal = await Preferences.get({ key: KEYS.LOANS });
        if (loansVal.value) setLoans(JSON.parse(loansVal.value));

        const debtClaimsVal = await Preferences.get({ key: KEYS.DEBT_CLAIMS });
        if (debtClaimsVal.value) setDebtClaims(JSON.parse(debtClaimsVal.value));

        const habitsVal = await Preferences.get({ key: KEYS.HABITS });
        if (habitsVal.value) setHabits(JSON.parse(habitsVal.value));

        const tasksVal = await Preferences.get({ key: KEYS.TASKS });
        if (tasksVal.value) setTasks(JSON.parse(tasksVal.value));

        const remindersVal = await Preferences.get({ key: KEYS.REMINDERS });
        if (remindersVal.value) setReminders(JSON.parse(remindersVal.value));

        const ideasVal = await Preferences.get({ key: KEYS.IDEAS });
        if (ideasVal.value) setIdeas(JSON.parse(ideasVal.value));

        const gamesVal = await Preferences.get({ key: KEYS.GAMES });
        if (gamesVal.value) setGames(JSON.parse(gamesVal.value));

        const serialsVal = await Preferences.get({ key: KEYS.SERIALS });
        if (serialsVal.value) setSerials(JSON.parse(serialsVal.value));
        
        console.log('Mobile persistence layer synchronized successfully!');
      } catch (err) {
        console.warn('Capacitor native storage preferences check bypassed:', err);
      }
    };

    // Request permissions for background notifications on load and setup listeners
    const requestNotificationPermission = async () => {
      try {
        const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;
        if (isCapacitor) {
          const perm = await LocalNotifications.checkPermissions();
          if (perm.display !== 'granted') {
            await LocalNotifications.requestPermissions();
          }

          // Create standard high-priority alarm channel for Android
          await LocalNotifications.createChannel({
            id: 'zenith-alarms',
            name: 'شدت مغناطیسی زنیت (Alarms)',
            description: 'طنین بیدارباش‌های شناختی هوشمند زنیت',
            importance: 5, // High/Max importance to wake phone and pop up
            visibility: 1, // Visible on secure lockscreens
            sound: 'beep.wav',
            vibration: true,
            lights: true
          });

          // Remove any previous hook listeners to avoid duplication during React mounts
          try {
            await LocalNotifications.removeAllListeners();
          } catch (e) {}

          // Add clicked notification handling (extremely durable when app is killed)
          await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
            console.log('Local Notification Action Performed clicked:', action);
            const extra = action.notification?.extra;
            if (extra && extra.alarmType && extra.alarmType !== 'none') {
              const tempTask: DayTask = {
                id: extra.id || Date.now().toString(),
                title: extra.title || 'بیدارباش زنیت',
                day: 'today',
                time: extra.time,
                alarmType: extra.alarmType,
                completed: false,
                missed: false,
                hasAlarm: true,
                createdAt: ''
              };
              handleTriggerAlarm(tempTask);
            }
          });

          // Handle foreground notification arrival with instant popup
          await LocalNotifications.addListener('localNotificationReceived', (notification) => {
            console.log('Local Notification Received in foreground:', notification);
            const extra = notification.extra;
            if (extra && extra.alarmType && extra.alarmType !== 'none') {
              const tempTask: DayTask = {
                id: extra.id || Date.now().toString(),
                title: extra.title || 'بیدارباش زنیت',
                day: 'today',
                time: extra.time,
                alarmType: extra.alarmType,
                completed: false,
                missed: false,
                hasAlarm: true,
                createdAt: ''
              };
              handleTriggerAlarm(tempTask);
            }
          });
        }
      } catch (err) {
        console.warn('Native local notification initialization failed or was rejected:', err);
      }
    };

    loadCapacitorData();
    requestNotificationPermission();
  }, []);

  // Check expiration of all tasks with actual device time
  const checkAllTasksExpiration = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const currentHourMin = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setTasks(prevTasks => {
      let updated = false;
      const nextTasks = prevTasks.map(t => {
        if (!t.completed && !t.missed) {
          if (t.createdAt < todayStr) {
            if (t.day === 'tomorrow') {
              updated = true;
              return { ...t, day: 'today', createdAt: todayStr };
            } else {
              updated = true;
              return { ...t, missed: true };
            }
          }
          if (t.day === 'today' && t.deadlineTime && currentHourMin > t.deadlineTime) {
            updated = true;
            return { ...t, missed: true };
          }
        }
        return t;
      });
      return updated ? nextTasks : prevTasks;
    });
  };

  // Capacitor App Lifecycle: Check task expiration when returning from background (onResume)
  useEffect(() => {
    let appStateListener: any = null;

    try {
      const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;
      if (isCapacitor) {
        appStateListener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            checkAllTasksExpiration();
          }
        });
      }
    } catch (e) {
      console.warn('App state listener register bypassed:', e);
    }

    // Run expiration check once on mounting as well
    checkAllTasksExpiration();

    return () => {
      if (appStateListener) {
        appStateListener.then((h: any) => h.remove()).catch(() => {});
      }
    };
  }, []);

  // Sync background/system alarms for Tasks
  const syncTaskNotifications = async (currentTasks: DayTask[]) => {
    try {
      const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;
      if (!isCapacitor) return;

      const pending = await LocalNotifications.getPending();
      // Filter task-related alarms (IDs under 100000)
      const tasksPending = pending.notifications.filter(n => n.id < 200000);
      if (tasksPending.length > 0) {
        await LocalNotifications.cancel({
          notifications: tasksPending.map(n => ({ id: n.id }))
        });
      }

      const now = new Date();
      const toSchedule: any[] = [];

      currentTasks.forEach((task, index) => {
        if (!task.completed && !task.missed && task.alarmType && task.alarmType !== 'none' && task.time) {
          const targetDate = new Date();
          const [hours, minutes] = task.time.split(':').map(Number);
          targetDate.setHours(hours, minutes, 0, 0);

          if (task.day === 'tomorrow') {
            targetDate.setDate(targetDate.getDate() + 1);
          } else {
            if (targetDate <= now) {
              return; // Already past for today
            }
          }

          let numericId = 1000 + index;
          if (!isNaN(Number(task.id))) {
            numericId = parseInt(task.id, 10);
          } else {
            let hash = 0;
            for (let i = 0; i < task.id.length; i++) {
              hash = task.id.charCodeAt(i) + ((hash << 5) - hash);
            }
            numericId = Math.abs(hash % 100000);
          }

          toSchedule.push({
            title: "⏰ یادآور تسک: " + task.title,
            body: `زمان انجام تسک فرا رسید (${task.time}) - نوع هشدار: ${
              task.alarmType === 'math' ? 'هوشمند محاسباتی ریاضی' : 'خواب‌شکن معمولی'
            }`,
            id: numericId,
            schedule: { at: targetDate },
            sound: 'beep.wav',
            channelId: 'zenith-alarms',
            extra: {
              type: 'task',
              id: task.id,
              alarmType: task.alarmType,
              title: task.title,
              time: task.time
            }
          });
        }
      });

      if (toSchedule.length > 0) {
        await LocalNotifications.schedule({
          notifications: toSchedule
        });
      }
    } catch (err) {
      console.warn('Failed to sync local notifications via Capacitor:', err);
    }
  };

  // Sync background/system alarms for Reminders
  const syncReminderNotifications = async (currentReminders: GeneralReminder[]) => {
    try {
      const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;
      if (!isCapacitor) return;

      const pending = await LocalNotifications.getPending();
      const reminderPending = pending.notifications.filter(n => n.id >= 200000 && n.id < 300000);
      if (reminderPending.length > 0) {
        await LocalNotifications.cancel({
          notifications: reminderPending.map(n => ({ id: n.id }))
        });
      }

      const now = new Date();
      const toSchedule: any[] = [];

      currentReminders.forEach((rem, index) => {
        if (!rem.completed && rem.date && rem.time) {
          const targetDate = new Date(`${rem.date}T${rem.time}:00`);

          if (targetDate > now) {
            let numericId = 200000 + index;
            if (!isNaN(Number(rem.id))) {
              numericId = 200000 + parseInt(rem.id, 10);
            } else {
              let hash = 0;
              for (let i = 0; i < rem.id.length; i++) {
                hash = rem.id.charCodeAt(i) + ((hash << 5) - hash);
              }
              numericId = 200000 + (Math.abs(hash) % 50000);
            }

            toSchedule.push({
              title: "🔔 یادداشت یادآوری: " + rem.title,
              body: `ساعت زمان‌بندی یادآور به صندوقچه رسید: ${rem.time}`,
              id: numericId,
              schedule: { at: targetDate },
              sound: 'beep.wav',
              channelId: 'zenith-alarms',
              extra: {
                type: 'reminder',
                id: rem.id,
                alarmType: 'normal',
                title: rem.title,
                time: rem.time
              }
            });
          }
        }
      });

      if (toSchedule.length > 0) {
        await LocalNotifications.schedule({
          notifications: toSchedule
        });
      }
    } catch (err) {
      console.warn('Failed to sync reminder notifications via Capacitor:', err);
    }
  };

  // Sync background/system alarms for Habits
  const syncHabitNotifications = async (currentHabits: Habit[]) => {
    try {
      const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;
      if (!isCapacitor) return;

      const pending = await LocalNotifications.getPending();
      const habitsPending = pending.notifications.filter(n => n.id >= 300000 && n.id < 400000);
      if (habitsPending.length > 0) {
        await LocalNotifications.cancel({
          notifications: habitsPending.map(n => ({ id: n.id }))
        });
      }

      const now = new Date();
      const localTodayISO = now.toISOString().slice(0, 10);
      const toSchedule: any[] = [];

      currentHabits.forEach((habit, index) => {
        if (habit.alarmType && habit.alarmType !== 'none' && habit.time) {
          const isCompletedToday = !!habit.history[localTodayISO];
          
          const targetDate = new Date();
          const [hours, minutes] = habit.time.split(':').map(Number);
          targetDate.setHours(hours, minutes, 0, 0);

          if (isCompletedToday || targetDate <= now) {
            targetDate.setDate(targetDate.getDate() + 1);
          }

          let numericId = 300000 + index;
          if (!isNaN(Number(habit.id))) {
            numericId = 300000 + parseInt(habit.id, 10);
          } else {
            let hash = 0;
            for (let i = 0; i < habit.id.length; i++) {
              hash = habit.id.charCodeAt(i) + ((hash << 5) - hash);
            }
            numericId = 300000 + (Math.abs(hash) % 100000);
          }

          toSchedule.push({
            title: "⏰ یادآور عادت: " + habit.title,
            body: `نوبت استمرار عادت روزانه فرا رسید (${habit.time}) - نوع هشدار: ${
              habit.alarmType === 'math' ? 'هوشمند محاسباتی ریاضی' : 'خواب‌شکن معمولی'
            }`,
            id: numericId,
            schedule: { at: targetDate },
            sound: 'beep.wav',
            channelId: 'zenith-alarms',
            extra: {
              type: 'habit',
              id: habit.id,
              alarmType: habit.alarmType,
              title: habit.title,
              time: habit.time
            }
          });
        }
      });

      if (toSchedule.length > 0) {
        await LocalNotifications.schedule({
          notifications: toSchedule
        });
      }
    } catch (err) {
      console.warn('Failed to sync habit notifications via Capacitor:', err);
    }
  };

  // Watchers to synchronize core databases to offline localStorage automatically
  useEffect(() => {
    localStorage.setItem(KEYS.TRADES, JSON.stringify(trades));
    Preferences.set({ key: KEYS.TRADES, value: JSON.stringify(trades) }).catch(() => {});
  }, [trades]);

  useEffect(() => {
    localStorage.setItem(KEYS.TXS, JSON.stringify(transactions));
    Preferences.set({ key: KEYS.TXS, value: JSON.stringify(transactions) }).catch(() => {});
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(KEYS.ASSETS, JSON.stringify(assets));
    Preferences.set({ key: KEYS.ASSETS, value: JSON.stringify(assets) }).catch(() => {});
  }, [assets]);

  useEffect(() => {
    localStorage.setItem(KEYS.LOANS, JSON.stringify(loans));
    Preferences.set({ key: KEYS.LOANS, value: JSON.stringify(loans) }).catch(() => {});
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(KEYS.DEBT_CLAIMS, JSON.stringify(debtClaims));
    Preferences.set({ key: KEYS.DEBT_CLAIMS, value: JSON.stringify(debtClaims) }).catch(() => {});
  }, [debtClaims]);

  useEffect(() => {
    localStorage.setItem(KEYS.HABITS, JSON.stringify(habits));
    Preferences.set({ key: KEYS.HABITS, value: JSON.stringify(habits) }).catch(() => {});
    syncHabitNotifications(habits);
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    Preferences.set({ key: KEYS.TASKS, value: JSON.stringify(tasks) }).catch(() => {});
    syncTaskNotifications(tasks);
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
    Preferences.set({ key: KEYS.REMINDERS, value: JSON.stringify(reminders) }).catch(() => {});
    syncReminderNotifications(reminders);
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(KEYS.IDEAS, JSON.stringify(ideas));
    Preferences.set({ key: KEYS.IDEAS, value: JSON.stringify(ideas) }).catch(() => {});
  }, [ideas]);

  useEffect(() => {
    localStorage.setItem(KEYS.GAMES, JSON.stringify(games));
    Preferences.set({ key: KEYS.GAMES, value: JSON.stringify(games) }).catch(() => {});
  }, [games]);

  useEffect(() => {
    localStorage.setItem(KEYS.SERIALS, JSON.stringify(serials));
    Preferences.set({ key: KEYS.SERIALS, value: JSON.stringify(serials) }).catch(() => {});
  }, [serials]);

  // Methods inside Journal
  const handleAddTrade = (newTrade: Omit<TradeLog, 'id'>) => {
    const t: TradeLog = {
      ...newTrade,
      id: Date.now().toString()
    };
    setTrades([t, ...trades]);
  };

  const handleUpdateTrade = (id: string, updates: Partial<TradeLog>) => {
    setTrades(trades.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDeleteTrade = (id: string) => {
    setTrades(trades.filter(t => t.id !== id));
  };

  // Finance Operations
  const handleAddTx = (newTx: Omit<ExpenseIncomeItem, 'id'>) => {
    setTransactions([{ ...newTx, id: Date.now().toString() }, ...transactions]);
  };

  const handleDeleteTx = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleAddAsset = (newAsset: Omit<AssetRecord, 'id'>) => {
    setAssets([{ ...newAsset, id: Date.now().toString() }, ...assets]);
  };

  const handleUpdateAsset = (id: string, updates: Partial<AssetRecord>) => {
    setAssets(assets.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const handleAddLoan = (newLoan: Omit<LoanItem, 'id'>) => {
    setLoans([{ ...newLoan, id: Date.now().toString() }, ...loans]);
  };

  const handlePayLoanInstallment = (id: string) => {
    setLoans(loans.map(l => {
      if (l.id === id) {
        return {
          ...l,
          installmentsPaid: Math.min(l.installmentsCount, l.installmentsPaid + 1)
        };
      }
      return l;
    }));
  };

  const handleDeleteLoan = (id: string) => {
    setLoans(loans.filter(l => l.id !== id));
  };

  const handleAddDebtClaim = (newItem: Omit<DebtClaimItem, 'id'>) => {
    setDebtClaims([{ ...newItem, id: Date.now().toString() }, ...debtClaims]);
  };

  const handleDeleteDebtClaim = (id: string) => {
    setDebtClaims(debtClaims.filter(c => c.id !== id));
  };

  // Habits Operations
  const handleAddHabit = (
    title: string,
    frequency: 'daily' | 'weekly',
    time?: string,
    deadlineTime?: string,
    alarmType?: 'math' | 'normal' | 'notification' | 'none'
  ) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      title,
      frequency,
      createdAt: new Date().toISOString().slice(0, 10),
      streak: 0,
      history: {},
      time,
      deadlineTime,
      hasAlarm: !!alarmType && alarmType !== 'none',
      alarmType
    };
    setHabits([...habits, newHabit]);
  };

  const handleToggleHabit = (id: string, date: string) => {
    setHabits(habits.map(h => {
      if (h.id === id) {
        const historyCopy = { ...h.history };
        const currentlyCompleted = !!historyCopy[date];
        if (currentlyCompleted) {
          delete historyCopy[date];
        } else {
          historyCopy[date] = true;
        }
        return {
          ...h,
          history: historyCopy,
          streak: currentlyCompleted ? Math.max(0, h.streak - 1) : h.streak + 1
        };
      }
      return h;
    }));
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  // Tasks Operations
  const handleAddTask = (newTask: Omit<DayTask, 'id' | 'completed' | 'missed' | 'createdAt'>) => {
    setTasks([...tasks, {
      ...newTask,
      id: Date.now().toString(),
      completed: false,
      missed: false,
      createdAt: new Date().toISOString().slice(0, 10)
    }]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        const now = new Date();
        const completedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        return { 
          ...t, 
          completed: nextCompleted, 
          completedAt: nextCompleted ? completedTime : undefined,
          missed: false 
        };
      }
      return t;
    }));
  };

  const handleArchiveTodayTasks = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setTasks(tasks.map(t => {
      if (t.day === 'today' && !t.archived) {
        return {
          ...t,
          archived: true,
          archivedAt: todayStr
        };
      }
      return t;
    }));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Reminders Operations
  const handleAddReminder = (newRem: Omit<GeneralReminder, 'id' | 'completed'>) => {
    setReminders([...reminders, {
      ...newRem,
      id: Date.now().toString(),
      completed: false
    }]);
  };

  const handleToggleReminder = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  // Ideas Operations
  const handleAddIdea = (title: string, estimate: number, desc: string) => {
    setIdeas([...ideas, {
      id: Date.now().toString(),
      title,
      estimatedHours: estimate,
      description: desc,
      status: 'idea',
      elapsedSeconds: 0,
      isRunning: false
    }]);
  };

  const handleUpdateIdea = (id: string, updates: Partial<StickyIdea>) => {
    setIdeas(ideas.map(idea => idea.id === id ? { ...idea, ...updates } : idea));
  };

  const handleDeleteIdea = (id: string) => {
    setIdeas(ideas.filter(idea => idea.id !== id));
  };

  // Games & TV Series Media Shelf
  const handleAddGame = (item: Omit<GameItem, 'id'>) => {
    setGames([...games, { ...item, id: Date.now().toString() }]);
  };

  const handleDeleteGame = (id: string) => {
    setGames(games.filter(g => g.id !== id));
  };

  const handleAddSerial = (item: Omit<SerialMovieItem, 'id'>) => {
    setSerials([...serials, { ...item, id: Date.now().toString() }]);
  };

  const handleDeleteSerial = (id: string) => {
    setSerials(serials.filter(s => s.id !== id));
  };

  const handleImportAllData = (data: any) => {
    if (data.trades) setTrades(data.trades);
    if (data.transactions) setTransactions(data.transactions);
    if (data.assets) setAssets(data.assets);
    if (data.loans) setLoans(data.loans);
    if (data.debtClaims) setDebtClaims(data.debtClaims);
    if (data.habits) setHabits(data.habits);
    if (data.tasks) {
      setTasks(data.tasks);
      syncTaskNotifications(data.tasks);
    }
    if (data.reminders) {
      setReminders(data.reminders);
      syncReminderNotifications(data.reminders);
    }
    if (data.ideas) setIdeas(data.ideas);
    if (data.games) setGames(data.games);
    if (data.serials) setSerials(data.serials);
  };

  // Sidebar navigation mapping helper
  const tabsConfig = [
    { key: 'dashboard', label: 'داشبورد کنترل ارشد', description: 'نظارت کلی بر انضباط، عادات و ثروت', icon: <LayoutGrid size={16} /> },
    { key: 'journal', label: 'ژورنال معامله‌گری', description: 'ثبت ترید و فیلتر دقیق عملکرد', icon: <BookOpen size={16} /> },
    { key: 'focus', label: 'اتاق تمرکز زنده', description: 'ساعت پومودورو، سکوت و لیست انتخابی', icon: <Sparkles size={16} /> },
    { key: 'financial', label: 'برنامه‌ریزی اقتصادی', description: 'ویرایش دارایی، اقساط وام و دیون', icon: <DollarSign size={16} /> },
    { key: 'habits', label: 'دفتر عادات و تسک', description: 'تقویم عادات، نمودار عملکرد و زنگ هوشمند', icon: <Award size={16} /> },
    { key: 'ideas', label: 'صندوقچه‌ ایده‌ها', description: 'طرح، پیاده‌سازی و زمان‌سنج پیش‌رفت', icon: <StickyNote size={16} /> },
    { key: 'games', label: 'قفسه بازی و فیلم', description: 'آرشیو دسته‌بندی سرگرمی و گیمینگ', icon: <Gamepad2 size={16} /> },
    { key: 'settings', label: 'تنظیمات و پشتیبان‌گیری', description: 'دانلود فایل پشتیبان دیتابیس گوشی', icon: <Sliders size={16} /> }
  ] as const;

  const currentTabIndex = tabsConfig.findIndex((t: any) => t.key === activeTab);
  const prevTab = currentTabIndex > 0 ? tabsConfig[currentTabIndex - 1] : null;
  const nextTab = currentTabIndex < tabsConfig.length - 1 ? tabsConfig[currentTabIndex + 1] : null;

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-indigo-600/30 selection:text-indigo-400 antialiased transition-colors duration-300 ${
      darkMode ? 'dark bg-[#070913] text-[#f1f3f9]' : 'bg-[#fafbfe] text-slate-900'
    }`}>
      
      {/* Decorative background gradients for glass look */}
      <div className="fixed top-[-250px] left-[-200px] w-[600px] h-[600px] rounded-full bg-indigo-600/5 dark:bg-indigo-505/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-200px] right-[-150px] w-[500px] h-[500px] rounded-full bg-amber-500/3 dark:bg-amber-505/3 blur-[120px] pointer-events-none z-0" />

      {/* Dynamic minimalist system status top flag bar */}
      <header className={`border-b px-6 py-3 flex items-center justify-between transition-all duration-300 relative z-10 ${
        darkMode ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md' : 'bg-white/90 border-slate-150 backdrop-blur-md shadow-sm'
      }`} dir="rtl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-display font-black text-lg shadow-lg shadow-indigo-500/10 select-none">
            Z
          </div>
          <span className="text-sm font-black font-display tracking-tight text-slate-850 dark:text-slate-100">
            اتاق کار زنیت
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Dark Mode Switcher */}
          <button 
            onClick={handleToggleDarkMode}
            className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center shadow-sm ${
              darkMode 
                ? 'bg-slate-800/80 border-slate-750 text-amber-400 hover:bg-slate-800 hover:text-amber-300' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
            title={darkMode ? 'تم روشن' : 'تم تیره'}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* Main body split layouts */}
      <div className="flex-1 flex flex-col md:flex-row relative z-10">
        
        {/* Mobile current active tab header banner (Elegant first-class UX) */}
        <div className={`md:hidden sticky top-0 z-30 flex items-center justify-between p-3.5 border-b shadow-sm backdrop-blur-md transition-all duration-300 ${
          darkMode ? 'bg-slate-950/95 border-slate-850/80 text-white' : 'bg-white/95 border-slate-150 text-slate-905'
        }`} dir="rtl">
          <div className="flex items-center gap-3">
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              darkMode ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
            }`}>
              {tabsConfig.find(tab => tab.key === activeTab)?.icon}
            </span>
            <div className="text-right">
              <h2 className="text-xs font-black font-display leading-tight">
                {tabsConfig.find(tab => tab.key === activeTab)?.label}
              </h2>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 max-w-[190px] truncate">
                {tabsConfig.find(tab => tab.key === activeTab)?.description}
              </span>
            </div>
          </div>

          <button 
            onClick={() => setShowMobileMoreMenu(true)}
            className={`px-3 py-1.5 h-8 rounded-full text-[10px] font-black border transition-all flex items-center gap-1 active:scale-95 cursor-pointer shrink-0 ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-350 hover:text-white' : 'bg-zinc-100 border-zinc-200 text-slate-750 hover:bg-zinc-200'
            }`}
          >
            <span>بخش‌ها</span>
            <span className="text-xs">▾</span>
          </button>
        </div>

        {/* Right sidebars - tab selectors and system controls (Hidden on mobile, beautiful layout for desktop) */}
        <nav className={`hidden md:flex w-full md:w-[270px] border-b md:border-b-0 md:border-l p-5 shrink-0 flex-col justify-between text-right transition-all duration-300 ${
          darkMode ? 'bg-[#0b0e1e]/80 border-slate-800/80' : 'bg-[#f7f9fd] border-slate-200/90'
        }`} dir="rtl">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-400/90 dark:text-slate-500 block px-2 select-none">
              محفظه‌های هدایت کاربری
            </span>
            
            <div className="space-y-1.5">
              {tabsConfig.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full p-3 rounded-2xl text-xs font-bold text-right transition-all duration-300 flex items-center justify-between group cursor-pointer border ${
                    activeTab === tab.key 
                      ? (darkMode ? 'bg-indigo-650/15 text-indigo-300 border-indigo-500/40 shadow-lg shadow-indigo-950/20' : 'bg-white text-indigo-700 shadow-md shadow-indigo-100/30 border-indigo-100') 
                      : (darkMode ? 'text-slate-450 border-transparent hover:text-slate-100 hover:bg-slate-900/80' : 'text-slate-650 border-transparent hover:text-slate-900 hover:bg-slate-200/40')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`p-1.5 rounded-xl transition-all duration-300 ${
                      activeTab === tab.key 
                        ? (darkMode ? 'bg-indigo-500/25 text-indigo-400' : 'bg-indigo-50 text-indigo-600') 
                        : (darkMode ? 'text-slate-500 group-hover:text-slate-305' : 'text-slate-400 group-hover:text-slate-950')
                    }`}>
                      {tab.icon}
                    </span>
                    <div className="text-right">
                      <div className="font-extrabold">{tab.label}</div>
                      <div className={`text-[9px] mt-0.5 font-medium ${activeTab === tab.key ? (darkMode ? 'text-indigo-300/80' : 'text-indigo-550') : 'text-slate-400'}`}>
                        {tab.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Minimal info box down sidebar */}
          <div className={`mt-8 border-t pt-4 space-y-3.5 text-right hidden md:block ${
            darkMode ? 'border-slate-850' : 'border-slate-200/60'
          }`}>
            <div className="flex items-start gap-2 text-[9px] text-slate-550 dark:text-slate-400 justify-end leading-relaxed">
              <span className="font-sans leading-relaxed text-[10px]">
                اطلاعات ثبت‌شده شما منحصراً در پایگاه داده داخلی مرورگر شخصی ذخیره شده است. هیچ سرور خارجی اطلاعات حساس شما را ردگیری نمی‌کند.
              </span>
              <Info size={13} className="shrink-0 mt-0.5 text-indigo-500" />
            </div>
            
            <div className="text-[8px] font-black tracking-wider text-indigo-600 dark:text-indigo-400 text-center uppercase">
              ZENITH HIGH PERFORMANCE LABS
            </div>
          </div>
        </nav>

        {/* Central main workspace sections rendering view container */}
        <main className="flex-1 p-5 pb-28 md:pb-5 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardSection 
              trades={trades}
              transactions={transactions}
              assets={assets}
              loans={loans}
              debtClaims={debtClaims}
              habits={habits}
              tasks={tasks}
              reminders={reminders}
              ideas={ideas}
              games={games}
              serials={serials}
              darkMode={darkMode}
              onNavigate={(tab) => setActiveTab(tab)}
              onAddTask={(title, day, time, deadlineTime, alarmType) => handleAddTask({ title, day, time, deadlineTime, alarmType, hasAlarm: alarmType !== 'none' })}
              onAddIdea={(title, description, estimatedHours) => handleAddIdea(title, estimatedHours, description)}
              onToggleHabit={handleToggleHabit}
              onToggleTask={handleToggleTask}
            />
          )}

          {activeTab === 'journal' && (
            <JournalSection 
              trades={trades}
              onAddTrade={handleAddTrade}
              onUpdateTrade={handleUpdateTrade}
              onDeleteTrade={handleDeleteTrade}
              darkMode={darkMode}
            />
          )}

          {activeTab === 'focus' && (
            <FocusSection 
              tasks={tasks}
              darkMode={darkMode}
            />
          )}

          {activeTab === 'financial' && (
            <FinancialSection 
              transactions={transactions}
              assets={assets}
              loans={loans}
              debtClaims={debtClaims}
              onAddTransaction={handleAddTx}
              onDeleteTransaction={handleDeleteTx}
              onAddAsset={handleAddAsset}
              onUpdateAsset={handleUpdateAsset}
              onDeleteAsset={handleDeleteAsset}
              onAddLoan={handleAddLoan}
              onPayLoanInstallment={handlePayLoanInstallment}
              onDeleteLoan={handleDeleteLoan}
              onAddDebtClaim={handleAddDebtClaim}
              onDeleteDebtClaim={handleDeleteDebtClaim}
              darkMode={darkMode}
            />
          )}

          {activeTab === 'habits' && (
            <HabitsSection 
              habits={habits}
              tasks={tasks}
              reminders={reminders}
              onAddHabit={handleAddHabit}
              onToggleHabit={handleToggleHabit}
              onDeleteHabit={handleDeleteHabit}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onAddReminder={handleAddReminder}
              onToggleReminder={handleToggleReminder}
              onDeleteReminder={handleDeleteReminder}
              onArchiveTodayTasks={handleArchiveTodayTasks}
              onTriggerAlarm={handleTriggerAlarm}
              onTriggerHabitAlarm={handleTriggerHabitAlarm}
              darkMode={darkMode}
            />
          )}

          {activeTab === 'ideas' && (
            <IdeasSection 
              ideas={ideas}
              onAddIdea={handleAddIdea}
              onUpdateIdea={handleUpdateIdea}
              onDeleteIdea={handleDeleteIdea}
              darkMode={darkMode}
            />
          )}

          {activeTab === 'games' && (
            <GamesSection 
              games={games}
              serials={serials}
              onAddGame={handleAddGame}
              onDeleteGame={handleDeleteGame}
              onAddSerial={handleAddSerial}
              onDeleteSerial={handleDeleteSerial}
              darkMode={darkMode}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsSection 
              darkMode={darkMode}
              trades={trades}
              transactions={transactions}
              assets={assets}
              loans={loans}
              debtClaims={debtClaims}
              habits={habits}
              tasks={tasks}
              reminders={reminders}
              ideas={ideas}
              games={games}
              serials={serials}
              onImportAllData={handleImportAllData}
            />
          )}

          {/* Quick Mobile Swipe-like Navigation Banners */}
          <div className="md:hidden flex items-center justify-between gap-3 mt-10 pb-12" dir="rtl">
            {prevTab ? (
              <button
                onClick={() => {
                  setActiveTab(prevTab.key);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex-1 p-3.5 rounded-2xl border text-right flex items-center gap-2.5 transition-all text-xs font-bold justify-start cursor-pointer active:scale-95 ${
                  darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-350 hover:text-white' : 'bg-white border-zinc-200 text-slate-650 hover:bg-zinc-50 shadow-sm'
                }`}
              >
                <span className="text-sm font-black text-indigo-500">→</span>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 block font-normal leading-tight">بخش قبلی</span>
                  <span className="font-extrabold text-[11px] leading-tight">
                    {prevTab.key === 'dashboard' ? 'داشبورد' :
                     prevTab.key === 'journal' ? 'ژورنال ترید' :
                     prevTab.key === 'focus' ? 'اتاق تمرکز' :
                     prevTab.key === 'financial' ? 'برنامه مالی' :
                     prevTab.key === 'habits' ? 'عادات و تسک' :
                     prevTab.key === 'ideas' ? 'صندوقچه ایده‌ها' :
                     prevTab.key === 'games' ? 'فیلم و بازی' : 'تنظیمات'}
                  </span>
                </div>
              </button>
            ) : <div className="flex-1" />}

            {nextTab ? (
              <button
                onClick={() => {
                  setActiveTab(nextTab.key);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex-1 p-3.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all text-xs font-bold justify-end cursor-pointer active:scale-95 ${
                  darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-350 hover:text-white' : 'bg-white border-zinc-200 text-slate-650 hover:bg-zinc-50 shadow-sm'
                }`}
              >
                <div className="text-left">
                  <span className="text-[9px] text-slate-400 block font-normal leading-tight">بخش بعدی</span>
                  <span className="font-extrabold text-[11px] leading-tight">
                    {nextTab.key === 'dashboard' ? 'داشبورد' :
                     nextTab.key === 'journal' ? 'ژورنال ترید' :
                     nextTab.key === 'focus' ? 'اتاق تمرکز' :
                     nextTab.key === 'financial' ? 'برنامه مالی' :
                     nextTab.key === 'habits' ? 'عادات و تسک' :
                     nextTab.key === 'ideas' ? 'صندوقچه ایده‌ها' :
                     nextTab.key === 'games' ? 'فیلم و بازی' : 'تنظیمات'}
                  </span>
                </div>
                <span className="text-sm font-black text-indigo-500">←</span>
              </button>
            ) : <div className="flex-1" />}
          </div>
        </main>

      </div>

      {/* Premium Floating Mobile Bottom Navigation Bar / Deck */}
      <div className={`md:hidden fixed bottom-4 left-4 right-4 z-[990] h-16 rounded-3xl border backdrop-blur-lg flex items-center justify-around px-2 shadow-2xl transition-all duration-300 ${
        darkMode ? 'bg-slate-950/90 border-slate-805 text-slate-101 shadow-indigo-950/40' : 'bg-white/95 border-zinc-200/90 text-slate-900 shadow-xl shadow-slate-200/55'
      }`} dir="rtl">
        {/* Dashboard Tab */}
        <button 
          onClick={() => { setActiveTab('dashboard'); setShowMobileMoreMenu(false); }}
          className={`flex flex-col items-center justify-center flex-1 h-full rounded-2xl transition-all active:scale-95 cursor-pointer ${
            activeTab === 'dashboard' && !showMobileMoreMenu
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'text-slate-450 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform ${activeTab === 'dashboard' && !showMobileMoreMenu ? 'scale-110 animate-pulse' : ''}`}>
            <LayoutGrid size={18} />
          </div>
          <span className="text-[9px] mt-0.5 whitespace-nowrap">داشبورد</span>
        </button>

        {/* Journal Tab */}
        <button 
          onClick={() => { setActiveTab('journal'); setShowMobileMoreMenu(false); }}
          className={`flex flex-col items-center justify-center flex-1 h-full rounded-2xl transition-all active:scale-95 cursor-pointer ${
            activeTab === 'journal' && !showMobileMoreMenu
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'text-slate-450 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform ${activeTab === 'journal' && !showMobileMoreMenu ? 'scale-110' : ''}`}>
            <BookOpen size={18} />
          </div>
          <span className="text-[9px] mt-0.5 whitespace-nowrap">ژورنال</span>
        </button>

        {/* Habits Tab */}
        <button 
          onClick={() => { setActiveTab('habits'); setShowMobileMoreMenu(false); }}
          className={`flex flex-col items-center justify-center flex-1 h-full rounded-2xl transition-all active:scale-95 cursor-pointer ${
            activeTab === 'habits' && !showMobileMoreMenu
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'text-slate-450 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform ${activeTab === 'habits' && !showMobileMoreMenu ? 'scale-110' : ''}`}>
            <Award size={18} />
          </div>
          <span className="text-[9px] mt-0.5 whitespace-nowrap">عادات</span>
        </button>

        {/* Focus Tab */}
        <button 
          onClick={() => { setActiveTab('focus'); setShowMobileMoreMenu(false); }}
          className={`flex flex-col items-center justify-center flex-1 h-full rounded-2xl transition-all active:scale-95 cursor-pointer ${
            activeTab === 'focus' && !showMobileMoreMenu
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'text-slate-450 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform ${activeTab === 'focus' && !showMobileMoreMenu ? 'scale-110 animate-bounce' : ''}`}>
            <Sparkles size={18} />
          </div>
          <span className="text-[9px] mt-0.5 whitespace-nowrap">تمرکز</span>
        </button>

        {/* More Menu Tab */}
        <button 
          onClick={() => setShowMobileMoreMenu(!showMobileMoreMenu)}
          className={`flex flex-col items-center justify-center flex-1 h-full rounded-2xl transition-all active:scale-95 cursor-pointer ${
            showMobileMoreMenu
              ? 'text-indigo-600 dark:text-indigo-405 font-extrabold'
              : 'text-slate-455 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-all ${showMobileMoreMenu ? 'scale-110 text-rose-500 rotate-180' : ''}`}>
            <Layers size={18} />
          </div>
          <span className="text-[9px] mt-0.5 whitespace-nowrap">بخش‌ها</span>
        </button>
      </div>

      {/* Floating Mobile More/Drawer fullscreen-overlay */}
      {showMobileMoreMenu && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[990] flex items-end justify-center transition-all animate-fade-in" dir="rtl">
          <div className={`w-full max-h-[85vh] rounded-t-[32px] p-6 shadow-2xl flex flex-col space-y-4 overflow-y-auto mb-0 border-t ${
            darkMode ? 'bg-[#0a0d1e] border-slate-800 text-slate-100' : 'bg-white border-zinc-200 text-slate-900'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-500/10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
                  <Compass size={20} />
                </span>
                <div className="text-right">
                  <h3 className="text-sm font-black font-display leading-tight">پیمایش کامل بخش‌های زنیت</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">بخش مد نظر خود را جهت جابجایی تپ کنید:</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMobileMoreMenu(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all active:scale-95 cursor-pointer ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-zinc-100 border-zinc-250 text-slate-600'
                }`}
              >
                <X size={15} />
              </button>
            </div>

            {/* Grid display of all 8 tabs */}
            <div className="grid grid-cols-2 gap-3 pb-8">
              {tabsConfig.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setShowMobileMoreMenu(false);
                      window.scrollTo({ top: 0, behavior: 'auto' });
                    }}
                    className={`p-4 rounded-2xl border text-right transition-all flex flex-col gap-2 cursor-pointer active:scale-95 ${
                      isActive 
                        ? (darkMode ? 'bg-indigo-650/20 border-indigo-500 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold') 
                        : (darkMode ? 'bg-slate-900/60 border-slate-850 text-slate-350 hover:bg-slate-900' : 'bg-zinc-50 border-zinc-150 text-slate-650 hover:bg-zinc-100')
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isActive 
                        ? (darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700') 
                        : (darkMode ? 'bg-slate-850 text-slate-400' : 'bg-white text-slate-500 shadow-sm border border-zinc-200/50')
                    }`}>
                      {tab.icon}
                    </span>
                    <div className="text-right">
                      <div className="text-xs font-black leading-tight">
                        {tab.key === 'dashboard' ? 'داشبورد' :
                         tab.key === 'journal' ? 'ژورنال ترید' :
                         tab.key === 'focus' ? 'اتاق تمرکز' :
                         tab.key === 'financial' ? 'برنامه مالی' :
                         tab.key === 'habits' ? 'عادت و تسک' :
                         tab.key === 'ideas' ? 'ایده‌ها' :
                         tab.key === 'games' ? 'فیلم و بازی' : 'تنظیمات'}
                      </div>
                      <div className="text-[9px] text-slate-400 leading-normal mt-1 block max-h-[2.4em] overflow-hidden">
                        {tab.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeNotification && (
        <div className="fixed top-4 right-4 bg-indigo-650 border border-indigo-500 text-white z-[9999] p-4 rounded-2xl shadow-xl flex items-start gap-3 max-w-sm animate-bounce" dir="rtl">
          <div className="p-1 rounded-full bg-white/10 text-white mt-0.5">
            <Sparkles size={16} />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold leading-tight">{activeNotification.title}</h4>
            <p className="text-[10px] text-slate-100 mt-1 leading-relaxed">{activeNotification.desc}</p>
          </div>
          <button 
            onClick={() => setActiveNotification(null)}
            className="text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Math Alarm modal ringtone popup overlay */}
      {mathAlarmTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4" dir="rtl">
          <div className={`rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-5 animate-pulse border ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-zinc-200 text-slate-900'
          }`}>
            <div className="flex justify-center text-indigo-500">
              <BellRing size={52} className="animate-bounce" />
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">وضعیت زنگ حشاش</span>
              <h3 className="text-lg font-extrabold flex justify-center items-center gap-1.5 leading-snug">
                <Clock size={18} className="text-indigo-500" />
                <span>زنگ هوشمند ریاضی: {mathAlarmTask.title}</span>
              </h3>
              <p className="text-xs text-slate-400">سطح چالش: محاسبات ضرب دو رقمی خواب‌شکن</p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-3 ${
              darkMode ? 'bg-slate-950 border-slate-850' : 'bg-zinc-50 border-zinc-150'
            }`}>
              <p className="text-xs text-slate-450 leading-relaxed font-semibold">
                جهت متوقف ساختن صدای آلارم باید پاسخ صحیح را محاسبه کنید! ({solvedCount} از ۲ مرحله برطرف شده)
              </p>

              <form onSubmit={handleVerifyAnswer} className="space-y-3">
                <div className="text-xl font-bold font-mono tracking-wider text-indigo-500" dir="ltr">
                  {mathNum1} × {mathNum2} = ؟
                </div>

                <input 
                  type="number"
                  placeholder="پاسخ را بنویسید"
                  required
                  autoFocus
                  value={mathUserAnswer}
                  onChange={(e) => setMathUserAnswer(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-center font-mono focus:outline-none text-base border ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-zinc-200 text-slate-900'
                  }`}
                />

                <button 
                  type="submit"
                  className="w-full h-10 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
                >
                  تأیید پاسخ و قطع خواب‌شکن
                </button>
              </form>
            </div>

            {emergencyConfirm ? (
              <div className="flex flex-col items-center gap-1 bg-slate-900/40 p-2 rounded-xl border border-slate-800" dir="rtl">
                <span className="text-[9px] text-rose-500 font-bold">زنگ خاموش شود؟ (این کار باعث کاهش درصد تعهد می‌شود)</span>
                <div className="flex items-center gap-3 mt-1">
                  <button 
                    onClick={() => {
                      setMathAlarmTask(null);
                      setEmergencyConfirm(false);
                    }}
                    className="text-[9px] text-rose-500 hover:text-rose-400 font-bold underline cursor-pointer"
                  >
                    بله، قطع شود
                  </button>
                  <button 
                    onClick={() => setEmergencyConfirm(false)}
                    className="text-[9px] text-slate-400 hover:text-slate-300 underline cursor-pointer"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setEmergencyConfirm(true)}
                className="text-[10px] text-slate-500 hover:text-slate-400 underline cursor-pointer"
              >
                متوقف کردن اضطراری زنگ
              </button>
            )}
          </div>
        </div>
      )}

      {/* Normal Alarm modal ringtone popup overlay */}
      {normalAlarmTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" dir="rtl">
          <div className={`rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-5 animate-pulse border ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-zinc-200 text-slate-900'
          }`}>
            <div className="flex justify-center text-indigo-500">
              <Bell size={52} className="animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">زنگ هشدار معمولی</span>
              <h3 className="text-lg font-extrabold">زنگ یادآوری تسک: {normalAlarmTask.title}</h3>
              <p className="text-xs text-slate-400 font-mono">ساعت تنظیم شده: {normalAlarmTask.time || '--:--'}</p>
            </div>

            <div className={`p-5 rounded-2xl border space-y-3 ${
              darkMode ? 'bg-slate-950 border-slate-850' : 'bg-zinc-50 border-zinc-150'
            }`}>
              <p className="text-xs text-slate-450 leading-relaxed">
                مدت زمان یادآوری نهایی فرا رسیده است. لطفاً اقدام متناسب را اجرا کنید.
              </p>
              
              <button
                type="button"
                onClick={() => setNormalAlarmTask(null)}
                className="w-full h-11 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
              >
                متوجه شدم و خاموش کن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
