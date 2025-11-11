
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getTagColorClasses } from '../utils/colorUtils';

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

export default MultiSelectTagInput;
