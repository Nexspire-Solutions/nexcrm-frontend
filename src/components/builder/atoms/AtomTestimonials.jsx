import React from 'react';
import { FiMessageSquare } from 'react-icons/fi';

const AtomTestimonials = ({ content }) => {
    return (
        <div className="w-full h-full min-h-[150px] bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center p-4">
            <FiMessageSquare className="text-4xl text-slate-300 mb-2" />
            <span className="text-slate-500 font-medium">Testimonials Section ({content.variant || 'grid'})</span>
            <div className="flex gap-2 mt-2">
                <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                <div className="w-8 h-8 rounded-full bg-slate-200"></div>
            </div>
        </div>
    );
};

export default AtomTestimonials;
