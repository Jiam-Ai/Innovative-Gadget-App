import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../App';
import { LOCAL_STORAGE_KEYS } from '../../constants';
import type { Order } from '../../types';


// --- Mock API Simulation ---

const fetchTrackingInfo = (orderId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const ordersJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
        const allOrders: Order[] = ordersJSON ? JSON.parse(ordersJSON) : [];
        const foundOrder = allOrders.find(o => o.id.trim().toLowerCase() === orderId.trim().toLowerCase());

        if (!foundOrder) {
          reject(new Error('Order not found'));
          return;
        }
        
        const history = [];
        const orderDate = new Date(foundOrder.date);
        let currentStatus = 'Order Placed';
        
        // Build history based on the deterministic order status
        history.push({ status: 'Order Placed', time: orderDate });

        const confirmedDate = new Date(orderDate.getTime() + 5 * 60 * 1000); // +5 min
        history.push({ status: 'Order Confirmed', time: confirmedDate });
        currentStatus = 'Order Confirmed';

        if (foundOrder.status === 'Shipped' || foundOrder.status === 'Delivered' || foundOrder.status === 'Completed') {
            const shippedDate = new Date(confirmedDate.getTime() + (2 + Math.random()) * 60 * 60 * 1000); // +2-3 hours
            history.push({ status: 'Shipped from Vendor', time: shippedDate });
            currentStatus = 'Shipped from Vendor';
        }

        if (foundOrder.status === 'Delivered' || foundOrder.status === 'Completed') {
           const deliveredDate = new Date(orderDate.getTime() + (24 + Math.random() * 8) * 60 * 60 * 1000); // +24-32 hours after order
           history.push({ status: 'Out for Delivery', time: new Date(deliveredDate.getTime() - 2 * 60 * 60 * 1000) }); // 2 hours before
           history.push({ status: 'Delivered', time: deliveredDate });
           currentStatus = 'Delivered';
        }
        
        if (foundOrder.status === 'Completed') {
           const completedDate = new Date(orderDate.getTime() + (30 + Math.random() * 8) * 60 * 60 * 1000); // Sometime after delivery
           history.push({ status: 'Receipt Confirmed by Buyer', time: completedDate });
           currentStatus = 'Completed';
        }

        resolve({
          id: foundOrder.id,
          status: currentStatus,
          history: history.reverse(), // Reverse to show most recent first
        });

      } catch (e) {
        console.error("Tracking info error:", e);
        reject(e);
      }
    }, 1200); // Simulate network delay
  });
};

const formatTrackingDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
};


interface TrackingStatusProps {
    status: string;
    time: string;
    isCurrent: boolean;
    isLast: boolean;
}

const TrackingStatus: React.FC<TrackingStatusProps> = ({ status, time, isCurrent, isLast }) => (
    <div className="relative flex space-x-4">
        {/* The line */}
        {!isLast && <div className="absolute left-[9px] top-5 h-full w-0.5 bg-gray-300 dark:bg-gray-600"></div>}
        
        {/* The dot */}
        <div className={`z-10 w-5 h-5 rounded-full border-2 flex-shrink-0 ${isCurrent ? 'bg-primary border-primary ring-4 ring-primary/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}></div>
        
        {/* The text content */}
        <div className="pb-8">
            <p className={`font-semibold ${isCurrent ? 'text-primary dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>{status}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{time}</p>
        </div>
    </div>
);

const ProgressBar: React.FC<{ currentStatus: string }> = ({ currentStatus }) => {
    const steps = ['Order Confirmed', 'Shipped', 'Delivered', 'Completed'];
    const currentStepIndex = steps.indexOf(currentStatus);
    const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

    return (
        <div className="w-full px-2 sm:px-4">
            <div className="flex items-center">
                {steps.map((step, index) => (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                index <= activeIndex ? 'bg-primary border-primary' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500'
                            }`}>
                                {index <= activeIndex && (
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <p className={`mt-2 text-xs text-center ${
                                index <= activeIndex ? 'text-gray-800 dark:text-gray-200 font-semibold' : 'text-gray-400 dark:text-gray-500'
                            }`}>{step.replace(' from Vendor', '')}</p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-1 transition-colors duration-500 ${
                                index < activeIndex ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-500'
                            }`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};


interface TrackOrderProps {
    prefilledOrderId?: string | null;
}

export const TrackOrder: React.FC<TrackOrderProps> = ({ prefilledOrderId }) => {
    const context = useContext(AppContext);
    const [orderId, setOrderId] = useState('');
    const [trackingResult, setTrackingResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    
    if (!context) return null;
    const { translations } = context;

    const performTracking = async (idToTrack: string) => {
        if (!idToTrack) return;
        setError('');
        setTrackingResult(null);

        if (!idToTrack.trim().toUpperCase().startsWith('SK-')) {
            setError(translations.invalid_order_id_format);
            return;
        }

        setIsLoading(true);
        try {
            const result = await fetchTrackingInfo(idToTrack.trim());
            setTrackingResult(result);
        } catch (err) {
            setError(translations.order_not_found_error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (prefilledOrderId) {
            setOrderId(prefilledOrderId);
            performTracking(prefilledOrderId);
        }
    }, [prefilledOrderId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        performTracking(orderId);
    };
    
    const handleCopyOrderId = () => {
        if (trackingResult?.id) {
            navigator.clipboard.writeText(trackingResult.id);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        }
    };

    return (
        <main className="container mx-auto px-4 py-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">{translations.track_your_order}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center">Enter your Order ID to see the status of your delivery.</p>
                
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
                    <input 
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder={translations.track_order_placeholder}
                        className="flex-grow p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Order ID"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-primary text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                         {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : translations.track_order_button}
                    </button>
                </form>

                {error && <p className="text-red-500 text-center">{error}</p>}

                {trackingResult && (
                    <div className="mt-8 border-t dark:border-gray-700 pt-6 animate-fade-in">
                        <div className="flex items-center gap-2">
                             <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Tracking for Order: <span className="text-primary dark:text-blue-400">{trackingResult.id}</span></h2>
                             <button onClick={handleCopyOrderId} className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors" title="Copy Order ID">
                                {isCopied ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <div className="my-8">
                            <ProgressBar currentStatus={trackingResult.status} />
                        </div>
                        
                        <div className="mt-6 border-t dark:border-gray-600 pt-6">
                            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Detailed History</h3>
                            {trackingResult.history.map((item: any, index: number) => (
                                <TrackingStatus 
                                    key={index} 
                                    status={item.status} 
                                    time={formatTrackingDate(item.time)} 
                                    isCurrent={index === 0}
                                    isLast={index === trackingResult.history.length - 1}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};
