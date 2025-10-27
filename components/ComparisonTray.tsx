import React, { useContext } from 'react';
import { AppContext } from '../App';

interface ComparisonTrayProps {
    onOpen: () => void;
}

export const ComparisonTray: React.FC<ComparisonTrayProps> = ({ onOpen }) => {
    const context = useContext(AppContext);

    if (!context) return null;
    const { translations, comparisonList, clearCompareList } = context;

    if (comparisonList.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.3)] animate-fade-in">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3 overflow-hidden">
                    <p className="font-semibold text-lg text-gray-700 dark:text-gray-200 hidden sm:block">Comparing:</p>
                    <div className="flex -space-x-4">
                        {comparisonList.map(product => (
                            <img 
                                key={product.id} 
                                src={product.images[0]} 
                                alt={product.name} 
                                title={product.name}
                                className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 object-cover shadow-md"
                            />
                        ))}
                    </div>
                    {comparisonList.length === 4 && (
                        <p className="text-sm text-red-500 font-semibold hidden lg:block ml-4">{translations.comparison_limit_error}</p>
                    )}
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <button 
                        onClick={onOpen} 
                        className="bg-primary text-white font-bold py-2 px-3 sm:px-6 rounded-md hover:bg-secondary transition-colors text-sm sm:text-base"
                    >
                        {translations.compare_items} ({comparisonList.length})
                    </button>
                    <button 
                        onClick={clearCompareList} 
                        className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-full transition-colors"
                        title={translations.clear_all}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};