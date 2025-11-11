
import React, { useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';

const Footer: React.FC = () => {
    const { handleExport, handleImport } = useAppContext();
    const importRef = useRef<HTMLInputElement>(null);
    return (
        <footer className="p-6 text-center text-sm text-slate-500 border-t border-slate-200">
            <div className="flex justify-center gap-6 mb-4">
                <button onClick={handleExport} className="hover:text-indigo-500 font-semibold">Export Data</button>
                <button onClick={() => importRef.current?.click()} className="hover:text-indigo-500 font-semibold">Import Data</button>
                <input type="file" ref={importRef} className="hidden" accept=".json" onChange={handleImport} />
            </div>
             <p className="mb-2">
                Created by <a href="https://aiforpinoys.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline font-semibold">@aiforpinoys</a>
            </p>
            <p>The Joy Jar v1 &middot; Your data is yours. Everything is stored locally in this browser.</p>
        </footer>
    );
};

export default Footer;
