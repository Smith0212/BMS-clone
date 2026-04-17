'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import useBookingStore from '@/store/useBookingStore';
import SeatGrid, { transformSeatMap } from '@/components/SeatGrid';
import { bmsApi } from '@/lib/bmsApi';

export default function BookSeatsPage() {
    const router                            = useRouter();
    const { data: session }                 = useSession();
    const { showInfo, selectedSeats, totalAmount, clearSeats, setReservedUntil } = useBookingStore();
    const [seatMap, setSeatMap]             = useState(null);
    const [loading, setLoading]             = useState(true);
    const [reserving, setReserving]         = useState(false);
    const [mounted, setMounted]             = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!showInfo?.showtimeId) {
            router.replace('/movies');
            return;
        }
        setLoading(true);
        clearSeats();
        bmsApi
            .getSeatMap(showInfo.showtimeId)
            .then((res) => {
                if (res.code === 1) setSeatMap(transformSeatMap(res.data));
                else toast.error('Could not load seat map');
            })
            .catch(() => toast.error('Failed to connect to server'))
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showInfo?.showtimeId, mounted]);

    const handleProceed = async () => {
        if (selectedSeats.length === 0) {
            toast.error('Please select at least one seat');
            return;
        }

        if (!session?.user?.backendToken) {
            toast.error('Please sign in to continue');
            router.push(`/login?callbackUrl=/movies/${showInfo?.movieId}/book`);
            return;
        }

        setReserving(true);
        try {
            const seatIds = selectedSeats.map((s) => s.id);
            const res = await bmsApi.reserveSeats(
                { showtime_id: showInfo.showtimeId, seat_ids: seatIds },
                session.user.backendToken
            );

            if (res.code === 1) {
                setReservedUntil(res.data.reserved_until);
                router.push('/booking/payment');
            } else if (res.code === 6) {
                toast.error('Some seats were just taken — please reselect');
                // Refresh seat map
                const fresh = await bmsApi.getSeatMap(showInfo.showtimeId);
                if (fresh.code === 1) setSeatMap(transformSeatMap(fresh.data));
                clearSeats();
            } else {
                toast.error(res.message || 'Could not reserve seats');
            }
        } catch {
            toast.error('Failed to reserve seats — try again');
        } finally {
            setReserving(false);
        }
    };

    if (!mounted || !showInfo) return null;

    return (
        <div className="w-full flex flex-col min-h-[calc(100vh-64px)] overflow-hidden">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 px-4 py-4 sticky top-0 z-10 w-full">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-white leading-tight">{showInfo.movieTitle}</h1>
                        <p className="text-sm text-gray-400 mt-1">
                            {showInfo.theater} &nbsp;|&nbsp; {showInfo.displayDate} &nbsp;|&nbsp; {showInfo.time} &nbsp;|&nbsp; {showInfo.format}
                        </p>
                    </div>
                </div>
            </div>

            {/* Seat area */}
            <div className="flex-1 w-full bg-gray-950 px-4 py-8 overflow-y-auto pb-32">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">
                        Loading seats…
                    </div>
                ) : (
                    <SeatGrid seatMap={seatMap} />
                )}
            </div>

            {/* Sticky bottom bar */}
            {selectedSeats.length > 0 && (
                <div className="fixed bottom-0 inset-x-0 bg-gray-900 border-t border-gray-800 p-4 shadow-2xl z-50">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-400">
                                {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
                                &nbsp;·&nbsp;
                                <span className="text-gray-300">
                                    {selectedSeats.map((s) => s.label).join(', ')}
                                </span>
                            </span>
                            <span className="text-xl font-bold text-primary-500">₹{totalAmount}</span>
                        </div>
                        <button
                            onClick={handleProceed}
                            disabled={reserving}
                            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg shadow-primary-500/30 disabled:opacity-60 disabled:cursor-wait"
                        >
                            {reserving ? 'Reserving…' : 'Proceed →'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
