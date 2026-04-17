'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, User } from 'lucide-react';
import { searchMovies, posterUrl } from '@/lib/tmdb';
import useAuthStore from '@/store/useAuthStore';
import Image from 'next/image';
import { getSession } from 'next-auth/react'; // Need client-side auth fetch since it's a dummy app, or just useAuthStore

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const pathname = usePathname();
    const { user, setUser } = useAuthStore();

    useEffect(() => {
        // Initial fetch user session purely for UI (Dummy implementation could also rely on next-auth useSession)
        // Here we'll just check if auth exists, but since we didn't add SessionProvider, we rely on server passing it or using standard fetches.
        // For simplicity, we assume we fetch session.
        getSession().then((session) => {
            if (session?.user) {
                setUser(session.user);
            }
        });
    }, [setUser]);

    useEffect(() => {
        if (searchQuery.length < 3) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            const data = await searchMovies(searchQuery);
            if (data && data.results) {
                setSearchResults(data.results.slice(0, 5));
            }
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const closeMenu = () => setMobileOpen(false);

    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-gray-950/80 border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-2xl font-bold tracking-tight">
                            <span className="text-primary-500">Book</span>MyShow
                        </Link>
                    </div>

                    {/* Desktop Search */}
                    <div className="hidden md:block flex-1 max-w-md mx-8 relative">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search for Movies, Events, Plays..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all"
                            />

                            {/* Search Dropdown */}
                            {(searchResults.length > 0 || isSearching) && (
                                <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                                    {isSearching ? (
                                        <div className="p-4 text-center text-sm text-gray-400">Searching...</div>
                                    ) : (
                                        <ul className="flex flex-col">
                                            {searchResults.map((movie) => (
                                                <li key={movie.id} className="hover:bg-gray-800 border-b border-gray-800 last:border-0 transition-colors">
                                                    <Link
                                                        href={`/movies/${movie.id}`}
                                                        className="flex items-center p-3 gap-4"
                                                        onClick={() => { setSearchQuery(''); closeMenu(); }}
                                                    >
                                                        <div className="w-10 h-14 relative rounded overflow-hidden bg-gray-800 flex-shrink-0">
                                                            <Image
                                                                src={posterUrl(movie.poster_path, 'w92')}
                                                                alt={movie.title}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="text-sm font-medium text-white truncate">{movie.title}</span>
                                                            <span className="text-xs text-gray-400 truncate">{new Date(movie.release_date).getFullYear()}</span>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop Auth Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/movies" className="text-sm font-medium hover:text-primary-500 transition-colors">
                            Movies
                        </Link>
                        {user ? (
                            <Link href="/profile" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-all">
                                <User className="w-4 h-4 text-primary-500" />
                                <span className="text-sm font-medium">{user.name?.split(' ')[0] || 'Profile'}</span>
                            </Link>
                        ) : (
                            <Link href="/login" className="px-5 py-2 rounded-lg bg-primary-500 text-white border border-transparent hover:bg-primary-600 transition-colors text-sm font-medium shadow-[0_0_15px_rgba(229,9,20,0.3)]">
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex md:hidden items-center group">
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="p-2 text-gray-400 hover:text-white"
                        >
                            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="md:hidden absolute top-16 inset-x-0 bg-gray-900 border-b border-gray-800 shadow-xl pb-6">
                    <div className="px-4 py-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search movies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-primary-500"
                            />
                            {/* Mobile Search Dropdown limited visible */}
                            {(searchResults.length > 0) && (
                                <ul className="mt-2 flex flex-col bg-gray-950 rounded-lg border border-gray-800">
                                    {searchResults.map((movie) => (
                                        <li key={movie.id}>
                                            <Link
                                                href={`/movies/${movie.id}`}
                                                className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 border-b border-gray-800 last:border-0"
                                                onClick={() => { setSearchQuery(''); closeMenu(); }}
                                            >
                                                {movie.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="flex flex-col space-y-2 mt-4">
                            <Link href="/movies" onClick={closeMenu} className="px-3 py-2 text-base font-medium rounded-md hover:bg-gray-800">Movies</Link>
                            {user ? (
                                <Link href="/profile" onClick={closeMenu} className="px-3 py-2 text-base font-medium text-primary-500 border border-primary-500 rounded-md">My Profile</Link>
                            ) : (
                                <Link href="/login" onClick={closeMenu} className="px-3 py-2 text-base font-medium bg-primary-500 text-center rounded-md">Sign In</Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
