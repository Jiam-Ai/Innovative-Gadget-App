import React, { useContext } from 'react';
import { AppContext } from '../../App';

const StoryCard: React.FC<{ name: string; storeName: string; quote: string; image: string }> = ({ name, storeName, quote, image }) => (
    <div className="bg-lightgray dark:bg-gray-700/50 rounded-lg p-6 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
        <img src={image} alt={name} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg mb-4"/>
        <h3 className="text-xl font-bold text-primary dark:text-blue-400">{name}</h3>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">{storeName}</p>
        <p className="text-gray-600 dark:text-gray-300 italic">"{quote}"</p>
    </div>
);

export const SuccessStories: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { translations } = context;

    return (
        <main className="container mx-auto px-4 py-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">{translations.success_stories}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 text-center">Hear from some of the amazing sellers who are growing their business with Innovative Gadget.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <StoryCard 
                        name="Fatu Kamara"
                        storeName="Freetown Fashion"
                        quote="Innovative Gadget has been a game-changer for my clothing business. I've reached customers in parts of the country I never could before. The platform is easy to use and the support is fantastic!"
                        image="https://picsum.photos/seed/woman1/200/200"
                    />
                    <StoryCard 
                        name="Mohamed Bah"
                        storeName="TechSavvy SL"
                        quote="As an electronics seller, getting my products in front of the right people was always a challenge. With Innovative Gadget, my sales have doubled and my store has become a trusted name for gadgets."
                        image="https://picsum.photos/seed/man1/200/200"
                    />
                     <StoryCard 
                        name="Aminata Sillah"
                        storeName="Mama Salone Beauty"
                        quote="I started my beauty business from my home, and now thanks to Innovative Gadget, I ship my natural shea butter lotions all over the country. It's a dream come true!"
                        image="https://picsum.photos/seed/woman2/200/200"
                    />
                     <StoryCard 
                        name="David Cole"
                        storeName="Salone Fresh Mart"
                        quote="The Vendor Hub gave me great tips on how to photograph my grocery products. The improved listings have led to a 50% increase in weekly orders. Highly recommended for any local producer."
                        image="https://picsum.photos/seed/man2/200/200"
                    />
                </div>
                 <div className="mt-12 text-center">
                    <button onClick={() => context.handleNavigation('auth')} className="bg-secondary text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-green-700 transition-colors">
                        Ready to Start Your Own Story?
                    </button>
                </div>
            </div>
        </main>
    );
};