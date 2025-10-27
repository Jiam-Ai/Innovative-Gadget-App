import React, { useContext } from 'react';
import { AppContext } from '../App';

interface FilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose, children }) => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { translations } = context;

    return (
        <>
             <div 
                className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${isOpen ? 'backdrop-enter-active' : 'backdrop-exit-active opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>
            <div 
                className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'filter-drawer-enter-active' : 'filter-drawer-exit-active translate-y-full'}`}
                style={{ maxHeight: '85vh' }}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex flex-col h-full">
                     <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{translations.categories}</h2>
                        <button onClick={onClose} className="p-2 -mr-2 text-gray-500 dark:text-gray-400" aria-label="Close filters">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="overflow-y-auto">
                        {children}
                    </div>
                     <div className="p-4 border-t dark:border-gray-700 flex-shrink-0">
                        <button 
                            onClick={onClose}
                            className="w-full bg-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors"
                        >
                            Show Results
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
