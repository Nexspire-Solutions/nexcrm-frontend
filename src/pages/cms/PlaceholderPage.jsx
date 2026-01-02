import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { FiTool } from 'react-icons/fi';

const PlaceholderPage = () => {
    const location = useLocation();
    const title = location.pathname.split('/').pop().replace(/-/g, ' ');

    return (
        <div className="flex flex-col items-center justify-center h-full p-10 text-center bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                <FiTool className="text-3xl" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 capitalize mb-2">{title}</h1>
            <p className="text-slate-500 max-w-md">
                This module is currently under development. Detailed features for <span className="font-semibold">{title}</span> will be available in the next update.
            </p>
        </div>
    );
};

export default PlaceholderPage;
