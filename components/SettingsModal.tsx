import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { CloseIcon, TrashIcon } from './Icons';
import { getTagColorClasses } from '../utils/colorUtils';

const SettingsModal: React.FC = () => {
    const {
        isSettingsOpen,
        setIsSettingsOpen,
        appState,
        handleUpdateSettings,
        allTags,
        handleAddCategory,
        handleDeleteCategory,
        handleDeleteTag,
    } = useAppContext();

    const { settings, categories } = appState;
    const [newCategory, setNewCategory] = useState('');
    const [notificationPermission, setNotificationPermission] = useState('default');

    useEffect(() => {
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, [isSettingsOpen]);

    if (!isSettingsOpen) return null;

    const onClose = () => setIsSettingsOpen(false);

    const handleRequestNotificationPermission = async (time: '9:00 AM' | '9:00 PM' | 'none') => {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notifications.');
            return;
        }

        if (time !== 'none' && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            if (permission === 'granted') {
                 handleUpdateSettings({...settings, dailyReminder: time});
            }
        } else {
             handleUpdateSettings({...settings, dailyReminder: time});
        }
    };

    const inputStyle = "w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors";

    const handleAddCategorySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim()) {
            handleAddCategory(newCategory.trim());
            setNewCategory('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Settings</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><CloseIcon /></button>
                </div>
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                     <div>
                        <label htmlFor="ritual-text" className="block text-base font-semibold text-slate-700 mb-2">Celebration Ritual Text</label>
                        <input type="text" id="ritual-text" value={settings.ritualText} onChange={e => handleUpdateSettings({...settings, ritualText: e.target.value})} className={inputStyle} />
                    </div>
                    <hr/>
                     <div>
                        <h3 className="text-xl font-bold mb-3">Daily Reminder</h3>
                        <div className="flex gap-2 flex-wrap">
                            {(['none', '9:00 AM', '9:00 PM'] as const).map(time => (
                                <button key={time} onClick={() => handleRequestNotificationPermission(time)} className={`px-4 py-2 text-base rounded-full transition-colors font-semibold ${settings.dailyReminder === time ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                                    {time}
                                </button>
                            ))}
                        </div>
                         {notificationPermission === 'denied' && (
                            <p className="text-sm text-red-600 mt-2">Notifications are blocked. Please enable them in your browser settings.</p>
                        )}
                        {notificationPermission === 'default' && settings.dailyReminder !== 'none' && (
                             <p className="text-sm text-slate-500 mt-2">Please allow notifications when prompted.</p>
                        )}
                    </div>
                    <hr/>
                    <div>
                         <h3 className="text-xl font-bold mb-3">Manage Categories</h3>
                         <form onSubmit={handleAddCategorySubmit} className="flex gap-2 mb-3">
                            <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New category name" className={`${inputStyle} text-base`} />
                            <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 rounded-lg hover:bg-indigo-700 transition-colors">Add</button>
                         </form>
                         <ul className="space-y-2">
                            {categories.map(cat => (
                                <li key={cat} className="flex justify-between items-center bg-slate-100 p-2 rounded-md">
                                    <span className="text-slate-800">{cat}</span>
                                    {cat !== 'Other' && <button onClick={() => handleDeleteCategory(cat)} className="text-red-500 hover:text-red-700"><TrashIcon /></button>}
                                </li>
                            ))}
                         </ul>
                    </div>
                    <hr/>
                    <div>
                         <h3 className="text-xl font-bold mb-3">Manage Tags</h3>
                         <p className="text-sm text-slate-500 mb-2">Deleting a tag will remove it from all associated wins.</p>
                         <ul className="space-y-2">
                            {allTags.length > 0 ? allTags.map(tag => (
                                <li key={tag} className="flex justify-between items-center bg-slate-100 p-2 rounded-md">
                                    <span className={getTagColorClasses(tag) + ' px-2 py-0.5 rounded-full text-sm font-medium'}>{tag}</span>
                                    <button onClick={() => handleDeleteTag(tag)} className="text-red-500 hover:text-red-700"><TrashIcon /></button>
                                </li>
                            )) : <p className="text-slate-500">No tags created yet.</p>}
                         </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;