import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { CloseIcon } from './Icons';
import { REFLECTION_PROMPTS_BY_CATEGORY } from '../constants';

type PromptCategory = keyof typeof REFLECTION_PROMPTS_BY_CATEGORY;

const ReflectionModal: React.FC = () => {
    const { isReflectionModalOpen, setIsReflectionModalOpen, currentPrompt, setCurrentPrompt } = useAppContext();
    const [view, setView] = useState<'categories' | 'prompt'>('categories');
    const [selectedCategory, setSelectedCategory] = useState<PromptCategory | null>(null);

    useEffect(() => {
        if (isReflectionModalOpen) {
            setView('categories');
            setSelectedCategory(null);
            setCurrentPrompt('');
        }
    }, [isReflectionModalOpen, setCurrentPrompt]);

    if (!isReflectionModalOpen) return null;

    const onClose = () => setIsReflectionModalOpen(false);

    const handleCategorySelect = (category: PromptCategory) => {
        setSelectedCategory(category);
        const prompts = REFLECTION_PROMPTS_BY_CATEGORY[category];
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        setCurrentPrompt(randomPrompt);
        setView('prompt');
    };

    const getNewPrompt = () => {
        if (!selectedCategory) return;
        const prompts = REFLECTION_PROMPTS_BY_CATEGORY[selectedCategory];
        let newPrompt = currentPrompt;
        // Ensure the new prompt is different from the current one if possible
        if (prompts.length > 1) {
            while (newPrompt === currentPrompt) {
                newPrompt = prompts[Math.floor(Math.random() * prompts.length)];
            }
        }
        setCurrentPrompt(newPrompt);
    };

    const backToCategories = () => {
        setView('categories');
    };

    const themeColors = {
        "Growth & Resilience": "bg-green-100 hover:bg-green-200 text-green-800",
        "Self-Compassion": "bg-yellow-100 hover:bg-yellow-200 text-yellow-800",
        "Purpose & Alignment": "bg-blue-100 hover:bg-blue-200 text-blue-800",
        "Energy & Boundaries": "bg-purple-100 hover:bg-purple-200 text-purple-800",
        "Joy & Gratitude": "bg-pink-100 hover:bg-pink-200 text-pink-800",
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg m-4 text-center" onClick={e => e.stopPropagation()}>
                <div className="flex justify-end items-center mb-4">
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><CloseIcon /></button>
                </div>
                
                {view === 'categories' ? (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-slate-800">Choose a Reflection Theme</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {Object.keys(REFLECTION_PROMPTS_BY_CATEGORY).map(category => (
                                <button 
                                    key={category} 
                                    onClick={() => handleCategorySelect(category as PromptCategory)}
                                    className={`w-full text-lg font-semibold py-3 px-5 rounded-lg transition-colors ${themeColors[category as PromptCategory]}`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-slate-500">{selectedCategory}</h3>
                        <p className="text-2xl font-bold text-slate-800 min-h-[6rem] flex items-center justify-center">
                            "{currentPrompt}"
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button onClick={backToCategories} className="bg-slate-200 text-slate-800 font-semibold py-2 px-5 rounded-lg hover:bg-slate-300 transition-colors order-2 sm:order-1">
                                &laquo; Back to Themes
                            </button>
                            <button onClick={getNewPrompt} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors order-1 sm:order-2">
                                New Prompt
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReflectionModal;
