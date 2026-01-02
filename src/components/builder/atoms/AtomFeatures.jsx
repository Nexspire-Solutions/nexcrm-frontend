import React from 'react';
import { FiMonitor, FiTrendingUp, FiShield } from 'react-icons/fi';

// Helper to get icon by name string
const getIcon = (name) => {
    switch (name) {
        case 'monitor': return <FiMonitor className="w-8 h-8 text-indigo-600 mb-4" />;
        case 'trend': return <FiTrendingUp className="w-8 h-8 text-indigo-600 mb-4" />;
        case 'shield': return <FiShield className="w-8 h-8 text-indigo-600 mb-4" />;
        default: return <FiMonitor className="w-8 h-8 text-indigo-600 mb-4" />;
    }
};

const AtomFeatures = ({ content, style }) => {
    // Default content structure
    const data = typeof content === 'object' ? content : {
        features: [
            { title: 'Responsive Design', text: 'Looks great on all devices.', icon: 'monitor' },
            { title: 'Data Analytics', text: 'Track your growth in real-time.', icon: 'trend' },
            { title: 'Secure Platform', text: 'Enterprise-grade security.', icon: 'shield' }
        ]
    };

    return (
        <div style={{ padding: '60px 20px', backgroundColor: '#f8fafc', ...style }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {data.features.map((feature, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        {getIcon(feature.icon)}
                        <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                        <p className="text-gray-600">{feature.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AtomFeatures;
