import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import type { BuyerInfo, Order } from '../types';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PaymentOption: React.FC<{id: string, name: string, icon: string, selected: boolean, onSelect: (id: string) => void}> = ({id, name, icon, selected, onSelect}) => (
    <div 
        onClick={() => onSelect(id)}
        role="radio"
        aria-checked={selected}
        className={`border-2 rounded-lg p-4 flex items-center space-x-4 cursor-pointer transition-all ${selected ? 'border-primary ring-2 ring-primary bg-blue-50 dark:bg-primary/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}
    >
        <img src={icon} alt={`${name} logo`} className="w-10 h-auto object-contain" />
        <span className="font-semibold text-gray-700 dark:text-gray-200">{name}</span>
    </div>
);

const CheckoutSuccessView: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { translations, handleNavigation } = context;

    const handleTrackOrder = () => {
        onClose();
        handleNavigation('track-order', { orderId: order.id });
    };

    const handleContinueShopping = () => {
        onClose();
        handleNavigation('shop');
    };
    
    return (
        <div className="p-8 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{translations.order_placed_success_title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{translations.order_placed_success_desc}</p>
            <div className="bg-lightgray dark:bg-gray-700/50 p-4 rounded-lg mb-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">{translations.your_order_id}</p>
                <p className="text-xl font-bold text-primary dark:text-blue-400 tracking-wider">{order.id}</p>
            </div>
            <div className="w-full space-y-3">
                 <button onClick={handleTrackOrder} className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors">
                    {translations.track_your_order}
                </button>
                 <button onClick={handleContinueShopping} className="w-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                    {translations.continue_shopping}
                </button>
            </div>
        </div>
    );
};


export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
    const context = useContext(AppContext);
    const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success'>('idle');
    const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

    // Form state
    const [selectedPayment, setSelectedPayment] = useState('cod');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');

    if (!context) return null;
    const { translations, currentBuyer, placeOrder } = context;

    const resetAndClose = () => {
        onClose();
        // Add a delay to allow the closing animation to finish before resetting state
        setTimeout(() => {
            setCheckoutStatus('idle');
            setPlacedOrder(null);
        }, 300);
    };

    useEffect(() => {
        if (isOpen) {
            setFullName(currentBuyer?.fullName || '');
            setPhoneNumber(currentBuyer?.phoneNumber || '');
            setDeliveryAddress('');
            setCheckoutStatus('idle');
            setPlacedOrder(null);
        }
    }, [isOpen, currentBuyer]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || !phoneNumber || !deliveryAddress) {
            alert('Please fill in all delivery details.');
            return;
        }

        setCheckoutStatus('processing');
        
        // Simulate processing delay
        setTimeout(() => {
            const newOrder = placeOrder({
                fullName,
                phoneNumber,
                deliveryAddress
            });

            if (newOrder) {
                setPlacedOrder(newOrder);
                setCheckoutStatus('success');
            } else {
                // Handle error case, e.g., show an error message
                setCheckoutStatus('idle');
                alert("There was an issue placing your order. Please try again.");
            }
        }, 1500);
    };

    if (!isOpen) return null;
    
    const renderContent = () => {
        switch (checkoutStatus) {
            case 'success':
                return placedOrder ? <CheckoutSuccessView order={placedOrder} onClose={resetAndClose} /> : null;
            case 'processing':
                 return (
                    <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                        <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Processing Your Order...</h2>
                    </div>
                 );
            case 'idle':
            default:
                return (
                    <>
                         <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{translations.checkout}</h2>
                            <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close checkout">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <form id="checkout-form" onSubmit={handleFormSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">{translations.delivery_details}</h3>
                                <div className="space-y-4">
                                    <input type="text" placeholder={translations.full_name} aria-label={translations.full_name} required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                                    <input type="tel" placeholder={translations.phone_number} aria-label={translations.phone_number} required value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                                    <textarea placeholder={translations.delivery_address} aria-label={translations.delivery_address} rows={3} required value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                                </div>
                            </div>
                            <div role="radiogroup" aria-labelledby="payment-method-heading">
                                <h3 id="payment-method-heading" className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">{translations.payment_method}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                   <PaymentOption id="cod" name={translations.cash_on_delivery} icon="https://img.icons8.com/fluency/96/stack-of-money.png" selected={selectedPayment === 'cod'} onSelect={setSelectedPayment} />
                                   <PaymentOption id="orange" name={translations.orange_money} icon="https://seeklogo.com/images/O/orange-money-logo-8F2AED37F3-seeklogo.com.png" selected={selectedPayment === 'orange'} onSelect={setSelectedPayment} />
                                   <PaymentOption id="africell" name={translations.africell_money} icon="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxPzFz-g_5y5Gk8o_e_7Q6YxX3nQJd-X-vA&s" selected={selectedPayment === 'africell'} onSelect={setSelectedPayment} />
                                   <PaymentOption id="syllogy" name={translations.syllogy_mobile_money} icon="https://img.icons8.com/color/96/wallet--v1.png" selected={selectedPayment === 'syllogy'} onSelect={setSelectedPayment} />
                                   <PaymentOption id="natcom" name={translations.natcom_top_up} icon="https://img.icons8.com/fluency/96/mobile-payment.png" selected={selectedPayment === 'natcom'} onSelect={setSelectedPayment} />
                                </div>
                            </div>
                        </form>
                        <div className="p-5 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                            <button 
                                type="submit"
                                form="checkout-form"
                                className="w-full bg-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors"
                            >
                                {translations.place_order}
                            </button>
                        </div>
                    </>
                );
        }
    }


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog" onClick={resetAndClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 transform transition-all" onClick={e => e.stopPropagation()}>
                {renderContent()}
            </div>
        </div>
    );
};