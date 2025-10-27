import React, { useContext, useId } from 'react';
import { AppContext } from '../App';
import type { Product } from '../types';

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
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
                    <defs><clipPath id={clipPathId}><rect x="0" y="0" width="10" height="20" /></clipPath></defs>
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


export const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose }) => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { translations, comparisonList, toggleCompare, addToCart } = context;

    if (!isOpen) return null;

    const renderStockStatus = (product: Product) => {
        if (product.stock === undefined) return <span className="text-gray-500 dark:text-gray-400">-</span>;
        if (product.stock === 0) return <span className="text-red-500 font-semibold">{translations.out_of_stock}</span>;
        if (product.stock <= 10) return <span className="text-orange-500 font-semibold">{translations.low_stock} ({product.stock})</span>;
        return <span className="text-green-600 font-semibold">{translations.in_stock}</span>;
    };

    const features = [
        { label: translations.price, render: (p: Product) => `SLL ${new Intl.NumberFormat('en-US').format(p.price)}` },
        { label: translations.rating, render: (p: Product) => <><StarRating rating={p.rating} /> ({p.reviewsCount})</> },
        { label: translations.category, render: (p: Product) => p.category },
        { label: translations.stock_status, render: (p: Product) => renderStockStatus(p) },
        { label: 'Vendor', render: (p: Product) => p.vendor },
    ];
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm" aria-modal="true" role="dialog" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl m-4 transform transition-all flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{translations.product_comparison}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label={translations.close}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="p-6 overflow-auto">
                    {comparisonList.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">Add products to compare them.</p>
                    ) : (
                        <div className={`grid gap-x-6 items-start`} style={{ gridTemplateColumns: `minmax(120px, auto) repeat(${comparisonList.length}, minmax(200px, 1fr))` }}>
                           {/* Header Row */}
                           <div className="font-bold text-lg text-gray-700 dark:text-gray-200 sticky top-0 bg-white dark:bg-gray-800 py-4 invisible">Feature</div>
                           {comparisonList.map(product => (
                               <div key={product.id} className="text-center sticky top-0 bg-white dark:bg-gray-800 py-4">
                                    <button onClick={() => toggleCompare(product)} title={translations.remove} className="absolute top-2 right-0 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors">
                                        &#x2715;
                                    </button>
                                    <img src={product.images[0]} alt={product.name} className="w-full h-32 object-contain rounded-md mb-2 mx-auto"/>
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{product.name}</h3>
                               </div>
                           ))}

                           {/* Feature Rows */}
                           {features.map(feature => (
                               <React.Fragment key={feature.label}>
                                   <div className="font-bold text-gray-700 dark:text-gray-200 py-4 border-t dark:border-gray-700">{feature.label}</div>
                                   {comparisonList.map(product => (
                                       <div key={product.id} className="py-4 border-t dark:border-gray-700 text-center flex items-center justify-center text-gray-600 dark:text-gray-300">
                                          {feature.render(product)}
                                       </div>
                                   ))}
                               </React.Fragment>
                           ))}
                           
                           {/* Action Row */}
                           <div className="py-4 border-t dark:border-gray-700 invisible">Actions</div>
                           {comparisonList.map(product => (
                               <div key={product.id} className="py-4 border-t dark:border-gray-700 text-center">
                                    <button
                                        onClick={() => addToCart(product)}
                                        disabled={product.stock === 0}
                                        className="w-full bg-secondary text-white py-2 px-4 rounded-md font-semibold text-sm hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {translations.add_to_cart}
                                    </button>
                               </div>
                           ))}

                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};