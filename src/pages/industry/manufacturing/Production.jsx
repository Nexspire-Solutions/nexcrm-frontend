import { useState } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';

const mockProduction = [
    { id: 'WO-001', product: 'Widget A', quantity: 500, completed: 350, status: 'in-progress', dueDate: '2024-12-25' },
    { id: 'WO-002', product: 'Component B', quantity: 1000, completed: 1000, status: 'completed', dueDate: '2024-12-20' },
    { id: 'WO-003', product: 'Assembly C', quantity: 200, completed: 0, status: 'pending', dueDate: '2024-12-30' },
    { id: 'WO-004', product: 'Part D', quantity: 750, completed: 500, status: 'in-progress', dueDate: '2024-12-28' },
];

export default function Production() {
    const [orders] = useState(mockProduction);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Production Orders"
                subtitle="Track manufacturing work orders"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Manufacturing' }, { label: 'Production' }]}
                actions={<button className="btn-primary">New Work Order</button>}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <ProCard className="bg-indigo-600 text-white border-none">
                    <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Active Orders</p>
                    <p className="text-3xl font-bold mt-2">12</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Completion Rate</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">78%</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Units (Today)</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">2,450</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Delayed</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">2</p>
                </ProCard>
            </div>

            <div className="space-y-4">
                {orders.map(order => (
                    <ProCard key={order.id}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{order.product}</h3>
                                <p className="text-sm text-slate-500">Work Order: {order.id}</p>
                            </div>
                            <StatusBadge
                                status={order.status}
                                variant={order.status === 'completed' ? 'success' : order.status === 'in-progress' ? 'info' : 'neutral'}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Quantity</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white">{order.quantity}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Completed</p>
                                <p className="text-lg font-semibold text-indigo-600">{order.completed}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Due Date</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white">{order.dueDate}</p>
                            </div>
                        </div>

                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                                className="bg-indigo-600 h-2 rounded-full transition-all"
                                style={{ width: `${(order.completed / order.quantity) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 text-right">{Math.round((order.completed / order.quantity) * 100)}% Complete</p>
                    </ProCard>
                ))}
            </div>
        </div>
    );
}
