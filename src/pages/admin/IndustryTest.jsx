import { Link } from 'react-router-dom';

const industries = [
    {
        name: 'E-commerce',
        color: 'from-purple-500 to-indigo-600',
        pages: [
            { name: 'Products', path: '/products' },
            { name: 'Orders', path: '/orders' },
            { name: 'Inventory', path: '/inventory' },
            { name: 'Customers', path: '/customers' },
            { name: 'Reviews', path: '/reviews' },
            { name: 'Coupons', path: '/coupons' },
            { name: 'Shipping', path: '/shipping' },
            { name: 'CMS', path: '/cms' },
            { name: 'Vendors', path: '/vendors' },
            { name: 'Reports', path: '/reports' }
        ]
    },
    {
        name: 'Real Estate',
        color: 'from-green-500 to-emerald-600',
        pages: [
            { name: 'Properties', path: '/properties' },
            { name: 'Viewings', path: '/viewings' },
            { name: 'Listings', path: '/listings' }
        ]
    },
    {
        name: 'Healthcare',
        color: 'from-red-500 to-pink-600',
        pages: [
            { name: 'Patients', path: '/patients' },
            { name: 'Prescriptions', path: '/prescriptions' }
        ]
    },
    {
        name: 'Education',
        color: 'from-blue-500 to-cyan-600',
        pages: [
            { name: 'Courses', path: '/courses' },
            { name: 'Students', path: '/students' },
            { name: 'Enrollments', path: '/enrollments' }
        ]
    },
    {
        name: 'Hospitality',
        color: 'from-amber-500 to-orange-600',
        pages: [
            { name: 'Rooms', path: '/rooms' },
            { name: 'Reservations', path: '/reservations' },
            { name: 'Housekeeping', path: '/housekeeping' }
        ]
    },
    {
        name: 'Fitness',
        color: 'from-teal-500 to-green-600',
        pages: [
            { name: 'Members', path: '/members' },
            { name: 'Classes', path: '/classes' },
            { name: 'Trainers', path: '/trainers' }
        ]
    },
    {
        name: 'Legal',
        color: 'from-slate-500 to-zinc-600',
        pages: [
            { name: 'Cases', path: '/cases' },
            { name: 'Billing', path: '/billing' }
        ]
    },
    {
        name: 'Manufacturing',
        color: 'from-yellow-500 to-amber-600',
        pages: [
            { name: 'Production', path: '/production' },
            { name: 'Work Orders', path: '/work-orders' }
        ]
    },
    {
        name: 'Logistics',
        color: 'from-sky-500 to-blue-600',
        pages: [
            { name: 'Shipments', path: '/shipments' },
            { name: 'Tracking', path: '/tracking' },
            { name: 'Vehicles', path: '/vehicles' }
        ]
    },
    {
        name: 'Restaurant',
        color: 'from-rose-500 to-red-600',
        pages: [
            { name: 'Menu', path: '/menu' },
            { name: 'Kitchen Orders', path: '/kitchen-orders' },
            { name: 'Tables', path: '/tables' }
        ]
    },
    {
        name: 'Salon',
        color: 'from-fuchsia-500 to-purple-600',
        pages: [
            { name: 'Bookings', path: '/bookings' },
            { name: 'Services', path: '/salon-services' },
            { name: 'Staff', path: '/staff' }
        ]
    },
    {
        name: 'Services',
        color: 'from-indigo-500 to-violet-600',
        pages: [
            { name: 'Appointments', path: '/appointments' },
            { name: 'Services', path: '/services' },
            { name: 'Clients', path: '/clients' }
        ]
    }
];

export default function IndustryTest() {
    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Industry Modules Test Page
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Click on any page below to test if it loads correctly
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {industries.map((industry) => (
                    <div
                        key={industry.name}
                        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
                    >
                        <div className={`h-2 bg-gradient-to-r ${industry.color}`}></div>
                        <div className="p-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                                {industry.name}
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {industry.pages.map((page) => (
                                    <Link
                                        key={page.path}
                                        to={page.path}
                                        className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        {page.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Quick Links</h3>
                <div className="flex flex-wrap gap-2">
                    <Link to="/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Dashboard
                    </Link>
                    <Link to="/leads" className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
                        Leads
                    </Link>
                    <Link to="/employees" className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
                        Employees
                    </Link>
                    <Link to="/communications/chat" className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
                        Team Chat
                    </Link>
                </div>
            </div>
        </div>
    );
}
