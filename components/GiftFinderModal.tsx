import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import type { Product } from '../types';
import { findGiftIdeas, GiftFinderParams } from '../services/geminiService';
import { ProductGrid } from './ProductGrid';

interface GiftFinderModalProps {
    isOpen: boolean;
    onClose: () => void;
    allProducts: Product[];
    onOpenProduct: (product: Product) => void;
}

export const GiftFinderModal: React.FC<GiftFinderModalProps> = ({ isOpen, onClose, allProducts, onOpenProduct }) => {
    const context = useContext(AppContext);
    const [formState, setFormState] = useState<GiftFinderParams>({
        recipient: 'friend',
        occasion: 'birthday',
        interests: '',
        budget: '0-500'
    });
    const [results, setResults] = useState<Product[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    if (!context) return null;
    const { translations } = context;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResults(null);
        try {
            const resultIds = await findGiftIdeas(formState, allProducts);
            if (resultIds.length > 0) {
                const resultProducts = allProducts.filter(p => resultIds.includes(p.id));
                setResults(resultProducts);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error(error);
            setResults([]); // show no results on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleProductClick = (product: Product) => {
        onClose();
        // Delay opening the next modal to allow for a smooth transition
        setTimeout(() => onOpenProduct(product), 300);
    };

    const handleReset = () => {
        setResults(null);
        setFormState({ recipient: 'friend', occasion: 'birthday', interests: '', budget: '0-500' });
    };

    if (!isOpen) return null;
    
    const inputClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{translations.gift_finder_title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label={translations.close}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {results === null && !isLoading && (
                        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
                            <p className="text-center text-gray-600 dark:text-gray-300 mb-4">{translations.gift_finder_desc}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="recipient" className={labelClasses}>{translations.who_is_it_for}</label>
                                    <select name="recipient" id="recipient" value={formState.recipient} onChange={handleInputChange} className={inputClasses}>
                                        <option value="friend">{translations.recipient_friend}</option>
                                        <option value="partner">{translations.recipient_partner}</option>
                                        <option value="parent">{translations.recipient_parent}</option>
                                        <option value="coworker">{translations.recipient_coworker}</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="occasion" className={labelClasses}>{translations.occasion}</label>
                                    <select name="occasion" id="occasion" value={formState.occasion} onChange={handleInputChange} className={inputClasses}>
                                        <option value="birthday">{translations.occasion_birthday}</option>
                                        <option value="holiday">{translations.occasion_holiday}</option>
                                        <option value="anniversary">{translations.occasion_anniversary}</option>
                                        <option value="thank-you">{translations.occasion_thank_you}</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="interests" className={labelClasses}>{translations.interests}</label>
                                <input type="text" name="interests" id="interests" value={formState.interests} onChange={handleInputChange} placeholder="e.g. Gaming, photography, fitness" required className={inputClasses} />
                            </div>
                            <div>
                                <label htmlFor="budget" className={labelClasses}>{translations.budget}</label>
                                <select name="budget" id="budget" value={formState.budget} onChange={handleInputChange} className={inputClasses}>
                                    <option value="under SLL 500">{translations.budget_under_500}</option>
                                    <option value="SLL 500 - 1000">{translations.budget_500_1000}</option>
                                    <option value="over SLL 1000">{translations.budget_over_1000}</option>
                                </select>
                            </div>
                             <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-secondary transition-colors mt-4">
                                {translations.find_gifts}
                            </button>
                        </form>
                    )}

                    {isLoading && (
                         <div className="text-center py-10 flex flex-col items-center">
                            <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <p className="text-gray-500 dark:text-gray-400">{translations.finding_gifts}</p>
                        </div>
                    )}
                    
                    {results !== null && !isLoading && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{translations.ai_gift_results}</h3>
                                <button onClick={handleReset} className="text-sm font-semibold text-primary dark:text-blue-400 hover:underline">Start Over</button>
                            </div>
                            {results.length > 0 ? (
                                <ProductGrid products={results} onOpenProductModal={handleProductClick} />
                            ) : (
                                <p className="text-center py-8 text-gray-500 dark:text-gray-400">{translations.no_gifts_found}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};