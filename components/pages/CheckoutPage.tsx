import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from '../../App';
import type { BuyerInfo, Order, CartItem } from '../../types';

const CheckoutStep: React.FC<{ number: number, label: string, isCurrent: boolean, isCompleted: boolean }> = ({ number, label, isCurrent, isCompleted }) => {
    const stateClasses = isCurrent
        ? 'border-primary bg-primary text-white ring-4 ring-primary/20'
        : isCompleted
        ? 'border-primary bg-primary text-white'
        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400';

    return (
        <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${stateClasses} transition-all duration-300`}>
                {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                ) : number}
            </div>
            <span className={`font-semibold text-sm sm:text-base ${isCurrent || isCompleted ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>{label}</span>
        </div>
    );
};

const OrderSummary: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { cart, translations } = context;

    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.negotiatedPrice ?? item.product.price) * item.quantity, 0);
    }, [cart]);
    
    const shippingFee = 50; // Mock shipping fee
    const total = subtotal + shippingFee;

    return (
        <div className="bg-lightgray dark:bg-dark-card p-6 rounded-lg h-fit sticky top-28">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3">Order Summary</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 mb-4">
                {cart.map((item: CartItem) => (
                    <div key={item.cartItemId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 object-cover rounded-md" />
                            <div>
                                <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{item.product.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                            </div>
                        </div>
                        <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">SLL {new Intl.NumberFormat('en-US').format((item.negotiatedPrice ?? item.product.price) * item.quantity)}</p>
                    </div>
                ))}
            </div>
            <div className="border-t dark:border-gray-700 pt-4 space-y-2">
                 <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>{translations.subtotal}</span>
                    <span>SLL {new Intl.NumberFormat('en-US').format(subtotal)}</span>
                </div>
                 <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Shipping</span>
                    <span>SLL {new Intl.NumberFormat('en-US').format(shippingFee)}</span>
                </div>
                 <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-gray-100 border-t dark:border-gray-700 pt-2 mt-2">
                    <span>{translations.total}</span>
                    <span>SLL {new Intl.NumberFormat('en-US').format(total)}</span>
                </div>
            </div>
        </div>
    );
}

const CheckoutSuccessView: React.FC<{ order: Order }> = ({ order }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { translations, handleNavigation } = context;

    const handleTrackOrder = () => {
        handleNavigation('track-order', { orderId: order.id });
    };

    const handleContinueShopping = () => {
        handleNavigation('shop');
    };
    
    return (
        <div className="text-center flex flex-col items-center max-w-lg mx-auto animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{translations.order_placed_success_title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{translations.order_placed_success_desc}</p>
            <div className="bg-lightgray dark:bg-dark-card p-4 rounded-lg mb-8">
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

const PaymentOption: React.FC<{
    id: string, 
    name: string, 
    description: string,
    icon: string, 
    selected: boolean, 
    onSelect: (id: string) => void
}> = ({id, name, description, icon, selected, onSelect}) => (
    <div 
        onClick={() => onSelect(id)}
        role="radio"
        aria-checked={selected}
        className={`relative border-2 rounded-lg p-4 flex items-start space-x-4 cursor-pointer transition-all ${selected ? 'border-primary ring-2 ring-primary/20 bg-blue-50 dark:bg-primary/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}
    >
        <img src={icon} alt={`${name} logo`} className="w-10 h-auto object-contain flex-shrink-0" />
        <div className="flex-1">
            <span className="font-bold text-gray-800 dark:text-gray-100">{name}</span>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        {selected && (
            <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full text-white flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
        )}
    </div>
);


export const CheckoutPage: React.FC = () => {
    const context = useContext(AppContext);
    const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
    const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

    // Form state
    const [selectedPayment, setSelectedPayment] = useState('cod');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({});

    if (!context) return null;
    const { translations, currentBuyer, placeOrder, handleNavigation, cart } = context;

    useEffect(() => {
        if (cart.length === 0 && step !== 'success') {
            handleNavigation('shop');
        }
    }, [cart, step, handleNavigation]);

    useEffect(() => {
        setFullName(currentBuyer?.fullName || '');
        setPhoneNumber(currentBuyer?.phoneNumber || '');
        setMobileMoneyNumber(currentBuyer?.phoneNumber || '');
        setDeliveryAddress('');
    }, [currentBuyer]);

    const validateShipping = () => {
        const errors: { [key: string]: boolean } = {};
        if (!fullName.trim()) errors.fullName = true;
        if (!phoneNumber.trim()) errors.phoneNumber = true;
        if (!deliveryAddress.trim()) errors.deliveryAddress = true;
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleContinueToPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateShipping()) {
            setStep('payment');
            window.scrollTo(0, 0);
        }
    };

    const handlePlaceOrder = (e: React.FormEvent) => {
        e.preventDefault();
        
        const isMobileMoney = ['orange', 'afri_money'].includes(selectedPayment);
        if (isMobileMoney && !/^\d{8,10}$/.test(mobileMoneyNumber.trim())) {
             alert('Please enter a valid mobile money phone number (e.g., 077123456).');
             return;
        }
        
        // --- REAL-WORLD SCENARIO ---
        // 1. Show a loading spinner.
        // 2. Call your backend server with order details and payment info (e.g., mobileMoneyNumber).
        // 3. Your backend calls the Payment Service Provider (e.g., Paystack).
        // 4. The PSP sends a push notification to the user's phone for PIN confirmation.
        // 5. Your website waits for a confirmation signal from your backend (which gets it from the PSP).
        // 6. Once confirmed, proceed to the success step.

        // --- SIMULATION FOR THIS APP ---
        // We will directly call placeOrder and simulate the success.
        const newOrder = placeOrder({
            fullName,
            phoneNumber,
            deliveryAddress
        });

        if (newOrder) {
            setPlacedOrder(newOrder);
            setStep('success');
            window.scrollTo(0, 0);
        } else {
            alert("There was an issue placing your order. Please try again.");
        }
    };
    
    if (step === 'success' && placedOrder) {
         return (
             <main className="container mx-auto px-4 py-12">
                <CheckoutSuccessView order={placedOrder} />
             </main>
         );
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">{translations.checkout}</h1>
            
            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-10">
                <div className="flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-300 dark:bg-gray-600 -translate-y-1/2">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: step === 'payment' ? '50%' : step === 'success' ? '100%' : '0%' }}></div>
                    </div>
                    <div className="relative z-10 w-full flex justify-between">
                         <CheckoutStep number={1} label="Shipping" isCurrent={step === 'shipping'} isCompleted={step === 'payment' || step === 'success'} />
                         <CheckoutStep number={2} label="Payment" isCurrent={step === 'payment'} isCompleted={step === 'success'} />
                         <CheckoutStep number={3} label="Confirmation" isCurrent={step === 'success'} isCompleted={false} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Left/Main Column */}
                <div className="lg:col-span-2">
                    {/* Shipping Details */}
                    <div style={{ display: step === 'shipping' ? 'block' : 'none' }}>
                        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md animate-fade-in">
                             <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{translations.delivery_details}</h2>
                             <form onSubmit={handleContinueToPayment} className="space-y-4">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                    <input type="text" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required className={`w-full mt-1 p-3 border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary`} />
                                </div>
                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                    <input type="tel" id="phoneNumber" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required className={`w-full mt-1 p-3 border ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary`} />
                                </div>
                                 <div>
                                    <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Delivery Address</label>
                                    <textarea id="deliveryAddress" rows={3} value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} required className={`w-full mt-1 p-3 border ${formErrors.deliveryAddress ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}></textarea>
                                </div>
                                <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors">
                                    Continue to Payment
                                </button>
                             </form>
                        </div>
                    </div>
                    
                    {/* Payment Details */}
                     <div style={{ display: step === 'payment' ? 'block' : 'none' }}>
                        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md animate-fade-in">
                             <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{translations.payment_method}</h2>
                             <form onSubmit={handlePlaceOrder} className="space-y-4">
                                <div role="radiogroup" className="flex flex-col gap-4">
                                   <PaymentOption id="cod" name={translations.cash_on_delivery} description={translations.payment_method_description_cod} icon="https://img.icons8.com/fluency/96/stack-of-money.png" selected={selectedPayment === 'cod'} onSelect={setSelectedPayment} />
                                   <PaymentOption id="orange" name={translations.orange_money} description={translations.payment_method_description_mobile} icon="https://seeklogo.com/images/O/orange-money-logo-8F2AED37F3-seeklogo.com.png" selected={selectedPayment === 'orange'} onSelect={setSelectedPayment} />
                                   <PaymentOption id="afri_money" name={translations.afri_money} description={translations.payment_method_description_mobile} icon="https://afrimoney.sl/wp-content/uploads/2022/04/Afrimoney-Logo-06-1-1024x262.png" selected={selectedPayment === 'afri_money'} onSelect={setSelectedPayment} />
                                </div>

                                {['orange', 'afri_money'].includes(selectedPayment) && (
                                     <div className="pt-4 animate-fade-in">
                                        <label htmlFor="mobileMoneyNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations.mobile_money_number_label}</label>
                                        <input 
                                            type="tel" 
                                            id="mobileMoneyNumber" 
                                            value={mobileMoneyNumber} 
                                            onChange={e => setMobileMoneyNumber(e.target.value)} 
                                            required 
                                            placeholder={translations.mobile_money_number_placeholder}
                                            className={`w-full mt-1 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary`} 
                                        />
                                    </div>
                                )}
                                {selectedPayment === 'cod' && (
                                    <div className="pt-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-lightgray dark:bg-gray-700/50 p-3 rounded-md animate-fade-in">
                                        {translations.cod_instruction}
                                    </div>
                                )}

                                <div className="flex items-center justify-center pt-4 text-sm text-gray-500 dark:text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>{translations.secure_transaction_info}</span>
                                </div>
                                 <div className="flex items-center gap-4 pt-4">
                                    <button type="button" onClick={() => setStep('shipping')} className="w-1/3 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                                        Back
                                    </button>
                                     <button type="submit" className="w-2/3 bg-secondary text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors">
                                        {translations.place_order}
                                    </button>
                                </div>
                             </form>
                        </div>
                    </div>
                </div>

                {/* Right/Sidebar Column */}
                <div className="lg:col-span-1">
                    <OrderSummary />
                </div>
            </div>
        </main>
    );
};