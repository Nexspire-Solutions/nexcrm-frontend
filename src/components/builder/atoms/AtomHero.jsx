import React from 'react';

const AtomHero = ({ content, style, id }) => {
    // Content expects: { title: "...", subtitle: "...", cta: "...", image: "..." }
    // If content is just a string (legacy), we parse it or use defaults

    const data = typeof content === 'object' ? content : {
        title: 'Hero Title',
        subtitle: 'Subtitle goes here',
        cta: 'Call to Action',
        image: 'https://via.placeholder.com/1200x600'
    };

    return (
        <div
            style={{
                position: 'relative',
                backgroundImage: `url(${data.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '80px 20px',
                textAlign: 'center',
                color: 'white',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                ...style
            }}
        >
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 1
            }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    {data.title}
                </h1>
                <p style={{ fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                    {data.subtitle}
                </p>
                <button style={{
                    backgroundColor: '#4F46E5',
                    color: 'white',
                    padding: '12px 32px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}>
                    {data.cta}
                </button>
            </div>
        </div>
    );
};

export default AtomHero;
