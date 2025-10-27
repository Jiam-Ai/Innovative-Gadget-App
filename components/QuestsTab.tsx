import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { generateNewQuests } from '../services/geminiService';
import type { BuyerQuest } from '../types';

export const QuestsTab: React.FC = () => {
    const context = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(false);
    
    if (!context || !context.currentBuyer) return null;
    
    const { translations, currentBuyer, updateBuyerProfile } = context;

    const { loyalty, quests = [] } = currentBuyer;

    const handleGetNewQuests = async () => {
        setIsLoading(true);
        const newQuests = await generateNewQuests(currentBuyer);
        if (newQuests.length > 0) {
            updateBuyerProfile({ quests: [...quests, ...newQuests] });
        }
        setIsLoading(false);
    };

    const tierColors = {
        Bronze: 'bg-orange-400',
        Silver: 'bg-gray-400',
        Gold: 'bg-yellow-500'
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Loyalty Info */}
            <div className="md:col-span-1 space-y-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{translations.loyalty_program_title}</h3>
                    <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6 rounded-lg text-center shadow-lg">
                        <p className="text-sm uppercase tracking-wider">{translations.points_balance}</p>
                        <p className="text-5xl font-bold my-2">{loyalty?.points.toLocaleString() || 0}</p>
                        <p className="text-sm uppercase tracking-wider">{translations.your_tier}: <span className={`font-bold px-2 py-0.5 rounded-full text-white text-xs ${tierColors[loyalty?.tier || 'Bronze']}`}>{loyalty?.tier || 'Bronze'}</span></p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                    <h4 className="font-semibold">{translations.how_to_earn}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{translations.earn_points_desc}</p>
                </div>
            </div>

            {/* Right Column: Quests */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                 <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{translations.your_quests}</h3>
                 <div className="space-y-3">
                     {quests.length > 0 ? quests.map(quest => (
                         <div key={quest.id} className={`p-4 rounded-lg flex items-center justify-between ${quest.isCompleted ? 'bg-green-100 dark:bg-green-900/50' : 'bg-lightgray dark:bg-gray-700/50'}`}>
                             <div>
                                 <p className={`font-semibold ${quest.isCompleted ? 'text-green-800 dark:text-green-200' : 'text-gray-800 dark:text-gray-100'}`}>{quest.title}</p>
                                 <p className="text-sm text-gray-500 dark:text-gray-400">{quest.description}</p>
                             </div>
                             <div className="text-right">
                                {quest.isCompleted ? (
                                    <span className="font-bold text-green-600 dark:text-green-400">{translations.completed}</span>
                                ) : (
                                    <span className="font-bold text-primary dark:text-blue-400">+{quest.points} pts</span>
                                )}
                             </div>
                         </div>
                     )) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No active quests. Get some new ones!</p>
                     )}
                 </div>
                 <button 
                    onClick={handleGetNewQuests}
                    disabled={isLoading}
                    className="w-full mt-6 bg-secondary text-white py-2.5 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
                 >
                    {isLoading ? translations.generating : translations.get_new_quests}
                 </button>
            </div>
        </div>
    );
};