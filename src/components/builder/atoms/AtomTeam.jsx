import React from 'react';
import { FiUsers } from 'react-icons/fi';

const AtomTeam = ({ content }) => {
    return (
        <div className="w-full bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
                <FiUsers className="text-slate-400" />
                <span className="font-bold text-slate-700">Team Section ({content.variant || 'grid'})</span>
            </div>
            <div className="flex gap-4 opacity-50 overflow-hidden">
                <div className="w-20 h-24 bg-slate-100 rounded"></div>
                <div className="w-20 h-24 bg-slate-100 rounded"></div>
                <div className="w-20 h-24 bg-slate-100 rounded"></div>
                <div className="w-20 h-24 bg-slate-100 rounded"></div>
            </div>
        </div>
    );
};

export default AtomTeam;
