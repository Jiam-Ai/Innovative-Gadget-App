import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { generateVendorStory } from '../services/geminiService';

interface VendorSpotlightModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const VendorSpotlightModal: React.FC<VendorSpotlightModalProps> = ({ isOpen, onClose }) => {
    const context = useContext(AppContext);
    const [inputs, setInputs] = useState(context?.currentSeller?.storyInputs || '');
    const [generatedStory, setGeneratedStory] = useState(context?.currentSeller?.story || '');
    const [isLoading, setIsLoading] = useState(false);
    
    if (!context || !context.currentSeller) return null;
    const { translations, currentSeller, updateSellerStory } = context;

    const handleGenerate = async () => {
        if (!inputs.trim()) return;
        setIsLoading(true);
        const story = await generateVendorStory(currentSeller.storeName, inputs);
        setGeneratedStory(story);
        setIsLoading(false);
    };

    const handleSave = () => {
        updateSellerStory(generatedStory, inputs);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4 p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{translations.tell_us_your_story}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{translations.story_prompt}</p>

                <textarea
                    value={inputs}
                    onChange={(e) => setInputs(e.target.value)}
                    rows={5}
                    placeholder="e.g., - Started in my grandmother's kitchen..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full mt-4 bg-primary text-white py-2.5 rounded-md font-semibold hover:bg-secondary transition-colors disabled:bg-gray-400 flex items-center justify-center"
                >
                    {isLoading ? translations.generating : translations.generate_story}
                </button>
                
                {generatedStory && (
                    <div className="mt-6 border-t dark:border-gray-700 pt-4">
                        <h3 className="font-bold text-lg dark:text-gray-200">AI Generated Story Preview:</h3>
                        <p className="mt-2 p-4 bg-lightgray dark:bg-gray-700/50 rounded-md text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{generatedStory}</p>
                    </div>
                )}
                
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="text-gray-600 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">{translations.close}</button>
                    <button onClick={handleSave} disabled={!generatedStory} className="bg-secondary text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400">Save Story</button>
                </div>
            </div>
        </div>
    );
};