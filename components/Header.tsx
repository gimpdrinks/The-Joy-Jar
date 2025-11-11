
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { LockIcon, SettingsIcon } from './Icons';

const Header: React.FC = () => {
    const { setIsSettingsOpen } = useAppContext();
    return (
        <header className="p-4 bg-white/50 backdrop-blur-sm border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
            <div className="flex-1"></div>
            <div className="text-center">
                <img 
                    src="https://res.cloudinary.com/dbylka4xx/image/upload/v1751883360/AiForPinoys_Logo_ttg2id.png" 
                    alt="AiForPinoys Logo" 
                    className="h-10 mx-auto mb-1"
                />
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">The Joy Jar</h1>
                <p className="text-sm text-slate-500">Collect your happy moments.</p>
            </div>
            <div className="flex-1 flex justify-end items-center gap-4">
                <div className="relative group">
                    <LockIcon />
                    <span className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                        Your data is private and stored only in this browser.
                    </span>
                </div>
                <button onClick={() => setIsSettingsOpen(true)} className="text-slate-500 hover:text-indigo-500 transition-colors" aria-label="Open settings">
                    <SettingsIcon />
                </button>
            </div>
        </header>
    );
};

export default Header;
