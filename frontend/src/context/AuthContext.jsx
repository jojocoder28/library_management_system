import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/users/me');
                    setUser(response.data);
                } catch (error) {
                    console.error("Auth check failed", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (username, password) => {
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await api.post('/auth/token', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const { access_token } = response.data;
            localStorage.setItem('token', access_token);

            // Fetch user details immediately
            const userResponse = await api.get('/users/me');
            setUser(userResponse.data);
            toast.success('Login successful!');
            return true;
        } catch (error) {
            toast.error('Invalid credentials');
            return false;
        }
    };

    const register = async (email, password) => {
        try {
            await api.post('/users/', { email, password, role: 'member' });
            toast.success('Registration successful! Please login.');
            return true;
        } catch (error) {
            toast.error('Registration failed. Email might differ.');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        toast.success('Logged out');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
