
export const UI_KIT_TEMPLATES = {
    HeroSection: {
        type: 'Section',
        props: { padding: '4rem', backgroundColor: '#f8fafc' },
        children: [
            {
                type: 'Container',
                props: { maxWidth: '1200px' },
                children: [
                    {
                        type: 'Grid',
                        props: { columns: 2, gap: '2rem' },
                        children: [
                            {
                                type: 'Container',
                                props: {},
                                children: [
                                    { type: 'Heading', props: { text: 'Build Faster with UI Kit', level: 'h1', align: 'left', color: '#1e293b' } },
                                    { type: 'Text', props: { text: 'Drag and drop pre-made sections to construct your landing pages in minutes.', align: 'left', color: '#64748b' } },
                                    { type: 'Button', props: { text: 'Get Started', variant: 'primary', align: 'left' } }
                                ]
                            },
                            {
                                type: 'Image',
                                props: { src: 'https://via.placeholder.com/600x400', alt: 'Hero Image' }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    PricingTable: {
        type: 'Section',
        props: { padding: '4rem', backgroundColor: '#ffffff' },
        children: [
            {
                type: 'Container',
                props: { maxWidth: '1000px' },
                children: [
                    { type: 'Heading', props: { text: 'Simple Pricing', level: 'h2', align: 'center', color: '#1e293b' } },
                    {
                        type: 'Grid',
                        props: { columns: 3, gap: '2rem' },
                        children: [
                            // Plan 1
                            { type: 'Container', props: { padding: '2rem', border: '1px solid #e2e8f0' }, children: [{ type: 'Heading', props: { text: 'Basic', level: 'h3' } }, { type: 'Text', props: { text: '$29/mo' } }] },
                            // Plan 2
                            { type: 'Container', props: { padding: '2rem', border: '2px solid #6366f1' }, children: [{ type: 'Heading', props: { text: 'Pro', level: 'h3' } }, { type: 'Text', props: { text: '$99/mo' } }] },
                            // Plan 3
                            { type: 'Container', props: { padding: '2rem', border: '1px solid #e2e8f0' }, children: [{ type: 'Heading', props: { text: 'Enterprise', level: 'h3' } }, { type: 'Text', props: { text: 'Custom' } }] }
                        ]
                    }
                ]
            }
        ]
    }
};
