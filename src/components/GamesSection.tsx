import React, { useState } from 'react';
import { GameItem, SerialMovieItem } from '../types';
import { 
  Gamepad2, Clapperboard, Plus, Trash2, Edit3, 
  CheckCircle, HelpCircle, Trophy, BookOpen, Clock, AlertCircle
} from 'lucide-react';

interface GamesSectionProps {
  games: GameItem[];
  serials: SerialMovieItem[];
  onAddGame: (item: Omit<GameItem, 'id'>) => void;
  onDeleteGame: (id: string) => void;
  onAddSerial: (item: Omit<SerialMovieItem, 'id'>) => void;
  onDeleteSerial: (id: string) => void;
  darkMode?: boolean;
}

export default function GamesSection({
  games,
  serials,
  onAddGame,
  onDeleteGame,
  onAddSerial,
  onDeleteSerial,
  darkMode = false
}: GamesSectionProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<'games' | 'serials'>('games');

  // Add Game forms state
  const [gameTitle, setGameTitle] = useState('');
  const [gameStatus, setGameStatus] = useState<GameItem['status']>('unplayed');
  const [gameNotes, setGameNotes] = useState('');

  // Add TV/Movies form state
  const [serialTitle, setSerialTitle] = useState('');
  const [serialStatus, setSerialStatus] = useState<SerialMovieItem['status']>('unwatched');
  const [serialNotes, setSerialNotes] = useState('');

  // Submit Game
  const handleAddGameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameTitle.trim()) return;
    onAddGame({
      title: gameTitle.trim(),
      status: gameStatus,
      notes: gameNotes.trim()
    });
    setGameTitle('');
    setGameNotes('');
  };

  // Submit TV Serial/Movie
  const handleAddSerialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialTitle.trim()) return;
    onAddSerial({
      title: serialTitle.trim(),
      status: serialStatus,
      notes: serialNotes.trim()
    });
    setSerialTitle('');
    setSerialNotes('');
  };

  // Status mapping to elegant Persian Labels & Tailwind styles
  const getGameStatusMeta = (status: GameItem['status']) => {
    switch (status) {
      case 'completed_achievements':
        return { 
          label: 'تکمیل شده با تمامی اچیومنت‌ها (100%)', 
          color: darkMode ? 'bg-emerald-950/40 text-emerald-405 border-emerald-900/30' : 'bg-slate-900 text-white border-slate-950', 
          icon: <Trophy size={11} className="mr-0.5 text-emerald-500" /> 
        };
      case 'completed_no_achievements':
        return { 
          label: 'تکمیل خط استوری داستانی', 
          color: darkMode ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30' : 'bg-zinc-100 text-zinc-800 border-zinc-200', 
          icon: <CheckCircle size={11} className="mr-0.5 text-indigo-500" /> 
        };
      case 'incomplete':
        return { 
          label: 'در دست بازی هم‌اکنون', 
          color: darkMode ? 'bg-amber-950/40 text-amber-400 border-amber-900/30' : 'bg-zinc-50 text-zinc-500 border-zinc-150', 
          icon: <Clock size={11} className="mr-0.5 text-amber-500" /> 
        };
      case 'unplayed':
      default:
        return { 
          label: 'خریداری شده/در نوبت بازی (Backlog)', 
          color: darkMode ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-zinc-100/40 text-zinc-450 border-zinc-150', 
          icon: <HelpCircle size={11} className="mr-0.5 text-slate-500" /> 
        };
    }
  };

  const getSerialStatusMeta = (status: SerialMovieItem['status']) => {
    switch (status) {
      case 'watched':
        return { 
          label: 'کامل دیده شده (Watched)', 
          color: darkMode ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' : 'bg-slate-900 text-white border-slate-950', 
          icon: <CheckCircle size={11} className="mr-0.5 text-emerald-500" /> 
        };
      case 'incomplete':
        return { 
          label: 'نیمه کاره تماشا شده (Watching)', 
          color: darkMode ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30' : 'bg-zinc-100 text-zinc-800 border-zinc-200', 
          icon: <Clock size={11} className="mr-0.5 text-indigo-400" /> 
        };
      case 'unwatched':
      default:
        return { 
          label: 'دیده نشده در لیست تماشا (Watch Later)', 
          color: darkMode ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-zinc-100/40 text-zinc-400 border-zinc-150', 
          icon: <AlertCircle size={11} className="mr-0.5 text-slate-500" /> 
        };
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Tab Selectors */}
      <div className={`p-1.5 w-fit rounded-xl flex gap-2 ${
        darkMode ? 'bg-slate-950 border border-slate-850' : 'bg-zinc-100'
      }`} dir="rtl">
        <button
          onClick={() => setActiveTab('games')}
          className={`px-5 py-2 rounded-lg text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'games' 
              ? (darkMode ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-zinc-900 shadow-sm')
              : 'text-zinc-500 hover:text-zinc-400'
          }`}
        >
          <Gamepad2 size={14} /> قفسه بازی‌های ویدیویی ({games.length})
        </button>
        <button
          onClick={() => setActiveTab('serials')}
          className={`px-5 py-2 rounded-lg text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'serials' 
              ? (darkMode ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-zinc-900 shadow-sm')
              : 'text-zinc-500 hover:text-zinc-400'
          }`}
        >
          <Clapperboard size={14} /> نگارخانه فیلم و سریال ({serials.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Module Input Column */}
        <div className={`p-5 border rounded-2xl shadow-sm space-y-4 transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-zinc-150'
        }`}>
          {activeTab === 'games' ? (
            <div className="space-y-4">
              <div className="border-b border-indigo-100/10 pb-2">
                <h3 className="text-sm font-bold font-display">ثبت بازی در مجموعه</h3>
                <p className="text-[10px] text-slate-400 mt-1">مدیریت پیشرفت اچیومنت‌های بازی‌های کنسول و کامپیوتر</p>
              </div>

              <form onSubmit={handleAddGameSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-450 mb-1 font-semibold">نام یا عنوان بازی *</label>
                  <input 
                    type="text" 
                    placeholder="Witcher 3, Elden Ring..."
                    required
                    value={gameTitle} 
                    onChange={(e) => setGameTitle(e.target.value)}
                    className={`w-full p-2.5 border rounded-lg focus:outline-none focus:border-indigo-500 ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white font-sans' : 'bg-zinc-50 border-zinc-200 text-slate-905'
                    }`} 
                  />
                </div>

                <div>
                  <label className="block text-slate-450 mb-1 font-semibold">وضعیت کنونی پیشبرد *</label>
                  <select
                    value={gameStatus}
                    onChange={(e) => setGameStatus(e.target.value as any)}
                    className={`w-full p-2.5 border rounded-lg focus:outline-none font-sans ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-zinc-50 border-zinc-200 text-slate-700'
                    }`}
                  >
                    <option value="unplayed" className={darkMode ? 'bg-slate-900' : ''}>بازی نشده و در نوبت (Backlog)</option>
                    <option value="incomplete" className={darkMode ? 'bg-slate-900' : ''}>ناقص و نیمه‌کاره رها شده</option>
                    <option value="completed_no_achievements" className={darkMode ? 'bg-slate-900' : ''}>تکمیل شده - فقط خط داستانی</option>
                    <option value="completed_achievements" className={darkMode ? 'bg-slate-900' : ''}>کامل شده به همراه 100٪ اچیومنت‌ها</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-450 mb-1 font-semibold">بررسی کوتاه / احساسات حین بازی</label>
                  <textarea 
                    rows={3}
                    placeholder="داستان، باس‌فایت‌های چالش‌برانگیز..."
                    value={gameNotes} 
                    onChange={(e) => setGameNotes(e.target.value)}
                    className={`w-full p-2.5 border rounded-lg focus:outline-none font-sans ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-zinc-50 border-zinc-200 text-slate-905'
                    }`} 
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors text-xs cursor-pointer shadow-sm"
                >
                  ثبت بازی در آرشیو
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-b border-indigo-100/10 pb-2">
                <h3 className="text-sm font-bold font-display">ثبت سریال یا فیلم</h3>
                <p className="text-[10px] text-slate-400 mt-1">آرشیو آثار برتر سینمایی تмаشا شده یا در صف تماشای بعد</p>
              </div>

              <form onSubmit={handleAddSerialSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-450 mb-1 font-semibold">عنوان سریال / فیلم *</label>
                  <input 
                    type="text" 
                    placeholder="Breaking Bad, Interstellar..."
                    required
                    value={serialTitle} 
                    onChange={(e) => setSerialTitle(e.target.value)}
                    className={`w-full p-2.5 border rounded-lg focus:outline-none focus:border-indigo-500 ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white font-sans' : 'bg-zinc-50 border-zinc-200'
                    }`} 
                  />
                </div>

                <div>
                  <label className="block text-slate-450 mb-1">وضعیت تماشا *</label>
                  <select
                    value={serialStatus}
                    onChange={(e) => setSerialStatus(e.target.value as any)}
                    className={`w-full p-2.5 border rounded-lg focus:outline-none font-sans ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-zinc-50 border-zinc-205 text-slate-705'
                    }`}
                  >
                    <option value="unwatched" className={darkMode ? 'bg-slate-900' : ''}>دیده نشده (در لیست تماشا)</option>
                    <option value="incomplete" className={darkMode ? 'bg-slate-900' : ''}>نیمه‌کاره دیده‌شده (Dropped/Watching)</option>
                    <option value="watched" className={darkMode ? 'bg-slate-900' : ''}>کامل تماشا شده (Watched)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-450 mb-1 font-semibold">توضیح یا یادداشت اثر</label>
                  <textarea 
                    rows={3}
                    placeholder="فیلم‌نامه قدرتمند و کارگردانی نولان..."
                    value={serialNotes} 
                    onChange={(e) => setSerialNotes(e.target.value)}
                    className={`w-full p-2.5 border rounded-lg focus:outline-none font-sans ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-zinc-50 border-zinc-200'
                    }`} 
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors text-xs cursor-pointer shadow-sm"
                >
                  ثبت فیلم/سریال در نگارخانه
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Board Results Column */}
        <div className="lg:col-span-2">
          {activeTab === 'games' ? (
            <div className="space-y-4">
              <h4 className={`text-xs font-bold border-b pb-2 select-none ${
                darkMode ? 'text-slate-300 border-slate-800' : 'text-slate-800 border-zinc-100'
              }`}>لیست بازی‌های من</h4>
              
              {games.length === 0 ? (
                <div className={`p-12 text-center border rounded-2xl text-xs shadow-sm ${
                  darkMode ? 'bg-slate-900/40 border-slate-800 text-slate-500' : 'bg-white border-zinc-150 text-slate-400'
                }`}>
                  هیچ بازی تا‌کنون ثبت نکرده‌اید. بازی‌های هیجان‌انگیز زندگی خود را دسته‌بندی کنید!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {games.map(game => {
                    const meta = getGameStatusMeta(game.status);
                    return (
                      <div key={game.id} className={`p-4 border rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-zinc-150 text-slate-900'
                      }`}>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h5 className={`font-extrabold text-sm ${darkMode ? 'text-slate-100' : 'text-zinc-805'}`}>{game.title}</h5>
                            <button 
                              onClick={() => onDeleteGame(game.id)}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                darkMode ? 'text-slate-550 hover:text-white' : 'text-slate-400 hover:text-rose-600'
                              }`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          
                          {/* Status Badge */}
                          <div className={`p-1 px-2.5 rounded-full border w-fit text-[9px] font-semibold flex items-center gap-1 ${meta.color}`}>
                            {meta.icon}
                            <span>{meta.label}</span>
                          </div>

                          {game.notes && (
                            <p className={`text-xs leading-relaxed font-sans pr-1.5 border-r-2 mt-2.5 ${
                              darkMode ? 'text-slate-400 border-indigo-500/40' : 'text-slate-500 border-zinc-300'
                            }`}>
                              {game.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className={`text-xs font-bold border-b pb-2 select-none ${
                darkMode ? 'text-slate-300 border-slate-800' : 'text-slate-800'
              }`}>فیلم‌ها و سریال‌های من</h4>
              
              {serials.length === 0 ? (
                <div className={`p-12 text-center border rounded-2xl text-xs shadow-sm ${
                  darkMode ? 'bg-slate-900/40 border-slate-800 text-slate-500' : 'bg-white border-zinc-150 text-slate-450'
                }`}>
                  قفسه فیلم‌ها و سریال‌های تماشا شده خالی است. اولین فیلم اثرگذار خود را ثبت کنید!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serials.map(serial => {
                    const meta = getSerialStatusMeta(serial.status);
                    return (
                      <div key={serial.id} className={`p-4 border rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-zinc-150 text-slate-900'
                      }`}>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h5 className={`font-extrabold text-sm ${darkMode ? 'text-slate-100' : 'text-zinc-805'}`}>{serial.title}</h5>
                            <button 
                              onClick={() => onDeleteSerial(serial.id)}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                darkMode ? 'text-slate-550 hover:text-white' : 'text-slate-400 hover:text-rose-600'
                              }`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          {/* Status Badge */}
                          <div className={`p-1 px-2.5 rounded-full border w-fit text-[9px] font-semibold flex items-center gap-1 ${meta.color}`}>
                            {meta.icon}
                            <span>{meta.label}</span>
                          </div>

                          {serial.notes && (
                            <p className={`text-xs leading-relaxed font-sans pr-1.5 border-r-2 mt-2.5 ${
                              darkMode ? 'text-slate-400 border-indigo-500/40' : 'text-slate-500 border-zinc-300'
                            }`}>
                              {serial.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
