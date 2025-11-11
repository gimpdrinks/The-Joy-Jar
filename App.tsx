
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AppState, Win, Category, Settings, TimeFilter } from './types';
import { CATEGORIES, INITIAL_APP_STATE, SEED_WINS } from './constants';
import { analyzeWinsWithAI } from './services/geminiService';

const STORAGE_KEY = 'theJoyJarState_v1';

// --- SHARED CONFIGS ---
const MOOD_CONFIG = {
    bgColors: ['bg-slate-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-orange-500'],
    textColors: ['text-slate-500', 'text-blue-500', 'text-green-500', 'text-yellow-500', 'text-orange-600'],
    labels: ['Okay 😐', 'Good 🙂', 'Great 😄', 'Awesome 😊', 'Amazing! 🎉']
};

const EFFORT_CONFIG = {
    bgColors: ['bg-green-400', 'bg-teal-400', 'bg-yellow-400', 'bg-orange-500', 'bg-red-500'],
    textColors: ['text-green-500', 'text-teal-500', 'text-yellow-500', 'text-orange-600', 'text-red-600'],
    labels: ['A little 💨', 'Some 💪', 'Moderate 🔥', 'A lot 🥵', 'Max effort 🚀']
};


// --- UTILITY FUNCTIONS ---
const loadState = (): AppState => {
    try {
        const storedState = localStorage.getItem(STORAGE_KEY);
        if (storedState) {
            const parsed = JSON.parse(storedState);
            if (parsed.version === "1" && parsed.wins && parsed.settings) {
                if(!('ritualText' in parsed.settings)) parsed.settings.ritualText = "Take a deep breath and smile.";
                if(!('dailyReminder' in parsed.settings)) parsed.settings.dailyReminder = "none";
                if (!parsed.categories || !Array.isArray(parsed.categories)) {
                    parsed.categories = CATEGORIES;
                }
                delete parsed.settings.aiEnabled; 
                delete parsed.settings.theme; 
                return parsed;
            }
        }
        return { ...INITIAL_APP_STATE, wins: SEED_WINS };
    } catch (error)
    {
        console.error("Failed to load state from localStorage", error);
        return { ...INITIAL_APP_STATE, wins: SEED_WINS };
    }
};

const saveState = (state: AppState) => {
    try {
        const stateToSave = { ...state, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
        console.error("Failed to save state to localStorage", error);
    }
};

const TAG_COLORS = [
    { bg: 'bg-blue-100', text: 'text-blue-800' },
    { bg: 'bg-green-100', text: 'text-green-800' },
    { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    { bg: 'bg-purple-100', text: 'text-purple-800' },
    { bg: 'bg-pink-100', text: 'text-pink-800' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    { bg: 'bg-teal-100', text: 'text-teal-800' },
    { bg: 'bg-orange-100', text: 'text-orange-800' },
];

const getTagColorClasses = (tag: string): string => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % TAG_COLORS.length);
    const color = TAG_COLORS[index];
    return `${color.bg} ${color.text}`;
};

// --- ICON COMPONENTS ---
const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 cursor-help"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const TagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
);

const CategoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1 text-slate-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);


// --- HELPER COMPONENTS ---

const ConfettiPiece: React.FC<{ i: number }> = ({ i }) => {
    const colors = ['bg-yellow-400', 'bg-blue-400', 'bg-pink-400', 'bg-green-400', 'bg-indigo-400'];
    const animations = ['animate-confetti-slow', 'animate-confetti-medium', 'animate-confetti-fast'];
    const color = colors[i % colors.length];
    const animation = animations[i % animations.length];
    const left = `${Math.random() * 100}%`;
    const delay = `${Math.random() * 2}s`;
    return <div className={`absolute top-0 w-2 h-2 ${color} rounded-full motion-safe:${animation} opacity-0`} style={{ left, animationDelay: delay }} />;
};

const Confetti: React.FC = () => (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-20">
        {[...Array(50)].map((_, i) => <ConfettiPiece key={i} i={i} />)}
    </div>
);

