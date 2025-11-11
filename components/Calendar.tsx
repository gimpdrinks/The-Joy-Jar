
import React, { useState, useEffect, useRef } from 'react';

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

export default Calendar;
