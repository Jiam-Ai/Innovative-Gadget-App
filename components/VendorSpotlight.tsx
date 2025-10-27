import React, { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { LOCAL_STORAGE_KEYS } from '../constants';
import type { Seller } from '../types';

export const VendorSpotlight: React.FC = () => {
    const context = useContext(AppContext);

    const featuredSeller = useMemo(() => {
        try {
            const sellersJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.SELLERS);
            const sellers: Seller[] = sellersJSON ? JSON.parse(sellersJSON) : [];
            const sellersWithStories = sellers.filter(s => s.story);
            if (sellersWithStories.length === 0) return null;
            // Select a random seller to feature
            return sellersWithStories[Math.floor(Math.random() * sellersWithStories.length)];
        } catch (e) {
            return null;
        }
    }, []);

    if (!context || !featuredSeller) return null;
    const { translations } = context;

    return (
        <div className="bg-gradient-to-tr from-secondary to-green-700 text-white p-6 rounded-lg shadow-md my-8">
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                {translations.vendor_spotlight}: {featuredSeller.storeName}
            </h2>
            <p className="whitespace-pre-wrap font-light italic leading-relaxed">"{featuredSeller.story}"</p>
        </div>
    );
};