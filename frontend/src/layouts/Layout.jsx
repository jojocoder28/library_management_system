import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Book, User, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Book className="h-8 w-8 text-indigo-600" />
                                <span className="ml-2 text-xl font-bold text-gray-900">LMS</span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link to="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Catalog
                                </Link>
                                {user && (
                                    <Link to="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        Dashboard
                                    </Link>
                                )}
                                {user?.role === 'admin' && (
                                    <Link to="/admin" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        Admin
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-700">Hello, {user.email}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex space-x-4">
                                    <Link to="/login" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                                    <Link to="/register" className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium">Register</Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                            >
                                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="sm:hidden">
                        <div className="pt-2 pb-3 space-y-1">
                            <Link to="/" className="bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Catalog</Link>
                            {user && <Link to="/dashboard" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Dashboard</Link>}
                        </div>
                        <div className="pt-4 pb-4 border-t border-gray-200">
                            {user ? (
                                <div className="flex items-center px-4">
                                    <div className="flex-shrink-0">
                                        <User className="h-10 w-10 rounded-full bg-gray-200 p-2" />
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-gray-800">{user.email}</div>
                                    </div>
                                    <button onClick={handleLogout} className="ml-auto flex-shrink-0 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500">
                                        <LogOut className="h-6 w-6" />
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-3 space-y-1">
                                    <Link to="/login" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Login</Link>
                                    <Link to="/register" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Register</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
