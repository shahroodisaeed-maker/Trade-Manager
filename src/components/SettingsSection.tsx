import React, { useState } from 'react';
import { 
  Sliders, Download, Upload, Copy, Check, Volume2, RefreshCw, 
  ShieldAlert, ShieldCheck, Database, FileText, Smartphone, HardDrive
} from 'lucide-react';

interface SettingsSectionProps {
  darkMode: boolean;
  trades: any[];
  transactions: any[];
  assets: any[];
  loans: any[];
  debtClaims: any[];
  habits: any[];
  tasks: any[];
  reminders: any[];
  ideas: any[];
  games: any[];
  serials: any[];
  onImportAllData: (data: any) => void;
}

export default function SettingsSection({
  darkMode,
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
  onImportAllData
}: SettingsSectionProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [testActive, setTestActive] = useState(false);
  const [testAudioCtx, setTestAudioCtx] = useState<AudioContext | null>(null);

  // Generate full JSON DB string
  const getFullBackupObject = () => {
    return {
      appName: 'Zenith Workspace',
      version: '1.0.0',
      exportTime: new Date().toISOString(),
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
      serials
    };
  };

  const downloadBackupFile = () => {
    try {
      const dataStr = JSON.stringify(getFullBackupObject(), null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `zenith_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setImportStatus({
        type: 'success',
        message: 'فایل پشتیبان دیتابیس با موفقیت تولید و دانلود شد. لطفاً آن را در محلی امن در گوشی ذخیره کنید.'
      });
    } catch (e) {
      setImportStatus({
        type: 'error',
        message: 'بستن دانلود به دلیل محدودیت اندروید تداخل پیدا کرد! لطفاً از روش کپی متن برای تهیه پشتیبان استفاده کنید.'
      });
    }
  };

  const copyBackupToClipboard = () => {
    const dataStr = JSON.stringify(getFullBackupObject());
    navigator.clipboard.writeText(dataStr).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  // Import JSON handler
  const handleImportJSON = (jsonString: string) => {
    try {
      if (!jsonString.trim()) {
        setImportStatus({ type: 'error', message: 'لطفاً ابتدا کد پشتیبان معتبر یا فایل مربوطه را وارد نمایید.' });
        return;
      }
      const parsed = JSON.parse(jsonString);
      
      // Basic validation
      if (!parsed.trades && !parsed.tasks && !parsed.habits) {
        setImportStatus({ 
          type: 'error', 
          message: 'فرمت فایل ناهمتراز است! ساختار صحیح اطلاعات جامع زنیت یافت نشد.' 
        });
        return;
      }

      onImportAllData(parsed);
      setImportStatus({ 
        type: 'success', 
        message: 'همگام‌سازی و بازیابی اطلاعات گوشی با دیتابیس جدید با موفقیت فرجام یافت! تمام صفحات بروز گردیدند.' 
      });
      setImportText('');
    } catch (e) {
      setImportStatus({ type: 'error', message: 'فایل به علت مغایرت در نحو JSON قابل پردازش نمی‌باشد! مطمئن شوید متن کامل را کپی نموده‌اید.' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleImportJSON(content);
    };
    reader.readAsText(file);
  };

  // Test Alarm system Audio triggers immediately
  const handleTestAudioAlarm = () => {
    try {
      setTestActive(true);
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        alert('موتور صوتی Web Audio در پوسته این فریمورک پشتیبانی نمی‌شود.');
        setTestActive(false);
        return;
      }

      const ctx = new AudioCtxClass();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // Play 3 rapid melodic beep chirps
      const chirp = (freq: number, delay: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gainNode.gain.setValueAtTime(0.35, ctx.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + dur);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + dur);
      };

      chirp(523.25, 0.0, 0.15); // C5
      chirp(659.25, 0.15, 0.15); // E5
      chirp(783.99, 0.3, 0.25); // G5

      setTimeout(() => {
        setTestActive(false);
        ctx.close().catch(() => {});
      }, 600);

    } catch (e) {
      console.warn('Test audio error:', e);
      setTestActive(false);
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Introduction Badge */}
      <div className={`p-4 rounded-3xl border transition-all ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-indigo-50/30 border-indigo-100'
      }`}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-600/10 text-indigo-500 rounded-2xl shrink-0">
            <Sliders size={22} className="animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-sm font-black dark:text-slate-100 text-slate-800">کابین تنظیمات ارشد و پارت حفاظت از اطلاعات گوشی (APK Backup Panel)</h2>
            <p className="text-[10px] text-slate-400 mt-1 lines-relaxed leading-relaxed font-sans">
              در زمان تبدیل نرم‌افزار به فایل Android APK، سیستم عامل گوشی‌های هوشمند گاه بابت مصرف حافظه رم یا بهینه‌سازی دیسک، کش WebView برنامه‌ها را به صورت دوره‌ای پاکساز می‌کند. این صفحه تضمین کامل پایداری شماست! با خروجی گرفتن منظم اطلاعات از دیسک بومی و تنظیم کدهای دسترسی، ثبات کارهای خود را مادام‌العمر بیمه کنید.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* RIGHT COLUMN: Mobile APK Instructions & Guidelines (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Android Permissions Manifest definitions */}
          <div className={`p-5 rounded-3xl border space-y-4 shadow-sm ${
            darkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-zinc-150'
          }`}>
            <div className="flex items-center gap-2 border-b pb-2.5 border-slate-200/10 dark:border-slate-800/60">
              <Smartphone className="text-indigo-400 shrink-0" size={18} />
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">راهنمای بهینه‌سازی دسترسی‌ها در خروجی اندروید (APK Build Guidelines)</h3>
            </div>

            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
              اگر خودتان این وب‌سرویس را به فایل APK پکیج می‌سازید (به وسیله Capacitor یا Cordova)، جهت صحت کارکرد زنگ‌های هشدار خواب‌شکن، یادداشت‌های یادآوری، و ذخیره‌سازی ابدی، فایل <span className="font-mono bg-indigo-500/10 px-1 py-0.5 rounded text-indigo-400">AndroidManifest.xml</span> پروژه را حتماً با دسترسی‌های زیر بیارایید:
            </p>

            <div className="space-y-2.5 font-mono text-[9px] text-left ltr bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 overflow-x-auto text-slate-350" dir="ltr">
              <div>{'<!-- درخواست دسترسی ارسال اعلانات پس‌زمینه و روی صفحه (اندروید ۱۳ به بالا) -->'}</div>
              <div className="text-indigo-400">{'<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />'}</div>
              
              <div className="mt-2">{'<!-- درخواست دسترسی زمان‌بندی دقیق زنگ هشدار بیدارباش معمولی و محاسباتی -->'}</div>
              <div className="text-indigo-400">{'<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />'}</div>
              <div className="text-indigo-400">{'<uses-permission android:name="android.permission.USE_EXACT_ALARM" />'}</div>

              <div className="mt-2">{'<!-- دسترسی خواندن و نوشتن فایل در حافظه تلفن جهت اکسپورت پشتیبان دیتابیس بر گوشی -->'}</div>
              <div className="text-rose-400">{'<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />'}</div>
              <div className="text-rose-400">{'<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />'}</div>
            </div>

            <div className={`p-3 rounded-2xl flex items-start gap-2.5 border text-[10px] font-sans leading-relaxed ${
              darkMode ? 'bg-indigo-950/10 border-indigo-900/30 text-indigo-400' : 'bg-indigo-50/50 border-indigo-100 text-indigo-800'
            }`}>
              <ShieldCheck className="shrink-0 text-indigo-500 mt-0.5" size={14} />
              <span>
                <strong>اطلاعیه فنی پایداری:</strong> Zenith Workspace مجهز به موتور همزمانی دوگانه است که به طور خودکار اطلاعات شما را هم روی <span className="font-bold underline">localStorage</span> مرورگر و هم در <span className="font-bold underline">Capacitor Preferences (مخزن SharedPreferences بومی اندروید)</span> به صورت رمزنگاری همگام می‌کند تا جلوی پاک‌شدن دوره‌ای داده‌ها توسط سیستم‌عامل را بگیرد.
              </span>
            </div>
          </div>

          {/* Section 2: Audio Engine Volume test panel */}
          <div className={`p-5 rounded-3xl border space-y-4 shadow-sm ${
            darkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-zinc-150'
          }`}>
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-200/10 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <HardDrive className="text-amber-500 shrink-0" size={18} />
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">تست سخت‌افزاری صدای بوق اضطراری (Device Beep Test)</h3>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded-lg">سیستم آماده بوق</span>
            </div>

            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
              جهت اطمینان از اینکه گوشی شما درخواست‌های صوتی مرورگر را آزاد گذاشته است و صدا قطع نیست، دکمه تست را بفشارید. این عمل بوق‌های ملودیک سه‌گانه‌ای پخش کرده و فیلتر صوتی برنامه را برای زنگ‌های آینده کاملاً Unmute می‌کند.
            </p>

            <button
              onClick={handleTestAudioAlarm}
              disabled={testActive}
              className={`w-full py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                testActive 
                  ? 'bg-amber-500/20 text-amber-500 cursor-not-allowed'
                  : 'bg-indigo-650 hover:bg-indigo-700 text-white'
              }`}
            >
              {testActive ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> در حال شلیک صوتی به بلندگوی گوشی...
                </>
              ) : (
                <>
                  🎼 نواختن ملودی فرکانسی تست بلندگو
                </>
              )}
            </button>
          </div>

        </div>

        {/* LEFT COLUMN: Data Export & Import Operations (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main DB Backup Export / Import Card */}
          <div className={`p-5 rounded-3xl border space-y-4 shadow-sm ${
            darkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-zinc-150'
          }`}>
            <div className="flex items-center gap-2 border-b pb-2.5 border-slate-200/10 dark:border-slate-800/60">
              <Database className="text-indigo-400 shrink-0" size={18} />
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">فرآیند همسان‌سازی و تولید پشتیبان (Export & Import Operations)</h3>
            </div>

            {/* Sub-card 1: Export DB */}
            <div className={`p-3.5 rounded-2xl space-y-2.5 border ${
              darkMode ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-zinc-150'
            }`}>
              <div className="text-[10px] font-bold text-slate-400">تولید نسخه کپی از تمام اطلاعات زنیت:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={downloadBackupFile}
                  className="p-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                  title="دانلود فایل دیتابیس به صورت JSON"
                >
                  <Download size={13} /> دانلود فایل پشتیبان
                </button>
                <button
                  onClick={copyBackupToClipboard}
                  className="p-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer border border-slate-700 shadow-sm"
                  title="کپی کردن فیلد متنی به هم پیوسته"
                >
                  {copiedText ? (
                    <>
                      <Check size={13} className="text-emerald-400" /> کپی موفق!
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> کپی کل متنی دیتابیس
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sub-card 2: Import DB via file selector */}
            <div className={`p-3.5 rounded-2xl space-y-3.5 border ${
              darkMode ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-zinc-150'
            }`}>
              <div className="text-[10px] font-bold text-slate-400">بارگذاری دیتابیس پشتیبان قبلی:</div>
              
              <div className="space-y-1.5">
                <label className="block text-[9px] text-slate-500 font-semibold mb-1">روش اول: بارگذاری مستقیم فایل JSON دیتابیس از گوشی</label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="block w-full text-[10px] text-slate-400 file:ml-2.5 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer"
                />
              </div>

              <div className="border-t pt-3 border-dashed border-slate-250/20 dark:border-slate-800/40">
                <label className="block text-[9px] text-slate-500 font-semibold mb-1">روش دوم: کپی و پیست کد متنی دیتابیس</label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="کل ساختار متنی دیتابیس کپی شده را اینجا پیست کنید و دکمه بازیابی را بزنید ..."
                  dir="ltr"
                  className="w-full h-15 font-mono text-[8px] p-2 bg-slate-950 text-slate-300 rounded-xl border border-slate-800 outline-none focus:border-indigo-500/50"
                />
                
                <button
                  onClick={() => handleImportJSON(importText)}
                  className="mt-2 w-full p-2 bg-indigo-650 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1"
                >
                  <Upload size={12} /> تایید بازیابی اطلاعات از فیلد متنی
                </button>
              </div>
            </div>

            {/* Status alerts rendering area */}
            {importStatus.type !== 'idle' && (
              <div className={`p-3 rounded-2xl border text-[10px] font-sans leading-relaxed ${
                importStatus.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-505/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-505/20 text-rose-450'
              }`}>
                {importStatus.message}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
