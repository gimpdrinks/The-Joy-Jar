
import React, { useState, useEffect, useMemo, useRef } from 'react';

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

export default CustomSelect;
