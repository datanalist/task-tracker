import { useState, useEffect, useMemo } from 'react';
import { 
  format, 
  eachDayOfInterval, 
  isSameDay, 
  startOfMonth, 
  endOfMonth 
} from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Check, Moon, Activity, TrendingUp, Plus, Trash2, Edit2, Lock, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { INITIAL_HABITS, MonthData, Habit } from './types';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState<MonthData>(() => {
    const saved = localStorage.getItem('habit-tracker-data');
    return saved ? JSON.parse(saved) : {};
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habit-tracker-habits');
    return saved ? JSON.parse(saved) : [];
  });

  const [isHabitsLocked, setIsHabitsLocked] = useState<boolean>(() => {
    const saved = localStorage.getItem('habit-tracker-locked');
    return saved ? JSON.parse(saved) : false;
  });

  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('✨');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const nextSuggestion = useMemo(() => {
    return INITIAL_HABITS.find(h => !habits.some(existing => existing.name === h.name));
  }, [habits]);

  const suggestions = useMemo(() => {
    return INITIAL_HABITS.filter(h => !habits.some(existing => existing.name === h.name));
  }, [habits]);

  // Сохранение данных
  useEffect(() => {
    localStorage.setItem('habit-tracker-data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('habit-tracker-habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('habit-tracker-locked', JSON.stringify(isHabitsLocked));
  }, [isHabitsLocked]);

  // Генерация дней месяца
  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    });
  }, [currentDate]);

  const toggleHabit = (dateStr: string, habitId: string) => {
    if (!isHabitsLocked) return;
    
    setData(prev => {
      const dayData = prev[dateStr] || { completedHabits: [], sleepHours: 0 };
      const isCompleted = dayData.completedHabits.includes(habitId);
      
      const newCompleted = isCompleted
        ? dayData.completedHabits.filter(id => id !== habitId)
        : [...dayData.completedHabits, habitId];

      return {
        ...prev,
        [dateStr]: { ...dayData, completedHabits: newCompleted }
      };
    });
  };

  const addHabit = () => {
    if (isHabitsLocked || !newHabitName.trim()) return;
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      icon: newHabitIcon,
    };
    setHabits([...habits, newHabit]);
    setNewHabitName('');
  };

  const addSuggestedHabit = (suggestion: Habit) => {
    if (isHabitsLocked) return;
    const newHabit: Habit = {
      ...suggestion,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
    };
    setHabits([...habits, newHabit]);
  };

  const removeHabit = (id: string) => {
    if (isHabitsLocked) return;
    setHabits(habits.filter(h => h.id !== id));
  };

  const [showConfirmLock, setShowConfirmLock] = useState(false);

  const approveHabits = () => {
    setIsHabitsLocked(true);
    setShowConfirmLock(false);
  };

  const updateSleep = (dateStr: string, hours: number) => {
    setData(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || { completedHabits: [], sleepHours: 0 }), sleepHours: hours }
    }));
  };

  // Данные для графиков
  const chartData = useMemo(() => {
    return daysInMonth.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayInfo = data[dateStr] || { completedHabits: [], sleepHours: 0 };
      return {
        date: format(day, 'd'),
        fullDate: dateStr,
        habitsCount: dayInfo.completedHabits.length,
        sleepHours: dayInfo.sleepHours,
      };
    });
  }, [daysInMonth, data]);

  const stickerColors = [
    'bg-pink-500/10 border-pink-500/50 text-pink-400', 
    'bg-blue-500/10 border-blue-500/50 text-blue-400', 
    'bg-green-500/10 border-green-500/50 text-green-400', 
    'bg-yellow-500/10 border-yellow-500/50 text-yellow-400',
    'bg-orange-500/10 border-orange-500/50 text-orange-400', 
    'bg-purple-500/10 border-purple-500/50 text-purple-400', 
    'bg-red-500/10 border-red-500/50 text-red-400', 
    'bg-indigo-500/10 border-indigo-500/50 text-indigo-400',
    'bg-teal-500/10 border-teal-500/50 text-teal-400', 
    'bg-fuchsia-500/10 border-fuchsia-500/50 text-fuchsia-400', 
    'bg-rose-500/10 border-rose-500/50 text-rose-400', 
    'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
  ];

  const selectMonth = (monthIndex: number) => {
    const newDate = new Date(currentDate.getFullYear(), monthIndex, 1);
    setCurrentDate(newDate);
    setIsSelectorOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] overflow-hidden relative font-mono text-gray-300">
      {/* Month Selector Overlay */}
      <div className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
        isSelectorOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        {/* Background Overlay with blur */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-md transition-all duration-700"
          onClick={() => setIsSelectorOpen(false)}
        />
        
        {/* Tiles Grid / Sheets Container */}
        <div className={cn(
          "relative w-full max-w-lg h-[400px] flex items-center justify-center transition-all duration-700 transform",
          isSelectorOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}>
          {(() => {
            const currentMonthIdx = currentDate.getMonth();
            const orderedIndices = [];
            for (let i = 0; i < 12; i++) {
              orderedIndices.push((currentMonthIdx - i + 12) % 12);
            }
            // Инвертируем, чтобы текущий месяц был последним в массиве и имел самый высокий z-index
            return orderedIndices.reverse().map((monthIdx, displayIdx) => {
              const monthName = months[monthIdx];
              const isSelected = currentDate.getMonth() === monthIdx;
              const offset = displayIdx * 12;
              return (
                <div
                  key={monthName}
                  className="absolute month-sheet-container"
                  style={{
                    zIndex: displayIdx,
                    transform: isSelectorOpen 
                      ? `translate(${-(offset - 80)}px, ${offset - 80}px)` 
                      : 'translate(0, 0)',
                  }}
                >
                  {/* Sticker / Tab */}
                  <div 
                    onClick={() => selectMonth(monthIdx)}
                    className={cn(
                      "absolute px-3 py-1.5 rounded-t-sm text-[9px] font-bold uppercase tracking-[0.15em] backdrop-blur-md border border-b-0 shadow-2xl transition-all duration-300 z-20 whitespace-nowrap cursor-pointer peer month-sticker hover:-translate-y-2",
                      stickerColors[monthIdx]
                    )}
                    style={{
                      right: `${(displayIdx / 11) * 82}%`, // Зеркальное распределение от правого до левого края
                      bottom: '100%',
                    }}
                  >
                    <span className="opacity-80 hover:opacity-100 transition-opacity">
                      {monthName.slice(0, 3)}
                    </span>
                  </div>

                  <button
                    onClick={() => selectMonth(monthIdx)}
                    className={cn(
                      "w-64 h-80 bg-[#0a0a0a] border border-border flex flex-col transition-all duration-300 shadow-2xl month-tile group relative",
                      "peer-hover:-translate-y-4 peer-hover:border-accent peer-hover:scale-[1.02] peer-hover:opacity-100 peer-hover:saturate-150",
                      isSelected ? "border-accent ring-1 ring-accent/30 opacity-100" : "opacity-90"
                    )}
                  >
                    {/* Title Bar Style */}
                    <div className="w-full h-8 bg-[#111] border-b border-border flex items-center justify-between px-3 group-hover:bg-[#1a1a1a] transition-colors flex-row-reverse">
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <div className="w-2 h-2 rounded-full bg-red-500/20 group-hover:bg-red-500 transition-colors" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500 transition-colors" />
                        <div className="w-2 h-2 rounded-full bg-green-500/20 group-hover:bg-green-500 transition-colors" />
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-gray-600 group-hover:text-gray-400">
                        {monthName.slice(0, 3)} {currentDate.getFullYear()}
                      </span>
                    </div>

                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-accent transition-colors">
                          Month
                        </span>
                        <span className="text-[10px] text-gray-700 font-bold">
                          {String(monthIdx + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <span className={cn(
                          "text-2xl font-bold uppercase tracking-[0.2em] rotate-12 transition-colors",
                          isSelected ? "text-accent" : "text-gray-400 group-hover:text-white"
                        )}>
                          {monthName}
                        </span>
                      </div>
                      <div className="h-1 w-full bg-border group-hover:bg-accent/30 transition-colors" />
                    </div>
                  </button>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Main Content */}
      <div 
        className={cn(
          "relative z-10 min-h-screen bg-[#050505] p-4 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
          isSelectorOpen ? "blur-md saturate-[0.7] brightness-[0.4] scale-[0.99]" : "blur-0 saturate-100 brightness-100 scale-100"
        )}
        onClick={() => isSelectorOpen && setIsSelectorOpen(false)}
      >
        <div className="max-w-[1400px] mx-auto space-y-8">
          
          {/* Header */}
          <header className="flex justify-between items-center mb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold tracking-tighter text-white uppercase italic">
                Ghost Mode / <span className="text-accent">Fix Everything</span>
              </h1>
              {!isHabitsLocked && (
                <span className="text-[10px] text-accent/60 uppercase tracking-widest">Setup Phase: Define your habits</span>
              )}
            </div>
            <div className="flex items-center gap-6">
              {!isHabitsLocked && habits.length > 0 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirmLock(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-black text-xs font-bold uppercase tracking-tighter hover:bg-accent/80 transition-colors rounded-sm"
                >
                  <Lock className="w-3 h-3" /> Approve Habits
                </button>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSelectorOpen(!isSelectorOpen);
                }}
                className="flex items-center gap-2 group"
              >
                <div className="text-sm font-medium group-hover:text-accent transition-colors text-white">
                  {format(currentDate, 'MMMM yyyy').toUpperCase()}
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-gray-500 group-hover:text-accent transition-all duration-500",
                  isSelectorOpen ? "rotate-180" : "rotate-0"
                )} />
              </button>
            </div>
          </header>

          {/* Habits Setup (only shown when not locked) */}
          {!isHabitsLocked && (
            <div className="bg-[#0a0a0a] border border-border p-6 rounded-sm space-y-4">
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-white flex items-center gap-2">
                <Edit2 className="w-3 h-3 text-accent" /> Habit Setup
              </h2>
              
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-500">Habit Name</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      placeholder={!nextSuggestion || isInputFocused ? "e.g. Reading" : ""}
                      className="w-48 h-9 bg-black border border-border px-3 text-xs focus:border-accent outline-none relative z-10 text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (!newHabitName.trim() && nextSuggestion) {
                            setNewHabitName(nextSuggestion.name);
                            setNewHabitIcon(nextSuggestion.icon || '✨');
                          } else {
                            addHabit();
                          }
                        }
                      }}
                    />
                    {!newHabitName && !isInputFocused && nextSuggestion && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none text-xs z-0">
                        {nextSuggestion.name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-500">Icon</label>
                  <input 
                    type="text"
                    value={newHabitIcon}
                    onChange={(e) => setNewHabitIcon(e.target.value)}
                    placeholder="✨"
                    className="w-16 h-9 bg-black border border-border px-3 text-xs text-center focus:border-accent outline-none text-white"
                  />
                </div>
                <button 
                  onClick={addHabit}
                  className="h-9 px-6 bg-white/5 border border-border hover:bg-white/10 text-xs font-bold uppercase transition-colors flex items-center gap-2 text-white"
                >
                  <Plus className="w-3 h-3" /> Add Habit
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {habits.map(habit => (
                  <div key={habit.id} className="group flex items-center gap-2 bg-black border border-border px-3 py-1.5 rounded-sm">
                    <span className="text-xs text-white">{habit.icon} {habit.name}</span>
                    <button 
                      onClick={() => removeHabit(habit.id)}
                      className="text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {!isInputFocused && suggestions.map(suggestion => (
                  <button 
                    key={suggestion.id} 
                    onClick={() => addSuggestedHabit(suggestion)}
                    className="flex items-center gap-2 bg-black/40 border border-border/30 px-3 py-1.5 rounded-sm opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:bg-black transition-all cursor-pointer"
                  >
                    <span className="text-xs text-white">{suggestion.icon} {suggestion.name}</span>
                    <Plus className="w-2 h-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tracking Table Container */}
          <div className="overflow-x-auto border-t border-l border-border bg-[#0a0a0a]">
            <div className="inline-block min-w-full">
              {/* Header Row (Days) */}
              <div className="flex">
                <div className="w-48 h-10 border-r border-b border-border flex items-center px-4 bg-[#0d0d0d] sticky left-0 z-10">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Habits</span>
                </div>
                {daysInMonth.map(day => (
                  <div key={day.toString()} className="w-8 h-10 border-r border-b border-border flex flex-col items-center justify-center bg-[#0d0d0d] text-[10px]">
                    <span className="text-gray-500 uppercase">{format(day, 'eeeee')}</span>
                    <span className={cn(
                      "font-bold",
                      isSameDay(day, new Date()) ? "text-accent" : "text-gray-400"
                    )}>{format(day, 'd')}</span>
                  </div>
                ))}
              </div>

              {/* Habit Rows */}
              {habits.map(habit => (
                <div key={habit.id} className="flex">
                  <div className="w-48 h-8 border-r border-b border-border px-4 flex items-center bg-[#0a0a0a] sticky left-0 z-10">
                    <span className="text-[11px] truncate text-white">{habit.name} {habit.icon}</span>
                  </div>
                  {daysInMonth.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isDone = data[dateStr]?.completedHabits.includes(habit.id);
                    return (
                      <div 
                        key={dateStr}
                        onClick={() => isHabitsLocked && toggleHabit(dateStr, habit.id)}
                        className={cn(
                          "w-8 h-8 border-r border-b border-border flex items-center justify-center transition-colors",
                          isHabitsLocked ? "cursor-pointer hover:bg-white/5" : "cursor-not-allowed opacity-50",
                          isDone && "bg-accent/10"
                        )}
                      >
                        {isDone && <Check className="w-4 h-4 text-accent" strokeWidth={3} />}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Sleep Hours Row */}
              <div className="flex bg-[#0d0d0d]/50">
                <div className="w-48 h-8 border-r border-b border-border px-4 flex items-center sticky left-0 z-10">
                  <span className="text-[11px] uppercase tracking-wider text-accent flex items-center gap-2">
                    <Moon className="w-3 h-3" /> Sleep Hours
                  </span>
                </div>
                {daysInMonth.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const hours = data[dateStr]?.sleepHours || 0;
                  return (
                    <div key={dateStr} className="w-8 h-8 border-r border-b border-border relative group">
                      <input 
                        type="number"
                        value={hours || ''}
                        onChange={(e) => updateSleep(dateStr, parseFloat(e.target.value) || 0)}
                        disabled={!isHabitsLocked}
                        className={cn(
                          "w-full h-full bg-transparent text-center text-[10px] focus:outline-none focus:bg-accent/20 text-accent font-bold appearance-none",
                          !isHabitsLocked && "cursor-not-allowed opacity-50"
                        )}
                        placeholder="-"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Habit Count Row */}
              <div className="flex bg-[#0d0d0d]">
                <div className="w-48 h-8 border-r border-b border-border px-4 flex items-center sticky left-0 z-10">
                  <span className="text-[11px] uppercase tracking-wider text-blue-400 flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Habit Count
                  </span>
                </div>
                {chartData.map(d => (
                  <div key={d.fullDate} className="w-8 h-8 border-r border-b border-border flex items-center justify-center text-[10px] font-bold text-blue-400/80">
                    {d.habitsCount}
                  </div>
                ))}
              </div>

              {/* Daily Progress (Bars) */}
              <div className="flex bg-[#080808]">
                <div className="w-48 h-24 border-r border-b border-border px-4 flex items-center sticky left-0 z-10">
                  <span className="text-[11px] uppercase tracking-wider text-gray-500">Daily Progress</span>
                </div>
                {chartData.map(d => (
                  <div key={d.fullDate} className="w-8 h-24 border-r border-b border-border flex items-end justify-center p-[2px]">
                    <div 
                      className="w-full bg-accent/40 rounded-t-sm transition-all duration-500"
                      style={{ height: `${habits.length > 0 ? (d.habitsCount / habits.length) * 100 : 0}%` }}
                    >
                      {d.habitsCount > 0 && (
                        <div className="w-full h-full bg-accent shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
            <div className="bg-[#0a0a0a] border border-border p-6 rounded-sm">
              <h3 className="text-xs uppercase tracking-widest mb-6 flex items-center gap-2 text-accent">
                <TrendingUp className="w-4 h-4" /> Sleep Tracker
              </h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="date" 
                      stroke="#333" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis hide domain={[0, 12]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }}
                      itemStyle={{ color: '#4ade80' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sleepHours" 
                      stroke="#4ade80" 
                      strokeWidth={2} 
                      dot={{ r: 2, fill: '#4ade80' }} 
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-border p-6 rounded-sm flex flex-col items-center justify-center relative overflow-hidden">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4 absolute top-4 left-6">Progress</h3>
              <div className="relative flex items-center justify-center">
                {/* SVG Circle Progress */}
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-900"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 58}
                    strokeDashoffset={2 * Math.PI * 58 * (1 - (habits.length > 0 ? (chartData.reduce((acc, d) => acc + d.habitsCount, 0) / (daysInMonth.length * habits.length)) : 0))}
                    className="text-accent transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {habits.length > 0 ? Math.round((chartData.reduce((acc, d) => acc + d.habitsCount, 0) / (daysInMonth.length * habits.length)) * 100) : 0}%
                  </span>
                  <span className="text-[8px] uppercase tracking-tighter text-gray-500">Completed</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmLock && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0a0a0a] border border-border p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent" /> Confirm Setup
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              После утверждения вы больше не сможете изменять список привычек. Вы готовы начать отслеживание?
            </p>
            <div className="flex gap-4 pt-2">
              <button 
                onClick={approveHabits}
                className="flex-1 h-9 bg-accent text-black text-[10px] font-bold uppercase tracking-tighter hover:bg-accent/80 transition-colors"
              >
                Yes, Approve
              </button>
              <button 
                onClick={() => setShowConfirmLock(false)}
                className="flex-1 h-9 bg-white/5 border border-border text-white text-[10px] font-bold uppercase tracking-tighter hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
