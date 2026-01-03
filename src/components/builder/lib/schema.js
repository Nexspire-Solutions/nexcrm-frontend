import { FiType, FiLayout, FiImage, FiBox, FiCode } from 'react-icons/fi';

// Component Definitions
export const COMPONENT_SCHEMA = {
    // --- Layout ---
    'Body': {
        type: 'Body',
        label: 'Body',
        icon: FiLayout,
        isCanvas: true, // Can accept children
        props: {
            className: 'min-h-screen bg-slate-50'
        }
    },
    'Section': {
        type: 'Section',
        label: 'Section',
        icon: FiLayout,
        isCanvas: true,
        props: {
            className: 'py-20 px-6 bg-white'
        },
        defaultChildren: [
            { type: 'Container', id: '' } // Will generate ID dynamically
        ]
    },
    'Container': {
        type: 'Container',
        label: 'Container',
        icon: FiBox,
        isCanvas: true,
        props: {
            className: 'max-w-7xl mx-auto w-full'
        }
    },
    'Grid': {
        type: 'Grid',
        label: 'Grid 2-Col',
        icon: FiLayout,
        isCanvas: true,
        props: {
            className: 'grid grid-cols-1 md:grid-cols-2 gap-8'
        }
    },

    // --- Content ---
    'Heading': {
        type: 'Heading',
        label: 'Heading',
        icon: FiType,
        isCanvas: false,
        props: {
            tag: 'h2',
            text: 'New Heading',
            className: 'text-3xl font-bold text-slate-900 mb-4'
        }
    },
    'Text': {
        type: 'Text',
        label: 'Text Block',
        icon: FiType,
        isCanvas: false,
        props: {
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            className: 'text-lg text-slate-600 leading-relaxed'
        }
    },
    'Button': {
        type: 'Button',
        label: 'Button',
        icon: FiBox,
        isCanvas: false,
        props: {
            text: 'Click Me',
            href: '#',
            className: 'inline-flex justify-center items-center py-3 px-8 text-base font-medium text-center text-white rounded-lg bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:ring-indigo-300'
        }
    },
    'Image': {
        type: 'Image',
        label: 'Image',
        icon: FiImage,
        isCanvas: false,
        props: {
            src: 'https://placehold.co/600x400',
            alt: 'Placeholder',
            className: 'w-full h-auto rounded-lg shadow-lg'
        }
    },
    'HtmlBlock': {
        type: 'HtmlBlock',
        label: 'Raw HTML',
        icon: FiCode,
        isCanvas: false,
        props: {
            html: '<div class="p-4 bg-yellow-100 text-yellow-800 rounded">Raw HTML Content</div>',
            className: ''
        }
    }
};

export const createNode = (type) => {
    const schema = COMPONENT_SCHEMA[type];
    if (!schema) return null;

    const pipeline = [
        {
            id: crypto.randomUUID(),
            type: type,
            props: { ...schema.props },
            children: []
        }
    ];

    // Hydrate default children if any (recursive later, flat for now)
    if (schema.defaultChildren) {
        schema.defaultChildren.forEach(child => {
            pipeline[0].children.push({
                id: crypto.randomUUID(),
                type: child.type,
                props: { ...COMPONENT_SCHEMA[child.type].props },
                children: []
            });
        });
    }

    return pipeline[0]; // Return the root of this structure
};

// Recursive function to deep clone a node tree and regenerate all IDs
export const cloneStructureWithNewIds = (node) => {
    const newNode = {
        ...node,
        id: crypto.randomUUID(), // New ID
        props: { ...node.props } // Shallow copy props
    };

    if (node.children && Array.isArray(node.children)) {
        newNode.children = node.children.map(child => cloneStructureWithNewIds(child));
    }

    return newNode;
};
