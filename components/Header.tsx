import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import type { Language, View, Product } from '../types';
import { getSearchSuggestions } from '../services/geminiService';
import { CATEGORIES } from '../constants';

interface HeaderProps {
    onSearch: (term: string) => void;
    onCartClick: () => void;
    currentView: View;
    onMenuClick: () => void;
    onVisualSearchClick: () => void;
    onVoiceSearch: () => void;
    allProducts: Product[];
    onGiftFinderClick: () => void;
}

const ThemeToggle: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { theme, toggleTheme } = context;

    return (
        <button
            onClick={toggleTheme}
            className="text-accent dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
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

export const LanguageSwitcher: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { language, setLanguage, translations } = context;

    const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as Language);
    };

    return (
        <div className="relative">
            <select 
                value={language}
                onChange={handleLangChange}
                className="bg-primary dark:bg-gray-700 text-white pl-3 pr-8 py-2 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
            >
                <option value="en">{translations.english}</option>
                <option value="krio">{translations.krio}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    );
};

const AISearchSuggestions: React.FC<{ query: string; onSelect: (term: string) => void; }> = ({ query, onSelect }) => {
    const [suggestions, setSuggestions] = useState<{ suggestions: string[]; didYouMean: string | null }>({ suggestions: [], didYouMean: null });
    const [isLoading, setIsLoading] = useState(false);
    const context = useContext(AppContext);

    useEffect(() => {
        if (query.length < 3) {
            setSuggestions({ suggestions: [], didYouMean: null });
            return;
        }

        const handler = setTimeout(async () => {
            setIsLoading(true);
            const result = await getSearchSuggestions(query, CATEGORIES);
            setSuggestions(result);
            setIsLoading(false);
        }, 500); // Debounce API call

        return () => {
            clearTimeout(handler);
        };
    }, [query]);

    if (!context || (suggestions.suggestions.length === 0 && !suggestions.didYouMean)) {
        return null;
    }
    const { translations } = context;

    return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 p-4 z-10">
            {isLoading && <p className="text-sm text-gray-500">Searching...</p>}
            {!isLoading && (
                <div className="space-y-3">
                    {suggestions.didYouMean && (
                        <button onClick={() => onSelect(suggestions.didYouMean!)} className="text-left w-full text-sm">
                           <span className="text-gray-500 dark:text-gray-400">{translations.did_you_mean} </span>
                           <span className="font-semibold text-primary dark:text-blue-400 italic hover:underline">{suggestions.didYouMean}</span>
                        </button>
                    )}
                    {suggestions.suggestions.length > 0 && (
                        <div>
                             <h4 className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1">{translations.ai_search_suggestions}</h4>
                             <ul className="space-y-1">
                                {suggestions.suggestions.map(sugg => (
                                    <li key={sugg}><button onClick={() => onSelect(sugg)} className="text-sm hover:underline text-gray-700 dark:text-gray-200">{sugg}</button></li>
                                ))}
                             </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


export const Header: React.FC<HeaderProps> = ({ onSearch, onCartClick, currentView, onMenuClick, onVisualSearchClick, onVoiceSearch, allProducts, onGiftFinderClick }) => {
    const context = useContext(AppContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSuggestionsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!context) return null;

    const { cart, translations, currentSeller, currentBuyer, logout, handleNavigation } = context;
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const isShopView = currentView === 'shop';

    const handleSearchChange = (term: string) => {
        setSearchQuery(term);
        onSearch(term);
    };
    
    return (
        <header className="bg-primary dark:bg-gray-800 shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onMenuClick} className="lg:hidden text-accent dark:text-gray-200" aria-label="Open menu">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                    <div onClick={() => handleNavigation('shop')} className="flex items-center gap-3 cursor-pointer">
                        <img src="https://files.catbox.moe/xl3z0v.jpeg" alt="Innovative Gadget Logo" className="h-10 w-10 rounded-full object-cover" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-accent dark:text-white leading-tight">
                            Innovative<span className="text-secondary">Gadget</span>
                        </h1>
                    </div>
                </div>

                {isShopView && (
                    <div ref={searchContainerRef} className="flex-1 max-w-xl mx-4 hidden lg:flex relative items-center bg-white dark:bg-gray-700 rounded-full px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder={translations.search_placeholder}
                            className="w-full bg-transparent p-2 text-gray-700 dark:text-gray-200 focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onFocus={() => setIsSuggestionsOpen(true)}
                        />
                         <button onClick={onVoiceSearch} className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400" aria-label="Search by voice">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        </button>
                        <button onClick={onVisualSearchClick} className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400" aria-label="Search by image">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                        {isSuggestionsOpen && <AISearchSuggestions query={searchQuery} onSelect={(term) => { handleSearchChange(term); setIsSuggestionsOpen(false); }} />}
                    </div>
                )}
                <div className="flex items-center space-x-2 sm:space-x-4">
                     <button onClick={onGiftFinderClick} title={translations.gift_finder} className="hidden lg:flex items-center gap-2 text-accent dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-semibold transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M5 5a3 3 0 013-3h8a3 3 0 013 3v8a3 3 0 01-3 3h-8a3 3 0 01-3-3V5zm3 0a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V6a1 1 0 00-1-1H8z" clipRule="evenodd" />
                           <path d="M5 3a1 1 0 000 2v8a1 1 0 001 1h1V4a1 1 0 00-1-1H5zM3 5a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V6a1 1 0 00-1-1H3z" />
                        </svg>
                        <span>{translations.gift_finder}</span>
                    </button>
                    <div className="hidden lg:flex items-center space-x-2 sm:space-x-4">
                        {currentSeller ? (
                             <div className="flex items-center space-x-2 sm:space-x-4">
                                <button
                                    onClick={() => handleNavigation('seller')}
                                    className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                                        currentView === 'seller' 
                                        ? 'bg-secondary text-white' 
                                        : 'text-accent dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700'
                                    }`}
                                    aria-current={currentView === 'seller' ? 'page' : undefined}
                                >
                                    {translations.seller_dashboard}
                                </button>
                                <button
                                    onClick={logout}
                                    className="text-accent dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                                >
                                    {translations.logout}
                                </button>
                            </div>
                        ) : currentBuyer ? (
                            <div className="flex items-center space-x-2 sm:space-x-4">
                                <button
                                    onClick={() => handleNavigation('buyer-dashboard')}
                                    className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                                        currentView === 'buyer-dashboard' 
                                        ? 'bg-secondary text-white' 
                                        : 'text-accent dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700'
                                    }`}
                                    aria-current={currentView === 'buyer-dashboard' ? 'page' : undefined}
                                >
                                    {translations.my_account}
                                </button>
                                <button
                                    onClick={logout}
                                    className="text-accent dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                                >
                                    {translations.logout}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleNavigation('auth')}
                                className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                                    currentView === 'auth' 
                                    ? 'bg-secondary text-white' 
                                    : 'text-accent dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700'
                                }`}
                            >
                                {translations.login_signup}
                            </button>
                        )}
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                    <button onClick={onCartClick} className="relative text-accent dark:text-gray-200 hover:text-secondary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {cartItemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {cartItemCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
            {isShopView && (
                 <div className="lg:hidden container mx-auto px-4 pb-4">
                    <div className="w-full flex items-center bg-white dark:bg-gray-700 rounded-full px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder={translations.search_placeholder}
                            className="w-full bg-transparent p-2 text-gray-700 dark:text-gray-200 focus:outline-none"
                            onChange={(e) => onSearch(e.target.value)}
                        />
                         <button onClick={onVoiceSearch} className="p-1 text-gray-500 dark:text-gray-400" aria-label="Search by voice">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        </button>
                        <button onClick={onVisualSearchClick} className="p-1 text-gray-500 dark:text-gray-400" aria-label="Search by image">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};