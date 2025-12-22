import { useEffect, useRef } from 'react';

const typeIcons = {
    lead: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    message: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    ),
    task: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    system: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

const typeColors = {
    lead: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400',
    message: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
    task: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
    system: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export default function NotificationSidebar({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead, onClearAll }) {
    const sidebarRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                // Check if the click was on the bell button (which we can't easily access here, so we rely on parent's handling or layout's overlay)
                // Actually, standard sidebar pattern uses an overlay for outside clicks.
            }
        };
        // We'll implementation overlay in layout, so this might not be needed if overlay covers everything else.
    }, [isOpen, onClose]);

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`fixed inset-y-0 right-0 z-[70] w-full max-w-xs sm:w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notifications</h2>
                        <div className="flex items-center gap-4">
                            {notifications.some(n => !n.read) && (
                                <button
                                    onClick={onMarkAllAsRead}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Report Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                                <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => onMarkAsRead(notification.id)}
                                    className={`relative p-4 rounded-xl border transition-all cursor-pointer ${notification.read
                                        ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                                        : 'bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30'
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeColors[notification.type] || typeColors.system}`}>
                                            {typeIcons[notification.type] || typeIcons.system}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className={`text-sm font-medium truncate ${notification.read ? 'text-slate-900 dark:text-white' : 'text-indigo-900 dark:text-indigo-100'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                                                    {notification.time}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                    {!notification.read && (
                                        <span className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full"></span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                            <button
                                onClick={onClearAll}
                                className="w-full py-2 px-4 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
                            >
                                Clear All Notifications
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
