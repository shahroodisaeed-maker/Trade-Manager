import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Shield, 
  ShieldAlert, Smartphone, Clock, Plus, Trash2, Check,
  AlertTriangle, Coffee, Sparkles, Smile, Ban, Wind, Waves, Radio, Brain
} from 'lucide-react';
import { DayTask } from '../types';

interface AppLimit {
  id: string;
  name: string;
  dailyMinutesAllowed: number;
  minutesUsedToday: number;
}

interface FocusSectionProps {
  tasks?: DayTask[];
  darkMode?: boolean;
}

export default function FocusSection({ tasks = [], darkMode = false }: FocusSectionProps) {
  // Pomodoro timer states
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  
  // Custom durations (configurable)
  const [workDuration, setWorkDuration] = useState(25);
  const [shortDuration, setShortDuration] = useState(5);
  const [longDuration, setLongDuration] = useState(15);

  // Audio simulation state (for ticking/relaxation feedback)
  const [muted, setMuted] = useState(false);

  // Silent Block / Do Not Disturb Mode Status
  const [dndActive, setDndActive] = useState(false);
  const [dndMinutes, setDndMinutes] = useState(60);
  const [dndRemainingSeconds, setDndRemainingSeconds] = useState(0);

  // Active Task Focus Option
  const [selectedFocusGoal, setSelectedFocusGoal] = useState<string>('all'); // custom task id or manual goal
  const [customGoalText, setCustomGoalText] = useState('');

  // Web Audio Zen Ambient sound generator states
  const [ambientSound, setAmbientSound] = useState<'none' | 'pink_noise' | 'binaural_beats' | 'ocean_waves'>('none');
  const ambientAudioCtxRef = useRef<AudioContext | null>(null);
  const ambientNodesRef = useRef<{ source: AudioNode; gainNode: GainNode }[]>([]);

  // App limitation directory
  const [apps, setApps] = useState<AppLimit[]>(() => {
    const data = localStorage.getItem('zenith_focus_apps');
    return data ? JSON.parse(data) : [
      { id: '1', name: 'اینستاگرام (Instagram)', dailyMinutesAllowed: 30, minutesUsedToday: 12 },
      { id: '2', name: 'تلگرام (Telegram)', dailyMinutesAllowed: 45, minutesUsedToday: 40 },
      { id: '3', name: 'یوتیوب (YouTube)', dailyMinutesAllowed: 60, minutesUsedToday: 25 }
    ];
  });

  // Sync back to local storage
  useEffect(() => {
    localStorage.setItem('zenith_focus_apps', JSON.stringify(apps));
  }, [apps]);

  // Predefined SelectPresets for application blocking
  const PREDEFINED_APPS = [
    { name: 'اینستاگرام (Instagram)', defaultLimit: 30 },
    { name: 'تلگرام (Telegram)', defaultLimit: 45 },
    { name: 'یوتیوب (YouTube)', defaultLimit: 60 },
    { name: 'واتس‌اپ (WhatsApp)', defaultLimit: 30 },
    { name: 'توییتر (Twitter/X)', defaultLimit: 25 },
    { name: 'تیک‌تاک (TikTok)', defaultLimit: 30 },
    { name: 'دیوار (Divar)', defaultLimit: 15 },
    { name: 'کلش آف کلنز (Clash of Clans)', defaultLimit: 40 },
    { name: 'پابجی (PUBG Mobile)', defaultLimit: 60 },
    { name: 'سایر برنامه‌ها ...', defaultLimit: 30 }
  ];

  const [selectedPresetIndex, setSelectedPresetIndex] = useState('0');
  const [customAppName, setCustomAppName] = useState('');
  const [newAppLimit, setNewAppLimit] = useState('30');

  // Sync Pomodoro Durations when settings input changes
  useEffect(() => {
    handleReset();
  }, [workDuration, shortDuration, longDuration]);

  // Handle Preset updates
  const handlePresetChange = (indexStr: string) => {
    setSelectedPresetIndex(indexStr);
    const idx = Number(indexStr);
    if (!isNaN(idx) && PREDEFINED_APPS[idx]) {
      setNewAppLimit(PREDEFINED_APPS[idx].defaultLimit.toString());
    }
  };

  // Handle Pomodoro clock intervals
  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            triggerAlert();
            setIsActive(false);
            if (ambientSound !== 'none') {
              stopAmbientSound();
            }
            if (mode === 'work') {
              alert('تبریک! مدت زمان تمرکز عمیق پومودورو به پایان رسید. حالا نوبت یک استراحت کوتاه است.');
              handleModeSwitch('short');
            } else {
              alert('دوره استراحت به پایان رسید! آماده تمرکز مجدد روی اهداف معامله‌گری خود هستید؟');
              handleModeSwitch('work');
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  // Handle DND timer count-down if active
  useEffect(() => {
    let interval: any = null;
    if (dndActive && dndRemainingSeconds > 0) {
      interval = setInterval(() => {
        setDndRemainingSeconds(prev => {
          if (prev <= 1) {
            setDndActive(false);
            alert('مدت سکوت کامل و عدم مزاحمت به پایان رسید. وضعیت سیستم به حالت عادی بازگشت.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [dndActive, dndRemainingSeconds]);

  // Cleanup synthesizer on component unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  // Handle DND trigger
  const handleToggleDnd = () => {
    if (dndActive) {
      setDndActive(false);
      setDndRemainingSeconds(0);
    } else {
      setDndActive(true);
      setDndRemainingSeconds(dndMinutes * 60);
    }
  };

  // Synthesize soft relaxing tone using Web Audio API on tick (no external file dependencies)
  const triggerAlert = () => {
    if (muted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5); // A5

      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.9);
    } catch (e) {
      console.log('Audio Context unsupported in this sandbox frame');
    }
  };

  // Web Audio Zen Ambient sound generator logic
  const startAmbientSound = (soundType: 'pink_noise' | 'binaural_beats' | 'ocean_waves') => {
    try {
      stopAmbientSound();
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      ambientAudioCtxRef.current = ctx;
      
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);

      if (soundType === 'pink_noise') {
        // Synthesize calming rainfall/pink noise
        gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11; // normalise
          b6 = white * 0.115926;
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;
        noiseNode.connect(gainNode);
        noiseNode.start();
        
        ambientNodesRef.current.push({ source: noiseNode, gainNode });
      } else if (soundType === 'binaural_beats') {
        // Focus alpha wave binaural beats (140Hz Carrier & 10Hz alpha difference = 150Hz)
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const panner1 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const panner2 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        osc1.frequency.value = 140;
        osc2.frequency.value = 150;

        if (panner1 && panner2) {
          panner1.pan.value = -1;
          panner2.pan.value = 1;
          osc1.connect(panner1).connect(gainNode);
          osc2.connect(panner2).connect(gainNode);
        } else {
          osc1.connect(gainNode);
          osc2.connect(gainNode);
        }

        osc1.start();
        osc2.start();
        ambientNodesRef.current.push({ source: osc1, gainNode });
        ambientNodesRef.current.push({ source: osc2, gainNode });
      } else if (soundType === 'ocean_waves') {
        // Dynamic slow wave cycle using a modulator oscillator to shift lfo volume
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        
        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 320;

        const waveGain = ctx.createGain();
        waveGain.gain.setValueAtTime(0.03, ctx.currentTime);
        
        const modulator = ctx.createOscillator();
        modulator.frequency.value = 0.12; // slow breathing rate
        
        const modulatorGain = ctx.createGain();
        modulatorGain.gain.value = 0.04;
        
        modulator.connect(modulatorGain).connect(waveGain.gain);
        noiseNode.connect(filter).connect(waveGain).connect(ctx.destination);
        
        modulator.start();
        noiseNode.start();
        
        ambientNodesRef.current.push({ source: noiseNode, gainNode: waveGain });
        ambientNodesRef.current.push({ source: modulator, gainNode: waveGain });
      }

      setAmbientSound(soundType);
    } catch (e) {
      console.log('Ambient Audio error in preview context:', e);
    }
  };

  const stopAmbientSound = () => {
    try {
      ambientNodesRef.current.forEach(node => {
        try {
          (node.source as any).stop();
        } catch (e) {}
      });
      ambientNodesRef.current = [];
      if (ambientAudioCtxRef.current) {
        ambientAudioCtxRef.current.close();
        ambientAudioCtxRef.current = null;
      }
      setAmbientSound('none');
    } catch (e) {}
  };

  const handleModeSwitch = (newMode: 'work' | 'short' | 'long') => {
    setIsActive(false);
    setMode(newMode);
    if (newMode === 'work') {
      setMinutes(workDuration);
    } else if (newMode === 'short') {
      setMinutes(shortDuration);
    } else {
      setMinutes(longDuration);
    }
    setSeconds(0);
  };

  const handleReset = () => {
    setIsActive(false);
    if (mode === 'work') {
      setMinutes(workDuration);
    } else if (mode === 'short') {
      setMinutes(shortDuration);
    } else {
      setMinutes(longDuration);
    }
    setSeconds(0);
  };

  // Restricting apps functions
  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    const preset = PREDEFINED_APPS[Number(selectedPresetIndex)];
    let finalName = '';

    if (preset.name === 'سایر برنامه‌ها ...') {
      if (!customAppName.trim()) {
        alert('لطفاً نام برنامه سفارشی را وارد کنید.');
        return;
      }
      finalName = customAppName.trim();
    } else {
      finalName = preset.name;
    }

    const newApp: AppLimit = {
      id: Date.now().toString(),
      name: finalName,
      dailyMinutesAllowed: Number(newAppLimit) || 30,
      minutesUsedToday: 0
    };
    setApps([...apps, newApp]);
    setCustomAppName('');
    setSelectedPresetIndex('0');
    setNewAppLimit('30');
  };

  const handleUpdateAppMinutes = (id: string, increment: number) => {
    setApps(apps.map(app => {
      if (app.id === id) {
        const nextValue = Math.max(0, app.minutesUsedToday + increment);
        if (nextValue >= app.dailyMinutesAllowed && app.minutesUsedToday < app.dailyMinutesAllowed) {
          triggerAlert(); // chime warning
        }
        return {
          ...app,
          minutesUsedToday: nextValue
        };
      }
      return app;
    }));
  };

  const handleDeleteApp = (id: string) => {
    setApps(apps.filter(app => app.id !== id));
  };

  // Convert seconds to readable MM:SS
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isCustomOptionPlaying = PREDEFINED_APPS[Number(selectedPresetIndex)]?.name === 'سایر برنامه‌ها ...';
  const selectedGoalName = selectedFocusGoal === 'custom' 
    ? (customGoalText || 'تمرکز اختصاصی') 
    : (tasks.find(t => t.id === selectedFocusGoal)?.title || 'کل کارنامه ترید و یادگیری مالی');

  // Calculates percentage completion for progress bar
  const totalDurationSeconds = (mode === 'work' ? workDuration : mode === 'short' ? shortDuration : longDuration) * 60;
  const currentSecondsLeft = minutes * 60 + seconds;
  const progressRatio = totalDurationSeconds > 0 ? (totalDurationSeconds - currentSecondsLeft) / totalDurationSeconds : 0;
  const percentProgress = Math.min(100, Math.round(progressRatio * 100));

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Dynamic Persian Affirmation Header */}
      <div className={`p-4 rounded-2xl border text-right shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-indigo-50/40 border-indigo-100/50'
      }`}>
        <div className="space-y-1">
          <span className="text-[9px] uppercase tracking-wider text-indigo-500 font-extrabold flex items-center gap-1">
            <Sparkles size={11} className="animate-spin" /> محیط تمرکز عمیق و بازیابی ذهن
          </span>
          <h2 className={`text-base font-bold font-display ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
            اتاق سکوت و کنترل کارآمد ذهن یادگیرنده
          </h2>
          <p className="text-[10px] text-slate-450">
            برای انجام بهترین معاملات مالی، ذهن شما باید آرام، متمرکز، پرانرژی و به دور از هیاهو چت‌های مزاحم گوشی باشد.
          </p>
        </div>
        <div className="text-left font-mono text-[9px] text-slate-450 leading-tight border-r pr-3 md:border-r-0 md:pr-0 border-slate-300/20">
          <div>تمرکز فعال: <strong className="text-indigo-505 font-bold font-sans">{selectedGoalName}</strong></div>
          <div>روزانه: ۲۵ دقیقه کار + ۵ دقیقه تنفس عمیق</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PANEL 1: Dynamic Pomodoro Clock & Goal Selection */}
        <div className={`p-6 border rounded-2xl shadow-sm flex flex-col justify-between items-center text-center space-y-5 transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          
          <div className="w-full space-y-1 bg-transparent text-right pb-3 border-b border-indigo-100/10">
            <h3 className="text-xs font-extrabold text-indigo-550 flex items-center gap-1 font-display">
              <Clock size={14} /> هدف‌گذاری و کنترل زمان (Core Time)
            </h3>
            
            {/* Focus Goal Connector with Habits/Tasks dropdown */}
            <div className="pt-2">
              <label className="block text-[10px] text-slate-400 mb-1 font-semibold">بابت انجام چه وظیفه‌ای تمرکز می‌کنید؟</label>
              <select 
                value={selectedFocusGoal}
                onChange={(e) => setSelectedFocusGoal(e.target.value)}
                className={`w-full p-2 border rounded-lg text-xs leading-relaxed focus:outline-none focus:border-indigo-500 font-sans ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-150 text-slate-850'
                }`}
              >
                <option value="all">تمرکز عمومی بر تحلیل مارکت</option>
                <option value="custom">یک هدف سفارشی را تایپ می‌کنم ...</option>
                {tasks.filter(t => !t.completed).map(t => (
                  <option key={t.id} value={t.id}>وظیفه: {t.title} ({t.time || 'امروز'})</option>
                ))}
              </select>

              {selectedFocusGoal === 'custom' && (
                <input 
                  type="text"
                  placeholder="هدف اختصاصی، مثلا: تحلیل الگوهای چارت طلا"
                  value={customGoalText}
                  onChange={(e) => setCustomGoalText(e.target.value)}
                  className={`w-full p-2 mt-1.5 border rounded-lg text-xs focus:outline-none focus:border-indigo-500 font-sans ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              )}
            </div>
          </div>

          {/* Mode Switchers */}
          <div className={`flex gap-1 p-0.5 border rounded-xl w-full ${
            darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-100 border-slate-200/40'
          }`} dir="rtl">
            <button 
              onClick={() => handleModeSwitch('work')}
              className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                mode === 'work' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-850')
              }`}
            >
              کارتمرکزی ({workDuration}دقیقه)
            </button>
            <button 
              onClick={() => handleModeSwitch('short')}
              className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                mode === 'short' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-850')
              }`}
            >
              <Coffee size={10} /> تنفس کوتاه ({shortDuration}دقیقه)
            </button>
            <button 
              onClick={() => handleModeSwitch('long')}
              className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                mode === 'long' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-850')
              }`}
            >
              استراحت بلند
            </button>
          </div>

          {/* GLOWING ORB TIMER RING */}
          <div className="relative w-56 h-56 flex flex-col items-center justify-center group">
            {/* Dynamic visual backdrop ring */}
            <svg className="w-full h-full absolute transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className={`stroke-current ${darkMode ? 'text-slate-950/20' : 'text-slate-100'}`}
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-indigo-600 transition-all duration-1000"
                strokeWidth="5"
                strokeDasharray="282.7"
                strokeDashoffset={282.7 - (282.7 * percentProgress) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Glowing Orb Heartbeat background if active */}
            <div className={`absolute w-44 h-44 rounded-full transition-all duration-1000 blur-2xl opacity-10 ${
              isActive 
                ? (mode === 'work' ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500 animate-pulse') 
                : 'bg-transparent'
            }`} />

            <div className="z-10 flex flex-col items-center justify-center">
              <span className={`text-4xl font-extrabold font-mono tracking-widest tabular-nums font-display ${
                darkMode ? 'text-slate-100' : 'text-slate-900'
              }`}>
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </span>
              
              <span className={`text-[9px] uppercase tracking-widest mt-1.5 font-extrabold px-2 py-0.5 rounded-full ${
                isActive 
                  ? 'bg-indigo-500/10 text-indigo-400 animate-pulse' 
                  : 'bg-slate-500/10 text-slate-400'
              }`}>
                {isActive ? 'در روند تمرکز فعال' : 'بارگذاری مجدد'}
              </span>

              <span className="text-[8px] text-slate-450 mt-1 max-w-[130px] truncate" title={selectedGoalName}>
                {selectedGoalName}
              </span>
            </div>
          </div>

          {/* Clock controls */}
          <div className="flex gap-3 w-full justify-center">
            <button
              onClick={() => {
                setIsActive(!isActive);
                triggerAlert();
              }}
              className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer ${
                isActive 
                  ? (darkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200') 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isActive ? (
                <>
                  <Pause size={13} /> توقف موقت
                </>
              ) : (
                <>
                  <Play size={13} /> شروع بازه
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                darkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800'
              }`}
              title="بارگذاری مجدد ساعت"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          {/* Dynamic Ambient Synthesizer Box */}
          <div className={`p-3 rounded-xl border w-full text-right ${
            darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-150'
          }`}>
            <span className="text-[10px] text-slate-400 font-bold block mb-1">پخش فرکانس صوتی آرامش ذهن (Web Synthesizer)</span>
            <div className="grid grid-cols-4 gap-1 text-[9px] font-sans">
              <button
                onClick={() => startAmbientSound('pink_noise')}
                className={`py-1 rounded flex flex-col items-center justify-center cursor-pointer transition-all ${
                  ambientSound === 'pink_noise' ? 'bg-indigo-600 text-white' : 'bg-transparent text-slate-500 hover:bg-slate-900/10'
                }`}
                title="صدای لطیف شبیه‌ساز باران کوهستان"
              >
                <Wind size={12} className="mb-0.5" />
                آوای باران
              </button>
              <button
                onClick={() => startAmbientSound('binaural_beats')}
                className={`py-1 rounded flex flex-col items-center justify-center cursor-pointer transition-all ${
                  ambientSound === 'binaural_beats' ? 'bg-indigo-600 text-white' : 'bg-transparent text-slate-500 hover:bg-slate-900/10'
                }`}
                title="فرکانس ۱۰ هرتز آلفا جهت یادگیری بیدارباش"
              >
                <Brain size={12} className="mb-0.5" />
                امواج آلفا
              </button>
              <button
                onClick={() => startAmbientSound('ocean_waves')}
                className={`py-1 rounded flex flex-col items-center justify-center cursor-pointer transition-all ${
                  ambientSound === 'ocean_waves' ? 'bg-indigo-600 text-white' : 'bg-transparent text-slate-500 hover:bg-slate-900/10'
                }`}
                title="صدای دوره‌ای جزر و مد دریای تمرکز"
              >
                <Waves size={12} className="mb-0.5" />
                موج اقیانوس
              </button>
              <button
                onClick={stopAmbientSound}
                className={`py-1 rounded flex flex-col items-center justify-center cursor-pointer transition-all ${
                  ambientSound === 'none' ? 'bg-slate-600 text-white' : 'bg-transparent text-slate-400 hover:bg-slate-900/10'
                }`}
              >
                <VolumeX size={12} className="mb-0.5" />
                بی‌صدا
              </button>
            </div>
            {ambientSound !== 'none' && (
              <div className="text-[8px] text-indigo-400/80 mt-1 text-center font-bold animate-pulse">
                اتصال آلاله صوتی طبیعی برقرار است. استفاده از هدفون پیشنهاد می‌شود.
              </div>
            )}
          </div>
        </div>

        {/* PANEL 2: Silent Block / Do Not Disturb Controller */}
        <div className={`p-5 border rounded-2xl shadow-sm flex flex-col justify-between transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-205'
        }`}>
          <div className="space-y-4">
            <h3 className={`text-sm font-bold flex items-center gap-1.5 font-display border-b pb-2 ${
              darkMode ? 'text-slate-100 border-slate-800' : 'text-slate-900 border-slate-100'
            }`}>
              <Shield size={16} className="text-indigo-500 animate-pulse" />
              سپر عدم مزاحمت یادواره (Do Not Disturb)
            </h3>
            
            <p className="text-xs text-slate-450 leading-relaxed text-right">
              با فعال کردن سپر سکوت، شبیه‌ساز قطع اینترنت و بی صدا شدن گوشی در برنامه اجرا می‌شود تا زمان ترید عمیق با اعلان‌ها تخریب نشود.
            </p>

            {!dndActive ? (
              <div className="space-y-4 pt-2 text-right">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">بازه مسدودسازی مزاحمت تلفن:</label>
                  <select
                    value={dndMinutes}
                    onChange={(e) => setDndMinutes(Number(e.target.value))}
                    className={`w-full p-2.5 border rounded-lg text-xs font-sans ${
                      darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-705'
                    }`}
                  >
                    <option value="15">۱۵ دقیقه (ترید سریع Scalping)</option>
                    <option value="30">۳۰ دقیقه (بررسی مارکت)</option>
                    <option value="60">۶۰ دقیقه (۱ ساعت پیله عمیق)</option>
                    <option value="120">۱۲۰ دقیقه (۲ ساعت مطالعه کامل)</option>
                  </select>
                </div>

                <div className="p-3 border rounded-xl border-dashed border-indigo-100/10 text-[10px] text-slate-450 leading-normal">
                  📌 نکات روانشناسی: تغییر مکرر بین برنامه چت تلگرام و نمودار ترید، طبق آمار موجب ۵۰٪ خطای معاملاتی به علت کمبود هوشیاری تجمعی می‌شود!
                </div>

                <button
                  onClick={handleToggleDnd}
                  className="w-full py-2 bg-indigo-650 text-white font-bold rounded-xl hover:bg-indigo-700 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <VolumeX size={13} /> قطع کامل اعلانات و شروع پیله
                </button>
              </div>
            ) : (
              <div className={`p-4 border rounded-xl space-y-4 text-center ${
                darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'
              }`}>
                {/* Glowing Radar Waves */}
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 bg-indigo-500 rounded-full blur animate-ping opacity-25" />
                  <div className="relative p-4 bg-indigo-600 rounded-full text-white">
                    <ShieldAlert size={28} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-extrabold text-indigo-500">سپر لایو لیندگر فعال است!</div>
                  <div className="text-[10px] text-slate-400 font-medium">زمان باقیمانده تا پایان حالت عدم مزاحمت:</div>
                  <div className="text-2xl font-mono text-indigo-505 tracking-widest font-bold">
                    {formatTime(dndRemainingSeconds)}
                  </div>
                </div>

                <p className="text-[10px] text-slate-450 leading-relaxed italic px-2">
                  "سوت خاموش گوشی متصل است. ذهن تریدر باید مثل بلور شفاف باشد."
                </p>

                <button
                  onClick={handleToggleDnd}
                  className={`w-full py-1.5 border rounded-lg transition-colors cursor-pointer text-xs ${
                    darkMode ? 'border-slate-800 hover:bg-slate-900 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-650'
                  }`}
                >
                  لغو سپر سکوت
                </button>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-450 text-center leading-normal pt-4 border-t border-slate-300/10">
            📊 تمرین آرامش: بر ثانیه نفس کشیدن خود متمرکز باشید.
          </div>
        </div>

        {/* PANEL 3: Interactive App Usage Limiter with Active Simulation */}
        <div className={`p-5 border rounded-2xl shadow-sm space-y-4 transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-zinc-150'
        }`}>
          <div className={`border-b pb-2 ${darkMode ? 'border-slate-800' : 'border-slate-150'}`}>
            <h3 className={`text-sm font-bold flex items-center gap-1.5 font-display ${
              darkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              <Smartphone size={16} className="text-indigo-500" />
              مرکز مراقبت و شبیه‌ساز مصرف برنامه‌ها
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              مدیریت و شبیه‌سازی گشت‌وگذاری‌های روزانه خود در شبکه‌های اجتماعی برای جلوگیری از گسست تمرکز معاملاتی.
            </p>
          </div>

          {/* List restricted apps with dynamic controls */}
          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-0.5">
            {apps.length === 0 ? (
              <div className="text-center p-6 text-slate-500 text-xs">برنامه‌ای برای اعمال محدودیت وجود ندارد. از فرم زیر جدید بسازید.</div>
            ) : (
              apps.map(app => {
                const percentage = Math.min(100, (app.minutesUsedToday / app.dailyMinutesAllowed) * 100);
                const isOverLimit = app.minutesUsedToday >= app.dailyMinutesAllowed;

                return (
                  <div key={app.id} className={`p-3 border rounded-xl space-y-2.5 relative overflow-hidden transition-all ${
                    darkMode ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-50/70 border-slate-100'
                  }`}>
                    {/* Blocker overlay if app goes over daily allowance limit */}
                    {isOverLimit && (
                      <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-2 font-sans text-xs ${
                        darkMode ? 'bg-slate-950/95 text-slate-200' : 'bg-white/95 text-slate-800'
                      }`}>
                        <AlertTriangle size={15} className="text-rose-500 mb-1 animate-bounce" />
                        <span className="font-bold text-rose-500 text-[11px]">سقف مصرف روزانه {app.name} به پایان رسید!</span>
                        <p className="text-[9px] text-slate-400 mt-0.5">برنامه معاملاتی طبق پلن تمرکز مسدود شد.</p>
                        <div className="flex gap-1.5 mt-2">
                          <button 
                            onClick={() => handleUpdateAppMinutes(app.id, -app.minutesUsedToday)}
                            className="px-2.5 py-0.5 bg-indigo-650 text-white rounded text-[9px] cursor-pointer font-bold hover:bg-indigo-750 font-sans shadow-sm"
                          >
                            بازنشانی مجدد (Reset)
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className={`font-bold ${darkMode ? 'text-slate-205' : 'text-slate-800'}`}>{app.name}</span>
                        <div className="text-[9px] text-slate-450 mt-0.5 font-bold">بازه مصوب: {app.dailyMinutesAllowed} دقیقه</div>
                      </div>
                      
                      {/* Simulation Interaction controls requested by user */}
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleUpdateAppMinutes(app.id, 5)} 
                          className={`p-1 px-1.5 rounded text-[8px] font-bold cursor-pointer transition-colors ${
                            darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-705'
                          }`}
                          title="شبیه‌سازی ۵ دقیقه گشت‌وگذار غیرمفید"
                        >
                          +۵ دقیقه استفاده
                        </button>
                        <button 
                          onClick={() => handleDeleteApp(app.id)}
                          className={`p-1 rounded cursor-pointer transition-colors ${
                            darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-405 hover:text-rose-600'
                          }`}
                          title="پاک کردن برنامه"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Progress indicators */}
                    <div className="space-y-1">
                      <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            percentage >= 90 ? 'bg-rose-500 animate-pulse' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>{app.minutesUsedToday} دقیقه مصرف شده امروز</span>
                        <span className="font-sans font-bold">{Math.round(percentage)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Form to submit a new limit */}
          <form onSubmit={handleAddApp} className={`p-3 border rounded-xl space-y-3 text-xs leading-relaxed transition-colors ${
            darkMode ? 'bg-slate-950/40 border-slate-850' : 'bg-zinc-50 border-slate-150'
          }`}>
            <span className="text-[10px] font-extrabold text-indigo-400 block pb-1 border-b border-indigo-150/10">محدود کردن برنامه‌های گوشی جهت ارتقای هوشیاری</span>
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">انتخاب برنامه هدف برای محدود ساختن *</label>
                <select
                  value={selectedPresetIndex}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-550 font-sans ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  {PREDEFINED_APPS.map((app, index) => (
                    <option key={index} value={index} className={darkMode ? 'bg-slate-900' : ''}>
                      {app.name}
                    </option>
                  ))}
                </select>
              </div>

              {isCustomOptionPlaying && (
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5 font-bold">نام بازی یا برنامه مد نظر خود را بنویسید:</label>
                  <input 
                    type="text" 
                    placeholder="مثال: اینستاگرام ترید..."
                    required
                    value={customAppName}
                    onChange={(e) => setCustomAppName(e.target.value)}
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 font-sans ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-250 text-slate-800'
                    }`}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">سقف مصرف روزانه (دقیقه)</label>
                  <input 
                    type="number" 
                    placeholder="مثلاً ۳۰"
                    required
                    value={newAppLimit}
                    onChange={(e) => setNewAppLimit(e.target.value)}
                    className={`w-full p-2 border rounded-lg text-center font-mono focus:outline-none focus:border-indigo-500 ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-950'
                    }`}
                  />
                </div>

                <div className="flex items-end">
                  <button 
                    type="submit"
                    className="w-full h-10 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Plus size={14} /> ثبت محدودیت
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
