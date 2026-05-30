import React, { useState, useEffect } from 'react';
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

import { 
  BookOpen, Sparkles, DollarSign, Award, StickyNote, Gamepad2, 
  Layers, Github, Compass, ToggleLeft, ToggleRight, Info, Sun, Moon
} from 'lucide-react';

import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App as CapacitorApp } from '@capacitor/app';

export default function App() {
  const [activeTab, setActiveTab] = useState<'journal' | 'focus' | 'financial' | 'habits' | 'ideas' | 'games'>('journal');

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

    // Request permissions for background notifications on load
    const requestNotificationPermission = async () => {
      try {
        const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;
        if (isCapacitor) {
          const perm = await LocalNotifications.checkPermissions();
          if (perm.display !== 'granted') {
            await LocalNotifications.requestPermissions();
          }
        }
      } catch (err) {
        console.warn('Notification permission failed or has been rejected:', err);
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
            actionTypeId: "OPEN_APP"
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
              sound: 'alert.wav',
              actionTypeId: "OPEN_APP"
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

  // Sidebar navigation mapping helper
  const tabsConfig = [
    { key: 'journal', label: 'ژورنال معامله‌گری', description: 'ثبت ترید و فیلتر دقیق عملکرد', icon: <BookOpen size={16} /> },
    { key: 'focus', label: 'اتاق تمرکز زنده', description: 'ساعت پومودورو، سکوت و لیست انتخابی', icon: <Sparkles size={16} /> },
    { key: 'financial', label: 'برنامه‌ریزی اقتصادی', description: 'ویرایش دارایی، اقساط وام و دیون', icon: <DollarSign size={16} /> },
    { key: 'habits', label: 'دفتر عادات و تسک', description: 'تقویم عادات، نمودار عملکرد و زنگ هوشمند', icon: <Award size={16} /> },
    { key: 'ideas', label: 'صندوقچه‌ ایده‌ها', description: 'طرح، پیاده‌سازی و زمان‌سنج پیش‌رفت', icon: <StickyNote size={16} /> },
    { key: 'games', label: 'قفسه بازی و فیلم', description: 'آرشیو دسته‌بندی سرگرمی و گیمینگ', icon: <Gamepad2 size={16} /> }
  ] as const;

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-indigo-600 selection:text-white antialiased transition-colors duration-300 ${
      darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Dynamic minimalist system status top flag bar */}
      <header className={`border-b px-6 py-3.5 flex items-center justify-between transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200/80 text-slate-900'
      }`} dir="rtl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-display font-extrabold text-base shadow-sm select-none">
            N
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight font-display">دفترچه کاری زیست جامع زنیت (Zenith Workspace)</h1>
            <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-550'}`}>مجموعه فضاهای یکپارچه کاملاً آفلاین معاملاتی، تمرکزی و یادداشتی با تم پرتراکم</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Dark Mode Switcher */}
          <button 
            onClick={handleToggleDarkMode}
            className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
              darkMode 
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
            title={darkMode ? 'تم روشن' : 'تم تیره'}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Status Label */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
            darkMode ? 'bg-slate-800 text-indigo-300' : 'bg-slate-100 text-slate-750'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping inline-block" />
            ذخیره‌سازی آفلاین فعال است
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden md:inline">2026-05-29 UTC</span>
        </div>
      </header>

      {/* Main body split layouts */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Right sidebars - tab selectors and system controls */}
        <nav className={`w-full md:w-64 border-b md:border-b-0 md:border-l p-4 shrink-0 flex flex-col justify-between text-right transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
        }`} dir="rtl">
          <div className="space-y-4">
            <span className="text-[9px] uppercase tracking-widest font-extrabold text-slate-400 block px-2 select-none">بخش‌های کاری زنیت</span>
            
            <div className="space-y-1">
              {tabsConfig.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold text-right transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                    activeTab === tab.key 
                      ? (darkMode ? 'bg-slate-800 text-indigo-300 border border-slate-700/50' : 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50') 
                      : (darkMode ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50')
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={activeTab === tab.key ? 'text-indigo-550' : (darkMode ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-950')}>
                      {tab.icon}
                    </span>
                    <div className="text-right">
                      <div className="font-bold">{tab.label}</div>
                      <div className={`text-[9px] ${activeTab === tab.key ? (darkMode ? 'text-indigo-300/80' : 'text-indigo-500/80') : 'text-slate-400'}`}>{tab.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Minimal info box down sidebar */}
          <div className={`mt-8 border-t pt-3.5 space-y-2 text-right hidden md:block ${
            darkMode ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <div className="flex items-start gap-1 text-[9px] text-slate-500 justify-end">
              <span className="font-sans leading-relaxed">این ابزار در مرورگر شما با تکنولوژی رمز شده ذخیره‌سازی محلی کار می‌کند. حتی در صورت قطع کامل اینترنت اطلاعات شما امن و قابل دسترس آفلاین است.</span>
              <Info size={11} className="shrink-0 mt-0.5 text-slate-400" />
            </div>
            <div className="text-[8px] text-slate-400 text-center font-semibold tracking-wider">CRAFTED FOR PEAK TRADERS</div>
          </div>
        </nav>

        {/* Central main workspace sections rendering view container */}
        <main className="flex-1 p-5 overflow-y-auto max-w-7xl mx-auto w-full">
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
        </main>

      </div>
    </div>
  );
}
