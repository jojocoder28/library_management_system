import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Book as BookIcon, Search, ArrowRight, Library, Users, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Home = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Only fetch books if user is logged in, OR if we want to show public catalog.
        // Per requirement: "without login the user can not view any other pages except landing page"
        // We will show a teaser on landing page for non-logged in users.
        if (user) {
            const fetchBooks = async () => {
                try {
                    const response = await api.get('/books/');
                    setBooks(response.data);
                } catch (error) {
                    console.error("Failed to fetch books", error);
                } finally {
                    setLoading(false);
                }
            };
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

    // Landing Page for Guest Users
    if (!user) {
        return (
            <div className="bg-white">
                {/* Hero Section */}
                <div className="relative isolate px-6 pt-14 lg:px-8">
                    <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
                        <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                                Announcing our new digital catalog. <a href="#" className="font-semibold text-indigo-600"><span className="absolute inset-0" aria-hidden="true" />Read more <span aria-hidden="true">&rarr;</span></a>
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            Knowledge at your fingertips
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Access thousands of books, journals, and research papers. Manage your borrowings and requests seamlessly with our new Library Management System.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link to="/register" className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                Get Started
                            </Link>
                            <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900">
                                Log in <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-indigo-600">Faster & Better</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Everything you need to manage your reading
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                            <div className="relative pl-16">
                                <dt className="text-base font-semibold leading-7 text-gray-900">
                                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                        <Library className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                    Extensive Catalog
                                </dt>
                                <dd className="mt-2 text-base leading-7 text-gray-600">
                                    Browse through our vast collection of physical and digital books.
                                </dd>
                            </div>
                            <div className="relative pl-16">
                                <dt className="text-base font-semibold leading-7 text-gray-900">
                                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                        <Clock className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                    Real-time Availability
                                </dt>
                                <dd className="mt-2 text-base leading-7 text-gray-600">
                                    Check if a book is available or when it is expected to return.
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        );
    }

    // Dashboard / Catalog view for Logged In Users
    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold leading-tight text-gray-900">Book Catalog</h1>
                    <p className="mt-2 text-gray-600">Browse our collection of books.</p>
                </div>
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
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredBooks.map((book) => (
                        <div key={book.id} className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow hover:shadow-lg transition-all duration-200 border border-gray-100">
                            <div className="flex w-full items-center justify-between space-x-6 p-6">
                                <div className="flex-1 truncate">
                                    <div className="flex items-center space-x-3">
                                        <h3 className="truncate text-lg font-medium text-gray-900 mb-1">{book.title}</h3>
                                    </div>
                                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 mb-2">
                                        {book.publication_year}
                                    </span>
                                    <p className="mt-1 truncate text-sm text-gray-500">ISBN: {book.isbn}</p>
                                    <div className="mt-2 text-sm text-gray-600 italic">
                                        By {book.authors && book.authors.map(a => a.name).join(", ")}
                                    </div>
                                </div>
                                <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center">
                                    <BookIcon className="h-7 w-7 text-indigo-600" />
                                </div>
                            </div>
                            <div>
                                <div className="-mt-px flex divide-x divide-gray-200">
                                    <div className="flex w-0 flex-1">
                                        <button
                                            onClick={() => handleRequest(book.id)}
                                            className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-b-lg py-4 text-sm font-semibold text-indigo-600 hover:text-indigo-500 hover:bg-gray-50 transition-colors"
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
