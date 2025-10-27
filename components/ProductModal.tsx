import React, { useContext, useState, useId, useEffect } from 'react';
import { AppContext } from '../App';
import type { Product, Review } from '../types';
import { summarizeProductReviews } from '../services/geminiService';
import { ProductCard } from './ProductCard';

interface ProductModalProps {
    isOpen: boolean;
    product: Product | null;
    onClose: () => void;
    onAddReview: (productId: number, review: Review) => void;
    allProducts: Product[];
    onVirtualTryOn: (product: Product) => void;
    onStartNegotiation: (product: Product) => void;
}

const StarRating: React.FC<{ rating: number, setRating?: (rating: number) => void }> = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const starPath = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

    const displayRating = hoverRating || rating;
    
    return (
        <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
            {[...Array(5)].map((_, i) => {
                const starValue = i + 1;
                return (
                    <svg
                        key={i}
                        className={`w-5 h-5 ${starValue <= displayRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} ${setRating ? 'cursor-pointer' : ''}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        onClick={() => setRating?.(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                    >
                        <path d={starPath} />
                    </svg>
                );
            })}
        </div>
    );
};

const ReviewForm: React.FC<{ productId: number; onAddReview: (productId: number, review: Review) => void; translations: Record<string, string> }> = ({ productId, onAddReview, translations }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [author, setAuthor] = useState('');
    const [image, setImage] = useState<string | undefined>();
    const inputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md";

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating > 0 && comment && author) {
            onAddReview(productId, {
                rating,
                comment,
                author,
                date: new Date().toISOString().split('T')[0],
                image
            });
            setRating(0);
            setComment('');
            setAuthor('');
            setImage(undefined);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <h4 className="font-semibold dark:text-gray-200">Write a review</h4>
            <div>
                <StarRating rating={rating} setRating={setRating} />
            </div>
            <input type="text" placeholder="Your Name" value={author} onChange={(e) => setAuthor(e.target.value)} required className={inputClasses}/>
            <textarea placeholder="Your review..." value={comment} onChange={(e) => setComment(e.target.value)} required rows={3} className={inputClasses}/>
            <div className="flex items-center gap-4">
                <input type="file" id="review-image" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <label htmlFor="review-image" className="cursor-pointer bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-md text-sm font-semibold">{translations.upload_review_image}</label>
                {image && <img src={image} alt="review preview" className="w-12 h-12 object-cover rounded-md"/>}
            </div>
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md">Submit Review</button>
        </form>
    );
};

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, product, onClose, onAddReview, allProducts, onVirtualTryOn, onStartNegotiation }) => {
    const context = useContext(AppContext);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
    const [reviewSummary, setReviewSummary] = useState<string>('');
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [isSubscription, setIsSubscription] = useState(false);

    useEffect(() => {
        if (isOpen && product) {
            setCurrentIndex(0);
            setQuantity(1);
            setIsSubscription(false);

            const defaults: { [key: string]: string } = {};
            product.variants?.forEach(v => {
                if (v.options.length > 0) defaults[v.type] = v.options[0].name;
            });
            setSelectedVariants(defaults);

            if (product.reviews && product.reviews.length > 2) {
                setIsSummaryLoading(true);
                summarizeProductReviews(product.reviews).then(summary => {
                    setReviewSummary(summary);
                    setIsSummaryLoading(false);
                });
            } else {
                setReviewSummary('');
            }
        }
    }, [isOpen, product]);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isOpen) return;
            if (event.key === 'Escape') onClose();
            if (event.key === 'ArrowLeft') prevImage();
            if (event.key === 'ArrowRight') nextImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, product]);

    const contextValue = useContext(AppContext);
    if (!contextValue || !product) return null;
    const { translations, addToCart } = contextValue;
    
    const nextImage = () => setCurrentIndex((prev) => (prev + 1) % product.images.length);
    const prevImage = () => setCurrentIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    
    const handleAddToCart = () => {
        addToCart(product, quantity, selectedVariants, isSubscription ? { frequency: 'monthly' } : undefined);
        onClose();
    };
    
    const relatedProducts = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl m-4 transform transition-all duration-300 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10" aria-label={translations.close}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="relative p-4">
                            <img src={product.images[currentIndex]} alt={product.name} className="w-full h-96 object-contain rounded-lg" />
                            {product.images.length > 1 && (
                                <>
                                    <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/50 dark:bg-black/50 p-2 rounded-full hover:bg-white dark:hover:bg-black" aria-label="Previous image"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg></button>
                                    <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/50 dark:bg-black/50 p-2 rounded-full hover:bg-white dark:hover:bg-black" aria-label="Next image"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></button>
                                </>
                            )}
                        </div>
                        <div className="p-6">
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{product.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sold by {product.vendor}</p>
                            <div className="flex items-center my-4">
                                <StarRating rating={product.rating} />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">({product.reviewsCount} {translations.reviews})</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 my-4">{product.description}</p>
                             <p className="text-4xl font-bold text-primary dark:text-blue-400 mb-4">SLL {new Intl.NumberFormat('en-US').format(product.price)}</p>
                            
                            {product.isNegotiable && (
                                <button onClick={() => onStartNegotiation(product)} className="w-full mb-4 text-center bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 py-2.5 px-4 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                    🤝 {translations.make_an_offer}
                                </button>
                            )}

                             {product.isSubscribable && (
                                <div className="bg-lightgray dark:bg-gray-700 p-3 rounded-lg mb-4">
                                    <h4 className="font-semibold">{translations.subscribe_and_save}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{translations.subscribe_prompt}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsSubscription(false)} className={`flex-1 p-2 text-sm rounded ${!isSubscription ? 'bg-primary text-white' : 'bg-white dark:bg-gray-600'}`}>{translations.one_time_purchase}</button>
                                        <button onClick={() => setIsSubscription(true)} className={`flex-1 p-2 text-sm rounded ${isSubscription ? 'bg-primary text-white' : 'bg-white dark:bg-gray-600'}`}>{translations.subscription}</button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-4 mb-4">
                                <div className="flex items-center border rounded dark:border-gray-600">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 dark:text-gray-300" aria-label="Decrease quantity">-</button>
                                    <span className="px-4 dark:text-gray-200">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-gray-600 dark:text-gray-300" aria-label="Increase quantity">+</button>
                                </div>
                                <button onClick={handleAddToCart} className="flex-1 bg-secondary text-white py-3 px-4 rounded-md font-semibold hover:bg-green-700 transition-colors">{translations.add_to_cart}</button>
                            </div>
                             {product.category === 'Clothing' && (
                                 <button onClick={() => onVirtualTryOn(product)} className="w-full text-center bg-primary text-white py-2.5 px-4 rounded-md font-semibold hover:bg-blue-800 transition-colors">
                                    {translations.virtual_try_on}
                                </button>
                            )}
                        </div>
                    </div>
                    
                     <div className="p-6 border-t dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-4 dark:text-gray-100">{translations.reviews}</h3>
                        
                        {reviewSummary && (
                             <div className="mb-6 p-4 bg-lightgray dark:bg-gray-700/50 rounded-lg">
                                 <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">✨ {translations.review_summary}</h4>
                                 {isSummaryLoading ? (
                                     <p className="text-sm text-gray-500 dark:text-gray-400">{translations.summarizing_reviews}</p>
                                 ) : (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{reviewSummary}</p>
                                 )}
                             </div>
                        )}

                        {product.reviews && product.reviews.length > 0 ? (
                            product.reviews.map((review, i) => (
                                <div key={i} className="border-b dark:border-gray-700 py-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold dark:text-gray-200">{review.author}</p>
                                            <StarRating rating={review.rating} />
                                        </div>
                                         <span className="text-xs text-gray-400">{review.date}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{review.comment}</p>
                                    {review.image && <img src={review.image} alt="review image" className="mt-2 w-24 h-24 object-cover rounded-md"/>}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No reviews yet.</p>
                        )}
                        <ReviewForm productId={product.id} onAddReview={onAddReview} translations={translations} />
                    </div>

                    {relatedProducts.length > 0 && (
                        <div className="p-6 border-t dark:border-gray-700 bg-lightgray dark:bg-gray-900/50">
                            <h3 className="text-xl font-bold mb-4 dark:text-gray-100">Related Products</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {relatedProducts.map(p => (
                                    <ProductCard key={p.id} product={p} onQuickView={(prod) => { onClose(); setTimeout(() => contextValue.handleNavigation('shop', { productId: prod.id }), 100); }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};