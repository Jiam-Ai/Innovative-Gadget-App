


import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { CategorySidebar } from './components/CategorySidebar';
import { ProductGrid } from './components/ProductGrid';
import { Footer } from './components/Footer';
import { CartModal } from './components/CartModal';
import { VendorAIAssistant } from './components/VendorAIAssistant';
import { SellerDashboard } from './components/SellerDashboard';
import { Auth } from './components/Auth';
import { ProductModal } from './components/ProductModal';
import { ChatbotWidget } from './components/ChatbotWidget';
import { ChatbotModal } from './components/ChatbotModal';
import { ComparisonTray } from './components/ComparisonTray';
import { ComparisonModal } from './components/ComparisonModal';
import { MobileNavMenu } from './components/MobileNavMenu';
import { FilterDrawer } from './components/FilterDrawer';
import { FilterControls } from './components/FilterControls';
import { VisualSearchModal } from './components/VisualSearchModal';
import { VirtualTryOnModal } from './components/VirtualTryOnModal';
import { PriceNegotiationModal } from './components/PriceNegotiationModal';
import { VendorSpotlightModal } from './components/VendorSpotlightModal';
import { VendorSpotlight } from './components/VendorSpotlight';
import { ForYouTab } from './components/ForYouTab';
import { GiftFinderModal } from './components/GiftFinderModal';

// Page Components
import { AboutUs } from './components/pages/AboutUs';
import { Careers } from './components/pages/Careers';
import { HelpCenter } from './components/pages/HelpCenter';
import { HowToBuy } from './components/pages/HowToBuy';
import { PrivacyPolicy } from './components/pages/PrivacyPolicy';
import { ReturnsRefunds } from './components/pages/ReturnsRefunds';
import { SuccessStories } from './components/pages/SuccessStories';
import { TermsConditions } from './components/pages/TermsConditions';
import { TrackOrder } from './components/pages/TrackOrder';
import { VendorHub } from './components/pages/VendorHub';
import { BuyerDashboard } from './components/pages/BuyerDashboard';
import { CheckoutPage } from './components/pages/CheckoutPage';

import type { Product, CartItem, Language, Seller, Order, BuyerInfo, Review, View, ChatMessage, Buyer, Theme, OrderStatus } from './types';
import { CATEGORIES, TRANSLATIONS, LOCAL_STORAGE_KEYS, SESSION_STORAGE_KEYS } from './constants';
import { getChatbotResponse, getPersonalizedRecommendations, processKrioVoiceCommand } from './services/geminiService';
import { FunctionCall } from '@google/genai';

export const AppContext = React.createContext<{
    language: Language;
    translations: Record<string, string>;
    setLanguage: (lang: Language) => void;
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number, variant?: { [key: string]: string }, subscription?: { frequency: 'monthly' }, negotiatedPrice?: number) => void;
    removeFromCart: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    currentSeller: Seller | null;
    currentBuyer: Buyer | null;
    logout: () => void;
    updateSellerProfile: (updatedInfo: Partial<Seller>) => Promise<{ success: boolean; error?: string }>;
    updateBuyerProfile: (updatedInfo: Partial<Buyer>) => Promise<{ success: boolean; error?: string }>;
    // FIX: Add `productId` to the payload of `handleNavigation` to allow navigating to and opening a product modal.
    handleNavigation: (view: View, payload?: { orderId?: string, productId?: number }) => void;
    orders: Order[];
    theme: Theme;
    toggleTheme: () => void;
    comparisonList: Product[];
    toggleCompare: (product: Product) => void;
    clearCompareList: () => void;
    currentView: View;
    openCart: () => void;
    startNegotiation: (product: Product) => void;
    updateSellerStory: (story: string, inputs: string) => void;
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
    placeOrder: (buyerInfo: BuyerInfo) => Order | null;
} | null>(null);


