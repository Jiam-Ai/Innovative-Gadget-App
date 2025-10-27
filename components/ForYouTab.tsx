import React from 'react';
import { ProductGrid } from './ProductGrid';
import { Product } from '../types';

interface ForYouTabProps {
    products: Product[] | null;
    onOpenProductModal: (product: Product) => void;
}

export const ForYouTab: React.FC<ForYouTabProps> = ({ products, onOpenProductModal }) => {
    if (products === null) {
        // Loading state
        return (
            <div className="text-center py-10">
                <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-500 dark:text-gray-400">Finding recommendations just for you...</p>
            </div>
        );
    }

    if (products.length === 0) {
        // Empty state
        return (
            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-2xl text-gray-600 dark:text-gray-300">Nothing here yet!</h2>
                <p className="text-gray-400 dark:text-gray-500 mt-2">Start browsing products to get personalized recommendations.</p>
            </div>
        );
    }
    
    return <ProductGrid products={products} onOpenProductModal={onOpenProductModal} />;
};