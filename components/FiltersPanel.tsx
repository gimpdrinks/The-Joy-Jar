
import React from 'react';
import { TimeFilter } from '../types';
import { useAppContext } from '../contexts/AppContext';
import CustomSelect from './CustomSelect';
import { CategoryIcon, TagIcon } from './Icons';

const FiltersPanel: React.FC = () => {
    const { 
        timeFilter, setTimeFilter, 
        searchText, setSearchText, 
        tagFilter, setTagFilter, 
        categoryFilter, setCategoryFilter, 
        allTags, appState 
    } = useAppContext();
    const { categories } = appState;

    const labelStyle = "block text-sm font-medium text-slate-600 mb-1";
    const inputStyle = "w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors";

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="search" className={labelStyle}>Search</label>
                <input type="search" id="search" placeholder="Search title or notes..." value={searchText} onChange={e => setSearchText(e.target.value)} className={inputStyle} />
            </div>
            <div>
                <label className={`${labelStyle} mb-2`}>Time Period</label>
                <div className="flex gap-2 flex-wrap">
                    {(["today", "7d", "30d", "all"] as TimeFilter[]).map(tf => (
                        <button key={tf} onClick={() => setTimeFilter(tf)} className={`px-4 py-2 text-base rounded-full transition-colors font-semibold ${timeFilter === tf ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                            {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : tf === 'all' ? 'All Time' : 'Today'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className={`${labelStyle}`}>Filter by Tag</label>
                    <CustomSelect options={allTags} selectedValue={tagFilter} onValueChange={setTagFilter} placeholder="All Tags" searchable icon={<TagIcon />} />
                </div>
                <div>
                    <label className={`${labelStyle}`}>Filter by Category</label>
                    <CustomSelect options={categories} selectedValue={categoryFilter} onValueChange={setCategoryFilter} placeholder="All Categories" icon={<CategoryIcon />} />
                </div>
            </div>
        </div>
    );
};

export default FiltersPanel;
