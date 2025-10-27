import React, { useContext } from 'react';
import { AppContext } from '../App';
import { ProductSort } from './ProductSort';

interface FilterControlsProps {
    onFilterClick: () => void;
    sortOrder: string;
    onSortChange: (order: string) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({ onFilterClick, sortOrder, onSortChange }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    
    const { translations } = context;

    return (
        <div className="flex items-center justify-between gap-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow">
            <button
                onClick={onFilterClick}
                className="flex items-center gap-2 p-2 text-sm font-medium text-gray-700 dark:text-gray-200"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
            </button>
            <ProductSort sortOrder={sortOrder} onSortChange={onSortChange} />
        </div>
    );
};