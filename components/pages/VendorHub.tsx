import React, { useContext } from 'react';
import { AppContext } from '../../App';
import type { Seller, Product, Order } from '../../types';

interface VendorHubProps {
    seller: Seller;
    products: Product[];
    orders: Order[];
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-lightgray dark:bg-gray-700/50 p-6 rounded-lg flex items-center space-x-4">
        <div className="bg-primary/20 text-primary dark:text-blue-300 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
            <p className="text-gray-500 dark:text-gray-400">{title}</p>
        </div>
    </div>
);

const ResourceCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg hover:shadow-lg dark:hover:shadow-gray-700/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        <div className="text-secondary mb-3">{icon}</div>
        <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{title}</h4>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
);

export const VendorHub: React.FC<VendorHubProps> = ({ seller, products, orders }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { translations, handleNavigation } = context;

    return (
        <main className="container mx-auto px-4 py-12">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Welcome to the {translations.vendor_hub}, {seller.storeName}!</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Here are resources and insights to help you grow your business on Innovative Gadget.</p>
                </div>
                
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                     <StatCard 
                        title="Total Products" 
                        value={products.length} 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} 
                    />
                    <StatCard 
                        title="Total Orders" 
                        value={orders.length} 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
                    />
                </div>
                
                {/* Seller Toolkit */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Seller's Toolkit</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ResourceCard 
                            title="Product Photography Guide"
                            description="Learn how to take stunning photos that make your products stand out. Good images can increase sales by up to 50%!"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                        />
                         <ResourceCard 
                            title="Marketing & Promotion Tips"
                            description="Discover effective ways to market your store on social media and drive more traffic to your Innovative Gadget product pages."
                             icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.517l-2.008-1.004A7.001 7.001 0 007 6H5.436z" /></svg>}
                        />
                         <ResourceCard 
                            title="Packaging Best Practices"
                            description="Ensure your items arrive safely and professionally. Good packaging protects products and impresses customers, leading to better reviews."
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                        />
                    </div>
                    <div className="mt-8 text-center">
                        <button onClick={() => handleNavigation('seller')} className="bg-primary text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-secondary transition-colors">
                            Go to my Seller Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};