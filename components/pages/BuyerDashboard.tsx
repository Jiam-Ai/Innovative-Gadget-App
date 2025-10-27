import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../../App';
import type { Buyer, Order, OrderStatus } from '../../types';
import { LoyaltyTab } from '../LoyaltyTab';

const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
        case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
        case 'Shipped': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
        case 'Delivered': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
        case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
};

const OrderHistoryTab: React.FC = () => {
    const context = useContext(AppContext);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    if (!context) return null;
    const { translations, orders, currentBuyer, handleNavigation, updateOrderStatus } = context;

    const buyerOrders = useMemo(() => {
        if (!currentBuyer) return [];
        return orders
            .filter(order => order.buyerId === currentBuyer.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, currentBuyer]);

    if (buyerOrders.length === 0) {
        return (
            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <p className="text-gray-500 dark:text-gray-400">{translations.no_orders_yet}</p>
            </div>
        );
    }
    
    const toggleOrder = (orderId: string) => {
        setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
    };

    return (
        <div className="space-y-4">
            {buyerOrders.map(order => {
                const statusKey = `status_${order.status.toLowerCase()}` as keyof typeof translations;
                return (
                <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="w-full p-4 text-left bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div onClick={() => toggleOrder(order.id)} className="flex-grow cursor-pointer pr-4">
                                <p className="font-semibold text-primary dark:text-blue-400">{translations.order_id}: {order.id}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{translations.date}: {new Date(order.date).toLocaleDateString()}</p>
                                <div className="mt-2">
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(order.status)}`}>
                                        {translations[statusKey] || order.status}
                                     </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="font-bold text-lg text-gray-800 dark:text-gray-100">SLL {new Intl.NumberFormat('en-US').format(order.total)}</p>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{order.items.length} item(s)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {expandedOrderId === order.id && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{translations.items_in_order}</h4>
                            <ul className="space-y-2 mb-4">
                                {order.items.map(item => (
                                    <li key={item.cartItemId} className="flex items-center space-x-3 text-sm">
                                        <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 object-cover rounded" />
                                        <div className="flex-grow">
                                            <p className="text-gray-800 dark:text-gray-100 font-semibold">{item.product.name}</p>
                                            <p className="text-gray-500 dark:text-gray-400">Sold by: {item.product.vendor}</p>
                                        </div>
                                        <span className="text-gray-600 dark:text-gray-300">Qty: {item.quantity}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleNavigation('track-order', { orderId: order.id })}
                                    className="text-sm font-semibold bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                >
                                    {translations.track_order}
                                </button>
                                {order.status === 'Delivered' && (
                                    <button
                                        onClick={() => updateOrderStatus(order.id, 'Completed')}
                                        className="text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                    >
                                        {translations.confirm_receipt}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )})}
        </div>
    );
};

const MyProfileTab: React.FC = () => {
    const context = useContext(AppContext);
    
    if (!context || !context.currentBuyer) return null;
    
    const { translations, currentBuyer, updateBuyerProfile } = context;

    const [fullName, setFullName] = useState(currentBuyer.fullName);
    const [email, setEmail] = useState(currentBuyer.email);
    const [phoneNumber, setPhoneNumber] = useState(currentBuyer.phoneNumber);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!fullName || !email || !phoneNumber) {
            setMessage({ type: 'error', text: 'Please fill in all fields.' });
            return;
        }

        const updatedInfo: Partial<Buyer> = {};
        if (fullName !== currentBuyer.fullName) updatedInfo.fullName = fullName;
        if (email !== currentBuyer.email) updatedInfo.email = email;
        if (phoneNumber !== currentBuyer.phoneNumber) updatedInfo.phoneNumber = phoneNumber;

        if (Object.keys(updatedInfo).length > 0) {
            const result = await updateBuyerProfile(updatedInfo);
            if (result.success) {
                setMessage({ type: 'success', text: translations.profile_updated_success });
            } else {
                setMessage({ type: 'error', text: translations[result.error!] || translations.profile_update_error });
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-lg mx-auto">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{translations.my_profile}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations.full_name}</label>
                    <input type="text" name="fullName" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md" />
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations.email}</label>
                    <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md" />
                </div>
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{translations.phone_number}</label>
                    <input type="tel" name="phoneNumber" id="phoneNumber" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md" />
                </div>
                {message && (
                    <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{message.text}</p>
                )}
                <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-800">
                    {translations.update_profile}
                </button>
            </form>
        </div>
    );
};

export const BuyerDashboard: React.FC = () => {
    const context = useContext(AppContext);
    const [activeTab, setActiveTab] = useState('order-history');

    if (!context) return null;
    const { translations } = context;
    
    const tabs = [
        { id: 'order-history', label: translations.order_history },
        { id: 'my-profile', label: translations.my_profile },
        { id: 'my-rewards', label: translations.my_rewards },
    ];
    
    return (
        <main className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">{translations.buyer_dashboard}</h2>
            
            <div role="tablist" aria-label="Buyer dashboard sections" className="flex flex-wrap items-center gap-2 mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        id={`tab-${tab.id}`}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex-1 min-w-[120px] text-center px-4 py-2.5 rounded-md text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${
                            activeTab === tab.id
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-500 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-100'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            
            <div className="mt-6">
                 <div id="panel-order-history" role="tabpanel" tabIndex={0} aria-labelledby="tab-order-history" className="focus:outline-none" hidden={activeTab !== 'order-history'}>
                    <OrderHistoryTab />
                </div>
                <div id="panel-my-profile" role="tabpanel" tabIndex={0} aria-labelledby="tab-my-profile" className="focus:outline-none" hidden={activeTab !== 'my-profile'}>
                    <MyProfileTab />
                </div>
                <div id="panel-my-rewards" role="tabpanel" tabIndex={0} aria-labelledby="tab-my-rewards" className="focus:outline-none" hidden={activeTab !== 'my-rewards'}>
                    <LoyaltyTab />
                </div>
            </div>
        </main>
    );
};