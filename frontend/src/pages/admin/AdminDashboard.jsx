import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Book, User, ClipboardList, CheckCircle, XCircle, Plus, Search } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [issues, setIssues] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reqRes, issueRes, bookRes] = await Promise.all([
                api.get('/requests/'),
                api.get('/issues/'),
                api.get('/books/')
            ]);
            setRequests(reqRes.data);
            setIssues(issueRes.data);
            setBooks(bookRes.data);
        } catch (error) {
            console.error("Fetch error", error);
            toast.error("Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (request) => {
        try {
            const copiesRes = await api.get('/copies/');
            const availableCopy = copiesRes.data.find(c => c.book_id === request.book_id && c.status === 'available');

            if (!availableCopy) {
                toast.error("No available copies for this book.");
                return;
            }

            const issueData = {
                copy_id: availableCopy.id,
                user_id: request.user_id,
                return_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };

            await api.post('/issues/', issueData);
            await api.put(`/requests/${request.id}`, { status: 'approved' });

            toast.success("Request approved and book issued");
            fetchData();
        } catch (error) {
            toast.error("Failed to approve request: " + (error.response?.data?.detail || error.message));
        }
    };

    const handleReturn = async (issueId) => {
        try {
            await api.post(`/issues/${issueId}/return`);
            toast.success("Book returned successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to return book");
        }
    };

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Overview of library operations and management.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        onClick={fetchData}
                        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {[
                        { id: 'requests', name: 'Requests', icon: ClipboardList },
                        { id: 'issues', name: 'Active Issues', icon: User },
                        { id: 'books', name: 'Inventory', icon: Book },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium`}
                        >
                            <tab.icon className={`${activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'} -ml-0.5 mr-2 h-5 w-5`} aria-hidden="true" />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="mt-4">
                    {/* REQUESTS TABLE */}
                    {activeTab === 'requests' && (
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Request ID</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">User ID</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Book ID</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {requests.filter(r => r.status === 'pending').length === 0 && (
                                        <tr><td colSpan="5" className="p-8 text-center text-gray-500">No pending requests found.</td></tr>
                                    )}
                                    {requests.filter(r => r.status === 'pending').map((req) => (
                                        <tr key={req.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{req.id}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{req.user_id}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{req.book_id}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                                                    Pending
                                                </span>
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button
                                                    onClick={() => handleApprove(req)}
                                                    className="text-green-600 hover:text-green-900 flex items-center justify-end w-full"
                                                >
                                                    Approve <CheckCircle className="ml-1 h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ISSUES TABLE */}
                    {activeTab === 'issues' && (
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Issue ID</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Copy ID</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">User ID</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Due Date</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {issues.filter(i => i.status === 'issued').length === 0 && (
                                        <tr><td colSpan="5" className="p-8 text-center text-gray-500">No active issues found.</td></tr>
                                    )}
                                    {issues.filter(i => i.status === 'issued').map((issue) => (
                                        <tr key={issue.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{issue.id}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{issue.copy_id}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{issue.user_id}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {new Date(issue.return_date).toLocaleDateString()}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button
                                                    onClick={() => handleReturn(issue.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Return
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* BOOKS TABLE */}
                    {activeTab === 'books' && (
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Book Title</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ISBN</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Year</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Edit</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {books.map((book) => (
                                        <tr key={book.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                {book.title}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{book.isbn}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{book.publication_year}</td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
