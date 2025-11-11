// FIX: Import React to fix "Cannot find namespace 'React'" error.
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, Win, Settings } from '../types';
import { CATEGORIES, INITIAL_APP_STATE, SEED_WINS } from '../constants';

const STORAGE_KEY = 'theJoyJarState_v1';

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

export const useAppState = () => {
    const [appState, setAppState] = useState<AppState>(loadState);

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

    return {
        appState,
        handleAddWin,
        handleDeleteWin,
        handleUpdateSettings,
        handleAddCategory,
        handleDeleteCategory,
        handleDeleteTag,
        handleExport,
        handleImport,
    };
};
