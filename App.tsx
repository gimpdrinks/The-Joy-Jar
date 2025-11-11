
import React from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import Header from './components/Header';
import AddWinForm from './components/AddWinForm';
import FiltersPanel from './components/FiltersPanel';
import WinItem from './components/WinItem';
import StatsPanel from './components/StatsPanel';
import Footer from './components/Footer';
import SettingsModal from './components/SettingsModal';
import { Win } from './types';

const AppContent = () => {
    const { filteredWins, handleDeleteWin } = useAppContext();
    
    return (
        <>
            <div className="min-h-screen">
                <Header />
                <main className="p-4 md:p-8">
                    <div className="max-w-3xl mx-auto space-y-12">
                        
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Log a New Win</h2>
                            <div className="p-8 bg-indigo-50 rounded-2xl shadow-lg relative overflow-hidden">
                                <AddWinForm />
                            </div>
                        </section>

                        <section>
                             <h2 className="text-2xl font-bold text-slate-800 mb-4">Filter Your Wins</h2>
                             <div className="p-8 bg-green-50 rounded-2xl shadow-lg">
                                <FiltersPanel />
                             </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-800">Your Wins ({filteredWins.length})</h2>
                            {filteredWins.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredWins.map((win: Win) => <WinItem key={win.id} win={win} onDelete={handleDeleteWin}/>)}
                                </div>
                            ) : (
                                <div className="text-center p-10 bg-yellow-50 rounded-2xl shadow-lg">
                                    <h3 className="text-xl font-semibold text-yellow-800">No wins to show... yet!</h3>
                                    <p className="text-slate-500 mt-2 text-base">Use the form above to log your first win and start celebrating.</p>
                                </div>
                            )}
                        </section>
                        
                        <section>
                             <h2 className="text-2xl font-bold text-slate-800 mb-4">Stats & Analysis</h2>
                             <div className="p-8 bg-purple-50 rounded-2xl shadow-lg">
                                <StatsPanel />
                             </div>
                        </section>

                    </div>
                </main>
            </div>
            <Footer />
            <SettingsModal />
        </>
    );
};


export default function App() {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}
