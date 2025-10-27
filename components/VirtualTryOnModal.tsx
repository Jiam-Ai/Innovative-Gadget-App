import React, { useState, useContext, useRef } from 'react';
import { AppContext } from '../App';
import type { Product } from '../types';
import { generateVirtualTryOnImage } from '../services/geminiService';

interface VirtualTryOnModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({ isOpen, onClose, product }) => {
    const context = useContext(AppContext);
    const [userImage, setUserImage] = useState<File | null>(null);
    const [userImagePreview, setUserImagePreview] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!context) return null;
    const { translations } = context;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUserImage(file);
        setUserImagePreview(URL.createObjectURL(file));
        setGeneratedImage(null);
        setError('');
    };

    const handleGenerate = async () => {
        if (!userImage || !product) return;

        setIsLoading(true);
        setError('');
        setGeneratedImage(null);
        
        try {
            const resultBase64 = await generateVirtualTryOnImage(userImage, product);
            if (resultBase64) {
                setGeneratedImage(`data:image/jpeg;base64,${resultBase64}`);
            } else {
                setError('Could not generate a preview. Please try another photo.');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClose = () => {
        setUserImage(null);
        setUserImagePreview(null);
        setGeneratedImage(null);
        setError('');
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onClose();
    }

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={handleClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4 p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{translations.virtual_try_on} for <span className="text-primary">{product.name}</span></h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{translations.try_on_prompt}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="w-full h-64 border-2 border-dashed dark:border-gray-600 rounded-lg flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-gray-700/50">
                        {userImagePreview ? (
                            <img src={userImagePreview} alt="Your photo" className="max-w-full max-h-full rounded-md object-contain" />
                        ) : (
                            <p className="text-gray-400 text-center">Upload your photo here</p>
                        )}
                         <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" id="tryon-input" className="hidden" />
                         <label htmlFor="tryon-input" className="mt-2 text-sm font-semibold text-primary dark:text-blue-400 hover:underline cursor-pointer">Choose file</label>
                    </div>

                    <div className="w-full h-64 border-2 border-dashed dark:border-gray-600 rounded-lg flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-700/50 relative">
                        {isLoading ? (
                            <div className="flex flex-col items-center">
                               <svg className="animate-spin h-8 w-8 text-primary mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <p className="text-sm text-gray-500">{translations.generating_preview}</p>
                            </div>
                        ) : generatedImage ? (
                            <img src={generatedImage} alt="Virtual try-on preview" className="max-w-full max-h-full rounded-md object-contain" />
                        ) : (
                           <p className="text-gray-400 text-center">Your preview will appear here</p>
                        )}
                    </div>
                </div>

                <button 
                    onClick={handleGenerate} 
                    disabled={!userImage || isLoading}
                    className="w-full mt-6 bg-secondary text-white py-3 px-4 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {translations.generate_description}
                </button>
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
            </div>
        </div>
    );
};