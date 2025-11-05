import React, { useContext, useId, useState } from 'react';
import type { Product } from '../types';
import { AppContext } from '../App';

interface ProductCardProps {
    product: Product;
    isSellerView?: boolean;
    onEdit?: (product: Product) => void;
    onClick?: (product: Product) => void;
    onUpdate?: (product: Product) => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const clipPathId = useId();
    const roundedRating = Math.round(rating * 2) / 2;
    const fullStars = Math.floor(roundedRating);
    const halfStar = roundedRating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    const starPath = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => (
                <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d={starPath} /></svg>
            ))}
            {halfStar && (
                 <svg className="w-4 h-4" viewBox="0 0 20 20">
                    <defs>
                        <clipPath id={clipPathId}>
                            <rect x="0" y="0" width="10" height="20" />
                        </clipPath>
                    </defs>
                    <path className="text-gray-300 dark:text-gray-600" fill="currentColor" d={starPath} />
                    <path className="text-yellow-400" fill="currentColor" d={starPath} clipPath={`url(#${clipPathId})`} />
                </svg>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d={starPath} /></svg>
            ))}
        </div>
    );
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, isSellerView = false, onEdit, onClick, onUpdate }) => {
    const context = useContext(AppContext);
    const [stockLevel, setStockLevel] = useState(product.stock ?? 0);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    if (!context) return null;
    const { addToCart, translations, comparisonList, toggleCompare } = context;

    const onSale = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = onSale ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;
    const isLowStock = product.stock !== undefined && product.stock <= 10;
    const isComparing = comparisonList.some(p => p.id === product.id);

    const formattedPrice = new Intl.NumberFormat('en-US').format(product.price);
    const formattedOriginalPrice = onSale ? new Intl.NumberFormat('en-US').format(product.originalPrice!) : '';
    
    const handleAddToCartClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart(product);
    };
    
    const handleQuickViewClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onClick) {
            onClick(product);
        }
    };

    const handleCompareClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleCompare(product);
    }
    
    const handleUpdateStock = () => {
        if (onUpdate) {
            onUpdate({ ...product, stock: stockLevel });
            setUpdateSuccess(true);
            setTimeout(() => setUpdateSuccess(false), 2000);
        }
    };

    return (
        <div onClick={() => onClick?.(product)} className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden group flex flex-col relative cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up">
            {!isSellerView && (
                 <button
                    onClick={handleCompareClick}
                    title={isComparing ? translations.remove_from_compare : translations.compare}
                    className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-all duration-200 ease-in-out ${
                        isComparing 
                        ? 'bg-primary text-white shadow-lg scale-110' 
                        : 'bg-white/70 text-gray-700 hover:bg-white dark:bg-dark-bg/50 dark:text-gray-200 dark:hover:bg-dark-bg'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </button>
            )}
            <div className="relative w-full aspect-square overflow-hidden">
                 <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" />
                 {onSale && !isSellerView && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse-badge">
                        -{discountPercent}%
                    </div>
                 )}
                 {!isSellerView && (
                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                            onClick={handleQuickViewClick}
                            className="bg-white/90 text-primary px-4 py-2 rounded-full hover:bg-white transition-colors text-sm font-semibold"
                        >
                            Quick View
                        </button>
                        <button 
                            onClick={handleAddToCartClick}
                            aria-label="Add to cart"
                            className="bg-secondary text-white p-3 rounded-full hover:bg-green-700 transition-colors"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </button>
                     </div>
                 )}
            </div>
            <div className="p-3 flex flex-col flex-grow">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 h-10 [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">{product.name}</h3>
                
                {isLowStock && !isSellerView && (
                    <p className="text-xs font-semibold text-red-500 mt-1 animate-fade-in">🔥 Only {product.stock} left!</p>
                )}
                
                <div className="flex justify-between items-center mt-auto pt-2">
                    <div>
                        {onSale ? (
                            <>
                                <span className="text-base font-bold text-red-600">SLL {formattedPrice}</span>
                                <span className="text-xs text-gray-400 line-through ml-1.5">SLL {formattedOriginalPrice}</span>
                            </>
                        ) : (
                           <span className="text-base font-bold text-primary dark:text-blue-400">SLL {formattedPrice}</span>
                        )}
                    </div>
                </div>
            </div>
            {isSellerView && onUpdate && (
                <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-dark-bg/50 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                         <label htmlFor={`stock-${product.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {translations.stock}:
                        </label>
                        <input
                            id={`stock-${product.id}`}
                            type="number"
                            value={stockLevel}
                            onChange={(e) => setStockLevel(Number(e.target.value) < 0 ? 0 : Number(e.target.value))}
                            className="w-20 p-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-center"
                            min="0"
                        />
                         <button
                            onClick={handleUpdateStock}
                            disabled={stockLevel === (product.stock ?? 0) || updateSuccess}
                            className="text-sm font-semibold bg-primary text-white px-3 py-1.5 rounded-md hover:bg-blue-800 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {updateSuccess ? translations.stock_updated : translations.update}
                        </button>
                    </div>
                     {onEdit && (
                         <button 
                            onClick={() => onEdit(product)}
                            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors text-sm font-semibold"
                        >
                            {translations.edit_product_details}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};