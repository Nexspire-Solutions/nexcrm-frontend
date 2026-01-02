import React from 'react';
import { FiCheck } from 'react-icons/fi';

const AtomPricing = ({ content, style }) => {
    const data = typeof content === 'object' ? content : {
        plans: [
            { name: 'Starter', price: '$29', features: ['5 Projects', 'Basic Analytics', 'Support'] },
            { name: 'Pro', price: '$99', features: ['Unlimited Projects', 'Advanced Analytics', 'Priority Support'], isPopular: true },
            { name: 'Enterprise', price: 'Custom', features: ['Dedicated Manager', 'SSO', 'SLA'] }
        ]
    };

    return (
        <div style={{ padding: '80px 20px', backgroundColor: 'white', ...style }}>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                {data.plans.map((plan, idx) => (
                    <div key={idx} className={`p-8 rounded-2xl border ${plan.isPopular ? 'border-indigo-600 bg-indigo-50 shadow-lg relative' : 'border-slate-200 bg-white'}`}>
                        {plan.isPopular && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                Most Popular
                            </span>
                        )}
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <div className="text-4xl font-black text-gray-900 mb-6">{plan.price}<span className="text-sm font-medium text-gray-500">/mo</span></div>
                        <ul className="space-y-3 mb-8">
                            {plan.features.map((feat, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                    <FiCheck className="text-green-500 shrink-0" /> {feat}
                                </li>
                            ))}
                        </ul>
                        <button className={`w-full py-3 rounded-lg font-bold transition-colors ${plan.isPopular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                            Choose Plan
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AtomPricing;
