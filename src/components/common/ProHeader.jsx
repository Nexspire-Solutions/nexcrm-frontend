import React from 'react';
import { Link } from 'react-router-dom';

export default function ProHeader({ title, subtitle, breadcrumbs = [], actions }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                {breadcrumbs.length > 0 && (
                    <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                        {breadcrumbs.map((crumb, idx) => (
                            <React.Fragment key={crumb.label}>
                                {idx > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
                                {crumb.to ? (
                                    <Link to={crumb.to} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-slate-900 dark:text-white font-medium">{crumb.label}</span>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>
                )}
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
                {subtitle && <p className="text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
            </div>
            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
}
