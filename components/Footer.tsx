import React, { useContext } from 'react';
import { AppContext } from '../App';
import type { View } from '../types';

interface NavButtonProps {
    targetView: View | View[];
    label: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
    notificationCount?: number;
    action?: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ targetView, label, icon, activeIcon, notificationCount, action }) => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { currentView, handleNavigation } = context;

    const isActive = Array.isArray(targetView) ? targetView.includes(currentView) : currentView === targetView;
    const effectiveOnClick = action ? action : () => handleNavigation(Array.isArray(targetView) ? targetView[0] : targetView);
    const textColor = isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400';

    return (
        <button 
            onClick={effectiveOnClick} 
            className="flex flex-col items-center justify-center space-y-1 w-1/4 h-full"
            aria-current={isActive ? 'page' : undefined}
        >
            <div className="relative">
                <span className={textColor}>
                    {isActive ? activeIcon : icon}
                </span>
                {notificationCount && notificationCount > 0 && (
                    <span className="absolute -top-1 -right-3.5 bg-green-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-dark-card">
                        {notificationCount}
                    </span>
                )}
            </div>
            <span className={`text-xs ${isActive ? 'font-bold' : ''} ${textColor}`}>{label}</span>
        </button>
    );
};


export const Footer: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { translations, openCart, currentBuyer, currentSeller, handleNavigation } = context;

    const handleMyAccountClick = () => {
        if (currentBuyer) handleNavigation('buyer-dashboard');
        else if (currentSeller) handleNavigation('seller');
        else handleNavigation('auth');
    };

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-700 z-40 lg:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
            <nav className="flex justify-around items-center h-16 px-1">
                <NavButton
                    targetView="shop"
                    label={translations.home}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.955M3 10.5v8.25a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75v-4.5a.75.75 0 01.75-.75h2.25a.75.75 0 01.75.75v4.5a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75V10.5" /></svg>}
                    activeIcon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" /><path d="M12 5.432l8.159 8.159c.026.026.05.054.07.084v6.101A2.25 2.25 0 0117.25 22h-2.25a.75.75 0 01-.75-.75V16.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.75a.75.75 0 01-.75.75h-2.25A2.25 2.25 0 013.75 19.75v-6.101a.752.752 0 01.07-.084L12 5.432z" /></svg>}
                />
                 <NavButton
                    targetView="shop" // Placeholder until wishlist page exists
                    label={translations.wishlist}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>}
                    activeIcon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>}
                />
                 <NavButton
                    targetView={[]}
                    label={translations.shopping}
                    action={openCart}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.328 1.093-.822l3.48-9.046A1.125 1.125 0 0020.25 3H4.228" /></svg>}
                    activeIcon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.21 9l-4.38-6.56a1 1 0 00-.83-.44H6.18a1 1 0 00-.83.44L1 9h16.21zM5 12a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4zm-7 0a2 2 0 100 4 2 2 0 000-4zM1 11v8a2 2 0 002 2h18a2 2 0 002-2v-8H1z" /></svg>}
                />
                 <NavButton
                    targetView={['buyer-dashboard', 'seller', 'auth']}
                    label={translations.my_account}
                    action={handleMyAccountClick}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>}
                    activeIcon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>}
                />
            </nav>
        </footer>
    );
};