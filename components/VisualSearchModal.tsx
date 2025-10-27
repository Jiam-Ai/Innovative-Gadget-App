import React, { useState, useContext, useRef } from 'react';
import { AppContext } from '../App';
import type { Product } from '../types';
import { findSimilarProductsByImage } from '../services/geminiService';

interface VisualSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    allProducts: Product[];
    onResults: (results: Product[]) => void;
}

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export const VisualSearchModal: React.FC<VisualSearchModalProps> = ({ isOpen, onClose, allProducts, onResults }) => {
    const context = useContext(AppContext);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!context) return null;
    const { translations } = context;

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImagePreview(URL.createObjectURL(file));
        setError('');
        setIsLoading(true);

        try {
            const imagePart = await fileToGenerativePart(file);
            const resultIds = await findSimilarProductsByImage(imagePart, allProducts);

            if (resultIds.length > 0) {
                const resultProducts = allProducts.filter(p => resultIds.includes(p.id));
                onResults(resultProducts);
                onClose();
            } else {
                setError(translations.no_similar_products);
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred during search.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClose = () => {
        setImagePreview(null);
        setError('');
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={handleClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 p-6 text-center" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{translations.visual_search_title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{translations.upload_image_prompt}</p>
                
                <div className="w-full h-48 border-2 border-dashed dark:border-gray-600 rounded-lg flex items-center justify-center mb-4 bg-gray-50 dark:bg-gray-700/50">
                    {isLoading ? (
                         <div className="flex flex-col items-center">
                             <svg className="animate-spin h-8 w-8 text-primary mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             <p className="text-sm text-gray-500">{translations.finding_similar_products}</p>
                         </div>
                    ) : imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="max-w-full max-h-full rounded-md object-contain" />
                    ) : (
                        <p className="text-gray-400">Image preview will appear here</p>
                    )}
                </div>

                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" id="visual-search-input" className="hidden" />
                <label htmlFor="visual-search-input" className="w-full inline-block bg-primary text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-800 transition-colors cursor-pointer">
                    {translations.upload_image}
                </label>

                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            </div>
        </div>
    );
};
