import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import type { Product } from '../types';
import { MOCK_PRODUCTS } from '../constants';

interface ShopTheLookProps {
    onOpenProductModal: (product: Product) => void;
}

interface Hotspot {
    id: number;
    productId: number;
    style: { top: string; left: string; };
}

const hotspots: Hotspot[] = [
    { id: 1, productId: 7, style: { top: '35%', left: '48%' } }, // Dress
    { id: 2, productId: 1, style: { top: '15%', left: '52%' } }, // Headphones
];

export const ShopTheLook: React.FC<ShopTheLookProps> = ({ onOpenProductModal }) => {
    const context = useContext(AppContext);
    const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

    if (!context) return null;
    const { translations, addToCart } = context;

    const getProductById = (id: number) => MOCK_PRODUCTS.find(p => p.id === id);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md my-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">{translations.shop_the_look}</h2>
            <div className="relative" onMouseLeave={() => setActiveHotspot(null)}>
                <img src="https://picsum.photos/seed/look/1200/800" alt="Shop the look" className="w-full rounded-lg" />

                {hotspots.map(hotspot => {
                    const product = getProductById(hotspot.productId);
                    if (!product) return null;

                    return (
                        <div key={hotspot.id} style={hotspot.style} className="absolute" onMouseEnter={() => setActiveHotspot(hotspot)}>
                            <button className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-125">
                                <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
                            </button>
                            
                            {activeHotspot?.id === hotspot.id && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-3 animate-fade-in" style={{ zIndex: 10 }}>
                                    <div className="flex gap-3">
                                        <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
                                        <div>
                                            <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{product.name}</p>
                                            <p className="font-semibold text-primary dark:text-blue-400">SLL {product.price}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => addToCart(product)} className="flex-1 bg-secondary text-white py-1.5 px-3 text-xs font-bold rounded hover:bg-green-700 transition-colors">{translations.add_to_cart}</button>
                                        <button onClick={() => onOpenProductModal(product)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-1.5 px-3 text-xs font-bold rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Details</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
