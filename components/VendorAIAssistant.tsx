import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { generateProductDescription } from '../services/geminiService';

export const VendorAIAssistant: React.FC = () => {
    const context = useContext(AppContext);
    const [keywords, setKeywords] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    if (!context) return null;
    const { translations } = context;

    const handleGenerate = async () => {
        if (!keywords.trim()) {
            setError('Please enter some keywords.');
            return;
        }
        setError('');
        setIsLoading(true);
        setDescription('');
        try {
            const result = await generateProductDescription(keywords);
            if (result.includes('Failed to generate')) {
                setError(result)
            } else {
                setDescription(result);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        if (navigator.clipboard && description) {
            navigator.clipboard.writeText(description).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
            });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl" role="img" aria-label="sparkles">✨</span>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{translations.vendor_ai_assistant}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{translations.ai_description}</p>
            
            <div className="flex flex-col md:flex-row gap-2 mb-2">
                <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder={translations.product_keywords}
                    className="flex-grow p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                    aria-label={translations.product_keywords}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-secondary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {translations.generating}
                        </>
                    ) : (
                        translations.generate_description
                    )}
                </button>
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            
            {description && (
                <div className="mt-4 p-4 bg-lightgray dark:bg-gray-700 rounded-md relative group border dark:border-gray-600">
                    <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap pr-10">{description}</p>
                    <button 
                      onClick={handleCopy}
                      className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-md text-gray-500 dark:text-gray-300 hover:text-primary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                      aria-label="Copy description"
                    >
                      {isCopied ? (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                </div>
            )}
        </div>
    );
};