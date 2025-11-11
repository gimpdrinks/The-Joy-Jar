
import React from 'react';
import { InfoIcon } from './Icons';
import { MOOD_CONFIG, EFFORT_CONFIG } from './configs';

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

export default SliderInput;
