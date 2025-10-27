import React, { useContext } from 'react';
import { AppContext } from '../../App';

export const AboutUs: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { translations } = context;

    return (
        <main className="container mx-auto px-4 py-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b dark:border-gray-700 pb-4">{translations.about_us}</h1>
                <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p className="text-lg">
                        Welcome to Innovative Gadget, your number one online marketplace for all things tech. We're dedicated to giving you the very best of online shopping, with a focus on dependability, customer service, and uniqueness.
                    </p>
                    <p>
                        Founded in {new Date().getFullYear()}, Innovative Gadget has come a long way from its beginnings. When we first started out, our passion for empowering local businesses and providing a convenient shopping experience for everyone drove us to do intense research, and gave us the impetus to turn hard work and inspiration into to a booming online store. We now serve customers all over and are thrilled to be a part of the fair-trade wing of the e-commerce industry.
                    </p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                        <div className="bg-lightgray dark:bg-gray-700/50 p-6 rounded-lg">
                            <h2 className="text-2xl font-semibold text-primary dark:text-blue-400 mb-3">Our Mission</h2>
                            <p>To create a world-class online marketplace that connects sellers with a nationwide customer base, fostering economic growth and simplifying daily life through technology.</p>
                        </div>
                        <div className="bg-lightgray dark:bg-gray-700/50 p-6 rounded-lg">
                            <h2 className="text-2xl font-semibold text-secondary mb-3">Our Vision</h2>
                            <p>To be the most trusted and customer-centric e-commerce platform, renowned for our vast selection, competitive prices, and reliable delivery services.</p>
                        </div>
                    </div>
                    <p>
                        We hope you enjoy our products as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
                    </p>
                    <p className="font-semibold">
                        Sincerely,<br/>
                        The Innovative Gadget Team
                    </p>
                </div>
            </div>
        </main>
    );
};