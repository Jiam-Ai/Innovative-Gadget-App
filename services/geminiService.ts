import { GoogleGenAI, Type, Modality, FunctionDeclaration, GenerateContentResponse } from "@google/genai";
// FIX: Import BuyerQuest type.
import type { Product, Review, NegotiationMessage, Buyer, BuyerQuest, ChatMessage } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

// --- Helper Functions ---
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// --- Existing AI Functions ---

export const generateProductDescription = async (keywords: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("AI service is currently unavailable. Please try again later.");
  }
  
  try {
    const prompt = `Generate a compelling and concise e-commerce product description for a gadget-focused market. Be persuasive and highlight key benefits. The product is: "${keywords}". Do not use markdown or special formatting. Just return plain text.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 100,
        thinkingConfig: { thinkingBudget: 50 },
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    return "Failed to generate AI description. Please check your keywords and try again.";
  }
};

// --- New Advanced AI Functions ---

export const findSimilarProductsByImage = async (image: { inlineData: { data: string; mimeType: string; } }, allProducts: Product[]): Promise<number[]> => {
    if (!API_KEY) return [];

    const productCatalog = allProducts.map(p => ({ id: p.id, name: p.name, category: p.category, description: p.description.substring(0, 100) }));

    const textPart = {
        text: `You are a visual search engine for an e-commerce site. Based on the provided image, find the 5 most visually and stylistically similar products from the following JSON product catalog. Prioritize visual similarity. Return a JSON object with a single key "similar_ids" which is an array of the top 5 most relevant product IDs. Example: {"similar_ids": [12, 34, 56, 78, 90]}\n\nProduct Catalog:\n${JSON.stringify(productCatalog)}`
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [image, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        similar_ids: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                    }
                }
            }
        });

        const result = JSON.parse(response.text.trim());
        return result.similar_ids || [];
    } catch (error) {
        console.error("Error finding similar products by image:", error);
        return [];
    }
};

export const generateVirtualTryOnImage = async (userImage: Blob, product: Product): Promise<string | null> => {
    if (!API_KEY) return null;

    try {
        const userImageBase64 = await blobToBase64(userImage);
        
        // In a real scenario, we might use a product image with a transparent background.
        // For this demo, we'll use the first product image and instruct the model.
        const productImageResponse = await fetch(product.images[0]);
        const productImageBlob = await productImageResponse.blob();
        const productImageBase64 = await blobToBase64(productImageBlob);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: userImageBase64, mimeType: userImage.type } },
                    { inlineData: { data: productImageBase64, mimeType: productImageBlob.type } },
                    { text: `Realistically place the clothing item from the second image onto the person in the first image. The clothing item is a "${product.name}". Preserve the background and the person's pose.` },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        return null;

    } catch (error) {
        console.error("Error generating virtual try-on image:", error);
        return null;
    }
};

export const summarizeProductReviews = async (reviews: Review[]): Promise<string> => {
    if (!API_KEY || reviews.length === 0) return "No summary available.";

    const reviewsText = reviews.map(r => `- ${r.comment} (Rating: ${r.rating}/5)`).join('\n');
    const prompt = `You are an e-commerce AI assistant. Summarize the following customer reviews for a product into a concise "Pros & Cons" list. Be objective and extract key themes.\n\nReviews:\n${reviewsText}\n\nSummary:`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { maxOutputTokens: 150 }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error summarizing reviews:", error);
        return "Could not generate summary.";
    }
};

