import React, { useContext } from 'react';
import { AppContext } from '../../App';

export const TermsConditions: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { translations } = context;

    return (
        <main className="container mx-auto px-4 py-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b dark:border-gray-700 pb-4">{translations.terms_conditions}</h1>
                <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using the Innovative Gadget website (the "Service") operated by Innovative Gadget ("us", "we", or "our").</p>
                    <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>

                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 pt-4">Accounts</h2>
                    <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                    
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 pt-4">Purchases</h2>
                    <p>If you wish to purchase any product or service made available through the Service ("Purchase"), you may be asked to supply certain information relevant to your Purchase including, without limitation, your name, phone number, and delivery address.</p>
                    
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 pt-4">Content</h2>
                    <p>Our Service allows sellers to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.</p>

                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 pt-4">Changes</h2>
                    <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.</p>
                    
                     <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 pt-4">Contact Us</h2>
                    <p>If you have any questions about these Terms, please contact us through our Help Center.</p>
                </div>
            </div>
        </main>
    );
};