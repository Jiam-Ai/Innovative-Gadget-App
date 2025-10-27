
import React, { useContext } from 'react';
import { AppContext } from '../../App';

const Step: React.FC<{ number: number; title: string; description: string; icon: React.ReactNode }> = ({ number, title, description, icon }) => (
    <div className="flex flex-col items-center text-center p-6 bg-lightgray dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white mb-4">
            {icon}
        </div>
        <p className="font-bold text-gray-500 dark:text-gray-400">Step {number}</p>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1 mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
);

export const HowToBuy: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { translations } = context;

    return (
        <main className="container mx-auto px-4 py-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">{translations.how_to_buy}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 text-center">Shopping on SaloneKart is simple. Follow these easy steps!</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <Step
                        number={1}
                        title="Browse & Discover"
                        description="Explore thousands of products from local sellers. Use the search bar or categories to find exactly what you need."
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                    />
                    <Step
                        number={2}
                        title="Add to Cart"
                        description="Found something you like? Click the 'Add to Cart' button to save it for later or proceed to checkout."
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    />
                    <Step
                        number={3}
                        title="Checkout"
                        description="Enter your delivery information and choose your preferred payment method (like Cash on Delivery or Mobile Money)."
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                    />
                    <Step
                        number={4}
                        title="Receive Your Order"
                        description="That's it! Your order will be delivered right to your doorstep. Sit back, relax, and enjoy your purchase."
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1" /></svg>}
                    />
                </div>
            </div>
        </main>
    );
};