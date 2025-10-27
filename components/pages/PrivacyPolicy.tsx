import React, { useContext } from 'react';
import { AppContext } from '../../App';

export const PrivacyPolicy: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { translations } = context;

    return (
        <main className="container mx-auto px-4 py-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b dark:border-gray-700 pb-4">{translations.privacy_policy}</h1>
                <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <p>
                        Innovative Gadget ("us", "we", or "our") operates the Innovative Gadget website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 pt-4">Information Collection and Use</h2>
                    <p>
                        We collect several different types of information for various purposes to provide and improve our Service to you. This includes information you provide when you register, place an order, or contact customer service.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 pt-4">Use of Data</h2>
                    <p>
                        Innovative Gadget uses the collected data for various purposes:
                    </p>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>To provide and maintain our Service</li>
                        <li>To notify you about changes to our Service</li>
                        <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                        <li>To provide customer support</li>
                        <li>To gather analysis or valuable information so that we can improve our Service</li>
                        <li>To monitor the usage of our Service</li>
                        <li>To detect, prevent and address technical issues</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 pt-4">Security of Data</h2>
                    <p>
                        The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                    </p>

                     <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 pt-4">Changes to This Privacy Policy</h2>
                    <p>
                       We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
                    </p>
                </div>
            </div>
        </main>
    );
};