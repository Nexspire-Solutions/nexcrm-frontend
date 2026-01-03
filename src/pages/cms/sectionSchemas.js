// Defines editable fields for each section type
export const SECTION_SCHEMAS = {
    'banner': {
        label: 'Hero Banner',
        fields: [
            { name: 'title', label: 'Headline', type: 'text', default: 'Welcome to Our Store' },
            { name: 'subtitle', label: 'Sub-headline', type: 'text', default: 'The best products for you' },
            { name: 'image', label: 'Background Image URL', type: 'image', default: '' },
            { name: 'buttonText', label: 'Button Text', type: 'text', default: 'Shop Now' },
            { name: 'buttonLink', label: 'Button Link', type: 'text', default: '/products' },
            { name: 'alignment', label: 'Text Alignment', type: 'select', options: ['left', 'center', 'right'], default: 'center' }
        ]
    },
    'features': {
        label: 'Features Grid',
        fields: [
            { name: 'title', label: 'Section Title', type: 'text', default: 'Why Choose Us' },
            { name: 'columns', label: 'Columns', type: 'number', default: 3 },
            // Complex list editing would go here, simplified for now
        ]
    },
    'products': {
        label: 'Product Grid',
        fields: [
            { name: 'title', label: 'Title', type: 'text', default: 'Featured Products' },
            { name: 'category', label: 'Category Filter', type: 'text', default: '' },
            { name: 'limit', label: 'Number of Products', type: 'number', default: 8 }
        ]
    },
    'categories': {
        label: 'Categories',
        fields: [
            { name: 'title', label: 'Title', type: 'text', default: 'Shop by Category' },
            { name: 'layout', label: 'Layout Style', type: 'select', options: ['grid', 'slider'], default: 'grid' }
        ]
    },
    'blog': {
        label: 'Blog Feed',
        fields: [
            { name: 'title', label: 'Latest News', type: 'text', default: 'From the Blog' },
            { name: 'limit', label: 'Posts to Show', type: 'number', default: 3 }
        ]
    },
    'form': {
        label: 'Newsletter',
        fields: [
            { name: 'title', label: 'Headline', type: 'text', default: 'Subscribe to our Newsletter' },
            { name: 'placeholder', label: 'Input Placeholder', type: 'text', default: 'Enter your email' }
        ]
    },
    'static': {
        label: 'Text Information',
        fields: [
            { name: 'content', label: 'Content', type: 'textarea', default: 'Enter your text here...' }
        ]
    },
    'dynamic_list': {
        label: 'Dynamic Data List',
        fields: [
            { name: 'title', label: 'Section Title', type: 'text', default: 'Featured Items' },
            { name: 'dataSource', label: 'Data Source', type: 'select', options: ['products', 'categories'], default: 'products' },
            { name: 'layout', label: 'Layout Information', type: 'select', options: ['grid', 'list'], default: 'grid' },
            { name: 'limit', label: 'Item Limit', type: 'number', default: 4 }
        ]
    }
};
