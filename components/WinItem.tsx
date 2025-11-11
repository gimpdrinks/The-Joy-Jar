
import React from 'react';
import { Win } from '../types';
import { getTagColorClasses } from '../utils/colorUtils';
import ScoreDisplay from './ScoreDisplay';

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

export default WinItem;
