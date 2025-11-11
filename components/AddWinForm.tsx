
import React, { useState } from 'react';
import { Category, Win } from '../types';
import { useAppContext } from '../contexts/AppContext';
import Confetti from './Confetti';
import SliderInput from './SliderInput';
import Calendar from './Calendar';
import MultiSelectTagInput from './MultiSelectTagInput';
import { CalendarIcon, InfoIcon } from './Icons';

const AddWinForm: React.FC = () => {
    const { handleAddWin, appState, allTags } = useAppContext();
    const { settings, categories } = appState;

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
        handleAddWin({ date, title, notes, tags, category, mood, effort, cost });
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
                    <p className="mt-2 text-slate-600 text-lg">{settings.ritualText}</p>
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

export default AddWinForm;
