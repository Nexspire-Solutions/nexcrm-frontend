import { useState } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';

const mockCourses = [
    { id: 1, title: 'Web Development Bootcamp', instructor: 'Sarah Johnson', students: 45, duration: '12 weeks', status: 'active', price: '$599' },
    { id: 2, title: 'Data Science Fundamentals', instructor: 'Michael Chen', students: 32, duration: '10 weeks', status: 'active', price: '$799' },
    { id: 3, title: 'UI/UX Design Mastery', instructor: 'Emily Davis', students: 28, duration: '8 weeks', status: 'upcoming', price: '$499' },
    { id: 4, title: 'Mobile App Development', instructor: 'David Wilson', students: 18, duration: '14 weeks', status: 'completed', price: '$699' },
];

export default function Courses() {
    const [courses] = useState(mockCourses);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Courses"
                subtitle="Manage your educational programs"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Education' }, { label: 'Courses' }]}
                actions={<button className="btn-primary">Create Course</button>}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <ProCard key={course.id} className="hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{course.title}</h3>
                            <StatusBadge
                                status={course.status}
                                variant={course.status === 'active' ? 'success' : course.status === 'upcoming' ? 'info' : 'neutral'}
                            />
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{course.instructor}</span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span>{course.students} Students</span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{course.duration}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <span className="text-2xl font-bold text-indigo-600">{course.price}</span>
                            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-900">View Details</button>
                        </div>
                    </ProCard>
                ))}
            </div>
        </div>
    );
}
