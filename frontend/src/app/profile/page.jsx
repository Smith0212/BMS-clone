import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { auth } from '@/lib/auth';
import { serverRequest } from '@/lib/bmsApi';

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user?.backendToken) {
        redirect('/login?callbackUrl=/profile');
    }

    const token = session.user.backendToken;

    const [profileRes, bookingsRes] = await Promise.all([
        serverRequest('/user/getProfile',       'GET', null, token),
        serverRequest('/booking/getMyBookings', 'GET', null, token),
    ]);

    const profile  = profileRes?.data  || {};
    const bookings = bookingsRes?.data?.bookings || [];

    const now      = new Date();
    const upcoming = bookings.filter((b) => {
        const dt = new Date(`${b.show_date}T${b.show_time}`);
        return dt >= now && b.status === 'confirmed';
    });
    const past = bookings.filter((b) => {
        const dt = new Date(`${b.show_date}T${b.show_time}`);
        return dt < now || b.status !== 'confirmed';
    });

    const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || session.user.name || 'User';

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-[70vh]">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-tr from-primary-500 to-yellow-500 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                        <p className="text-gray-400">{profile.email || session.user.email}</p>
                        {profile.city && <p className="text-sm text-gray-500 mt-0.5">{profile.city}</p>}
                    </div>
                </div>
                <Link
                    href="/api/auth/signout"
                    className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 bg-gray-900 border border-red-900/30 px-4 py-2 rounded-lg transition"
                >
                    <LogOut size={16} /> Sign Out
                </Link>
            </div>

            {/* Bookings */}
            <div className="space-y-12">
                <section>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        Upcoming Bookings
                        <span className="bg-primary-500 text-xs px-2 py-0.5 rounded-full text-white">{upcoming.length}</span>
                    </h2>

                    {upcoming.length === 0 ? (
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
                            No upcoming bookings.{' '}
                            <Link href="/" className="text-primary-500 hover:underline">Book a movie now!</Link>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {upcoming.map((b) => <BookingCard key={b.booking_id} booking={b} />)}
                        </div>
                    )}
                </section>

                {past.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold text-gray-400 mb-6">Past Bookings</h2>
                        <div className="grid gap-4 md:grid-cols-2 opacity-70">
                            {past.map((b) => <BookingCard key={b.booking_id} booking={b} />)}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

function BookingCard({ booking }) {
    const showDate = new Date(booking.show_date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
    const [h, m]   = String(booking.show_time).split(':');
    const hour     = parseInt(h, 10);
    const showTime = `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;

    const statusColor = booking.status === 'confirmed'
        ? 'bg-green-500/20 text-green-400 border-green-500/20'
        : 'bg-gray-700/30 text-gray-400 border-gray-700/30';

    return (
        <div className="flex bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition">
            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-white text-lg line-clamp-1">{booking.movie_title}</h3>
                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold border ${statusColor}`}>
                            {booking.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-400">{booking.theater_name}</p>
                    <p className="text-sm font-medium text-primary-500 mt-2">{showDate} at {showTime}</p>
                </div>

                <div className="mt-4 flex justify-between items-end border-t border-gray-800 pt-3">
                    <p className="text-xs text-gray-400">
                        {booking.total_seats} seat{booking.total_seats > 1 ? 's' : ''} ·{' '}
                        <span className="font-mono text-gray-500">{booking.booking_ref}</span>
                    </p>
                    <p className="text-sm font-bold text-white">₹{booking.total_amount}</p>
                </div>
            </div>
        </div>
    );
}