const SliderInput: React.FC<{ 
    label: string; 
    value: number; 
    onChange: (value: number) => void; 
    tooltipText: string;
    type: 'mood' | 'effort';
}> = ({ label, value, onChange, tooltipText, type }) => {
    
    const config = type === 'mood' ? MOOD_CONFIG : EFFORT_CONFIG;
    const bgColorClass = config.bgColors[value - 1];
    const textColorClass = config.textColors[value - 1];
    const labelText = config.labels[value - 1];

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                 <label className="block text-lg font-semibold text-slate-700">
                    {label}
                    <span className="relative group inline-block">
                        <InfoIcon />
                        <span className="absolute bottom-full -left-1/2 mb-2 w-64 p-2 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {tooltipText}
                        </span>
                    </span>
                </label>
                <span className={`text-lg font-bold ${textColorClass}`}>{labelText}</span>
            </div>
            <div className="relative w-full h-2 bg-slate-200 rounded-full mt-1">
                <div className={`absolute top-0 left-0 h-2 ${bgColorClass} rounded-full transition-all`} style={{ width: `${((value - 1) / 4) * 100}%` }}></div>
                <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={value}
                    onChange={e => onChange(Number(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer"
                />
            </div>
        </div>
    );
};

const Calendar: React.FC<{ selectedDate: string; onDateSelect: (date: string) => void; onClose: () => void; }> = ({ selectedDate, onDateSelect, onClose }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate + 'T00:00:00'));
    const calendarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const changeMonth = (offset: number) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const handleDateClick = (day: number) => {
        const newDate = new Date(year, month, day);
        onDateSelect(newDate.toISOString().split('T')[0]);
    };

    return (
        <div ref={calendarRef} className="absolute z-30 mt-2 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 p-4">
            <div className="flex justify-between items-center mb-4">
                <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-slate-100 transition-colors" aria-label="Previous month">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <div className="font-semibold text-lg">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-slate-100 transition-colors" aria-label="Next month">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm text-slate-500 font-medium">
                {daysOfWeek.map(day => <div key={day} className="w-10 h-10 flex items-center justify-center">{day.slice(0,1)}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, day) => {
                    const dayNumber = day + 1;
                    const dateObj = new Date(year, month, dayNumber);
                    const dateStr = dateObj.toISOString().split('T')[0];
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    
                    let buttonClasses = "w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-700";
                    if (isSelected) buttonClasses += " bg-indigo-600 text-white hover:bg-indigo-700 font-semibold";
                    else if (isToday) buttonClasses += " ring-2 ring-indigo-300";
                    
                    return (
                        <button type="button" key={dayNumber} onClick={() => handleDateClick(dayNumber)} className={buttonClasses}>
                            {dayNumber}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const ScoreDisplay: React.FC<{ label: string; value: number; type: 'mood' | 'effort' }> = ({ label, value, type }) => {
    const config = type === 'mood' ? MOOD_CONFIG : EFFORT_CONFIG;
    const textColorClass = config.textColors[value - 1];
    const labelText = config.labels[value - 1];
    const emoji = labelText.match(/(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u)?.[0] || '';

    return (
        <p className="flex items-center justify-end gap-1.5">
            <span>{label}: {value}/5</span>
            <span className={`${textColorClass} text-lg`}>{emoji}</span>
        </p>
    );
};


// --- UI COMPONENTS ---

const Header: React.FC<{ onSettingsClick: () => void }> = ({ onSettingsClick }) => (
    <header className="p-4 bg-white/50 backdrop-blur-sm border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
        <div className="flex-1"></div>
        <div className="text-center">
            <img 
                src="https://res.cloudinary.com/dbylka4xx/image/upload/v1751883360/AiForPinoys_Logo_ttg2id.png" 
                alt="AiForPinoys Logo" 
                className="h-10 mx-auto mb-1"
            />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">The Joy Jar</h1>
            <p className="text-sm text-slate-500">Collect your happy moments.</p>
        </div>
        <div className="flex-1 flex justify-end items-center gap-4">
            <div className="relative group">
                <LockIcon />
                <span className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                    Your data is private and stored only in this browser.
                </span>
            </div>
            <button onClick={onSettingsClick} className="text-slate-500 hover:text-indigo-500 transition-colors" aria-label="Open settings">
                <SettingsIcon />
            </button>
        </div>
    </header>
);

const MultiSelectTagInput: React.FC<{ allTags: string[]; selectedTags: string[]; setSelectedTags: (tags: string[]) => void; className?: string }> = ({ allTags, selectedTags, setSelectedTags, className }) => {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredTags = useMemo(() => allTags.filter(tag => !selectedTags.includes(tag) && tag.toLowerCase().includes(inputValue.toLowerCase())), [allTags, selectedTags, inputValue]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const addTag = (tag: string) => {
        const newTag = tag.trim();
        if (newTag && !selectedTags.includes(newTag)) {
            setSelectedTags([...selectedTags, newTag]);
        }
        setInputValue('');
        setIsOpen(false);
    };

    const removeTag = (tagToRemove: string) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ',' || e.key === 'Enter') {
            e.preventDefault();
            if (inputValue) addTag(inputValue);
        }
        if (e.key === 'Backspace' && !inputValue) {
            removeTag(selectedTags[selectedTags.length - 1]);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <div className={`${className} flex items-center flex-wrap gap-2`} onClick={() => inputRef.current?.focus()}>
                {selectedTags.map(tag => (
                    <span key={tag} className={`flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-full ${getTagColorClasses(tag)}`}>
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="font-bold">&times;</button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={e => {setInputValue(e.target.value); setIsOpen(true);}}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(true)}
                    className="flex-grow bg-transparent focus:outline-none p-1 text-lg text-slate-900 placeholder-slate-400"
                    placeholder={selectedTags.length > 0 ? '' : 'Add tags...'}
                />
            </div>
            {isOpen && filteredTags.length > 0 && (
                 <div className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-slate-200 max-h-48 overflow-y-auto">
                    <ul>
                        {filteredTags.map(tag => (
                            <li key={tag}><button type="button" className="w-full text-left px-4 py-2 text-lg text-slate-700 hover:bg-indigo-50" onClick={() => addTag(tag)}>{tag}</button></li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
};


type AddWinFormProps = { onAddWin: (win: Omit<Win, 'id'>) => void; ritualText: string; allTags: string[]; categories: Category[] }
const AddWinForm: React.FC<AddWinFormProps> = ({ onAddWin, ritualText, allTags, categories }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [category, setCategory] = useState<Category>('Work');
    const [tags, setTags] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [mood, setMood] = useState(3);
    const [effort, setEffort] = useState(3);
    const [cost, setCost] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;
        onAddWin({ date, title, notes, tags, category, mood, effort, cost });
        setTitle(''); setTags([]); setNotes(''); setMood(3); setEffort(3); setCost(0); setCategory('Work');
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 4000);
    };

    const handleDateSelect = (selectedDate: string) => {
        setDate(selectedDate);
        setIsCalendarOpen(false);
    };

    const labelStyle = "block text-base font-semibold text-slate-700 mb-2";
    const inputStyle = "w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors";

    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    return (
        <>
            {showCelebration && <Confetti />}
            {showCelebration && (
                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10 motion-safe:animate-pulse">
                    <p className="text-3xl font-bold text-indigo-500">You did it!</p>
                    <p className="mt-2 text-slate-600 text-lg">{ritualText}</p>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className={labelStyle}>
                        What is your win?
                        <span className="relative group inline-block">
                            <InfoIcon />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                A 'win' can be anything from a major project to a small positive moment you want to acknowledge.
                            </span>
                        </span>
                    </label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className={inputStyle} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="date-display" className={labelStyle}>Date</label>
                        <div className="relative">
                            <button type="button" id="date-display" onClick={() => setIsCalendarOpen(!isCalendarOpen)} className={`${inputStyle} text-left flex items-center justify-between`}>
                                <span>{formattedDate}</span>
                                <CalendarIcon />
                            </button>
                            {isCalendarOpen && (
                                <Calendar selectedDate={date} onDateSelect={handleDateSelect} onClose={() => setIsCalendarOpen(false)} />
                            )}
                        </div>
                    </div>
                    <div className="relative">
                        <label htmlFor="category" className={labelStyle}>Category</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value as Category)} className={`${inputStyle} appearance-none`}>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 pt-6 text-slate-700">
                           <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
                <div>
                    <label className={labelStyle}>Tags</label>
                    <MultiSelectTagInput allTags={allTags} selectedTags={tags} setSelectedTags={setTags} className={inputStyle} />
                </div>
                <div>
                    <label htmlFor="notes" className={labelStyle}>What makes this win special? Tell me more.</label>
                    <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`${inputStyle} resize-none`} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-2">
                     <SliderInput 
                        label="Mood" 
                        value={mood} 
                        onChange={setMood} 
                        type="mood"
                        tooltipText="How did this win make you feel? (1 = Okay, 5 = Amazing!)" 
                    />
                    <SliderInput 
                        label="Effort" 
                        value={effort} 
                        onChange={setEffort} 
                        type="effort"
                        tooltipText="How much work did this win take? (1 = A little, 5 = A lot!)" 
                    />
                </div>
                <div>
                    <label htmlFor="cost" className={labelStyle}>Celebration Cost (₱)</label>
                    <div className="relative">
                         <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 text-lg">₱</span>
                        <input type="number" id="cost" min="0" value={cost} onChange={e => setCost(Number(e.target.value))} className={`${inputStyle} pl-8`} />
                    </div>
                </div>
                <div className="pt-4">
                    <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105">Add & Celebrate 🎉</button>
                </div>
            </form>
        </>
    );
};

type WinItemProps = { win: Win, onDelete: (id: string) => void };
const WinItem: React.FC<WinItemProps> = ({ win, onDelete }) => (
    <div className="bg-white p-5 rounded-xl shadow-md space-y-3">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-slate-500">{win.date} &middot; {win.category}</p>
                <h3 className="font-semibold text-lg text-slate-800">{win.title}</h3>
            </div>
            <button onClick={() => onDelete(win.id)} className="text-slate-400 hover:text-red-500 text-sm font-medium">Delete</button>
        </div>
        {win.notes && <p className="text-base text-slate-600">{win.notes}</p>}
        <div className="flex justify-between items-end pt-1">
            <div className="flex gap-2 flex-wrap">
                {win.tags.map(tag => (
                    <span key={tag} className={`text-sm font-semibold px-2.5 py-1 rounded-full ${getTagColorClasses(tag)}`}>
                        {tag}
                    </span>
                ))}
            </div>
            <div className="text-right text-sm text-slate-500 font-medium space-y-1">
                <ScoreDisplay label="Mood" value={win.mood} type="mood" />
                <ScoreDisplay label="Effort" value={win.effort} type="effort" />
                {win.cost > 0 && <p className="pt-1">Celebration Cost: ₱{win.cost.toLocaleString()}</p>}
            </div>
        </div>
    </div>
);


type CustomSelectProps = { options: string[]; selectedValue: string; onValueChange: (value: string) => void; placeholder: string; searchable?: boolean; icon?: React.ReactNode; };
const CustomSelect: React.FC<CustomSelectProps> = ({ options, selectedValue, onValueChange, placeholder, searchable = false, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = useMemo(() => options.filter(option => option.toLowerCase().includes(searchTerm.toLowerCase())), [options, searchTerm]);
    const handleSelect = (value: string) => { onValueChange(value); setIsOpen(false); setSearchTerm(''); };
    
    const baseStyle = "w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors";

    return (
        <div className="relative" ref={selectRef}>
            <button type="button" className={`${baseStyle} flex items-center justify-between text-left`} onClick={() => setIsOpen(!isOpen)} aria-haspopup="listbox" aria-expanded={isOpen}>
                <span className="flex items-center gap-2">
                    {icon}
                    <span className={`text-lg ${selectedValue ? 'text-slate-900' : 'text-slate-400'}`}>
                        {selectedValue || placeholder}
                    </span>
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            {isOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-slate-200 max-h-60 overflow-y-auto">
                    {searchable && (
                        <div className="p-2 border-b border-slate-200 sticky top-0 bg-white">
                            <input type="text" placeholder="Search..." autoFocus value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-100 border-transparent rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-lg" />
                        </div>
                    )}
                    <ul role="listbox">
                        <li><button type="button" className="w-full text-left px-4 py-2 text-lg text-slate-700 hover:bg-green-50" onClick={() => handleSelect('')}>{placeholder}</button></li>
                        {filteredOptions.map(option => (
                            <li key={option}><button type="button" className="w-full text-left px-4 py-2 text-lg text-slate-700 hover:bg-green-50" onClick={() => handleSelect(option)}>{option}</button></li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

type FiltersPanelProps = { timeFilter: TimeFilter; setTimeFilter: (f: TimeFilter) => void; searchText: string; setSearchText: (s: string) => void; tagFilter: string; setTagFilter: (t: string) => void; categoryFilter: string; setCategoryFilter: (c: string) => void; allTags: string[]; categories: Category[] };
const FiltersPanel: React.FC<FiltersPanelProps> = ({ timeFilter, setTimeFilter, searchText, setSearchText, tagFilter, setTagFilter, categoryFilter, setCategoryFilter, allTags, categories }) => {
    const labelStyle = "block text-sm font-medium text-slate-600 mb-1";
    const inputStyle = "w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors";

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="search" className={labelStyle}>Search</label>
                <input type="search" id="search" placeholder="Search title or notes..." value={searchText} onChange={e => setSearchText(e.target.value)} className={inputStyle} />
            </div>
            <div>
                <label className={`${labelStyle} mb-2`}>Time Period</label>
                <div className="flex gap-2 flex-wrap">
                    {(["today", "7d", "30d", "all"] as TimeFilter[]).map(tf => (
                        <button key={tf} onClick={() => setTimeFilter(tf)} className={`px-4 py-2 text-base rounded-full transition-colors font-semibold ${timeFilter === tf ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                            {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : tf === 'all' ? 'All Time' : 'Today'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className={`${labelStyle}`}>Filter by Tag</label>
                    <CustomSelect options={allTags} selectedValue={tagFilter} onValueChange={setTagFilter} placeholder="All Tags" searchable icon={<TagIcon />} />
                </div>
                <div>
                    <label className={`${labelStyle}`}>Filter by Category</label>
                    <CustomSelect options={categories} selectedValue={categoryFilter} onValueChange={setCategoryFilter} placeholder="All Categories" icon={<CategoryIcon />} />
                </div>
            </div>
        </div>
    );
};


type StatsPanelProps = { allWins: Win[]; geminiKey: string; };
const StatsPanel: React.FC<StatsPanelProps> = ({ allWins, geminiKey }) => {
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysisPeriod, setAnalysisPeriod] = useState<TimeFilter>('7d');

    const handleAnalyzeWithAI = async () => {
        setIsLoading(true);
        const timeFilterLabels: Record<TimeFilter, string> = { today: 'Today', '7d': 'Last 7 Days', '30d': 'Last 30 Days', 'all': 'All Time' };
        const rangeLabel = timeFilterLabels[analysisPeriod];

        let winsToAnalyze = [...allWins];
        if (analysisPeriod !== 'all') {
            const now = new Date();
            const filterDate = new Date();
            if (analysisPeriod === 'today') {
                 winsToAnalyze = winsToAnalyze.filter(w => new Date(w.date + 'T00:00:00').toDateString() === now.toDateString());
            } else {
                if (analysisPeriod === '7d') filterDate.setDate(now.getDate() - 7);
                if (analysisPeriod === '30d') filterDate.setDate(now.getDate() - 30);
                winsToAnalyze = winsToAnalyze.filter(w => new Date(w.date + 'T00:00:00') >= filterDate && new Date(w.date + 'T00:00:00') <= now);
            }
        }
        
        const result = await analyzeWinsWithAI(winsToAnalyze, geminiKey, rangeLabel);
        setSummary(result);
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <div>
                 <label className="block text-sm font-medium text-slate-600 mb-2">Select Period to Analyze</label>
                 <div className="flex gap-2 flex-wrap mb-4">
                    {(["today", "7d", "30d", "all"] as TimeFilter[]).map(tf => (
                        <button key={tf} onClick={() => setAnalysisPeriod(tf)} className={`px-4 py-2 text-base rounded-full transition-colors font-semibold ${analysisPeriod === tf ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                            {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : tf === 'all' ? 'All Time' : 'Today'}
                        </button>
                    ))}
                </div>
                <button onClick={handleAnalyzeWithAI} disabled={isLoading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 text-lg rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:from-purple-300 disabled:to-indigo-300 disabled:cursor-not-allowed transition-all transform hover:scale-105">
                    {isLoading ? 'Reflecting...' : 'Ask AI Coach'}
                </button>
            </div>
            {summary && (
                <div className="p-4 bg-slate-100 rounded-lg whitespace-pre-wrap text-base font-sans leading-relaxed text-slate-700" style={{ fontFamily: 'monospace, monospace' }}>
                    {summary}
                </div>
            )}
        </div>
    );
};

type SettingsModalProps = { isOpen: boolean; onClose: () => void; settings: Settings; setSettings: (s: Settings) => void; geminiKey: string; setGeminiKey: (k: string) => void; categories: Category[]; allTags: string[]; onAddCategory: (name: string) => void; onDeleteCategory: (name: string) => void; onDeleteTag: (name: string) => void; };
const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, setSettings, geminiKey, setGeminiKey, categories, allTags, onAddCategory, onDeleteCategory, onDeleteTag }) => {
    const [newCategory, setNewCategory] = useState('');
    if (!isOpen) return null;
    const inputStyle = "w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors";

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        onAddCategory(newCategory);
        setNewCategory('');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Settings</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><CloseIcon /></button>
                </div>
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                     <div>
                        <label htmlFor="gemini-key" className="block text-base font-semibold text-slate-700">Your Gemini API Key</label>
                         <p className="text-sm text-slate-500 mb-2">The key is only stored in memory and is never saved.</p>
                        <input type="password" id="gemini-key" value={geminiKey} onChange={e => setGeminiKey(e.target.value)} className={inputStyle} />
                    </div>
                     <div>
                        <label htmlFor="ritual-text" className="block text-base font-semibold text-slate-700">Celebration Ritual Text</label>
                        <input type="text" id="ritual-text" value={settings.ritualText} onChange={e => setSettings({...settings, ritualText: e.target.value})} className={inputStyle} />
                    </div>
                    <hr/>
                    <div>
                         <h3 className="text-xl font-bold mb-3">Manage Categories</h3>
                         <form onSubmit={handleAddCategory} className="flex gap-2 mb-3">
                            <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New category name" className={`${inputStyle} text-base`} />
                            <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 rounded-lg hover:bg-indigo-700 transition-colors">Add</button>
                         </form>
                         <ul className="space-y-2">
                            {categories.map(cat => (
                                <li key={cat} className="flex justify-between items-center bg-slate-100 p-2 rounded-md">
                                    <span className="text-slate-800">{cat}</span>
                                    {cat !== 'Other' && <button onClick={() => onDeleteCategory(cat)} className="text-red-500 hover:text-red-700"><TrashIcon /></button>}
                                </li>
                            ))}
                         </ul>
                    </div>
                    <hr/>
                    <div>
                         <h3 className="text-xl font-bold mb-3">Manage Tags</h3>
                         <p className="text-sm text-slate-500 mb-2">Deleting a tag will remove it from all associated wins.</p>
                         <ul className="space-y-2">
                            {allTags.length > 0 ? allTags.map(tag => (
                                <li key={tag} className="flex justify-between items-center bg-slate-100 p-2 rounded-md">
                                    <span className={getTagColorClasses(tag) + ' px-2 py-0.5 rounded-full text-sm font-medium'}>{tag}</span>
                                    <button onClick={() => onDeleteTag(tag)} className="text-red-500 hover:text-red-700"><TrashIcon /></button>
                                </li>
                            )) : <p className="text-slate-500">No tags created yet.</p>}
                         </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Footer: React.FC<{onExport: () => void, onImport: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({onExport, onImport}) => {
    const importRef = useRef<HTMLInputElement>(null);
    return (
        <footer className="p-6 text-center text-sm text-slate-500 border-t border-slate-200">
            <div className="flex justify-center gap-6 mb-4">
                <button onClick={onExport} className="hover:text-indigo-500 font-semibold">Export Data</button>
                <button onClick={() => importRef.current?.click()} className="hover:text-indigo-500 font-semibold">Import Data</button>
                <input type="file" ref={importRef} className="hidden" accept=".json" onChange={onImport} />
            </div>
             <p className="mb-2">
                Created by <a href="https://aiforpinoys.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline font-semibold">@aiforpinoys</a>
            </p>
            <p>The Joy Jar v1 &middot; Your data is yours. Everything is stored locally in this browser.</p>
        </footer>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
    const [appState, setAppState] = useState<AppState>(loadState);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [geminiKey, setGeminiKey] = useState(''); // In-memory only
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
    const [searchText, setSearchText] = useState('');
    const [tagFilter, setTagFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => { saveState(appState); }, [appState]);
    
    const handleAddWin = useCallback((newWinData: Omit<Win, 'id'>) => setAppState(prev => ({ ...prev, wins: [{ ...newWinData, id: new Date().toISOString() + Math.random() }, ...prev.wins] })), []);
    const handleDeleteWin = useCallback((id: string) => { if (window.confirm("Are you sure you want to delete this win?")) setAppState(prev => ({ ...prev, wins: prev.wins.filter(w => w.id !== id) })); }, []);
    const handleUpdateSettings = useCallback((newSettings: Settings) => setAppState(prev => ({ ...prev, settings: newSettings })), []);
    
    const handleAddCategory = useCallback((name: string) => {
        const trimmed = name.trim();
        if (trimmed && !appState.categories.find(c => c.toLowerCase() === trimmed.toLowerCase())) {
            setAppState(prev => ({...prev, categories: [...prev.categories, trimmed].sort() }));
        }
    }, [appState.categories]);

    const handleDeleteCategory = useCallback((name: string) => {
        if (name === 'Other') { alert("Cannot delete the 'Other' category."); return; }
        if (window.confirm(`Are you sure you want to delete the "${name}" category? All wins using it will be moved to "Other".`)) {
            setAppState(prev => ({
                ...prev,
                wins: prev.wins.map(win => win.category === name ? { ...win, category: 'Other' } : win),
                categories: prev.categories.filter(c => c !== name),
            }));
        }
    }, []);

    const handleDeleteTag = useCallback((tagToDelete: string) => {
        if (window.confirm(`Are you sure you want to delete the tag "${tagToDelete}"? It will be removed from all wins.`)) {
            setAppState(prev => ({
                ...prev,
                wins: prev.wins.map(win => ({ ...win, tags: win.tags.filter(tag => tag !== tagToDelete) })),
            }));
        }
    }, []);

    const filteredWins = useMemo(() => {
        let wins = [...appState.wins].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (timeFilter !== 'all') {
            const now = new Date();
            const filterDate = new Date();
            if (timeFilter === 'today') {
                 wins = wins.filter(w => new Date(w.date + 'T00:00:00').toDateString() === now.toDateString());
            } else {
                if (timeFilter === '7d') filterDate.setDate(now.getDate() - 7);
                if (timeFilter === '30d') filterDate.setDate(now.getDate() - 30);
                wins = wins.filter(w => new Date(w.date + 'T00:00:00') >= filterDate && new Date(w.date + 'T00:00:00') <= now);
            }
        }
        if (searchText) {
            const lowerSearch = searchText.toLowerCase();
            wins = wins.filter(w => w.title.toLowerCase().includes(lowerSearch) || (w.notes && w.notes.toLowerCase().includes(lowerSearch)));
        }
        if (tagFilter) wins = wins.filter(w => w.tags.includes(tagFilter));
        if (categoryFilter) wins = wins.filter(w => w.category === categoryFilter);
        return wins;
    }, [appState.wins, timeFilter, searchText, tagFilter, categoryFilter]);

    const allTags = useMemo(() => Array.from(new Set(appState.wins.flatMap(w => w.tags))).sort(), [appState.wins]);

    const handleExport = () => {
        const dataStr = JSON.stringify(appState, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'TheJoyJar_backup.json');
        linkElement.click();
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File is not text");
                const importedState = JSON.parse(text);
                if (importedState.version === "1" && Array.isArray(importedState.wins) && importedState.settings) {
                    if (window.confirm(`Found ${importedState.wins.length} wins. Replace current data? (Cancel to merge)`)) {
                        if (!importedState.categories || !Array.isArray(importedState.categories)) { importedState.categories = CATEGORIES; }
                        setAppState(importedState);
                    } else {
                         setAppState(prev => {
                            const existingIds = new Set(prev.wins.map(w => w.id));
                            const newWins = importedState.wins.filter((w: Win) => !existingIds.has(w.id));
                            const combinedCategories = Array.from(new Set([...prev.categories, ...(importedState.categories || [])])).sort();
                            return { ...prev, wins: [...prev.wins, ...newWins], categories: combinedCategories };
                         });
                    }
                    alert("Import successful!");
                } else {
                    throw new Error("Invalid file format.");
                }
            } catch (err) {
                alert(`Import failed: ${err instanceof Error ? err.message : "Unknown error"}`);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    return (
        <>
            <div className="min-h-screen">
                <Header onSettingsClick={() => setIsSettingsOpen(true)} />
                <main className="p-4 md:p-8">
                    <div className="max-w-3xl mx-auto space-y-12">
                        
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Log a New Win</h2>
                            <div className="p-8 bg-indigo-50 rounded-2xl shadow-lg relative overflow-hidden">
                                <AddWinForm onAddWin={handleAddWin} ritualText={appState.settings.ritualText} allTags={allTags} categories={appState.categories} />
                            </div>
                        </section>

                        <section>
                             <h2 className="text-2xl font-bold text-slate-800 mb-4">Filter Your Wins</h2>
                             <div className="p-8 bg-green-50 rounded-2xl shadow-lg">
                                <FiltersPanel timeFilter={timeFilter} setTimeFilter={setTimeFilter} searchText={searchText} setSearchText={setSearchText} tagFilter={tagFilter} setTagFilter={setTagFilter} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} allTags={allTags} categories={appState.categories}/>
                             </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-800">Your Wins ({filteredWins.length})</h2>
                            {filteredWins.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredWins.map(win => <WinItem key={win.id} win={win} onDelete={handleDeleteWin}/>)}
                                </div>
                            ) : (
                                <div className="text-center p-10 bg-yellow-50 rounded-2xl shadow-lg">
                                    <h3 className="text-xl font-semibold text-yellow-800">No wins to show... yet!</h3>
                                    <p className="text-slate-500 mt-2 text-base">Use the form above to log your first win and start celebrating.</p>
                                </div>
                            )}
                        </section>
                        
                        <section>
                             <h2 className="text-2xl font-bold text-slate-800 mb-4">Stats & Analysis</h2>
                             <div className="p-8 bg-purple-50 rounded-2xl shadow-lg">
                                <StatsPanel allWins={appState.wins} geminiKey={geminiKey} />
                             </div>
                        </section>

                    </div>
                </main>
            </div>
            <Footer onExport={handleExport} onImport={handleImport} />
            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
                settings={appState.settings} 
                setSettings={handleUpdateSettings} 
                geminiKey={geminiKey} 
                setGeminiKey={setGeminiKey}
                categories={appState.categories}
                allTags={allTags}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                onDeleteTag={handleDeleteTag}
            />
        </>
    );
}