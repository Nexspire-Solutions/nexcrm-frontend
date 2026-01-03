export const PRO_SECTIONS = {
    HeroModern: {
        id: 'hero-modern',
        type: 'Section',
        props: { className: 'relative isolate overflow-hidden bg-white' },
        children: [
            {
                type: 'Container', // Background/Decorations
                props: { className: 'absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80' },
                children: [
                    {
                        type: 'HtmlBlock',
                        props: {
                            html: '<div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>'
                        }
                    }
                ]
            },
            {
                type: 'Container',
                props: { className: 'mx-auto max-w-2xl py-32 sm:py-48 lg:py-56' },
                children: [
                    {
                        type: 'Container',
                        props: { className: 'hidden sm:mb-8 sm:flex sm:justify-center' },
                        children: [
                            {
                                type: 'HtmlBlock',
                                props: {
                                    html: '<div class="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">Announcing our next round of funding. <a href="#" class="font-semibold text-indigo-600"><span class="absolute inset-0" aria-hidden="true"></span>Read more <span aria-hidden="true">&rarr;</span></a></div>'
                                }
                            }
                        ]
                    },
                    {
                        type: 'Container',
                        props: { className: 'text-center' },
                        children: [
                            {
                                type: 'Heading',
                                props: {
                                    tag: 'h1',
                                    text: 'Data to enrich your online business',
                                    className: 'text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'
                                }
                            },
                            {
                                type: 'Text',
                                props: {
                                    text: 'Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat fugiat aliqua.',
                                    className: 'mt-6 text-lg leading-8 text-gray-600'
                                }
                            },
                            {
                                type: 'Container',
                                props: { className: 'mt-10 flex items-center justify-center gap-x-6' },
                                children: [
                                    { type: 'Button', props: { text: 'Get started', className: 'rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' } },
                                    { type: 'Button', props: { text: 'Learn more <span aria-hidden="true">→</span>', className: 'text-sm font-semibold leading-6 text-gray-900' } }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    FeatureGrid: {
        id: 'features-pro',
        type: 'Section',
        props: { className: 'bg-white py-24 sm:py-32' },
        children: [
            {
                type: 'Container',
                props: { className: 'mx-auto max-w-7xl px-6 lg:px-8' },
                children: [
                    {
                        type: 'Container',
                        props: { className: 'mx-auto max-w-2xl lg:text-center' },
                        children: [
                            { type: 'Heading', props: { text: 'Deploy faster', tag: 'h2', className: 'text-base font-semibold leading-7 text-indigo-600' } },
                            { type: 'Heading', props: { text: 'Everything you need to deploy your app', tag: 'p', className: 'mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl' } },
                            { type: 'Text', props: { text: 'Quis tellus eget adipiscing convallis sit sit eget aliquet quis. Suspendisse eget egestas a elementum pulvinar et feugiat blandit at. In mi viverra elit nunc.', className: 'mt-6 text-lg leading-8 text-gray-600' } }
                        ]
                    },
                    {
                        type: 'Container',
                        props: { className: 'mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl' },
                        children: [
                            {
                                type: 'Grid',
                                props: { className: 'grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16' },
                                children: [
                                    // Feature 1
                                    {
                                        type: 'Container',
                                        props: { className: 'relative pl-16' },
                                        children: [
                                            {
                                                type: 'Container',
                                                props: { className: 'absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600' },
                                                children: [
                                                    {
                                                        type: 'HtmlBlock',
                                                        props: {
                                                            html: '<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3.75m-3-3.75l-3 3.75M12 9.75V4.5m0 12.75l3 3.75m-3-3.75l-3 3.75" /></svg>'
                                                        }
                                                    }
                                                ]
                                            },
                                            { type: 'Heading', props: { text: 'Push to deploy', tag: 'dt', className: 'text-base font-semibold leading-7 text-gray-900' } },
                                            { type: 'Text', props: { text: 'Morbi viverra dui mi arcu sed. Tellus semper adipiscing suspendisse semper morbi. Odio urna massa nunc massa.', className: 'mt-2 text-base leading-7 text-gray-600' } }
                                        ]
                                    },
                                    // Feature 2
                                    {
                                        type: 'Container',
                                        props: { className: 'relative pl-16' },
                                        children: [
                                            {
                                                type: 'Container',
                                                props: { className: 'absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600' },
                                                children: [
                                                    {
                                                        type: 'HtmlBlock',
                                                        props: {
                                                            html: '<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>'
                                                        }
                                                    }
                                                ]
                                            },
                                            { type: 'Heading', props: { text: 'SSL certificates', tag: 'dt', className: 'text-base font-semibold leading-7 text-gray-900' } },
                                            { type: 'Text', props: { text: 'Sit quis amet rutrum tellus ullamcorper ultricies libero dolor eget. Sem sodales gravida quam turpis enim lacus amet.', className: 'mt-2 text-base leading-7 text-gray-600' } }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    PricingPro: {
        id: 'pricing-pro',
        type: 'Section',
        props: { className: 'bg-white py-24 sm:py-32' },
        children: [
            {
                type: 'Container',
                props: { className: 'mx-auto max-w-7xl px-6 lg:px-8' },
                children: [
                    {
                        type: 'Container',
                        props: { className: 'mx-auto max-w-2xl sm:text-center' },
                        children: [
                            { type: 'Heading', props: { text: 'Pricing', tag: 'h2', className: 'text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl' } },
                            { type: 'Text', props: { text: 'Distinctio et nulla eum soluta et acusamus consectetur. Barba non esse cetra Eiusmod sunt.', className: 'mt-6 text-lg leading-8 text-gray-600' } }
                        ]
                    },
                    {
                        type: 'Container',
                        props: { className: 'mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none' },
                        children: [
                            {
                                type: 'Container',
                                props: { className: 'p-8 sm:p-10 lg:flex-auto' },
                                children: [
                                    { type: 'Heading', props: { text: 'Lifetime membership', tag: 'h3', className: 'text-2xl font-bold tracking-tight text-gray-900' } },
                                    { type: 'Text', props: { text: 'Lorem ipsum dolor sit amet consect etur adipisicing elit. Itaque amet indis perferendis blanditiis repellendus etur quidem assumenda.', className: 'mt-6 text-base leading-7 text-gray-600' } }
                                ]
                            },
                            {
                                type: 'Container',
                                props: { className: '-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0' },
                                children: [
                                    {
                                        type: 'Container',
                                        props: { className: 'rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16' },
                                        children: [
                                            {
                                                type: 'Container', props: { className: 'mx-auto max-w-xs px-8' }, children: [
                                                    { type: 'Text', props: { text: 'Pay once, own it forever', className: 'text-base font-semibold text-gray-600' } },
                                                    { type: 'Text', props: { text: '$349', className: 'mt-6 flex items-baseline justify-center gap-x-2 text-5xl font-bold tracking-tight text-gray-900' } },
                                                    { type: 'Button', props: { text: 'Get access', className: 'mt-10 block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' } }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
};