export const categorizeSupportTicket = async (message: string): Promise<{ category: string, sentiment: string } | null> => {
    if (!API_KEY) return null;

    const prompt = `Analyze the following customer support message for an e-commerce store. Categorize it and determine its sentiment.
    
    Categories: "Delivery", "Payment", "Return", "Product Inquiry", "Account Issue", "Other"
    Sentiment: "Positive", "Neutral", "Negative"

    Message: "${message}"

    Return the result as a JSON object.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING },
                        sentiment: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error categorizing support ticket:", error);
        return null;
    }
};

export const getSearchSuggestions = async (query: string, categories: string[]): Promise<{ suggestions: string[], didYouMean: string | null }> => {
    if (!API_KEY || !query) return { suggestions: [], didYouMean: null };

    const prompt = `You are a helpful search assistant for an e-commerce site.
    Given the user's search query, provide helpful suggestions.
    
    1. Check for a likely typo. If you find one, suggest a correction.
    2. Suggest up to 3 relevant categories from the provided list that might contain what the user is looking for.
    3. Suggest up to 2 related search terms.

    User Query: "${query}"
    Available Categories: ${categories.join(', ')}

    Return a JSON object with two keys: "didYouMean" (string or null) and "suggestions" (an array of strings).
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        didYouMean: { type: Type.STRING, nullable: true },
                        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error getting search suggestions:", error);
        return { suggestions: [], didYouMean: null };
    }
};

// --- 5 New Differentiating AI Features ---

export const handlePriceNegotiation = async (
    product: Product,
    history: NegotiationMessage[]
): Promise<NegotiationMessage> => {
    const systemInstruction = `You are an AI negotiation agent for Innovative Gadget. You are friendly, a bit witty, and a firm but fair negotiator.
    - Product: ${product.name}
    - Listing Price: SLL ${product.price}
    - Your minimum acceptable price (secret): SLL ${product.minPrice}
    - Your goal is to meet the user's offer as close to the listing price as possible, but you must not go below your minimum price.
    - If the user's offer is below your minimum, make a counter-offer that is higher but still a good deal.
    - When you reach an agreement, your final message must include the text "Offer Accepted!" and the final price.
    - Be conversational. Use phrases like "Ah, my friend!", "Let's talk business.", "That price is a bit low!".
    `;
    // FIX: Switched to a stateless generateContent call, which is appropriate for this function's design.
    // The previous implementation incorrectly used the stateful Chat API in a stateless manner.
    const contents = history.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
    }));

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction,
                temperature: 0.8,
            },
        });
        
        const responseText = response.text;
        const acceptedMatch = responseText.match(/Offer Accepted!.*?(\d+)/);
        
        if (acceptedMatch) {
            return { sender: 'bot', text: responseText, isFinal: true, offer: parseInt(acceptedMatch[1], 10) };
        }
        
        return { sender: 'bot', text: responseText, isFinal: false };
    } catch (error) {
        console.error("Error in negotiation AI:", error);
        return { sender: 'bot', text: "Sorry, I'm having trouble with the connection. Let's try again.", isFinal: false };
    }
};

export const generateVendorStory = async (storeName: string, bulletPoints: string): Promise<string> => {
    if (!API_KEY) return "AI service is unavailable.";
    const prompt = `You are a brilliant storyteller for "Vendor Spotlight".
    Write a short, heartwarming, and engaging story (2-3 paragraphs) about a local vendor.
    Use the following information to craft the narrative. Make it sound authentic and inspiring.
    
    - Store Name: ${storeName}
    - Key Points: ${bulletPoints}
    
    The story should highlight their passion, craft, and connection to the community.`;
    
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { temperature: 0.7 }});
    return response.text.trim();
};

