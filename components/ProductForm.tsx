import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { CATEGORIES } from '../constants';
import type { Product, Seller, Variant, VariantOption } from '../types';

interface ProductFormProps {
    currentSeller: Seller;
    productToEdit?: Product | null;
    onFormSubmit: (product: Product) => void;
    onCancel?: () => void;
}

const initialFormState = {
    name: '',
    description: '',
    price: '',
    category: CATEGORIES.find(c => c !== 'All') || 'Electronics',
    images: [] as string[],
    variants: [] as Variant[],
};

export const ProductForm: React.FC<ProductFormProps> = ({ currentSeller, productToEdit, onFormSubmit, onCancel }) => {
    const context = useContext(AppContext);
    const [formData, setFormData] = useState(initialFormState);
    const [formError, setFormError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditMode = !!productToEdit;

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name,
                description: productToEdit.description,
                price: String(productToEdit.price),
                category: productToEdit.category,
                images: productToEdit.images,
                variants: productToEdit.variants || [],
            });
        } else {
            setFormData(initialFormState);
        }
    }, [productToEdit]);

    if (!context) return null;
    const { translations } = context;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    // --- Variant Handlers ---
    const addVariantType = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { type: '', options: [{ name: '', price: 0, stock: 0 }] }]
        }));
    };

    const handleVariantTypeChange = (index: number, value: string) => {
        const newVariants = [...formData.variants];
        newVariants[index].type = value;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const addVariantOption = (variantIndex: number) => {
        const newVariants = [...formData.variants];
        newVariants[variantIndex].options.push({ name: '', price: 0, stock: 0 });
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const handleVariantOptionChange = (variantIndex: number, optionIndex: number, field: keyof VariantOption, value: string | number) => {
        const newVariants = [...formData.variants];
        (newVariants[variantIndex].options[optionIndex] as any)[field] = value;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const removeVariantOption = (variantIndex: number, optionIndex: number) => {
        const newVariants = [...formData.variants];
        newVariants[variantIndex].options.splice(optionIndex, 1);
        if (newVariants[variantIndex].options.length === 0) {
            newVariants.splice(variantIndex, 1);
        }
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };
    // --- End Variant Handlers ---


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (formData.images.length + files.length > 5) {
                setFormError(translations.max_images_error);
                return;
            }
            const imagePromises = files.map((file) => new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file as Blob);
            }));
            Promise.all(imagePromises).then(base64Images => {
                setFormData(prev => ({ ...prev, images: [...prev.images, ...base64Images] }));
                setFormError('');
            });
        }
    };

    const removeImage = (indexToRemove: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, index) => index !== indexToRemove) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const priceNumber = Number(formData.price);
        if (!formData.name || !formData.description || !priceNumber || priceNumber <= 0 || !formData.category || formData.images.length === 0) {
            setFormError(translations.fill_all_fields);
            return;
        }
        setFormError('');

        const newProductData = {
            name: formData.name,
            description: formData.description,
            price: priceNumber,
            category: formData.category,
            images: formData.images,
            vendor: currentSeller.storeName,
            variants: formData.variants,
        };
        
        const finalProduct: Product = isEditMode
            ? { ...productToEdit, ...newProductData }
            : {
                ...newProductData,
                id: Date.now(),
                rating: 0,
                reviewsCount: 0,
                reviews: [],
                sellerId: currentSeller.id,
            };

        onFormSubmit(finalProduct);
        
        // Reset form state for next use
        setFormData(initialFormState);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const availableCategories = CATEGORIES.filter(c => c !== 'All');
    const inputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md";

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{isEditMode ? 'Edit Product' : translations.add_new_product}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="name" placeholder={translations.product_name} value={formData.name} onChange={handleInputChange} required className={inputClasses} />
                <textarea name="description" rows={3} placeholder={translations.product_description} value={formData.description} onChange={handleInputChange} required className={inputClasses}></textarea>
                <input type="number" name="price" placeholder={`${translations.product_price} (Base)`} value={formData.price} onChange={handleInputChange} required min="1" className={inputClasses} />
                <select name="category" value={formData.category} onChange={handleInputChange} className={inputClasses}>
                    {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                
                {/* --- Variants UI --- */}
                <div className="space-y-4 rounded-md border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-200">Product Variants (e.g., Size, Color)</h4>
                    {formData.variants.map((variant, vIndex) => (
                        <div key={vIndex} className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                            <input
                                type="text"
                                placeholder="Variant Type (e.g., Color)"
                                value={variant.type}
                                onChange={(e) => handleVariantTypeChange(vIndex, e.target.value)}
                                className={`${inputClasses} font-medium`}
                            />
                            {variant.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-2">
                                    <input type="text" placeholder="Option Name" value={option.name} onChange={(e) => handleVariantOptionChange(vIndex, oIndex, 'name', e.target.value)} className={`${inputClasses} p-1 w-1/3`} />
                                    <input type="number" placeholder="Price" value={option.price} onChange={(e) => handleVariantOptionChange(vIndex, oIndex, 'price', Number(e.target.value))} className={`${inputClasses} p-1 w-1/3`} />
                                    <input type="number" placeholder="Stock" value={option.stock} onChange={(e) => handleVariantOptionChange(vIndex, oIndex, 'stock', Number(e.target.value))} className={`${inputClasses} p-1 w-1/3`} />
                                    <button type="button" onClick={() => removeVariantOption(vIndex, oIndex)} className="text-red-500 p-1">&#x2715;</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addVariantOption(vIndex)} className="text-sm text-primary dark:text-blue-400 hover:underline">+ Add another option</button>
                        </div>
                    ))}
                    <button type="button" onClick={addVariantType} className="w-full text-sm font-semibold text-primary dark:text-blue-400 py-2 border-2 border-dashed border-primary dark:border-blue-500 rounded-md hover:bg-blue-50 dark:hover:bg-primary/10 transition-colors">
                        + Add Variant Type
                    </button>
                </div>

                <input type="file" name="images" accept="image/png, image/jpeg, image/webp" ref={fileInputRef} onChange={handleImageChange} required={formData.images.length === 0} multiple className="w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-primary/20 file:text-primary dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-primary/30"/>
                {formData.images.length > 0 && (
                     <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {formData.images.map((image, index) => (
                            <div key={index} className="relative group">
                                <img src={image} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover rounded-md border dark:border-gray-700" />
                                <button type="button" onClick={() => removeImage(index)} className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                    &#x2715;
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                <div className="flex flex-col sm:flex-row gap-2">
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="w-full bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 py-2 px-4 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 order-2 sm:order-1">
                            Cancel
                        </button>
                    )}
                    <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded-md font-semibold hover:bg-secondary transition-colors order-1 sm:order-2">
                        {isEditMode ? 'Update Product' : translations.add_product}
                    </button>
                </div>
            </form>
        </div>
    );
};