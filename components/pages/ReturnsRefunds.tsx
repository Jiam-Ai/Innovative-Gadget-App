
import React, { useContext } from 'react';
import { AppContext } from '../../App';

export const ReturnsRefunds: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { translations } = context;

    return (
        <main className="container mx-auto px-4 py-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b dark:border-gray-700 pb-4">{translations.returns_refunds}</h1>
                <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 pt-4">Our Commitment</h2>
                    <p>
                        We want you to be completely satisfied with your purchase on SaloneKart. If you're not happy with your order for any reason, we are here to help.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 pt-4">7-Day Return Policy</h2>
                    <p>
                        You have 7 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 pt-4">How to Initiate a Return</h2>
                    <p>
                        To start the return process, please follow these steps:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 pl-4">
                        <li>Contact our Customer Service team through the <button onClick={() => context.handleNavigation('help-center')} className="text-primary dark:text-blue-400 font-semibold hover:underline">Help Center</button> with your order number and the reason for the return.</li>
                        <li>Our team will provide you with instructions on how to return the product.</li>
                        <li>Once we receive your item, we will inspect it and notify you of the status of your refund.</li>
                    </ol>

                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 pt-4">Refunds</h2>
                    <p>
                        If your return is approved, we will initiate a refund to your original method of payment (e.g., Mobile Money) or provide you with store credit, depending on the situation. Please note that delivery fees are non-refundable.
                    </p>
                    
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 pt-4">Questions?</h2>
                    <p>
                       If you have any questions on how to return your item to us, contact us via the help center or our social media pages.
                    </p>
                </div>
            </div>
        </main>
    );
};