import React from 'react';

const AtomImage = ({ src, alt, style }) => {
    return (
        <img
            src={src || 'https://via.placeholder.com/300x200?text=Image'}
            alt={alt || 'Placeholder'}
            style={{
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                ...style
            }}
        />
    );
};

export default AtomImage;
