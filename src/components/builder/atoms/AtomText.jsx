import React from 'react';

const AtomText = ({ content, style, id }) => {
    return (
        <div style={{ padding: '8px', ...style }}>
            {content || 'Double click to edit text'}
        </div>
    );
};

export default AtomText;
