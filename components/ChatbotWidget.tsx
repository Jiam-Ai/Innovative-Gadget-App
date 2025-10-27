import React from 'react';

interface ChatbotWidgetProps {
    onClick: () => void;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform duration-300 ease-in-out transform hover:scale-110"
            aria-label="Open chatbot"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        </button>
    );
};