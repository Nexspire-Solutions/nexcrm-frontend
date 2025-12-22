import React from 'react';

export default function ProTable({ columns, data, keyField = 'id', onRowClick, isLoading = false, emptyMessage = 'No data found' }) {
    if (isLoading) {
        return (
            <div className="w-full py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="w-full py-16 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className={`px-6 py-4 whitespace-nowrap ${col.className || ''} ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {data.map((row) => (
                        <tr
                            key={row[keyField]}
                            onClick={() => onRowClick && onRowClick(row)}
                            className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                        >
                            {columns.map((col, idx) => (
                                <td key={idx} className={`px-6 py-4 ${col.className || ''} ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                                    {col.render ? col.render(row) : row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
