import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Book, User, ClipboardList, CheckCircle, XCircle, Plus } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [issues, setIssues] = useState([]);
    const [books, setBooks] = useState([]); // For managing inventory
    const [loading, setLoading] = useState(true);

    // Form State for New Book
    const [newBook, setNewBook] = useState({ title: '', isbn: '', publisher_id: 1, publication_year: 2023, author_ids: [] });

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
            // Need to find a copy. In a real app, we might select a specific copy.
            // For now, let's assume we pick the first available copy of this book.
            // But the backend requires copy_id. 
            // We first need to check availability.

            // Simplified Logic: 
            // 1. Get copies of the book.
            // 2. Pick first available.
            // 3. Issue it.

            const copiesRes = await api.get('/copies/'); // This endpoint returns ALL copies. Might be inefficient.
            // Ideally we need /books/{id}/copies.
            // Based on my backend implementation, /copies/ returns all.

            const availableCopy = copiesRes.data.find(c => c.book_id === request.book_id && c.status === 'available');

            if (!availableCopy) {
                toast.error("No available copies for this book.");
                return;
            }

            const issueData = {
                copy_id: availableCopy.id,
                user_id: request.user_id,
                return_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days later
            };

            await api.post('/issues/', issueData);
            // Also update request status to approved
            await api.put(`/requests/${request.id}`, { status: 'approved' });

            toast.success("Request approved and book issued");
            fetchData(); // Refresh
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
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-2 text-sm text-gray-700">Manage library operations.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {['requests', 'issues', 'books'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm capitalize`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {loading ? <div>Loading...</div> : (
                <div className="mt-4">
                    {activeTab === 'requests' && (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {requests.filter(r => r.status === 'pending').length === 0 && <li className="p-4 text-gray-500">No pending requests.</li>}
                                {requests.filter(r => r.status === 'pending').map((req) => (
                                    <li key={req.id} className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-indigo-600">Request #{req.id}</p>
                                            <p className="text-sm text-gray-500">User ID: {req.user_id} | Book ID: {req.book_id}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleApprove(req)} className="p-2 bg-green-100 text-green-800 rounded-full hover:bg-green-200">
                                                <CheckCircle className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {activeTab === 'issues' && (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {issues.filter(i => i.status === 'issued').length === 0 && <li className="p-4 text-gray-500">No active issues.</li>}
                                {issues.filter(i => i.status === 'issued').map((issue) => (
                                    <li key={issue.id} className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-indigo-600">Issue #{issue.id}</p>
                                            <p className="text-sm text-gray-500">Copy ID: {issue.copy_id} | User ID: {issue.user_id}</p>
                                            <p className="text-xs text-gray-400">Due: {new Date(issue.return_date).toLocaleDateString()}</p>
                                        </div>
                                        <button onClick={() => handleReturn(issue.id)} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-200">
                                            Return Book
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {activeTab === 'books' && (
                        <div>
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Inventory</h3>
                            {/* Placeholder for Add Book Form - kept simple for now */}
                            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                <ul className="divide-y divide-gray-200">
                                    {books.map((book) => (
                                        <li key={book.id} className="p-4">
                                            <p className="text-sm font-medium text-gray-900">{book.title}</p>
                                            <p className="text-sm text-gray-500">ISBN: {book.isbn}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
