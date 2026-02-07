import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Book as BookIcon, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                // Fetching books. For public catalog we might need a public endpoint or use the protected on if user logged in.
                // The current backend requires authenticated user for /books/.
                // If no user, we might show a landing page or empty list with "Login to view".
                // Let's assume we want to show books. If backend restricts, we handle error.
                const response = await api.get('/books/');
                setBooks(response.data);
            } catch (error) {
                console.error("Failed to fetch books", error);
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchBooks();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleRequest = async (bookId) => {
        if (!user) {
            toast.error("Please login to request books");
            return;
        }
        try {
            await api.post('/requests/', { book_id: bookId });
            toast.success("Book requested successfully!");
        } catch (error) {
            toast.error(error.response?.data?.detail || "Failed to request book");
        }
    };

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold leading-tight text-gray-900">Book Catalog</h1>
                <p className="mt-2 text-gray-600">Browse our collection of books.</p>
            </header>

            {/* Search */}
            <div className="max-w-md relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                    type="text"
                    className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                    placeholder="Search by title or ISBN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : !user ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <BookIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Login Required</h3>
                    <p className="mt-1 text-sm text-gray-500">Please login to view the catalog and request books.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredBooks.map((book) => (
                        <div key={book.id} className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow hover:shadow-md transition-shadow">
                            <div className="flex w-full items-center justify-between space-x-6 p-6">
                                <div className="flex-1 truncate">
                                    <div className="flex items-center space-x-3">
                                        <h3 className="truncate text-sm font-medium text-gray-900">{book.title}</h3>
                                        <span className="inline-block flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                            {book.publication_year}
                                        </span>
                                    </div>
                                    <p className="mt-1 truncate text-sm text-gray-500">ISBN: {book.isbn}</p>
                                    <div className="mt-2 text-sm text-gray-500">
                                        {book.authors && book.authors.map(a => a.name).join(", ")}
                                    </div>
                                </div>
                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <BookIcon className="h-6 w-6 text-indigo-600" />
                                </div>
                            </div>
                            <div>
                                <div className="-mt-px flex divide-x divide-gray-200">
                                    <div className="flex w-0 flex-1">
                                        <button
                                            onClick={() => handleRequest(book.id)}
                                            className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                        >
                                            Request Copy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
