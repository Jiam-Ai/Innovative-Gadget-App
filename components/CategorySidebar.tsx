import React, { useContext } from 'react';
import { AppContext } from '../App';
import { PRICE_RANGES, RATING_FILTERS } from '../constants';

interface CategorySidebarProps {
    categories: string[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
    selectedPriceRange: string;
    onSelectPriceRange: (range: string) => void;
    selectedRating: number;
    onSelectRating: (rating: number) => void;
}

const StarRatingFilter: React.FC<{ rating: number }> = ({ rating }) => {
    const starPath = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20"><path d={starPath} /></svg>
            ))}
        </div>
    );
};

export const CategorySidebar: React.FC<CategorySidebarProps> = ({ 
    categories, selectedCategory, onSelectCategory,
    selectedPriceRange, onSelectPriceRange,
    selectedRating, onSelectRating
}) => {
    const context = useContext(AppContext);
    if (!context) return null;
    
    const { translations } = context;

    const categoryTranslationMap: Record<string, string> = {
        'All': translations.all,
        'Electronics': translations.electronics,
        'Clothing': translations.clothing,
        'Groceries': translations.groceries,
        'Mobile Phones': translations.mobile_phones,
        'Beauty & Health': translations.beauty_health
    };

    const ratingTranslationMap: Record<number, string> = {
        0: translations.all_ratings,
        4: translations.four_stars_up,
        3: translations.three_stars_up,
    };

    return (
        <aside className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md h-fit space-y-8">
            {/* Categories */}
            <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{translations.categories}</h2>
                <ul className="space-y-1">
                    {categories.map(category => (
                        <li key={category}>
                            <button
                                onClick={() => onSelectCategory(category)}
                                className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 text-sm border-l-4 ${
                                    selectedCategory === category
                                        ? 'bg-primary/10 dark:bg-primary/20 border-primary text-primary font-semibold'
                                        : 'text-gray-600 dark:text-gray-300 border-transparent hover:bg-lightgray dark:hover:bg-dark-bg hover:text-primary dark:hover:text-white'
                                }`}
                            >
                                {categoryTranslationMap[category] || category}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Price Range */}
            <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{translations.price_range}</h2>
                <ul className="space-y-1">
                    {PRICE_RANGES.map(range => (
                        <li key={range.key}>
                            <button
                                onClick={() => onSelectPriceRange(range.key)}
                                className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 text-sm border-l-4 ${
                                    selectedPriceRange === range.key
                                        ? 'bg-primary/10 dark:bg-primary/20 border-primary text-primary font-semibold'
                                        : 'text-gray-600 dark:text-gray-300 border-transparent hover:bg-lightgray dark:hover:bg-dark-bg hover:text-primary dark:hover:text-white'
                                }`}
                            >
                                {range.labelKey ? translations[range.labelKey] : range.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Rating */}
            <div>
                 <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{translations.rating}</h2>
                 <ul className="space-y-1">
                    {RATING_FILTERS.map(filter => (
                         <li key={filter.key}>
                            <button
                                onClick={() => onSelectRating(filter.key)}
                                className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-center justify-between border-l-4 ${
                                    selectedRating === filter.key
                                        ? 'bg-primary/10 dark:bg-primary/20 border-primary text-primary font-semibold'
                                        : 'text-gray-600 dark:text-gray-300 border-transparent hover:bg-lightgray dark:hover:bg-dark-bg hover:text-primary dark:hover:text-white'
                                }`}
                            >
                                <span className="text-sm">{ratingTranslationMap[filter.key] || filter.labelKey}</span>
                                {filter.key > 0 && <StarRatingFilter rating={filter.key} />}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};