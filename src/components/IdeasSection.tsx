import React, { useState, useEffect } from 'react';
import { StickyIdea } from '../types';
import { 
  Plus, Play, Pause, Check, Trash2, Calendar, 
  Hourglass, Clock, Sparkles, FolderArchive, ArrowRightLeft, 
  BookOpen, ChevronRight, CheckCircle2, Moon, AlertOctagon
} from 'lucide-react';

interface IdeasSectionProps {
  ideas: StickyIdea[];
  onAddIdea: (title: string, estimate: number, desc: string) => void;
  onUpdateIdea: (id: string, updates: Partial<StickyIdea>) => void;
  onDeleteIdea: (id: string) => void;
  darkMode?: boolean;
}

export default function IdeasSection({
  ideas,
  onAddIdea,
  onUpdateIdea,
  onDeleteIdea,
  darkMode = false
}: IdeasSectionProps) {
  // Sticky Input states
  const [title, setTitle] = useState('');
  const [estimate, setEstimate] = useState('5');
  const [desc, setDesc] = useState('');

  // Local seconds ticking interval for active running stopwatches
  useEffect(() => {
    const ticker = setInterval(() => {
      ideas.forEach(idea => {
        if (idea.isRunning) {
          onUpdateIdea(idea.id, {
            elapsedSeconds: idea.elapsedSeconds + 1
          });
        }
      });
    }, 1000);
    return () => clearInterval(ticker);
  }, [ideas]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddIdea(title.trim(), Number(estimate) || 2, desc.trim());
    setTitle('');
    setEstimate('5');
    setDesc('');
  };

  const handleToggleTimer = (idea: StickyIdea) => {
    if (idea.isRunning) {
      // Pause
      onUpdateIdea(idea.id, { isRunning: false });
    } else {
      // Start/Resume
      // Ensure other ideas are paused so we focus on exactly ONE running idea (the zen way)
      ideas.forEach(other => {
        if (other.id !== idea.id && other.isRunning) {
          onUpdateIdea(other.id, { isRunning: false });
        }
      });
      onUpdateIdea(idea.id, { 
        isRunning: true, 
        status: 'running',
        lastStartedAt: new Date().toISOString()
      });
    }
  };

  const handleSetStatus = (id: string, status: 'idea' | 'running' | 'completed' | 'later') => {
    onUpdateIdea(id, { 
      status, 
      isRunning: status === 'running' ? true : false 
    });
  };

  // Convert raw seconds to readable stopwatch style (HH:MM:SS)
  const formatStopwatch = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Groups
  const listIdeasByStatus = (status: 'idea' | 'running' | 'completed' | 'later') => {
    return ideas.filter(idea => idea.status === status);
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Top Banner and Registration form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Registration form */}
        <div className={`p-5 border rounded-2xl shadow-sm space-y-4 transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-zinc-150'
        }`}>
          <div className="border-b border-indigo-100/10 pb-2">
            <h3 className="text-sm font-bold flex items-center gap-1.5 font-sans">
              <Sparkles size={16} className="text-indigo-400" />
              توفان فکری و ثبت ایده‌های جدید
            </h3>
            <p className="text-[10px] text-slate-405 mt-1">طرح ایده اولیه، برآورد زمان پیشبرد گام‌به‌گام کارگاه ایده</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-450 mb-1">نام ایده / عنوان پروژه *</label>
              <input 
                type="text" 
                placeholder="ساخت ربات تلگرامی تحلیل تکنیکال..."
                required
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full p-2.5 border rounded-lg focus:outline-none focus:border-indigo-500 text-xs ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-white font-sans' : 'bg-zinc-50 border-zinc-200'
                }`} 
              />
            </div>

            <div>
              <label className="block text-slate-450 mb-1">برآورد زمان لازم برای کارکرد (ساعت)</label>
              <input 
                type="number" 
                value={estimate} 
                onChange={(e) => setEstimate(e.target.value)}
                className={`w-full p-2.5 border rounded-lg focus:outline-none font-mono text-xs ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-zinc-50 border-zinc-200'
                }`} 
              />
            </div>

            <div>
              <label className="block text-slate-450 mb-1">نقشه‌راه / خلاصه ایده</label>
              <textarea 
                rows={3}
                placeholder="ویژگی‌ها، چالش‌ها و اقداماتی که لازم است انجام شود..."
                value={desc} 
                onChange={(e) => setDesc(e.target.value)}
                className={`w-full p-2.5 border rounded-lg focus:outline-none text-xs font-sans ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-zinc-50 border-zinc-200'
                }`} 
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors text-xs cursor-pointer shadow-sm"
            >
              افزودن ایده به جعبه ایده
            </button>
          </form>
        </div>

        {/* Tactile sticky board */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active section categories tabs */}
          <div className="space-y-4">
            
            {/* ROW 1: Running/Timing Idea active panel */}
            {listIdeasByStatus('running').some(idea => idea.isRunning) && (
              <div className="p-5 bg-indigo-950 text-white rounded-2xl shadow-lg border border-indigo-900/40 space-y-3 animate-pulse">
                <div className="flex justify-between items-center border-b border-indigo-900/60 pb-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1.5 font-mono">
                    <Clock size={13} className="text-indigo-400 animate-spin" /> زمان‌سنج فعال ایده لایو
                  </span>
                  <div className="flex items-center gap-1.5">
                    {listIdeasByStatus('running').filter(i => i.isRunning).map(runIdea => (
                      <button 
                        key={runIdea.id}
                        onClick={() => handleSetStatus(runIdea.id, 'completed')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-555 rounded text-[10px] font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                      >
                        <Check size={11} /> تکمیل و آرشیو مأموریت
                      </button>
                    ))}
                  </div>
                </div>

                {listIdeasByStatus('running').filter(i => i.isRunning).map(runIdea => (
                  <div key={runIdea.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-base font-extrabold text-white">{runIdea.title}</h4>
                      <p className="text-xs text-indigo-200 mt-1 max-w-sm leading-relaxed">{runIdea.description}</p>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto font-sans">
                      <div className="text-left md:text-right">
                        <div className="text-2xl font-bold font-mono tracking-widest tabular-nums text-white">{formatStopwatch(runIdea.elapsedSeconds)}</div>
                        <div className="text-[9px] text-indigo-300">برآورد: {runIdea.estimatedHours} ساعت کار</div>
                      </div>
                      
                      <button
                        onClick={() => handleToggleTimer(runIdea)}
                        className="p-3 bg-white text-indigo-950 rounded-full hover:bg-indigo-100 transition-transform hover:scale-105 cursor-pointer shadow-md"
                        title="توقف موقت (برود به در حال انجام)"
                      >
                        <Pause size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB PANELS: Ideas list */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Brainstorm box */}
              <div className={`border rounded-2xl p-4 space-y-3 shadow-sm min-h-[320px] transition-colors ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-zinc-150'
              }`}>
                <h4 className={`text-xs font-bold border-b pb-2 flex justify-between items-center ${
                  darkMode ? 'text-slate-205 border-slate-800' : 'text-slate-800 border-zinc-100'
                }`}>
                  <span>صندوقچه‌ ایده‌های خام</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    darkMode ? 'bg-slate-950 text-indigo-400' : 'bg-slate-100 text-zinc-600'
                  }`}>{listIdeasByStatus('idea').length}</span>
                </h4>

                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-0.5">
                  {listIdeasByStatus('idea').length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-[10px]">ایده جدیدی ثبت نشده است.</div>
                  ) : (
                    listIdeasByStatus('idea').map(idea => (
                      <div key={idea.id} className={`p-3 border rounded-xl space-y-2 relative group transition-colors ${
                        darkMode ? 'bg-slate-950/45 border-slate-850 hover:bg-slate-950' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100/40'
                      }`}>
                        <div>
                          <div className="flex justify-between items-start">
                            <span className={`font-bold text-xs ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{idea.title}</span>
                            <span className="text-[9px] px-1 py-0.5 rounded text-indigo-400 font-mono font-bold border border-indigo-400/20">حدود: {idea.estimatedHours}h</span>
                          </div>
                          {idea.description && <p className="text-[10px] text-slate-400 leading-relaxed mt-1">{idea.description}</p>}
                        </div>

                        <div className="flex gap-1.5 pt-1.5 border-t border-dashed border-indigo-100/5 justify-end text-xs">
                          <button 
                            onClick={() => handleSetStatus(idea.id, 'later')}
                            className="px-1.5 py-0.5 hover:bg-indigo-50/15 rounded text-[9px] text-slate-400 hover:text-slate-300"
                          >
                            بعداً (Snooze)
                          </button>
                          
                          <button 
                            onClick={() => handleToggleTimer(idea)}
                            className="px-2 py-0.5 bg-indigo-655 text-white rounded text-[9px] flex items-center gap-0.5 hover:bg-indigo-700 font-bold transition-all"
                          >
                            <Play size={8} /> شروع پیشبرد
                          </button>
                          
                          <button 
                            onClick={() => onDeleteIdea(idea.id)}
                            className="p-1 text-slate-500 hover:text-rose-500"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* In Progress Box (The crucial section requested!) */}
              <div className={`border rounded-2xl p-4 space-y-3 shadow-sm min-h-[320px] transition-colors ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-zinc-150'
              }`}>
                <h4 className={`text-xs font-bold border-b pb-2 flex justify-between items-center ${
                  darkMode ? 'text-slate-205 border-slate-800' : 'text-slate-800 border-zinc-100'
                }`}>
                  <span>بخش در حال انجام (In Progress)</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    darkMode ? 'bg-slate-950 text-indigo-400' : 'bg-slate-100 text-zinc-650'
                  }`}>{listIdeasByStatus('running').length}</span>
                </h4>

                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-0.5">
                  {listIdeasByStatus('running').length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-[10px] leading-relaxed">
                      ایده‌ای در لیست پیشرفت فعال نیست. روی دکمه شروع پیشبرد کلیک کنید تا وارد این بخش بشود و تایمر به کار بیفتد!
                    </div>
                  ) : (
                    listIdeasByStatus('running').map(idea => (
                      <div key={idea.id} className={`p-3 border rounded-xl space-y-2 relative group transition-colors ${
                        idea.isRunning ? 'border-indigo-500/40 bg-indigo-50/5' : (darkMode ? 'bg-slate-950/45 border-slate-850' : 'bg-zinc-50 border-zinc-200')
                      }`}>
                        <div>
                          <div className="flex justify-between items-start">
                            <span className={`font-bold text-xs ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                              {idea.title}
                            </span>
                            <span className="text-[9px] font-mono font-bold text-amber-500">
                              ⏱ {formatStopwatch(idea.elapsedSeconds)}
                            </span>
                          </div>
                          {idea.description && <p className="text-[10px] text-slate-400 leading-relaxed mt-1">{idea.description}</p>}
                        </div>

                        <div className="flex gap-1.5 pt-1.5 border-t border-dashed border-indigo-100/5 justify-end text-xs items-center">
                          <span className="text-[9px] text-slate-500 ml-auto font-mono">برآورد: {idea.estimatedHours}h</span>
                          
                          <button 
                            onClick={() => handleSetStatus(idea.id, 'idea')}
                            className="px-1 py-0.5 hover:bg-indigo-50/15 rounded text-[9px] text-slate-450 hover:text-slate-300"
                            title="بازگشت به ایده خام برای تعلیق کامل"
                          >
                            تثبیت خام
                          </button>

                          <button 
                            onClick={() => handleToggleTimer(idea)}
                            className={`px-2 py-0.5 rounded text-[9px] flex items-center gap-1 font-bold ${
                              idea.isRunning 
                                ? 'bg-amber-600 text-white hover:bg-amber-700' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                          >
                            {idea.isRunning ? <Pause size={8} /> : <Play size={8} />}
                            {idea.isRunning ? 'توقف و مکث' : 'ادامه زمان‌سنج'}
                          </button>

                          <button 
                            onClick={() => handleSetStatus(idea.id, 'completed')}
                            className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
                            title="پایان ایده و دستاورد"
                          >
                            <Check size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Do Later Box */}
              <div className={`border rounded-2xl p-4 space-y-3 shadow-sm min-h-[320px] transition-colors ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-zinc-150'
              }`}>
                <h4 className={`text-xs font-bold border-b pb-2 flex justify-between items-center ${
                  darkMode ? 'text-slate-205 border-slate-800' : 'text-slate-800 border-zinc-105'
                }`}>
                  <span>بخش بعداً انجام می‌دهم (Snoozed)</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    darkMode ? 'bg-slate-950 text-indigo-400' : 'bg-slate-100 text-zinc-650'
                  }`}>{listIdeasByStatus('later').length}</span>
                </h4>

                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-0.5">
                  {listIdeasByStatus('later').length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-[10px]">ایده معلق شده‌ای در این لیست وجود ندارد.</div>
                  ) : (
                    listIdeasByStatus('later').map(idea => (
                      <div key={idea.id} className={`p-3 border rounded-xl space-y-2 transition-colors ${
                        darkMode ? 'bg-slate-950/45 border-slate-850' : 'bg-zinc-50 border-zinc-200'
                      }`}>
                        <div>
                          <div className="flex justify-between items-start">
                            <span className={`font-bold text-xs ${darkMode ? 'text-slate-202' : 'text-slate-800'}`}>{idea.title}</span>
                            <span className="text-[9px] px-1 py-0.5 rounded text-zinc-500 font-mono">طول: {idea.estimatedHours}h</span>
                          </div>
                          {idea.description && <p className="text-[10px] text-slate-400 leading-relaxed mt-1">{idea.description}</p>}
                        </div>

                        <div className="flex gap-1.5 pt-1 border-t border-dashed border-indigo-100/5 justify-end text-xs">
                          <button 
                            onClick={() => handleSetStatus(idea.id, 'idea')}
                            className={`px-1.5 py-0.5 border text-[9px] transition-all rounded ${
                              darkMode ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-zinc-200 text-slate-700'
                            }`}
                          >
                            بازگرداندن به فعال
                          </button>
                          <button 
                            onClick={() => handleToggleTimer(idea)}
                            className="px-2 py-0.5 bg-indigo-650 text-white rounded text-[9px] flex items-center gap-0.5 hover:bg-indigo-700 font-bold transition-all"
                          >
                            <Play size={8} /> شروع پیشبرد
                          </button>
                          <button 
                            onClick={() => onDeleteIdea(idea.id)}
                            className="p-1 text-slate-500 hover:text-rose-500"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Completed Ideas Archive */}
            <div className={`p-4 border rounded-2xl shadow-sm space-y-3 transition-colors ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-zinc-150'
            }`}>
              <h4 className={`text-xs font-bold border-b pb-2 flex justify-between items-center ${
                darkMode ? 'text-slate-205 border-slate-800' : 'text-slate-850 border-zinc-100'
              }`}>
                <span className="flex items-center gap-1"><FolderArchive size={14} className="text-indigo-400" /> بایگانی ایده‌های تکمیل مأموریت شده (Completed)</span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">کل: {listIdeasByStatus('completed').length}</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 max-h-[140px] overflow-y-auto pr-0.5">
                {listIdeasByStatus('completed').length === 0 ? (
                  <div className="col-span-4 p-4 text-center text-slate-505 text-[10px]">ایده کاملاً رشدیافته و بایگانی شده‌ای یافت نشد.</div>
                ) : (
                  listIdeasByStatus('completed').map(idea => (
                    <div key={idea.id} className={`p-3 border rounded-xl relative transition-colors ${
                      darkMode ? 'bg-slate-950/30 border-slate-850' : 'bg-zinc-50 border-zinc-150'
                    }`}>
                      <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-bold mb-1">
                        <CheckCircle2 size={10} /> مأموریت موفق
                      </div>
                      <h5 className={`font-bold text-[11px] ${darkMode ? 'text-slate-202' : 'text-slate-800'}`}>{idea.title}</h5>
                      <span className="text-[9px] text-slate-400 font-mono block mt-1">زمان پیشبرد: {formatStopwatch(idea.elapsedSeconds)}</span>
                      <button 
                        onClick={() => onDeleteIdea(idea.id)}
                        className={`absolute bottom-2 left-2 transition-colors cursor-pointer ${
                          darkMode ? 'text-slate-600 hover:text-white' : 'text-slate-400 hover:text-rose-600'
                        }`}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
