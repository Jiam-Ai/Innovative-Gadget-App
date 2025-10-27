import React, { useContext } from 'react';
import { AppContext } from '../App';

interface ProductSortProps {
    sortOrder: string;
    onSortChange: (order: string) => void;
}

export const ProductSort: React.FC<ProductSortProps> = ({ sortOrder, onSortChange }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    
    const { translations } = context;

    return (
        <div className="flex items-center space-x-2">
            <label htmlFor="sort-order" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {translations.sort_by}:
            </label>
            <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => onSortChange(e.target.value)}
                className="p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
                <option value="default">{translations.sort_default}</option>
                <option value="price-asc">{translations.sort_price_asc}</option>
                <option value="price-desc">{translations.sort_price_desc}</option>
            </select>
        </div>
    );
};