import React from 'react';

const AtomCallToAction = ({ content, style }) => {
    const data = typeof content === 'object' ? content : {
        title: 'Ready to Get Started?',
        text: 'Join thousands of satisfied customers today.',
        buttonText: 'Sign Up Now',
        buttonLink: '#'
    };

    return (
        <div style={{ padding: '80px 20px', backgroundColor: '#4F46E5', color: 'white', textAlign: 'center', ...style }}>
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">{data.title}</h2>
                <p className="text-xl text-indigo-100 mb-8">{data.text}</p>
                <button className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-lg shadow hover:bg-indigo-50 transition-colors">
                    {data.buttonText}
                </button>
            </div>
        </div>
    );
};

export default AtomCallToAction;
