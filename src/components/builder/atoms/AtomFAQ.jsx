import React from 'react';
import { FiHelpCircle } from 'react-icons/fi';

const AtomFAQ = ({ content }) => {
    return (
        <div className="w-full bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
                <FiHelpCircle className="text-slate-400" />
                <span className="font-bold text-slate-700">FAQ Section</span>
            </div>
            <div className="space-y-2 opacity-50">
                <div className="h-8 bg-slate-100 rounded w-full"></div>
                <div className="h-8 bg-slate-100 rounded w-full"></div>
                <div className="h-8 bg-slate-100 rounded w-3/4"></div>
            </div>
        </div>
    );
};

export default AtomFAQ;