const App: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [view, setView] = useState<View>('shop');
    const [prefilledOrderId, setPrefilledOrderId] = useState<string | null>(null);
    const [currentSeller, setCurrentSeller] = useState<Seller | null>(null);
    const [currentBuyer, setCurrentBuyer] = useState<Buyer | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
    const [selectedRating, setSelectedRating] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('default');
    const [language, setLanguage] = useState<Language>('en');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [unseenOrderIds, setUnseenOrderIds] = useState<string[]>([]);
    const [productModal, setProductModal] = useState<{ isOpen: boolean; product: Product | null }>({ isOpen: false, product: null });
    
    // Chatbot State
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isBotTyping, setIsBotTyping] = useState(false);

    // Theme State
    const [theme, setTheme] = useState<Theme>('light');
    
    // Comparison State
    const [comparisonList, setComparisonList] = useState<Product[]>([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
    
    // Mobile UI State
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    // Advanced Features State
    const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
    const [isVirtualTryOnOpen, setIsVirtualTryOnOpen] = useState(false);
    const [productForTryOn, setProductForTryOn] = useState<Product | null>(null);
    const [visualSearchResults, setVisualSearchResults] = useState<Product[] | null>(null);
    const [negotiationModal, setNegotiationModal] = useState<{ isOpen: boolean; product: Product | null }>({ isOpen: false, product: null });
    const [vendorSpotlightModal, setVendorSpotlightModal] = useState(false);
    const [activeShopTab, setActiveShopTab] = useState('all_products');
    const [forYouProducts, setForYouProducts] = useState<Product[] | null>(null);
    const [isGiftFinderOpen, setIsGiftFinderOpen] = useState(false);


    useEffect(() => {
        // Load products, orders, and sessions from localStorage
        try {
            const sellerProductsJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS);
            setProducts(sellerProductsJSON ? JSON.parse(sellerProductsJSON) : []);

            const ordersJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
            setOrders(ordersJSON ? JSON.parse(ordersJSON) : []);

            // Check for active seller session
            const loggedInSellerId = sessionStorage.getItem(SESSION_STORAGE_KEYS.SELLER_ID);
            if (loggedInSellerId) {
                const sellersJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.SELLERS);
                const sellers: Seller[] = sellersJSON ? JSON.parse(sellersJSON) : [];
                const loggedInSeller = sellers.find(s => s.id === loggedInSellerId);
                if (loggedInSeller) {
                    setCurrentSeller(loggedInSeller);
                    const unseenOrdersJSON = localStorage.getItem(`unseen_orders_${loggedInSeller.id}`);
                    setUnseenOrderIds(unseenOrdersJSON ? JSON.parse(unseenOrdersJSON) : []);
                }
            }

            // Check for active buyer session
            const loggedInBuyerId = sessionStorage.getItem(SESSION_STORAGE_KEYS.BUYER_ID);
             if (loggedInBuyerId) {
                const buyersJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.BUYERS);
                const buyers: Buyer[] = buyersJSON ? JSON.parse(buyersJSON) : [];
                const loggedInBuyer = buyers.find(b => b.id === loggedInBuyerId);
                if (loggedInBuyer) {
                    setCurrentBuyer(loggedInBuyer);
                }
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            setProducts([]);
            setOrders([]);
        }
        
        // Initialize Chatbot
        setChatMessages([{ sender: 'bot', text: TRANSLATIONS[language].chatbot_greeting }]);

        // Initialize Theme
        const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME) as Theme;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (prefersDark) {
            setTheme('dark');
        }

    }, []);

    // Effect to apply theme changes to the DOM
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, theme);
        } catch (error) {
            console.error("Failed to save theme to localStorage", error);
        }
    }, [theme]);
    
    // Update chatbot greeting if language changes
    useEffect(() => {
        if (chatMessages.length === 1 && chatMessages[0].sender === 'bot') {
             setChatMessages([{ sender: 'bot', text: TRANSLATIONS[language].chatbot_greeting }]);
        }
    }, [language]);
    
    const handleOpenProductModal = (product: Product) => {
        setProductModal({ isOpen: true, product });
        // Track browsing history for personalization
        if (currentBuyer) {
            const updatedHistory = [...new Set([product.id, ...currentBuyer.browsingHistory])].slice(0, 20); // Keep last 20
            setCurrentBuyer(prev => ({ ...prev!, browsingHistory: updatedHistory }));
        }
    };
    const handleCloseProductModal = () => setProductModal({ isOpen: false, product: null });
    const openCart = () => setIsCartOpen(true);
    const handleOpenVirtualTryOn = (product: Product) => {
        setProductForTryOn(product);
        setIsVirtualTryOnOpen(true);
        setProductModal({ isOpen: false, product: null });
    };

    const handleStartNegotiation = (product: Product) => {
        setNegotiationModal({ isOpen: true, product });
        handleCloseProductModal();
    };

    const handleNavigation = (targetView: View, payload?: { orderId?: string; productId?: number }) => {
        setVisualSearchResults(null);
        setActiveShopTab('all_products'); // Reset to default tab
        if (targetView === 'track-order' && payload?.orderId) {
            setPrefilledOrderId(payload.orderId);
        } else {
            setPrefilledOrderId(null);
        }

        if (targetView === 'shop' && payload?.productId) {
            const productToOpen = products.find(p => p.id === payload.productId);
            if(productToOpen) {
                handleOpenProductModal(productToOpen);
            }
        }

        if ((targetView === 'seller' || targetView === 'vendor-hub') && !currentSeller) {
            setView('auth');
        } else if (targetView === 'buyer-dashboard' && !currentBuyer) {
            setView('auth');
        } else {
            setView(targetView);
        }
        setIsMobileNavOpen(false); // Close nav on navigation
        window.scrollTo(0, 0);
    };
    
    const handleSendChatMessage = async (message: string) => {
        if (!message.trim()) return;
    
        const userMessage: ChatMessage = { sender: 'user', text: message };
        const newMessages = [...chatMessages, userMessage];
        setChatMessages(newMessages);
        setIsBotTyping(true);
    
        try {
            const botResponseText = await getChatbotResponse(newMessages, products);
    
            const botMessage: ChatMessage = { sender: 'bot', text: botResponseText };
            setChatMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { sender: 'bot', text: TRANSLATIONS[language].chatbot_error };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsBotTyping(false);
        }
    };

    const handleSellerLoginSuccess = (seller: Seller) => {
        setCurrentSeller(seller);
        sessionStorage.setItem(SESSION_STORAGE_KEYS.SELLER_ID, seller.id);
        
        try {
            const unseenOrdersJSON = localStorage.getItem(`unseen_orders_${seller.id}`);
            setUnseenOrderIds(unseenOrdersJSON ? JSON.parse(unseenOrdersJSON) : []);
        } catch (error) {
            console.error("Failed to load unseen orders", error);
            setUnseenOrderIds([]);
        }
        
        setView('seller');
    };

    const handleBuyerLoginSuccess = (buyer: Buyer) => {
        setCurrentBuyer(buyer);
        sessionStorage.setItem(SESSION_STORAGE_KEYS.BUYER_ID, buyer.id);
        setView('shop'); // Or redirect to buyer dashboard: setView('buyer-dashboard');
    };

    const handleLogout = () => {
        setCurrentSeller(null);
        setCurrentBuyer(null);
        setUnseenOrderIds([]);
        sessionStorage.removeItem(SESSION_STORAGE_KEYS.SELLER_ID);
        sessionStorage.removeItem(SESSION_STORAGE_KEYS.BUYER_ID);
        setView('shop');
    };

    const filteredProducts = useMemo(() => {
        if (view !== 'shop') return [];
        if (visualSearchResults) return visualSearchResults;
        
        const filtered = products
            .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(p => {
                if (selectedPriceRange === 'all') return true;
                if (selectedPriceRange.endsWith('+')) {
                    const min = Number(selectedPriceRange.slice(0, -1));
                    return p.price >= min;
                }
                const [min, max] = selectedPriceRange.split('-').map(Number);
                return p.price >= min && p.price <= max;
            })
            .filter(p => p.rating >= selectedRating);
        
        const sorted = [...filtered].sort((a, b) => {
            if (sortOrder === 'price-asc') {
                return a.price - b.price;
            }
            if (sortOrder === 'price-desc') {
                return b.price - a.price;
            }
            return 0; 
        });

        return sorted;
    }, [products, selectedCategory, searchTerm, sortOrder, view, selectedPriceRange, selectedRating, visualSearchResults]);
    
    const sellerOrders = useMemo(() => {
        if (!currentSeller) return [];
        
        const relevantOrders = orders.map(order => {
            const sellerItems = order.items.filter(item => item.product.sellerId === currentSeller.id);
            if (sellerItems.length === 0) return null;
            
            return {
                ...order,
                items: sellerItems,
                total: sellerItems.reduce((acc, item) => acc + (item.negotiatedPrice ?? item.product.price) * item.quantity, 0),
            };
        }).filter((order): order is Order => order !== null);
        
        return relevantOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, currentSeller]);


    const addProduct = useCallback((newProduct: Product) => {
        const updatedProducts = [...products, newProduct];
        setProducts(updatedProducts);
        
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
        } catch (error) {
            console.error("Failed to save product to localStorage", error);
        }
    }, [products]);

    const updateProduct = useCallback((updatedProduct: Product) => {
        const updatedProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        setProducts(updatedProducts);

        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
        } catch (error) {
            console.error("Failed to update product in localStorage", error);
        }
    }, [products]);
    
    const addProductReview = useCallback((productId: number, review: Review) => {
        const updatedProducts = products.map(p => {
            if (p.id === productId) {
                const existingReviews = p.reviews || [];
                const updatedReviews = [...existingReviews, review];
                const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
                const newAverageRating = totalRating / updatedReviews.length;

                return {
                    ...p,
                    reviews: updatedReviews,
                    rating: parseFloat(newAverageRating.toFixed(1)),
                    reviewsCount: updatedReviews.length
                };
            }
            return p;
        });
        setProducts(updatedProducts);
    }, [products]);


    const updateSellerProfile = useCallback(async (updatedInfo: Partial<Seller>): Promise<{ success: boolean; error?: string }> => {
        if (!currentSeller) return { success: false, error: 'Not logged in' };
        
        try {
            const sellersJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.SELLERS);
            let sellers: Seller[] = sellersJSON ? JSON.parse(sellersJSON) : [];

            if (updatedInfo.email && updatedInfo.email.toLowerCase() !== currentSeller.email) {
                if (sellers.some(s => s.email.toLowerCase() === updatedInfo.email!.toLowerCase())) {
                    return { success: false, error: 'email_in_use_error' };
                }
            }
            
            const updatedSeller = { ...currentSeller, ...updatedInfo };
            
            const updatedSellers = sellers.map(s => s.id === currentSeller.id ? updatedSeller : s);
            localStorage.setItem(LOCAL_STORAGE_KEYS.SELLERS, JSON.stringify(updatedSellers));

            setCurrentSeller(updatedSeller);
            
            if (updatedInfo.storeName && updatedInfo.storeName !== currentSeller.storeName) {
                const newProducts = products.map(p => 
                    p.sellerId === currentSeller.id ? { ...p, vendor: updatedInfo.storeName! } : p
                );
                setProducts(newProducts);
                localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(newProducts));
            }

            return { success: true };
        } catch (error) {
            console.error("Failed to update seller profile", error);
            return { success: false, error: 'auth_storage_error' };
        }
    }, [currentSeller, products]);

    const updateBuyerProfile = useCallback(async (updatedInfo: Partial<Buyer>): Promise<{ success: boolean; error?: string }> => {
        if (!currentBuyer) return { success: false, error: 'Not logged in' };
        
        try {
            const buyersJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.BUYERS);
            let buyers: Buyer[] = buyersJSON ? JSON.parse(buyersJSON) : [];

            if (updatedInfo.email && updatedInfo.email.toLowerCase() !== currentBuyer.email) {
                if (buyers.some(b => b.email.toLowerCase() === updatedInfo.email!.toLowerCase())) {
                    return { success: false, error: 'email_in_use_error' };
                }
            }
            
            const updatedBuyer = { ...currentBuyer, ...updatedInfo };
            
            const updatedBuyers = buyers.map(b => b.id === currentBuyer.id ? updatedBuyer : b);
            localStorage.setItem(LOCAL_STORAGE_KEYS.BUYERS, JSON.stringify(updatedBuyers));

            setCurrentBuyer(updatedBuyer);
            return { success: true };

        } catch (error) {
            console.error("Failed to update buyer profile", error);
            return { success: false, error: 'auth_storage_error' };
        }
    }, [currentBuyer]);


    const addToCart = useCallback((product: Product, quantity: number = 1, variant?: { [key: string]: string }, subscription?: { frequency: 'monthly' }, negotiatedPrice?: number) => {
        setCart(prevCart => {
            const variantString = variant ? Object.entries(variant).sort().join('-') : 'none';
            const subString = subscription ? `-${subscription.frequency}` : '';
            const priceString = negotiatedPrice ? `-neg${negotiatedPrice}` : '';
            const cartItemId = `${product.id}-${variantString}${subString}${priceString}`;
            
            const existingItem = prevCart.find(item => item.cartItemId === cartItemId);
            if (existingItem) {
                return prevCart.map(item =>
                    item.cartItemId === cartItemId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevCart, { product, quantity, variant, cartItemId, subscription, negotiatedPrice }];
        });
    }, []);

    const removeFromCart = useCallback((cartItemId: string) => {
        setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));
    }, []);

    const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(cartItemId);
        } else {
            setCart(prevCart =>
                prevCart.map(item =>
                    item.cartItemId === cartItemId ? { ...item, quantity } : item
                )
            );
        }
    }, [removeFromCart]);

    const handleCheckout = () => {
        setIsCartOpen(false);
        handleNavigation('checkout');
    };

    const markOrdersAsSeen = useCallback(() => {
        if (!currentSeller || unseenOrderIds.length === 0) return;
        try {
            localStorage.removeItem(`unseen_orders_${currentSeller.id}`);
            setUnseenOrderIds([]);
        } catch (error) {
            console.error("Failed to mark orders as seen", error);
        }
    }, [currentSeller, unseenOrderIds]);
    
    const placeOrder = (buyerInfo: BuyerInfo): Order | null => {
        if (cart.length === 0) return null;

        const newOrder: Order = {
            id: `SK-${Date.now()}`,
            date: new Date().toISOString(),
            buyerInfo,
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.negotiatedPrice ?? item.product.price) * item.quantity, 0),
            buyerId: currentBuyer ? currentBuyer.id : undefined,
            status: 'Pending',
        };

        const updatedOrders = [...orders, newOrder];
        setOrders(updatedOrders);
        
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));

            const sellerIdsInOrder = [...new Set(cart.map(item => item.product.sellerId))];
            sellerIdsInOrder.forEach(sellerId => {
                if (sellerId === 'system') return;
                try {
                    const unseenKey = `unseen_orders_${sellerId}`;
                    const existingUnseenJSON = localStorage.getItem(unseenKey);
                    const existingUnseen: string[] = existingUnseenJSON ? JSON.parse(existingUnseenJSON) : [];
                    const updatedUnseen = [...new Set([...existingUnseen, newOrder.id])];
                    localStorage.setItem(unseenKey, JSON.stringify(updatedUnseen));

                    if (currentSeller && currentSeller.id === sellerId) {
                        setUnseenOrderIds(updatedUnseen);
                    }
                } catch (error) {
                    console.error("Failed to update unseen orders in localStorage", error);
                }
            });

        } catch (error) {
            console.error("Failed to save order to localStorage", error);
            return null; // Indicate failure
        }

        setCart([]);
        return newOrder;
    };

    const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
        const updatedOrders = orders.map(order => 
            order.id === orderId ? { ...order, status } : order
        );
        setOrders(updatedOrders);
        try {
             localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));
        } catch (error) {
            console.error("Failed to update order status in localStorage", error);
        }
    }, [orders]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const toggleCompare = useCallback((product: Product) => {
        setComparisonList(prev => {
            const isInList = prev.some(p => p.id === product.id);
            if (isInList) {
                return prev.filter(p => p.id !== product.id);
            } else {
                if (prev.length < 4) {
                    return [...prev, product];
                }
                alert(TRANSLATIONS[language].comparison_limit_error);
                return prev;
            }
        });
    }, [language]);

    const clearCompareList = useCallback(() => {
        setComparisonList([]);
    }, []);

    const handleVoiceSearch = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Sorry, your browser doesn't support voice search.");
            return;
        }
        
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'en-US'; // Best effort for Krio
        recognition.interimResults = false;

        recognition.onstart = () => {
            alert(TRANSLATIONS[language].voice_search_prompt);
        };

        recognition.onresult = async (event: any) => {
            const command = event.results[0][0].transcript;
            console.log("Voice command:", command);
            
            const response = await processKrioVoiceCommand(command);
            const functionCall: FunctionCall | undefined = response.functionCalls?.[0];

            if (functionCall) {
                if (functionCall.name === 'search_products') {
                    // FIX: Argument of type 'unknown' is not assignable to parameter of type 'SetStateAction<string>'. Cast to string.
                    setSearchTerm(functionCall.args.query as string);
                } else if (functionCall.name === 'add_to_cart') {
                    // FIX: Property 'toLowerCase' does not exist on type 'unknown'. Cast to string.
                    const productName = (functionCall.args.productName as string).toLowerCase();
                    const productToAdd = products.find(p => p.name.toLowerCase().includes(productName));
                    if (productToAdd) {
                        addToCart(productToAdd);
                        openCart();
                    } else {
                        alert(`Sorry, I couldn't find a product named "${productName}".`);
                    }
                }
            } else {
                alert("I didn't quite understand that. Please try again.");
            }
        };
        
        recognition.onerror = (event: any) => {
            console.error("Voice recognition error", event.error);
        };
        
        recognition.start();
    };

    const updateSellerStory = useCallback((story: string, inputs: string) => {
        if (!currentSeller) return;
        updateSellerProfile({ story, storyInputs: inputs });
    }, [currentSeller, updateSellerProfile]);

    const fetchForYouProducts = useCallback(async () => {
        if (currentBuyer) {
            setForYouProducts(null); // Show loader
            const ids = await getPersonalizedRecommendations(currentBuyer, products);
            const recommendedProducts = products.filter(p => ids.includes(p.id));
            setForYouProducts(recommendedProducts);
        } else {
             setForYouProducts([]); // No history, show empty state
        }
    }, [currentBuyer, products]);

    useEffect(() => {
        if (view === 'shop' && activeShopTab === 'for_you') {
            fetchForYouProducts();
        }
    }, [view, activeShopTab, fetchForYouProducts]);

    const renderContent = () => {
        switch (view) {
            case 'auth':
                return <Auth onSellerLoginSuccess={handleSellerLoginSuccess} onBuyerLoginSuccess={handleBuyerLoginSuccess} />;
            case 'seller':
                if (currentSeller) {
                    return <SellerDashboard
                        sellerProducts={products.filter(p => p.sellerId === currentSeller.id)}
                        sellerOrders={sellerOrders}
                        onAddProduct={addProduct}
                        onUpdateProduct={updateProduct}
                        currentSeller={currentSeller}
                        onUpdateProfile={updateSellerProfile}
                        unseenOrderIds={unseenOrderIds}
                        onViewOrders={markOrdersAsSeen}
                        onOpenStoryModal={() => setVendorSpotlightModal(true)}
                    />;
                }
                return null;
            case 'buyer-dashboard':
                if (currentBuyer) {
                     return <BuyerDashboard />;
                }
                return null;
            case 'about-us': return <AboutUs />;
            case 'careers': return <Careers />;
            case 'help-center': return <HelpCenter />;
            case 'how-to-buy': return <HowToBuy />;
            case 'privacy-policy': return <PrivacyPolicy />;
            case 'returns-refunds': return <ReturnsRefunds />;
            case 'success-stories': return <SuccessStories />;
            case 'terms-conditions': return <TermsConditions />;
            case 'track-order': return <TrackOrder prefilledOrderId={prefilledOrderId} />;
            case 'vendor-hub':
                if (currentSeller) {
                    return <VendorHub
                                seller={currentSeller}
                                products={products.filter(p => p.sellerId === currentSeller.id)}
                                orders={sellerOrders}
                            />;
                }
                return null;
            case 'checkout': return <CheckoutPage />;
            case 'shop':
            default:
                return (
                    <>
                         <main className="container mx-auto px-4 py-8">
                           <div className="lg:hidden mb-6">
                                <FilterControls 
                                    onFilterClick={() => setIsFilterDrawerOpen(true)}
                                    sortOrder={sortOrder}
                                    onSortChange={setSortOrder}
                                />
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                <div className="hidden lg:block">
                                    <CategorySidebar
                                        categories={CATEGORIES}
                                        selectedCategory={selectedCategory}
                                        onSelectCategory={setSelectedCategory}
                                        selectedPriceRange={selectedPriceRange}
                                        onSelectPriceRange={setSelectedPriceRange}
                                        selectedRating={selectedRating}
                                        onSelectRating={setSelectedRating}
                                    />
                                </div>
                                <div className="lg:col-span-3">
                                    <VendorSpotlight />

                                    <div className="flex border-b-2 dark:border-gray-700 mb-6">
                                        <button onClick={() => setActiveShopTab('all_products')} className={`py-2 px-4 font-semibold ${activeShopTab === 'all_products' ? 'border-b-2 border-primary text-primary dark:text-blue-400' : 'text-gray-500'}`}>
                                            {TRANSLATIONS[language].all_products}
                                        </button>
                                        <button onClick={() => setActiveShopTab('for_you')} className={`py-2 px-4 font-semibold ${activeShopTab === 'for_you' ? 'border-b-2 border-primary text-primary dark:text-blue-400' : 'text-gray-500'}`}>
                                            {TRANSLATIONS[language].for_you}
                                        </button>
                                    </div>

                                    {activeShopTab === 'all_products' && (
                                        <>
                                            {visualSearchResults && (
                                                <div className="mb-4 flex justify-between items-center">
                                                    <h2 className="text-xl font-bold dark:text-white">Visually Similar Results</h2>
                                                    <button onClick={() => setVisualSearchResults(null)} className="text-sm font-semibold text-primary hover:underline">Clear Search</button>
                                                </div>
                                            )}
                                            <ProductGrid products={filteredProducts} onOpenProductModal={handleOpenProductModal} />
                                        </>
                                    )}
                                    {activeShopTab === 'for_you' && (
                                        <ForYouTab products={forYouProducts} onOpenProductModal={handleOpenProductModal} />
                                    )}
                                </div>
                            </div>
                        </main>
                    </>
                );
        }
    };
    
    const appContextValue = {
        language,
        translations: TRANSLATIONS[language],
        setLanguage,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        currentSeller,
        currentBuyer,
        logout: handleLogout,
        updateSellerProfile,
        updateBuyerProfile,
        handleNavigation,
        orders,
        theme,
        toggleTheme,
        comparisonList,
        toggleCompare,
        clearCompareList,
        currentView: view,
        openCart,
        startNegotiation: handleStartNegotiation,
        updateSellerStory,
        updateOrderStatus,
        placeOrder,
    };

    return (
        <AppContext.Provider value={appContextValue}>
            <div className="bg-lightgray dark:bg-dark-bg min-h-screen font-sans flex flex-col">
                <Header 
                    onSearch={setSearchTerm} 
                    onCartClick={openCart}
                    currentView={view}
                    onMenuClick={() => setIsMobileNavOpen(true)}
                    onVisualSearchClick={() => setIsVisualSearchOpen(true)}
                    onVoiceSearch={handleVoiceSearch}
                    allProducts={products}
                    onGiftFinderClick={() => setIsGiftFinderOpen(true)}
                />
                 <MobileNavMenu 
                    isOpen={isMobileNavOpen} 
                    onClose={() => setIsMobileNavOpen(false)}
                />
                <div className="flex-grow pb-16 lg:pb-0">
                    {renderContent()}
                </div>
                <Footer />
                <CartModal 
                    isOpen={isCartOpen} 
                    onClose={() => setIsCartOpen(false)}
                    onCheckout={handleCheckout}
                />
                 <ProductModal
                    isOpen={productModal.isOpen}
                    product={productModal.product}
                    onClose={handleCloseProductModal}
                    onAddReview={addProductReview}
                    allProducts={products}
                    onVirtualTryOn={handleOpenVirtualTryOn}
                    onStartNegotiation={handleStartNegotiation}
                />
                <PriceNegotiationModal
                    isOpen={negotiationModal.isOpen}
                    product={negotiationModal.product}
                    onClose={() => setNegotiationModal({ isOpen: false, product: null })}
                />
                <VendorSpotlightModal
                    isOpen={vendorSpotlightModal}
                    onClose={() => setVendorSpotlightModal(false)}
                />
                <VisualSearchModal 
                    isOpen={isVisualSearchOpen}
                    onClose={() => setIsVisualSearchOpen(false)}
                    allProducts={products}
                    onResults={setVisualSearchResults}
                />
                <VirtualTryOnModal
                    isOpen={isVirtualTryOnOpen}
                    onClose={() => setIsVirtualTryOnOpen(false)}
                    product={productForTryOn}
                />
                 <FilterDrawer
                    isOpen={isFilterDrawerOpen}
                    onClose={() => setIsFilterDrawerOpen(false)}
                >
                     <CategorySidebar
                        categories={CATEGORIES}
                        selectedCategory={selectedCategory}
                        onSelectCategory={(cat) => {
                            setSelectedCategory(cat);
                        }}
                        selectedPriceRange={selectedPriceRange}
                        onSelectPriceRange={setSelectedPriceRange}
                        selectedRating={selectedRating}
                        onSelectRating={setSelectedRating}
                    />
                </FilterDrawer>
                <GiftFinderModal
                    isOpen={isGiftFinderOpen}
                    onClose={() => setIsGiftFinderOpen(false)}
                    allProducts={products}
                    onOpenProduct={handleOpenProductModal}
                />
                <ChatbotWidget onClick={() => setIsChatbotOpen(true)} />
                <ChatbotModal
                    isOpen={isChatbotOpen}
                    onClose={() => setIsChatbotOpen(false)}
                    messages={chatMessages}
                    onSendMessage={handleSendChatMessage}
                    isTyping={isBotTyping}
                />
                <ComparisonTray onOpen={() => setIsCompareModalOpen(true)} />
                <ComparisonModal 
                    isOpen={isCompareModalOpen}
                    onClose={() => setIsCompareModalOpen(false)}
                />
            </div>
        </AppContext.Provider>
    );
};

export default App;