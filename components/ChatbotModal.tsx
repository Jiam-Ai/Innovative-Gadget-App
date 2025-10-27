import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import type { ChatMessage } from '../types';

interface ChatbotModalProps {
    isOpen: boolean;
    onClose: () => void;
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isTyping: boolean;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 p-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
    </div>
);

const formatBotMessage = (text: string) => {
    // Removes asterisks used for markdown bolding/italics
    return text.replace(/\*/g, '');
};

export const ChatbotModal: React.FC<ChatbotModalProps> = ({ isOpen, onClose, messages, onSendMessage, isTyping }) => {
    const context = useContext(AppContext);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    if (!context) return null;
    const { translations } = context;

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        onSendMessage(suggestion);
    };

    const suggestedPrompts = [
        "What are the best headphones?",
        "Compare top mobile phones",
        "How do I return an item?",
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-end sm:items-center" aria-modal="true" role="dialog" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md m-0 sm:m-4 flex flex-col transform transition-all max-h-[80vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-primary text-white rounded-t-2xl sm:rounded-t-2xl">
                    <h2 className="text-xl font-bold">{translations.chatbot_title}</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200" aria-label="Close chat">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-lightgray dark:bg-gray-900">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">A</div>}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>
                                    {msg.sender === 'bot' ? formatBotMessage(msg.text) : msg.text}
                                </p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex items-end gap-2 justify-start">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">A</div>
                            <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-white dark:bg-gray-700 text-gray-800 rounded-bl-none">
                                <TypingIndicator />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                 {/* Suggested Prompts */}
                {messages.length <= 2 && !isTyping && (
                    <div className="p-2 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-wrap gap-2 justify-center">
                        {suggestedPrompts.map(prompt => (
                            <button key={prompt} onClick={() => handleSuggestionClick(prompt)} className="text-xs text-primary dark:text-blue-400 bg-blue-100 dark:bg-primary/20 px-3 py-1.5 rounded-full hover:bg-blue-200 dark:hover:bg-primary/30 transition-colors">
                                {prompt}
                            </button>
                        ))}
                    </div>
                )}


                {/* Input Form */}
                <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl sm:rounded-b-2xl">
                    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={translations.chatbot_placeholder}
                            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label="Your message"
                        />
                        <button
                            type="submit"
                            className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-secondary transition-colors disabled:bg-gray-400"
                            aria-label="Send message"
                            disabled={isTyping || !input.trim()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};