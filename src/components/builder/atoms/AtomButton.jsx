import React from 'react';

const AtomButton = ({ content, style }) => {
    return (
        <button
            style={{
                padding: '10px 20px',
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                ...style
            }}
        >
            {content || 'Button'}
        </button>
    );
};

export default AtomButton;