export const getPersonalizedRecommendations = async (buyer: Buyer, allProducts: Product[]): Promise<number[]> => {
    if (!API_KEY) return [];

    const viewedProducts = allProducts.filter(p => buyer.browsingHistory.includes(p.id))
        .map(p => ({ id: p.id, name: p.name, category: p.category }));

    const productCatalog = allProducts.filter(p => !buyer.browsingHistory.includes(p.id))
        .map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price, description: p.description.substring(0, 100) }));

    const prompt = `You are a personalization engine for an e-commerce site.
    Based on the user's browsing history (if available) and loyalty tier, recommend up to 10 other products from the catalog that they would most likely be interested in.
    
    - For 'Gold' tier users, suggest premium, new arrivals, or higher-priced items.
    - For 'Silver' tier users, suggest popular mid-range items and best-sellers.
    - For 'Bronze' tier users, focus on value, deals, and items related to their history.

    If browsing history is empty, recommend popular products based on their loyalty tier. Otherwise, prioritize products in similar categories to their history but also suggest complementary items.

    User Loyalty Tier: ${buyer.loyalty?.tier || 'Bronze'}

    User Browsing History:
    ${buyer.browsingHistory.length > 0 ? JSON.stringify(viewedProducts) : "No browsing history available."}
    
    Full Product Catalog (for recommendations):
    ${JSON.stringify(productCatalog)}
    
    Return a JSON object with a single key "recommended_ids", which is an array of product IDs.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { recommended_ids: { type: Type.ARRAY, items: { type: Type.NUMBER } } }
                }
            }
        });
        const result = JSON.parse(response.text.trim());
        return result.recommended_ids || [];
    } catch (error) {
        console.error("Error getting recommendations:", error);
        return [];
    }
};

export const processKrioVoiceCommand = async (command: string): Promise<GenerateContentResponse> => {
     const tools: FunctionDeclaration[] = [
        {
            name: 'search_products',
            parameters: {
                type: Type.OBJECT,
                properties: { query: { type: Type.STRING, description: 'The user\'s search term' } },
                required: ['query'],
            },
        },
        {
            name: 'add_to_cart',
            parameters: {
                type: Type.OBJECT,
                properties: { productName: { type: Type.STRING, description: 'The name of the product to add to the cart' } },
                required: ['productName'],
            },
        },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a voice assistant for an e-commerce app. The user may be speaking with a regional dialect or accent. Interpret their command and call the appropriate function. Command: "${command}"`,
      config: {
        tools: [{ functionDeclarations: tools }],
      },
    });
    
    return response;
};

