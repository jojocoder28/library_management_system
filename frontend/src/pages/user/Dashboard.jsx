import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Clock, BookOpen, Calendar, AlertCircle } from 'lucide-react';

const UserDashboard = () => {
    const [issues, setIssues] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [issuesRes, requestsRes] = await Promise.all([
                    api.get('/issues/'),
                    api.get('/requests/')
                ]);
                setIssues(issuesRes.data);
                setRequests(requestsRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="text-center py-10">Loading settings...</div>;

    return (
        <div className="space-y-8">
            {/* Active Borrowings */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="mr-2 h-6 w-6 text-indigo-600" />
                    My Borrowed Books
                </h2>
                {issues.filter(i => i.status === 'issued').length === 0 ? (
                    <p className="text-gray-500 italic">You have no active book loans.</p>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {issues.filter(i => i.status === 'issued').map((issue) => (
                                <li key={issue.id}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-indigo-600 truncate">
                                                Copy ID: {issue.copy_id}
                                            </p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800`}>
                                                    {issue.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                    Return by: {new Date(issue.return_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>

            {/* Pending Requests */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Clock className="mr-2 h-6 w-6 text-yellow-600" />
                    My Requests
                </h2>
                {requests.length === 0 ? (
                    <p className="text-gray-500 italic">No pending requests.</p>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {requests.map((req) => (
                                <li key={req.id}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-indigo-600 truncate">
                                                Book ID: {req.book_id}
                                            </p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {req.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    Requested on: {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>
        </div>
    );
};

export default UserDashboard;
