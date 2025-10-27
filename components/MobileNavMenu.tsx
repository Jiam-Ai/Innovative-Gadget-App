import React, { useContext } from 'react';
import { AppContext } from '../App';
import { CATEGORIES } from '../constants';
import { LanguageSwitcher } from './Header';

const ThemeToggle: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { theme, toggleTheme } = context;

    return (
        <button
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
        </button>
    );
};

interface MobileNavMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MobileNavMenu: React.FC<MobileNavMenuProps> = ({ isOpen, onClose }) => {
    const context = useContext(AppContext);

    if (!context) return null;

    const { translations, handleNavigation, currentSeller, currentBuyer, logout } = context;
    
    const categoryTranslationMap: Record<string, string> = {
        'All': translations.all,
        'Electronics': translations.electronics,
        'Clothing': translations.clothing,
        'Groceries': translations.groceries,
        'Mobile Phones': translations.mobile_phones,
        'Beauty & Health': translations.beauty_health
    };
    
    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${isOpen ? 'backdrop-enter-active' : 'backdrop-exit-active opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>
            <div 
                className={`fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'mobile-nav-enter-active' : 'mobile-nav-exit-active -translate-x-full'}`}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Menu</h2>
                        <button onClick={onClose} className="p-2 -mr-2 text-gray-500 dark:text-gray-400" aria-label="Close menu">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Account Section */}
                        <div className="space-y-2">
                             {currentSeller ? (
                                <>
                                    <button onClick={() => handleNavigation('seller')} className="w-full text-left font-semibold p-2 rounded-md hover:bg-lightgray dark:hover:bg-gray-700">{translations.seller_dashboard}</button>
                                    <button onClick={logout} className="w-full text-left font-semibold p-2 rounded-md hover:bg-lightgray dark:hover:bg-gray-700">{translations.logout}</button>
                                </>
                            ) : currentBuyer ? (
                                <>
                                    <button onClick={() => handleNavigation('buyer-dashboard')} className="w-full text-left font-semibold p-2 rounded-md hover:bg-lightgray dark:hover:bg-gray-700">{translations.my_account}</button>
                                    <button onClick={logout} className="w-full text-left font-semibold p-2 rounded-md hover:bg-lightgray dark:hover:bg-gray-700">{translations.logout}</button>
                                </>
                            ) : (
                                <button onClick={() => handleNavigation('auth')} className="w-full text-left font-semibold p-2 rounded-md hover:bg-lightgray dark:hover:bg-gray-700">{translations.login_signup}</button>
                            )}
                        </div>
                        
                        <div className="border-t dark:border-gray-700 my-4"></div>
                        
                        {/* Categories Section */}
                        <div>
                             <h3 className="font-bold text-gray-500 dark:text-gray-400 uppercase text-sm px-2 mb-2">{translations.categories}</h3>
                             <ul className="space-y-1">
                                {CATEGORIES.map(category => (
                                    <li key={category}>
                                        <button 
                                            onClick={() => {
                                                handleNavigation('shop');
                                                // In a real app with routing, you'd navigate and pass params
                                                // For this structure, we'd need to lift category selection up
                                            }}
                                            className="w-full text-left p-2 rounded-md hover:bg-lightgray dark:hover:bg-gray-700"
                                        >
                                            {categoryTranslationMap[category] || category}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </nav>

                    <div className="p-4 border-t dark:border-gray-700 flex items-center justify-between">
                         <LanguageSwitcher />
                         <ThemeToggle />
                    </div>
                </div>
            </div>
        </>
    );
};
