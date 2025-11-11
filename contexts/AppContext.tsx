import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { AppState, Win, Settings, TimeFilter } from '../types';
import { useAppState } from '../hooks/useAppState';

type AppContextType = {
    appState: AppState;
    handleAddWin: (newWinData: Omit<Win, 'id'>) => void;
    handleDeleteWin: (id: string) => void;
    handleUpdateSettings: (newSettings: Settings) => void;
    handleAddCategory: (name: string) => void;
    handleDeleteCategory: (name: string) => void;
    handleDeleteTag: (tagToDelete: string) => void;
    handleExport: () => void;
    handleImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isSettingsOpen: boolean;
    setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    geminiKey: string;
    setGeminiKey: React.Dispatch<React.SetStateAction<string>>;
    timeFilter: TimeFilter;
    setTimeFilter: React.Dispatch<React.SetStateAction<TimeFilter>>;
    searchText: string;
    setSearchText: React.Dispatch<React.SetStateAction<string>>;
    tagFilter: string;
    setTagFilter: React.Dispatch<React.SetStateAction<string>>;
    categoryFilter: string;
    setCategoryFilter: React.Dispatch<React.SetStateAction<string>>;
    filteredWins: Win[];
    allTags: string[];
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { 
        appState, handleAddWin, handleDeleteWin, handleUpdateSettings, 
        handleAddCategory, handleDeleteCategory, handleDeleteTag,
        handleExport, handleImport
    } = useAppState();

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [geminiKey, setGeminiKey] = useState('');
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
    const [searchText, setSearchText] = useState('');
    const [tagFilter, setTagFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const allTags = useMemo(() => Array.from(new Set(appState.wins.flatMap(w => w.tags))).sort(), [appState.wins]);

    const filteredWins = useMemo(() => {
        let wins = [...appState.wins].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    
    const value = {
        appState, handleAddWin, handleDeleteWin, handleUpdateSettings,
        handleAddCategory, handleDeleteCategory, handleDeleteTag,
        handleExport, handleImport,
        isSettingsOpen, setIsSettingsOpen,
        geminiKey, setGeminiKey,
        timeFilter, setTimeFilter,
        searchText, setSearchText,
        tagFilter, setTagFilter,
        categoryFilter, setCategoryFilter,
        allTags,
        filteredWins
    };
    
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};