// FIX: Add missing function to generate new quests for the loyalty program.
export const generateNewQuests = async (buyer: Buyer): Promise<BuyerQuest[]> => {
    if (!API_KEY) return [];

    const existingQuests = buyer.quests?.map(q => q.title).join(', ') || 'None';

    const prompt = `You are a gamification engine for Innovative Gadget, an e-commerce site.
    Your goal is to generate 3 new, creative, and engaging quests for a user to complete to earn loyalty points.
    Do not generate quests the user already has.
    
    User Profile:
    - Loyalty Tier: ${buyer.loyalty?.tier}
    - Browsing History (Product IDs): ${buyer.browsingHistory.slice(0, 5).join(', ')}
    - Existing Quests: ${existingQuests}
    
    Quest Ideas:
    - Encourage exploring new categories.
    - Encourage writing reviews for past purchases.
    - Encourage using a new feature (like visual search or price negotiation).
    - A simple quest like "Visit the 'For You' tab".
    
    Generate 3 unique quests. Return a JSON object with a "quests" key, which is an array of objects.
    Each object should have "title" (string, short & catchy), "description" (string, 1 sentence), and "points" (number, between 50 and 250).
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        quests: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    points: { type: Type.NUMBER }
                                },
                                required: ['title', 'description', 'points']
                            }
                        }
                    },
                    required: ['quests']
                }
            }
        });

        const result = JSON.parse(response.text.trim());
        const generatedQuests: {title: string, description: string, points: number}[] = result.quests || [];
        
        return generatedQuests.map(q => ({
            ...q,
            id: `quest-${Date.now()}-${Math.random()}`,
            isCompleted: false
        }));

    } catch (error) {
        console.error("Error generating new quests:", error);
        return [];
    }
};

export const getChatbotResponse = async (history: ChatMessage[], products: Product[]): Promise<string> => {
    if (!API_KEY) {
        return "AI service is currently unavailable.";
    }

    const systemInstruction = `You are a friendly, witty, and extremely helpful personal shopping assistant for Innovative Gadget, an e-commerce marketplace.
    Your goal is to help users discover products and have a delightful shopping experience. You are a fashion and tech expert.
    Your instructions:
    - Be conversational and engaging.
    - Proactively ask questions to understand the user's needs. E.g., "What's the occasion?", "What's your budget?".
    - When a user asks for recommendations (e.g., "find me a dress"), use the provided Product Context to suggest specific product names.
    - If the user asks a general customer service question (payment, delivery, returns), use the following knowledge base:
        - **Payment Methods**: We accept Cash on Delivery, Orange Money, and Africell Money.
        - **Delivery**: We deliver nationwide. Orders can be tracked on the 'Track Your Order' page.
        - **Return Policy**: We have a 7-day return policy for unused items in original packaging.
    - If you cannot answer, politely say: "That's a bit outside my expertise, but our human support team can help! You can find a contact form in our Help Center."`;

    const contents = history.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
    }));

    // Inject product context into the last user message
    const lastMessage = contents[contents.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
        const productContext = JSON.stringify(products.slice(0, 10).map(p => ({ id: p.id, name: p.name, category: p.category })));
        lastMessage.parts[0].text = `${lastMessage.parts[0].text}\n\nProduct Context: ${productContext}`;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction,
                temperature: 0.8,
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating chatbot response:", error);
        throw error;
    }
};


export const generateComparisonSummary = async (products: Product[]): Promise<string> => {
    if (!API_KEY || products.length < 2) return "Comparison requires at least two products.";

    const productDetails = products.map(p => 
        `- Name: ${p.name}\n` +
        `  Category: ${p.category}\n` +
        `  Price: SLL ${p.price}\n` +
        `  Rating: ${p.rating}/5 from ${p.reviewsCount} reviews\n` +
        `  Key Features: ${p.description.substring(0, 150)}...\n`
    ).join('\n');

    const prompt = `You are a helpful and witty e-commerce tech expert for "Innovative Gadget".
    A customer is comparing the following products. Provide a concise summary that helps them decide.

    Your analysis should:
    1.  Start with a brief overview of the choice they are making.
    2.  For each product, list 2-3 key "Pros" (what makes it stand out).
    3.  Provide a final "Verdict" recommending which type of user might prefer each product.
    
    Keep the language clear, engaging, and easy to understand. Do not use markdown formatting. Use line breaks to structure your response.

    Products to compare:
    ${productDetails}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { maxOutputTokens: 300 }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating comparison summary:", error);
        return "Could not generate an AI summary at this time. Please try again later.";
    }
};

export interface GiftFinderParams {
    occasion: string;
    recipient: string;
    interests: string;
    budget: string;
}

export const findGiftIdeas = async (params: GiftFinderParams, allProducts: Product[]): Promise<number[]> => {
    if (!API_KEY) return [];
    
    const productCatalog = allProducts.map(p => ({ 
        id: p.id, 
        name: p.name, 
        category: p.category, 
        price: p.price, 
        description: p.description.substring(0, 100) 
    }));

    const prompt = `You are a friendly and creative AI Gift Finder for "Innovative Gadget", an electronics and gadget store.
    Based on the user's criteria, recommend up to 6 products from the provided catalog that would make excellent gifts.
    
    User's Criteria:
    - Occasion: ${params.occasion}
    - Gifting for: A ${params.recipient}
    - Their interests: ${params.interests}
    - Budget: ${params.budget}

    Your task is to analyze the product catalog and select the most suitable gift ideas. Prioritize items that are popular, well-rated, and match the interests and budget.
    
    Product Catalog:
    ${JSON.stringify(productCatalog)}
    
    Return a JSON object with a single key "recommended_ids", which is an array of product IDs. Do not recommend more than 6 products.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recommended_ids: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                    },
                    required: ['recommended_ids']
                }
            }
        });
        const result = JSON.parse(response.text.trim());
        return result.recommended_ids || [];
    } catch (error) {
        console.error("Error finding gift ideas:", error);
        return [];
    }
};