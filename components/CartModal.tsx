import React, { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { CartItem } from '../types';

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCheckout: () => void;
}

const CartModalRow: React.FC<{ item: CartItem }> = ({ item }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { updateQuantity, removeFromCart, translations } = context;
    const formattedPrice = new Intl.NumberFormat('en-US').format(item.negotiatedPrice ?? item.product.price);

    const variantText = item.variant 
        ? Object.entries(item.variant).map(([, value]) => value).join(', ')
        : null;

    return (
        <div className="flex items-center justify-between py-4 border-b dark:border-gray-700">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
                <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                <div className="min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{item.product.name}</p>
                    {variantText && <p className="text-xs text-gray-500 dark:text-gray-400">{variantText}</p>}
                    <p className="text-sm text-gray-500 dark:text-gray-400">SLL {formattedPrice}</p>
                    {item.subscription && (
                        <p className="text-xs font-bold text-secondary">{translations.subscription}</p>
                    )}
                     {item.negotiatedPrice && (
                        <p className="text-xs font-bold text-green-600 dark:text-green-400">Deal Price!</p>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center border rounded dark:border-gray-600">
                    <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Decrease quantity">-</button>
                    <span className="px-3 dark:text-gray-200" aria-label="Current quantity">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Increase quantity">+</button>
                </div>
                <button onClick={() => removeFromCart(item.cartItemId)} className="text-red-500 hover:text-red-700" aria-label="Remove item">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        </div>
    );
};

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onCheckout }) => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { cart, translations } = context;

    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.negotiatedPrice ?? item.product.price) * item.quantity, 0);
    }, [cart]);
    const formattedSubtotal = new Intl.NumberFormat('en-US').format(subtotal);

    const cartByVendor = useMemo(() => {
        return cart.reduce((acc, item) => {
            const vendor = item.product.vendor;
            if (!acc[vendor]) {
                acc[vendor] = [];
            }
            acc[vendor].push(item);
            return acc;
        }, {} as Record<string, CartItem[]>);
    }, [cart]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm animate-fade-in" aria-modal="true" role="dialog" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-2xl m-4 transform transition-all flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{translations.shopping_cart}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close cart">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="p-5 flex-1 overflow-y-auto">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-12 flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Your Cart is Empty</h3>
                            <p className="mt-1">Looks like you haven't added anything yet.</p>
                        </div>
                    ) : (
                        // FIX: Refactored to use `Object.keys` which has better type support in some TS configs than `Object.entries`, resolving the "map does not exist on unknown" error.
                        Object.keys(cartByVendor).map((vendor) => (
                            <div key={vendor} className="mb-4">
                                <h3 className="font-bold text-lg text-gray-700 dark:text-gray-200 border-b-2 border-primary/50 dark:border-primary/70 pb-2 mb-2">{vendor}</h3>
                                {cartByVendor[vendor].map(item => <CartModalRow key={item.cartItemId} item={item} />)}
                            </div>
                        ))
                    )}
                </div>
                
                {cart.length > 0 && (
                    <div className="p-5 border-t dark:border-gray-700 bg-gray-50 dark:bg-dark-bg/50 rounded-b-lg flex-shrink-0">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-medium text-gray-600 dark:text-gray-300">{translations.subtotal}:</span>
                            <span className="text-2xl font-bold text-primary dark:text-blue-400">SLL {formattedSubtotal}</span>
                        </div>
                        <button 
                            onClick={onCheckout}
                            className="w-full bg-secondary text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                        >
                            {translations.proceed_to_checkout}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
