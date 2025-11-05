

import React from 'react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
    products: Product[];
    onOpenProductModal: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onOpenProductModal }) => {
    if (products.length === 0) {
        return (
            <div className="text-center py-16 px-6 bg-white dark:bg-dark-card rounded-lg shadow-md flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">No products found</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or category filters to find what you're looking for.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
                <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={onOpenProductModal} 
                />
            ))}
        </div>
    );
};