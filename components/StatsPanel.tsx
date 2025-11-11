import React, { useState, useMemo } from 'react';
import { TimeFilter, Win, Category } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { analyzeWinsWithAI } from '../services/geminiService';
import { getTagColorClasses } from '../utils/colorUtils'; // Using for chart colors
import { MOOD_CONFIG, EFFORT_CONFIG } from './configs';

const timeFilterLabels: Record<TimeFilter, string> = { today: 'Today', '7d': 'Last 7 Days', '30d': 'Last 30 Days', 'all': 'All Time' };

const calculateStreak = (wins: Win[]): number => {
    if (wins.length === 0) return 0;
    const winDates = [...new Set(wins.map(w => w.date))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mostRecentWinDate = new Date(winDates[0]);
    mostRecentWinDate.setHours(0,0,0,0);
    const daysSinceLastWin = (today.getTime() - mostRecentWinDate.getTime()) / (1000 * 3600 * 24);

    if (daysSinceLastWin > 1) return 0;

    let streak = 0;
    let expectedDate = mostRecentWinDate;

    for (const dateStr of winDates) {
        const winDate = new Date(dateStr);
        winDate.setHours(0,0,0,0);
        
        const diff = (expectedDate.getTime() - winDate.getTime()) / (1000 * 3600 * 24);
        if (diff === 0) {
            streak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
            break; 
        }
    }
    return streak;
};

const StreakDisplay: React.FC<{streak: number}> = ({ streak }) => {
    let milestone = '';
    if (streak >= 30) milestone = "Amazing commitment! That's a 30-day streak!";
    else if (streak >= 7) milestone = "Awesome! You're on a 7-day streak!";
    else if (streak >= 3) milestone = "Great start! Keep the momentum going.";

    return (
        <div className="text-center p-6 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-orange-600">
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 5.5a5 5 0 1 1-5 5-5 5 0 0 1 5-5z M2 22a7 7 0 0 1 14 0"/></svg>
                 <span className="text-4xl font-bold">{streak}</span>
                 <span className="text-xl font-semibold">Day Streak</span>
            </div>
            {milestone && <p className="text-orange-700 font-medium mt-2">{milestone}</p>}
        </div>
    );
}

const Charts: React.FC<{wins: Win[], categories: Category[]}> = ({ wins, categories }) => {
    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        categories.forEach(c => counts[c] = 0);
        wins.forEach(win => {
            counts[win.category] = (counts[win.category] || 0) + 1;
        });
        const totalWins = wins.length || 1;
        return Object.entries(counts).map(([name, count]) => ({
            name,
            count,
            percentage: (count / totalWins) * 100,
            colorClasses: getTagColorClasses(name),
        })).filter(c => c.count > 0).sort((a,b) => b.count - a.count);
    }, [wins, categories]);

    const timeSeriesData = useMemo(() => {
        const dataByDate: Record<string, { moods: number[], efforts: number[], count: number }> = {};
        wins.forEach(win => {
            if (!dataByDate[win.date]) {
                dataByDate[win.date] = { moods: [], efforts: [], count: 0 };
            }
            dataByDate[win.date].moods.push(win.mood);
            dataByDate[win.date].efforts.push(win.effort);
            dataByDate[win.date].count++;
        });
        return Object.entries(dataByDate).map(([date, values]) => ({
            date,
            avgMood: values.moods.reduce((a, b) => a + b, 0) / values.count,
            avgEffort: values.efforts.reduce((a, b) => a + b, 0) / values.count,
        })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [wins]);


    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-bold text-slate-700 mb-2">Category Distribution</h4>
                <div className="space-y-2">
                    {categoryData.map(({ name, percentage, colorClasses }) => (
                        <div key={name} className="flex items-center gap-3">
                            <span className="w-28 text-sm font-medium text-slate-600 truncate">{name}</span>
                            <div className="flex-1 bg-slate-200 rounded-full h-5">
                                <div className={`${colorClasses.split(' ')[0]} h-5 rounded-full text-xs text-right pr-2 font-bold ${colorClasses.split(' ')[1]}`} style={{ width: `${percentage}%` }}>
                                    {Math.round(percentage)}%
                                </div>
                            </div>
                        </div>
                    ))}
                    {wins.length === 0 && <p className="text-slate-500 text-sm">No wins in this period to chart.</p>}
                </div>
            </div>
            <div>
                <h4 className="text-lg font-bold text-slate-700 mb-2">Mood & Effort Timeline</h4>
                <div className="flex gap-2 items-end h-40 p-2 border-l border-b border-slate-200">
                    {timeSeriesData.map(({ date, avgMood, avgEffort}) => (
                         <div key={date} className="flex-1 flex justify-center items-end gap-1 group relative">
                            <div className="w-1/2 bg-blue-200 rounded-t-sm" style={{ height: `${(avgMood / 5) * 100}%` }}></div>
                            <div className="w-1/2 bg-teal-200 rounded-t-sm" style={{ height: `${(avgEffort / 5) * 100}%` }}></div>
                             <div className="absolute bottom-full mb-2 w-max p-2 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                {date}<br/>
                                Mood: {avgMood.toFixed(1)}/5<br/>
                                Effort: {avgEffort.toFixed(1)}/5
                            </div>
                         </div>
                    ))}
                     {wins.length === 0 && <p className="text-slate-500 text-sm self-center">No wins in this period to chart.</p>}
                </div>
                 <div className="flex justify-end gap-4 text-sm mt-1">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-200"></span>Mood</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-teal-200"></span>Effort</span>
                 </div>
            </div>
        </div>
    );
};


