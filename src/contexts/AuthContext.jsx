import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/index';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (savedToken) {
                // Set token immediately to allow API calls
                setToken(savedToken);

                try {
                    console.log('[AuthContext] Verifying session...');
                    const response = await authAPI.getCurrentUser();

                    if (response.success && response.user) {
                        setUser(response.user);
                        localStorage.setItem('user', JSON.stringify(response.user));
                        console.log('[AuthContext] Session verified, user data updated');
                    } else {
                        throw new Error('Invalid user data received');
                    }
                } catch (error) {
                    console.error('[AuthContext] Session verification failed:', error);

                    // If unauthorized, clear everything
                    if (error.response?.status === 401) {
                        logout();
                    } else if (savedUser) {
                        // If other error (e.g. network), fallback to saved user
                        console.log('[AuthContext] Falling back to saved user data');
                        setUser(JSON.parse(savedUser));
                    } else {
                        logout();
                    }
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            console.log('[AuthContext] Login attempt for:', email);
            const response = await authAPI.login(email, password);
            console.log('[AuthContext] API response:', response);
            const { token: newToken, user: newUser } = response;

            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));

            setToken(newToken);
            setUser(newUser);

            console.log('[AuthContext] Login successful, state updated:', { token: newToken, user: newUser });
            return { success: true };
        } catch (error) {
            console.error('[AuthContext] Login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.response?.data?.error || 'Login failed',
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const updateUser = (userData) => {
        const newUser = { ...user, ...userData };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
