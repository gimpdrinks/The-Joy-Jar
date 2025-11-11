
import React, { useEffect } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import Header from './components/Header';
import AddWinForm from './components/AddWinForm';
import FiltersPanel from './components/FiltersPanel';
import WinItem from './components/WinItem';
import StatsPanel from './components/StatsPanel';
import Footer from './components/Footer';
import SettingsModal from './components/SettingsModal';
import { Win } from './types';
// FIX: Import the ReflectionModal component to make it available in the app.
import ReflectionModal from './components/ReflectionModal';

const AppContent = () => {
    const { filteredWins, handleDeleteWin, appState } = useAppContext();
    const { settings, wins } = appState;

    useEffect(() => {
      const scheduleNotification = () => {
        if (!('Notification' in window) || Notification.permission !== 'granted' || settings.dailyReminder === 'none') {
          return;
        }

        const hasWonToday = wins.some(win => new Date(win.date + 'T00:00:00').toDateString() === new Date().toDateString());
        if (hasWonToday) {
            return; 
        }

        const now = new Date();
        const [hour, minute] = settings.dailyReminder === '9:00 AM' ? [9, 0] : [21, 0];
        
        let notificationTime = new Date();
        notificationTime.setHours(hour, minute, 0, 0);

        if (now > notificationTime) {
            // If time has passed for today, schedule for tomorrow
            notificationTime.setDate(notificationTime.getDate() + 1);
        }

        const timeoutId = setTimeout(() => {
          new Notification('The Joy Jar', {
            body: "Don't forget to celebrate a win today!",
            icon: '/vite.svg',
          });
        }, notificationTime.getTime() - now.getTime());

        return () => clearTimeout(timeoutId);
      };
      
      const timeoutCleanup = scheduleNotification();
      return timeoutCleanup;

    }, [settings.dailyReminder, wins]);
    
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
            {/* FIX: Render the ReflectionModal component. */}
            <ReflectionModal />
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