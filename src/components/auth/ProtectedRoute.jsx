import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionsContext';

export default function ProtectedRoute({ allowedRoles, requiredPermission }) {
    const { user, loading, isAuthenticated } = useAuth();
    const { hasPermission } = usePermissions();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role || 'user')) {
        // User is authenticated but doesn't have the required role
        return <Navigate to="/dashboard" replace />;
    }

    if (requiredPermission) {
        const [module, action] = requiredPermission;
        if (!hasPermission(module, action || 'read')) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <Outlet />;
}
