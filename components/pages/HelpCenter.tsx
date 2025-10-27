import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';
import { categorizeSupportTicket } from '../../services/geminiService';

interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen, onClick }) => {
    return (
        <div className="border-b dark:border-gray-700">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left py-4 px-2 hover:bg-lightgray dark:hover:bg-gray-700 transition-colors"
                aria-expanded={isOpen}
            >
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-primary dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className="p-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
};

const ContactSupportForm: React.FC = () => {
    const context = useContext(AppContext);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ category: string; sentiment: string } | null>(null);
    const [error, setError] = useState('');

    if (!context) return null;
    const { translations } = context;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        
        setIsLoading(true);
        setResult(null);
        setError('');

        try {
            const analysis = await categorizeSupportTicket(message);
            if (analysis) {
                setResult(analysis);
                setMessage('');
            } else {
                setError('Failed to submit ticket. Please try again.');
            }
        } catch (err) {
            setError('An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="mt-12 border-t dark:border-gray-700 pt-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">{translations.contact_support}</h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder={translations.your_message}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-800 transition-colors disabled:bg-gray-400"
                >
                    {isLoading ? translations.generating : translations.submit_ticket}
                </button>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {result && (
                    <div className="p-4 bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-md text-center">
                        <p className="font-semibold text-green-800 dark:text-green-200">{translations.ticket_submitted_success}</p>
                        <p className="text-sm text-green-700 dark:text-green-300">We've categorized your issue as: <span className="font-bold">{result.category}</span></p>
                    </div>
                )}
            </form>
        </div>
    );
};


export const HelpCenter: React.FC = () => {
    const context = useContext(AppContext);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    if (!context) return null;
    const { translations } = context;

    const faqs = [
        {
            q: "How do I place an order?",
            a: "Placing an order is easy! Simply browse our products, add items to your cart, and click 'Proceed to Checkout'. Follow the on-screen instructions to enter your delivery details and choose a payment method."
        },
        {
            q: "What payment methods do you accept?",
            a: "We accept Cash on Delivery, Orange Money, and Africell Money. You can choose your preferred method during the checkout process."
        },
        {
            q: "How can I track my order?",
            a: "You can track your order status on our 'Track Your Order' page, which is linked in the footer. You will need the Order ID that was provided to you after checkout."
        },
        {
            q: "What is your return policy?",
            a: "We offer a 7-day return policy for most items. If you are not satisfied with your purchase, please visit our 'Returns & Refunds' page for detailed instructions on how to initiate a return."
        },
        {
            q: "How do I become a seller on SaloneKart?",
            a: "We are always excited to welcome new sellers! Click on 'Seller Login' in the top right corner, then choose 'Sign Up' to create your store. You can also visit our 'Vendor Hub' for more resources."
        },
    ];

    const handleItemClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <main className="container mx-auto px-4 py-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">{translations.help_center}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center">We're here to help! Find answers to your questions below.</p>
                
                <div className="space-y-2">
                    {faqs.map((faq, index) => (
                        <AccordionItem 
                            key={index}
                            title={faq.q}
                            isOpen={openIndex === index}
                            onClick={() => handleItemClick(index)}
                        >
                           <p>{faq.a}</p>
                        </AccordionItem>
                    ))}
                </div>

                <ContactSupportForm />
            </div>
        </main>
    );
};