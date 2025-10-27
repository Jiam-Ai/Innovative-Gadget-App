import React, { useContext } from 'react';
import { AppContext } from '../../App';

const JobOpening: React.FC<{title: string, location: string, description: string}> = ({ title, location, description }) => (
    <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg hover:shadow-lg dark:hover:shadow-gray-700/50 transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-primary dark:text-blue-400">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{location}</p>
            </div>
            <button className="bg-secondary text-white px-5 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors">Apply Now</button>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">{description}</p>
    </div>
);

export const Careers: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { translations } = context;

    return (
        <main className="container mx-auto px-4 py-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">{translations.careers}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Join our team and help us revolutionize e-commerce.</p>
                
                <div className="space-y-6">
                   <JobOpening 
                        title="Marketing Manager"
                        location="Freetown"
                        description="We are looking for an experienced Marketing Manager to develop and manage marketing programs, support sales and revenue growth, and drive our brand forward."
                   />
                    <JobOpening 
                        title="Delivery & Logistics Coordinator"
                        location="Bo"
                        description="This role involves managing the end-to-end delivery process, coordinating with our delivery fleet, and ensuring timely and accurate delivery of customer orders."
                   />
                   <JobOpening 
                        title="Vendor Support Specialist"
                        location="Remote / Freetown"
                        description="As a Vendor Support Specialist, you will be the primary point of contact for our sellers, providing them with assistance and guidance to succeed on our platform."
                   />
                </div>
                
                <div className="mt-12 text-center bg-lightgray dark:bg-gray-700/50 p-6 rounded-lg">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Don't see a role for you?</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">We're always looking for talented people. Send your resume to <a href="mailto:careers@innovativegadget.com" className="text-primary dark:text-blue-400 font-semibold hover:underline">careers@innovativegadget.com</a> and we'll be in touch!</p>
                </div>
            </div>
        </main>
    );
};