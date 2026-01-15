import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../api/axios';

// Icons
const Icons = {
    chevronLeft: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
    ),
    chevronRight: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    ),
    plus: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    ),
    close: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    clock: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function BookingCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [staff, setStaff] = useState([]);
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState('month'); // month, week, day
    const [selectedStaff, setSelectedStaff] = useState('');
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        service_id: '',
        assigned_staff: '',
        appointment_date: '',
        start_time: '',
        customer_notes: ''
    });

    useEffect(() => {
        fetchData();
    }, [currentDate, selectedStaff]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            const [appointmentsRes, staffRes, servicesRes] = await Promise.all([
                apiClient.get('/appointments', {
                    params: {
                        start_date: startDate.toISOString().split('T')[0],
                        end_date: endDate.toISOString().split('T')[0],
                        staff_id: selectedStaff || undefined,
                        limit: 500
                    }
                }),
                apiClient.get('/staff-specialists', { params: { is_active: true } }),
                apiClient.get('/services', { params: { is_active: true } })
            ]);

            setAppointments(appointmentsRes.data?.data || []);
            setStaff(staffRes.data?.data || []);
            setServices(servicesRes.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];
        // Previous month padding
        for (let i = 0; i < startingDay; i++) {
            const prevDate = new Date(year, month, -startingDay + i + 1);
            days.push({ date: prevDate, isCurrentMonth: false });
        }
        // Current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }
        // Next month padding
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }
        return days;
    };

    const getAppointmentsForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return appointments.filter(apt => apt.appointment_date === dateStr);
    };

    const navigateMonth = (direction) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setFormData(prev => ({ ...prev, appointment_date: date.toISOString().split('T')[0] }));
    };

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/appointments', formData);
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Failed to create appointment:', error);
            alert(error.response?.data?.error || 'Failed to create appointment');
        }
    };

    const resetForm = () => {
        setFormData({
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            service_id: '',
            assigned_staff: '',
            appointment_date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
            start_time: '',
            customer_notes: ''
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-500',
            confirmed: 'bg-blue-500',
            completed: 'bg-green-500',
            cancelled: 'bg-red-500',
            no_show: 'bg-gray-500'
        };
        return colors[status] || 'bg-gray-400';
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const days = getDaysInMonth(currentDate);

    if (isLoading && appointments.length === 0) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse mb-6"></div>
                <div className="h-96 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Booking Calendar"
                subtitle={`${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                breadcrumbs={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Services' },
                    { label: 'Calendar' }
                ]}
                actions={
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="btn-primary flex items-center gap-2"
                    >
                        {Icons.plus}
                        New Booking
                    </button>
                }
            />

            {/* Calendar Controls */}
            <ProCard className="mb-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigateMonth(-1)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                        >
                            {Icons.chevronLeft}
                        </button>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white min-w-[180px] text-center">
                            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <button
                            onClick={() => navigateMonth(1)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                        >
                            {Icons.chevronRight}
                        </button>
                        <button
                            onClick={goToToday}
                            className="ml-2 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-lg hover:bg-indigo-200"
                        >
                            Today
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Staff Filter */}
                        <select
                            value={selectedStaff}
                            onChange={(e) => setSelectedStaff(e.target.value)}
                            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                        >
                            <option value="">All Staff</option>
                            {staff.map(s => (
                                <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                            ))}
                        </select>

                        {/* View Mode Toggle */}
                        <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                            {['month', 'week', 'day'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-3 py-1 text-sm capitalize ${viewMode === mode
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </ProCard>

            {/* Calendar Grid */}
            <ProCard>
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
                    {DAYS.map(day => (
                        <div key={day} className="py-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7">
                    {days.map(({ date, isCurrentMonth }, index) => {
                        const dayAppointments = getAppointmentsForDate(date);
                        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

                        return (
                            <div
                                key={index}
                                onClick={() => handleDateClick(date)}
                                className={`min-h-[100px] p-2 border-b border-r border-slate-100 dark:border-slate-700 cursor-pointer transition-colors ${!isCurrentMonth ? 'bg-slate-50 dark:bg-slate-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    } ${isSelected ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}
                            >
                                <div className={`text-sm font-medium mb-1 ${isToday(date)
                                        ? 'w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center'
                                        : isCurrentMonth
                                            ? 'text-slate-900 dark:text-white'
                                            : 'text-slate-400 dark:text-slate-600'
                                    }`}>
                                    {date.getDate()}
                                </div>

                                {/* Appointment Pills */}
                                <div className="space-y-1">
                                    {dayAppointments.slice(0, 3).map(apt => (
                                        <div
                                            key={apt.id}
                                            className={`px-1.5 py-0.5 text-xs text-white rounded truncate ${getStatusColor(apt.status)}`}
                                            title={`${apt.start_time?.substring(0, 5)} - ${apt.customer_name || apt.service_name}`}
                                        >
                                            {apt.start_time?.substring(0, 5)} {apt.service_name || apt.customer_name}
                                        </div>
                                    ))}
                                    {dayAppointments.length > 3 && (
                                        <div className="text-xs text-slate-500 pl-1">
                                            +{dayAppointments.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ProCard>

            {/* Selected Date Side Panel */}
            {selectedDate && (
                <ProCard className="mt-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h3>
                        <button
                            onClick={() => { setFormData(prev => ({ ...prev, appointment_date: selectedDate.toISOString().split('T')[0] })); setShowModal(true); }}
                            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                            {Icons.plus} Add Booking
                        </button>
                    </div>

                    {getAppointmentsForDate(selectedDate).length === 0 ? (
                        <p className="text-slate-500 text-sm">No appointments scheduled</p>
                    ) : (
                        <div className="space-y-2">
                            {getAppointmentsForDate(selectedDate).map(apt => (
                                <div key={apt.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <div className={`w-1 h-12 rounded-full ${getStatusColor(apt.status)}`}></div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                {apt.customer_name}
                                            </span>
                                            <StatusBadge status={apt.status} variant={apt.status === 'confirmed' ? 'success' : 'default'} />
                                        </div>
                                        <div className="text-sm text-slate-500 flex items-center gap-2">
                                            {Icons.clock}
                                            {apt.start_time?.substring(0, 5)} - {apt.service_name}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ProCard>
            )}

            {/* Booking Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                New Booking
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                {Icons.close}
                            </button>
                        </div>

                        <form onSubmit={handleCreateAppointment} className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.appointment_date}
                                        onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time *</label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Service *</label>
                                <select
                                    required
                                    value={formData.service_id}
                                    onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                >
                                    <option value="">Select a service</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} - ₹{s.price}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Staff</label>
                                <select
                                    value={formData.assigned_staff}
                                    onChange={(e) => setFormData({ ...formData, assigned_staff: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                >
                                    <option value="">Any available</option>
                                    {staff.map(s => (
                                        <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.customer_email}
                                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.customer_phone}
                                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                                <textarea
                                    value={formData.customer_notes}
                                    onChange={(e) => setFormData({ ...formData, customer_notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    rows={2}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Create Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
