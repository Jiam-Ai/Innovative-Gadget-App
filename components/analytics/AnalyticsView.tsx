import React, { useState, useMemo, useContext } from 'react';
import { AppContext } from '../../App';
import type { Order, Product } from '../../types';
import { LineChart } from './LineChart';

// Component for displaying individual stats
const StatCard: React.FC<{ title: string; value: string; note?: string; icon: React.ReactNode }> = ({ title, value, note, icon }) => (
    <div className="bg-lightgray dark:bg-gray-700/50 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
            <div className="bg-primary/20 text-primary dark:text-blue-300 p-3 rounded-full">{icon}</div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
            </div>
        </div>
        {note && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{note}</p>}
    </div>
);

// Main Analytics View
export const AnalyticsView: React.FC<{ sellerProducts: Product[], sellerOrders: Order[] }> = ({ sellerProducts, sellerOrders }) => {
    const context = useContext(AppContext);
    const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | 'all'>('30d');
    
    if (!context) return null;
    const { translations } = context;

    const filteredData = useMemo(() => {
        const now = new Date();
        const cutoffDate = new Date();
        if (timePeriod === '7d') {
            cutoffDate.setDate(now.getDate() - 7);
        } else if (timePeriod === '30d') {
            cutoffDate.setDate(now.getDate() - 30);
        }

        const filteredOrders = timePeriod === 'all'
            ? sellerOrders
            : sellerOrders.filter(order => new Date(order.date) >= cutoffDate);
        
        const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
        const unitsSold = filteredOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        
        const allReviews = sellerProducts.flatMap(p => p.reviews || []);
        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = allReviews.length > 0 ? (totalRating / allReviews.length) : 0;

        // Prepare data for the chart
        const salesByDay: { [key: string]: number } = {};
        filteredOrders.forEach(order => {
            const date = new Date(order.date).toISOString().split('T')[0];
            salesByDay[date] = (salesByDay[date] || 0) + order.total;
        });

        const chartData = Object.entries(salesByDay)
            .map(([date, value]) => ({ date, value }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
            totalSales,
            unitsSold,
            avgRating,
            totalReviews: allReviews.length,
            chartData
        };
    }, [sellerOrders, sellerProducts, timePeriod]);

    const timePeriodOptions = [
        { id: '7d', label: 'Last 7 Days' },
        { id: '30d', label: 'Last 30 Days' },
        { id: 'all', label: 'All Time' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Store Analytics</h3>
                 <div className="flex bg-lightgray dark:bg-gray-900 p-1 rounded-full">
                     {timePeriodOptions.map(option => (
                         <button
                            key={option.id}
                            onClick={() => setTimePeriod(option.id as '7d' | '30d' | 'all')}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                                timePeriod === option.id
                                    ? 'bg-primary text-white shadow'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700'
                            }`}
                         >
                            {option.label}
                         </button>
                     ))}
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <StatCard 
                    title="Total Sales"
                    value={`SLL ${new Intl.NumberFormat('en-US').format(filteredData.totalSales)}`}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />
                 <StatCard 
                    title="Units Sold"
                    value={String(filteredData.unitsSold)}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                />
                 <StatCard 
                    title="Avg. Rating"
                    value={filteredData.totalReviews > 0 ? `${filteredData.avgRating.toFixed(1)} / 5.0` : 'N/A'}
                    note={filteredData.totalReviews > 0 ? `From ${filteredData.totalReviews} reviews` : '(No reviews yet)'}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
                />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Sales Over Time</h4>
                {filteredData.chartData.length > 1 ? (
                    <LineChart data={filteredData.chartData} />
                ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p>Not enough data to display a chart for this period.</p>
                        <p className="text-sm">You need at least two days with sales.</p>
                    </div>
                )}
            </div>
        </div>
    )
};
