import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../api/axios';

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await apiClient.get('/courses');
            setCourses(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            setCourses([]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Courses"
                subtitle="Manage your educational courses"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Education' }, { label: 'Courses' }]}
                actions={<button className="btn-primary">Add Course</button>}
            />

            {courses.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400">No courses found</p>
                        <p className="text-sm text-slate-400 mt-1">Create your first course to get started</p>
                    </div>
                </ProCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <ProCard key={course.id} className="hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <StatusBadge status={course.status || 'active'} variant={course.status === 'active' ? 'success' : 'neutral'} />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{course.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{course.instructor || 'No instructor'}</p>
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-sm">
                                <span className="text-slate-500">{course.students || 0} Students</span>
                                <span className="text-slate-500">{course.duration || '-'}</span>
                            </div>
                        </ProCard>
                    ))}
                </div>
            )}
        </div>
    );
}
