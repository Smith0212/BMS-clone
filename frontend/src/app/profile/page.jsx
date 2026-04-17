import { auth } from '@/lib/auth';
import Image from 'next/image';
import Link from 'next/link';
import { posterUrl } from '@/lib/tmdb';
import { LogOut } from 'lucide-react';

export default async function ProfilePage() {
    const session = await auth();

    // Need to fetch bookings fully server-side from your own API
    // Using localhost with absolute URL or directly from the map structure
    let bookings = [];
    try {
        const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/bookings`, {
            method: 'GET',
            headers: {
                cookie: `authjs.session-token=${session?.cookies?.['authjs.session-token']?.value};` // Rough simulation server-side fetch or just use raw Map
            }
        });
        // Wait, dynamic fetching requires absolute URL and might fail without proper cookies forwarding. 
        // Since it's a server component and we use an in-memory Map, let's just import the Map!
    } catch (e) {
        // ignore
    }

    // Workaround for dummy app: just import the Map directly for server components
    const { bookingsMap } = await import('@/app/api/bookings/route.js');
    bookings = Array.from(bookingsMap.values())
        .filter(b => b.userId === session?.user?.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const upcomingBookings = bookings.filter(b => new Date(`${b.showInfo.date} ${b.showInfo.time}`) >= new Date());
    const pastBookings = bookings.filter(b => new Date(`${b.showInfo.date} ${b.showInfo.time}`) < new Date());

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-[70vh]">
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-tr from-primary-500 to-yellow-500 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg">
                        {session?.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{session?.user?.name || 'User Profile'}</h1>
                        <p className="text-gray-400">{session?.user?.email}</p>
                    </div>
                </div>
                <Link
                    href="/api/auth/signout"
                    className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 bg-gray-900 border border-red-900/30 px-4 py-2 rounded-lg transition"
                >
                    <LogOut size={16} /> Sign Out
                </Link>
            </div>

            <div className="space-y-12">
                <section>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        Upcoming Bookings <span className="bg-primary-500 text-xs px-2 py-0.5 rounded-full text-white">{upcomingBookings.length}</span>
                    </h2>

                    {upcomingBookings.length === 0 ? (
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
                            No upcoming bookings. <Link href="/" className="text-primary-500 hover:underline">Book a movie now!</Link>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {upcomingBookings.map(b => (
                                <BookingCard key={b.id} booking={b} />
                            ))}
                        </div>
                    )}
                </section>

                {pastBookings.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold text-gray-400 mb-6">Past Bookings</h2>
                        <div className="grid gap-4 md:grid-cols-2 opacity-75">
                            {pastBookings.map(b => (
                                <BookingCard key={b.id} booking={b} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

function BookingCard({ booking }) {
    const { showInfo, seats, totalAmount, status } = booking;

    return (
        <div className="flex bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition">
            <div className="w-24 bg-gray-800 flex-shrink-0 relative">
                {showInfo.posterPath && (
                    <Image src={posterUrl(showInfo.posterPath, 'w185')} alt="Movie" fill className="object-cover" />
                )}
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-white text-lg line-clamp-1">{showInfo.movieTitle}</h3>
                        <span className="text-[10px] uppercase bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold border border-green-500/20">{status}</span>
                    </div>
                    <p className="text-sm text-gray-400">{showInfo.theater} ({showInfo.format})</p>
                    <p className="text-sm font-medium text-primary-500 mt-2">{showInfo.date} at {showInfo.time}</p>
                </div>

                <div className="mt-4 flex justify-between items-end border-t border-gray-800 pt-3">
                    <p className="text-xs text-gray-400">Seats: <span className="text-white font-medium">{seats.map(s => s.id).join(', ')}</span></p>
                    <p className="text-sm font-bold text-white">₹{totalAmount}</p>
                </div>
            </div>
        </div>
    );
}
