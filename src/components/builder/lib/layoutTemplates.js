import { PRO_SECTIONS } from './ProfessionalSections';

export const HEADER_TEMPLATES = [
    {
        id: 'header-simple',
        name: 'Simple Header',
        thumbnail: 'https://placehold.co/400x100/indigo/white?text=Simple+Header',
        structure: {
            id: 'header-simple',
            type: 'Section',
            props: { className: 'py-4 px-6 bg-white border-b border-slate-100' },
            children: [
                {
                    type: 'Container',
                    id: 'header-cont',
                    props: { className: 'max-w-7xl mx-auto flex items-center justify-between' },
                    children: [
                        { type: 'Heading', props: { text: 'Brand', tag: 'h1', className: 'text-xl font-bold' } },
                        { type: 'Text', props: { text: 'Home  About  Contact', className: 'text-sm text-slate-600 space-x-4' } }
                    ]
                }
            ]
        }
    },
    {
        id: 'header-centered',
        name: 'Centered Logo',
        thumbnail: 'https://placehold.co/400x100/indigo/white?text=Centered+Header',
        structure: {
            id: 'header-centered',
            type: 'Section',
            props: { className: 'py-6 px-6 bg-white border-b border-slate-100' },
            children: [
                {
                    type: 'Container',
                    id: 'header-cont',
                    props: { className: 'max-w-7xl mx-auto flex flex-col items-center gap-4' },
                    children: [
                        { type: 'Heading', props: { text: 'Brand', tag: 'h1', className: 'text-2xl font-bold' } },
                        { type: 'Text', props: { text: 'Shop  Collections  About  Journal', className: 'text-sm font-medium text-slate-800 space-x-6' } }
                    ]
                }
            ]
        }
    }
];

export const FOOTER_TEMPLATES = [
    {
        id: 'footer-simple',
        name: 'Simple Footer',
        thumbnail: 'https://placehold.co/400x100/slate/white?text=Simple+Footer',
        structure: {
            id: 'footer-simple',
            type: 'Section',
            props: { className: 'py-8 px-6 bg-slate-50 border-t border-slate-200' },
            children: [
                {
                    type: 'Container',
                    id: 'footer-cont',
                    props: { className: 'max-w-7xl mx-auto text-center' },
                    children: [
                        { type: 'Text', props: { text: '© 2024 Brand Name. All rights reserved.', className: 'text-sm text-slate-500' } }
                    ]
                }
            ]
        }
    },
    {
        id: 'footer-dark',
        name: 'Dark Multi-Column',
        thumbnail: 'https://placehold.co/400x100/black/white?text=Dark+Footer',
        structure: {
            id: 'footer-dark',
            type: 'Section',
            props: { className: 'py-16 px-6 bg-slate-900 text-white' },
            children: [
                {
                    type: 'Container',
                    id: 'footer-cont',
                    props: { className: 'max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8' },
                    children: [
                        { type: 'Heading', props: { text: 'Brand', tag: 'h3', className: 'text-xl font-bold mb-4' } },
                        { type: 'Text', props: { text: 'Shop\nAbout\nContact', className: 'text-slate-400 leading-loose' } },
                        { type: 'Text', props: { text: 'Terms\nPrivacy\nReturns', className: 'text-slate-400 leading-loose' } },
                        { type: 'Text', props: { text: 'Subscribe to our newsletter for updates.', className: 'text-slate-400' } }
                    ]
                }
            ]
        }
    }
];

export const LAYOUT_TEMPLATES = [
    {
        id: 'landing-sass-pro',
        name: 'SaaS Landing (Pro)',
        description: 'High-converting, modern landing page with premium styling.',
        thumbnail: 'https://placehold.co/600x400/indigo/white?text=SaaS+Pro',
        category: 'Professional',
        structure: {
            id: 'body-content',
            type: 'Body',
            children: [
                PRO_SECTIONS.HeroModern,
                PRO_SECTIONS.FeatureGrid,
                PRO_SECTIONS.PricingPro
            ]
        }
    },
    {
        id: 'blank-slate',
        name: 'Blank Canvas',
        description: 'Start from scratch with an empty section.',
        thumbnail: 'https://placehold.co/600x400/gray/white?text=Blank+Canvas',
        category: 'Basic',
        structure: {
            id: 'body-content',
            type: 'Section',
            props: { className: 'py-20 px-6 bg-white min-h-[50vh]' },
            children: [
                { type: 'Container', id: 'cont-1', props: { className: 'max-w-7xl mx-auto' }, children: [] }
            ]
        }
    }
];
