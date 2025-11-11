import React, { useState } from 'react';
import { TimeFilter } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { analyzeWinsWithAI } from '../services/geminiService';

const StatsPanel: React.FC = () => {
    const { appState, geminiKey } = useAppContext();
    const { wins } = appState;

    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysisPeriod, setAnalysisPeriod] = useState<TimeFilter>('7d');

    const handleAnalyzeWithAI = async () => {
        setIsLoading(true);
        const timeFilterLabels: Record<TimeFilter, string> = { today: 'Today', '7d': 'Last 7 Days', '30d': 'Last 30 Days', 'all': 'All Time' };
        const rangeLabel = timeFilterLabels[analysisPeriod];

        let winsToAnalyze = [...wins];
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
        
        const result = await analyzeWinsWithAI(winsToAnalyze, rangeLabel, geminiKey);
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

export default StatsPanel;