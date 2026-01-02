import React from 'react';

const AtomContainer = ({ children, style, columns = 1 }) => {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: '1rem',
                padding: '1rem',
                minHeight: '50px',
                border: '1px dashed #e2e8f0', // Visual guide
                ...style
            }}
        >
            {children}
        </div>
    );
};

export default AtomContainer;
