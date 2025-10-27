import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import type { Product, NegotiationMessage } from '../types';
import { handlePriceNegotiation } from '../services/geminiService';

interface PriceNegotiationModalProps {
    isOpen: boolean;
    product: Product | null;
    onClose: () => void;
}

export const PriceNegotiationModal: React.FC<PriceNegotiationModalProps> = ({ isOpen, product, onClose }) => {
    const context = useContext(AppContext);
    const [messages, setMessages] = useState<NegotiationMessage[]>([]);
    const [input, setInput] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && product) {
            setMessages([{ sender: 'bot', text: context?.translations.negotiation_greeting || "Let's make a deal!" }]);
        } else {
            setMessages([]);
            setInput('');
        }
    }, [isOpen, product, context?.translations.negotiation_greeting]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isBotTyping]);

    if (!context || !product || !isOpen) return null;
    const { translations, addToCart } = context;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isBotTyping) return;

        const userMessage: NegotiationMessage = { sender: 'user', text: input };
        const newHistory = [...messages, userMessage];
        setMessages(newHistory);
        setInput('');
        setIsBotTyping(true);

        try {
            const botResponse = await handlePriceNegotiation(product, newHistory);
            setMessages(prev => [...prev, botResponse]);
            
            if (botResponse.isFinal && botResponse.offer) {
                // Automatically add to cart with negotiated price
                setTimeout(() => {
                     addToCart(product, 1, undefined, undefined, botResponse.offer);
                     onClose();
                }, 2000);
            }
        } catch (error) {
            console.error("Negotiation error:", error);
            const errorMessage: NegotiationMessage = { sender: 'bot', text: "Sorry, I'm having trouble connecting." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsBotTyping(false);
        }
    };
    
    const isNegotiationOver = messages[messages.length - 1]?.isFinal;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-end sm:items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md m-0 sm:m-4 flex flex-col transform transition-all max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center p-4 border-b dark:border-gray-700">
                    <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-md mr-4" />
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{translations.price_negotiation}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{product.name}</p>
                    </div>
                     <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label={translations.close}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-lightgray dark:bg-gray-900">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">🤖</div>}
                            <div className={`max-w-xs p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isBotTyping && <div className="text-sm text-gray-500">...</div>}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                    {isNegotiationOver ? (
                        <div className="text-center p-3 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-800 dark:text-green-200 font-semibold">
                           {translations.offer_accepted} Adding to cart...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={translations.negotiation_placeholder}
                                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={isBotTyping}
                            />
                            <button
                                type="submit"
                                className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-secondary transition-colors disabled:bg-gray-400"
                                disabled={isBotTyping || !input.trim()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};