const StatsPanel: React.FC = () => {
    const { appState, handleAddAnalysis, handleDeleteAnalysis } = useAppContext();
    const { wins, analysisHistory, categories } = appState;

    const [currentAnalysis, setCurrentAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysisPeriod, setAnalysisPeriod] = useState<TimeFilter>('7d');

    const winsForPeriod = useMemo(() => {
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
        return winsToAnalyze;
    }, [wins, analysisPeriod]);

    const currentStreak = useMemo(() => calculateStreak(wins), [wins]);

    const handleAnalyzeWithAI = async () => {
        setIsLoading(true);
        setCurrentAnalysis('');
        const rangeLabel = timeFilterLabels[analysisPeriod];
        const result = await analyzeWinsWithAI(winsForPeriod, rangeLabel);
        
        if (!result.startsWith("It seems I had trouble")) {
            const newAnalysis = {
                date: new Date().toISOString().split('T')[0],
                period: analysisPeriod,
                winsAnalyzedCount: winsForPeriod.length,
                winIds: winsForPeriod.map(w => w.id),
                content: result,
            };
            handleAddAnalysis(newAnalysis);
        } else {
            setCurrentAnalysis(result);
        }
        setIsLoading(false);
    };

    const renderMarkdown = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return (<>{parts.map((part, i) => part.startsWith('**') && part.endsWith('**') ? <strong key={i} className="font-bold">{part.slice(2, -2)}</strong> : part)}</>);
    };

    return (
        <div className="space-y-8">
            <div>
                 <h3 className="text-xl font-bold text-slate-800 mb-4">Gamification</h3>
                 <StreakDisplay streak={currentStreak} />
            </div>

            <div>
                 <label className="block text-sm font-medium text-slate-600 mb-2">Select Period for Charts & AI Analysis</label>
                 <div className="flex gap-2 flex-wrap mb-4">
                    {(["today", "7d", "30d", "all"] as TimeFilter[]).map(tf => (
                        <button key={tf} onClick={() => setAnalysisPeriod(tf)} className={`px-4 py-2 text-base rounded-full transition-colors font-semibold ${analysisPeriod === tf ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                            {timeFilterLabels[tf]}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Charts</h3>
                <Charts wins={winsForPeriod} categories={categories} />
            </div>

            <div>
                 <h3 className="text-xl font-bold text-slate-800 mb-4">The Joy Jar Coach</h3>
                <button onClick={handleAnalyzeWithAI} disabled={isLoading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 text-lg rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:from-purple-300 disabled:to-indigo-300 disabled:cursor-not-allowed transition-all transform hover:scale-105">
                    {isLoading ? 'Reflecting...' : `Ask Joy Jar Coach for ${timeFilterLabels[analysisPeriod]}`}
                </button>
            </div>
            
            {currentAnalysis && (
                <div className="whitespace-pre-wrap text-base font-sans leading-relaxed text-slate-700 p-4 bg-red-100 border border-red-200 rounded-lg">
                    {renderMarkdown(currentAnalysis)}
                </div>
            )}
            
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Reflection History</h3>
                {analysisHistory.length > 0 ? (
                    <div className="space-y-4">
                        {analysisHistory.map(analysis => (
                             <div key={analysis.id} className="bg-white p-5 rounded-xl shadow-md space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">
                                            Analyzed on {analysis.date} for {timeFilterLabels[analysis.period]} ({analysis.winsAnalyzedCount} wins)
                                        </p>
                                    </div>
                                    <button onClick={() => handleDeleteAnalysis(analysis.id)} className="text-slate-400 hover:text-red-500 text-sm font-medium">Delete</button>
                                </div>
                                <div className="whitespace-pre-wrap text-base font-sans leading-relaxed text-slate-700">
                                    {renderMarkdown(analysis.content)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-6 bg-purple-100/50 rounded-lg">
                         <p className="text-slate-500">Your past analyses will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsPanel;