'use client';

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useBookingStore from '@/store/useBookingStore';
import { generateSeatMap } from '@/utils/seatHelpers';
import SeatGrid from '@/components/SeatGrid';

export default function BookSeatsPage({ params }) {
    const router = useRouter();
    const { showInfo, selectedSeats, totalAmount } = useBookingStore();

    const seatMap = useMemo(() => {
        // Generate map deterministically based on movie, theater, date, format and time
        if (!showInfo) return null;
        const seedStr = `${showInfo.movieId}-${showInfo.theater}-${showInfo.date}-${showInfo.time}`;

        // Hash string to int roughly
        let seedInt = 0;
        for (let i = 0; i < seedStr.length; i++) seedInt += seedStr.charCodeAt(i);

        return generateSeatMap(seedInt.toString());
    }, [showInfo]);

    useEffect(() => {
        if (!showInfo) {
            router.replace('/movies');
        }
    }, [showInfo, router]);

    if (!showInfo || !seatMap) return <div className="p-20 text-center text-white">Loading mapping...</div>;

    const handleProceed = () => {
        if (selectedSeats.length === 0) return;
        router.push('/booking/payment');
    };

    return (
        <div className="w-full flex flex-col min-h-[calc(100vh-64px)] overflow-hidden">
            {/* Top Header info */}
            <div className="bg-gray-900 border-b border-gray-800 px-4 py-4 sticky top-0 z-10 w-full flex-shrink-0">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-white leading-tight">{showInfo.movieTitle}</h1>
                        <p className="text-sm text-gray-400 mt-1">
                            {showInfo.theater} | {showInfo.date} | {showInfo.time} | {showInfo.format}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Seat area */}
            <div className="flex-1 w-full bg-gray-950 px-4 py-8 overflow-y-auto pb-32">
                <SeatGrid seatMap={seatMap} />
            </div>

            {/* Sticky Bottom Bar */}
            {selectedSeats.length > 0 && (
                <div className="fixed bottom-0 inset-x-0 bg-gray-900 border-t border-gray-800 p-4 shadow-2xl z-50 transform transition-transform duration-300">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-400">{selectedSeats.length} Ticket(s) selected</span>
                            <span className="text-xl font-bold text-primary-500">₹{totalAmount}</span>
                        </div>
                        <button
                            onClick={handleProceed}
                            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg shadow-primary-500/30"
                        >
                            Proceed &rarr;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
