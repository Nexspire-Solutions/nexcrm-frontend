import axios from './axios';

// Get all permissions
export const getPermissions = () => {
    return axios.get('/roles/permissions');
};

// Update permissions for a role
export const updateRolePermissions = (role, permissions) => {
    return axios.put(`/roles/permissions/${role}`, { permissions });
};

const permissionsAPI = {
    getPermissions,
    updateRolePermissions
};

export default permissionsAPI;
