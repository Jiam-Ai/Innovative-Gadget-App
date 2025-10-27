import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { LOCAL_STORAGE_KEYS } from '../constants';
import type { Seller, Buyer } from '../types';

interface AuthProps {
    onSellerLoginSuccess: (seller: Seller) => void;
    onBuyerLoginSuccess: (buyer: Buyer) => void;
}

const validateEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

const validatePassword = (password: string) => {
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= 8 && hasNumber && hasSpecialChar;
};

export const Auth: React.FC<AuthProps> = ({ onSellerLoginSuccess, onBuyerLoginSuccess }) => {
    const context = useContext(AppContext);
    const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot'>('login');
    const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');
    
    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [storeName, setStoreName] = useState('');

    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    if (!context) return null;
    const { translations } = context;

    const clearForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setPhoneNumber('');
        setStoreName('');
        setMessage(null);
    };

    const handleUserTypeToggle = (type: 'buyer' | 'seller') => {
        if (userType !== type) {
            setUserType(type);
            clearForm();
        }
    };

    const switchAuthView = (targetView: 'login' | 'signup' | 'forgot') => {
        setAuthView(targetView);
        clearForm();
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (authView === 'forgot') {
             if (!validateEmail(email)) {
                setMessage({ type: 'error', text: translations.signup_invalid_email });
                return;
            }
            // Simulation
            setMessage({ type: 'success', text: translations.reset_link_sent });
            return;
        }

        // --- Buyer Logic ---
        if (userType === 'buyer') {
            let buyers: Buyer[] = [];
            try {
                const buyersJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.BUYERS);
                buyers = buyersJSON ? JSON.parse(buyersJSON) : [];
            } catch (err) {
                setMessage({ type: 'error', text: translations.auth_storage_error });
                return;
            }
            
            if (authView === 'login') {
                const buyer = buyers.find(b => b.email.toLowerCase() === email.toLowerCase().trim());
                if (buyer && buyer.password === password) {
                    onBuyerLoginSuccess(buyer);
                } else {
                    setMessage({ type: 'error', text: translations.login_error });
                }
            } else if (authView === 'signup') {
                if (!fullName.trim() || !phoneNumber.trim()) {
                     setMessage({ type: 'error', text: translations.fill_all_fields }); // A generic error
                     return;
                }
                if (!validateEmail(email) || !validatePassword(password) || password !== confirmPassword) {
                    if (!validateEmail(email)) setMessage({ type: 'error', text: translations.signup_invalid_email });
                    else if (!validatePassword(password)) setMessage({ type: 'error', text: translations.signup_password_weak });
                    else setMessage({ type: 'error', text: translations.signup_password_mismatch });
                    return;
                }
                if (buyers.some(b => b.email.toLowerCase() === email.toLowerCase().trim())) {
                    setMessage({ type: 'error', text: translations.signup_email_exists });
                    return;
                }

                const newBuyer: Buyer = {
                    id: `buyer-${Date.now()}`,
                    email: email.trim().toLowerCase(),
                    password: password,
                    fullName: fullName.trim(),
                    phoneNumber: phoneNumber.trim(),
                    browsingHistory: [],
                    loyalty: {
                        points: 0,
                        tier: 'Bronze',
                    },
                    // FIX: Initialize quests for new buyers.
                    quests: [],
                };

                try {
                    localStorage.setItem(LOCAL_STORAGE_KEYS.BUYERS, JSON.stringify([...buyers, newBuyer]));
                    onBuyerLoginSuccess(newBuyer);
                } catch (err) {
                    setMessage({ type: 'error', text: translations.auth_storage_error });
                }
            }
        }
        
        // --- Seller Logic ---
        if (userType === 'seller') {
            let sellers: Seller[] = [];
            try {
                const sellersJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.SELLERS);
                sellers = sellersJSON ? JSON.parse(sellersJSON) : [];
            } catch (err) {
                setMessage({ type: 'error', text: translations.auth_storage_error });
                return;
            }
            
            if (authView === 'login') {
                const seller = sellers.find(s => s.email.toLowerCase() === email.toLowerCase().trim());
                if (seller && seller.password === password) {
                    onSellerLoginSuccess(seller);
                } else {
                    setMessage({ type: 'error', text: translations.login_error });
                }
            } else if (authView === 'signup') {
                if (!storeName.trim()) {
                    setMessage({ type: 'error', text: translations.store_name_required });
                    return;
                }
                if (!validateEmail(email) || !validatePassword(password) || password !== confirmPassword) {
                    if (!validateEmail(email)) setMessage({ type: 'error', text: translations.signup_invalid_email });
                    else if (!validatePassword(password)) setMessage({ type: 'error', text: translations.signup_password_weak });
                    else setMessage({ type: 'error', text: translations.signup_password_mismatch });
                    return;
                }
                if (sellers.some(s => s.email.toLowerCase() === email.toLowerCase().trim())) {
                    setMessage({ type: 'error', text: translations.signup_email_exists });
                    return;
                }

                const newSeller: Seller = {
                    id: `seller-${Date.now()}`,
                    email: email.trim().toLowerCase(),
                    storeName: storeName.trim(),
                    password: password,
                };

                try {
                    localStorage.setItem(LOCAL_STORAGE_KEYS.SELLERS, JSON.stringify([...sellers, newSeller]));
                    onSellerLoginSuccess(newSeller);
                } catch (err) {
                    setMessage({ type: 'error', text: translations.auth_storage_error });
                }
            }
        }
    };


    const renderFormFields = () => {
        const inputClasses = "mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary";
        const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

        if (authView === 'forgot') {
            return (
                 <div>
                    <label htmlFor="email" className={labelClasses}>{translations.email}</label>
                    <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClasses} />
                </div>
            )
        }
        
        const isSignup = authView === 'signup';
        
        return (
            <>
                {isSignup && userType === 'buyer' && (
                    <>
                        <div>
                            <label htmlFor="fullName" className={labelClasses}>{translations.full_name}</label>
                            <input type="text" name="fullName" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required className={inputClasses} />
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className={labelClasses}>{translations.phone_number}</label>
                            <input type="tel" name="phoneNumber" id="phoneNumber" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required className={inputClasses} />
                        </div>
                    </>
                )}

                 {isSignup && userType === 'seller' && (
                    <div>
                        <label htmlFor="storeName" className={labelClasses}>{translations.store_name}</label>
                        <input type="text" name="storeName" id="storeName" value={storeName} onChange={e => setStoreName(e.target.value)} required className={inputClasses} />
                    </div>
                 )}

                <div>
                    <label htmlFor="email" className={labelClasses}>{translations.email}</label>
                    <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="password" className={labelClasses}>{translations.password}</label>
                    <input type="password" name="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className={inputClasses} />
                     {authView === 'login' && (
                         <div className="text-right mt-2">
                            <button type="button" onClick={() => switchAuthView('forgot')} className="text-sm font-medium text-primary hover:underline dark:text-blue-400">
                                {translations.forgot_password}
                            </button>
                        </div>
                    )}
                </div>
                 {isSignup && (
                    <div>
                        <label htmlFor="confirmPassword" className={labelClasses}>{translations.confirm_password}</label>
                        <input type="password" name="confirmPassword" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={inputClasses} />
                    </div>
                )}
            </>
        )
    }

    const UserTypeToggle = () => (
        <div className="flex bg-lightgray dark:bg-gray-900 p-1 rounded-full mb-6">
            <button
                type="button"
                onClick={() => handleUserTypeToggle('buyer')}
                className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${userType === 'buyer' ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
            >
                {translations.buyer}
            </button>
            <button
                type="button"
                onClick={() => handleUserTypeToggle('seller')}
                className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${userType === 'seller' ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
            >
                {translations.seller}
            </button>
        </div>
    );

    return (
        <main className="container mx-auto px-4 py-12 flex justify-center items-center">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                {authView === 'forgot' ? (
                     <>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">{translations.reset_password}</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">{translations.reset_password_prompt}</p>
                    </>
                ) : (
                    <>
                        <UserTypeToggle />
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
                           {userType === 'buyer' ? 'Buyer' : 'Seller'} {authView === 'login' ? translations.login : translations.signup}
                        </h2>
                    </>
                )}
               
                <form onSubmit={handleSubmit} className="space-y-6">
                    {renderFormFields()}
                    {message && <p className={`text-sm text-center ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{message.text}</p>}
                    <button type="submit" disabled={message?.type === 'success' && authView === 'forgot'} className="w-full bg-primary text-white py-3 px-4 rounded-md font-semibold hover:bg-secondary transition-colors disabled:bg-gray-400">
                        {authView === 'login' ? translations.login : authView === 'signup' ? translations.signup : translations.send_reset_link}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    {authView === 'forgot' ? (
                        <button onClick={() => switchAuthView('login')} className="font-medium text-primary hover:underline dark:text-blue-400">
                            {translations.back_to_login}
                        </button>
                    ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {authView === 'login' ? translations.signup_prompt : translations.login_prompt}{' '}
                            <button onClick={() => switchAuthView(authView === 'login' ? 'signup' : 'login')} className="font-medium text-primary hover:underline dark:text-blue-400">
                                {authView === 'login' ? translations.signup : translations.login}
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
};