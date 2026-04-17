'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import useBookingStore from '@/store/useBookingStore';
import Image from 'next/image';
import { posterUrl } from '@/lib/tmdb';

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const router = useRouter();
    const { clearSeats } = useBookingStore();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            router.replace('/');
            return;
        }

        const fetchBooking = async () => {
            try {
                const res = await fetch(`/api/bookings/${id}`);
                if (!res.ok) throw new Error("Not found");
                const data = await res.json();
                setBooking(data.booking);

                // Clear Zustand after successful extraction
                clearSeats();
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id, router, clearSeats]);

    const downloadTicket = () => {
        window.print();
    };

    if (loading) return <div className="text-center pt-32 text-white">Loading your ticket...</div>;
    if (!booking) return <div className="text-center pt-32 text-white">Booking not found!</div>;

    const { showInfo, seats, totalAmount } = booking;

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center pt-16 pb-20 px-4">
            {/* Success Animation */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(34,197,94,0.4)]"
            >
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-gray-400 mb-10 text-center">Your tickets have been successfully booked.</p>

            {/* Ticket Card - styled specifically for printing/display */}
            <div id="ticket" className="w-full max-w-2xl bg-white text-gray-900 rounded-xl overflow-hidden shadow-2xl relative">
                <div className="flex border-b-2 border-dashed border-gray-300">
                    <div className="w-1/3 bg-gray-100 flex-shrink-0 relative hidden sm:block">
                        {showInfo.posterPath && (
                            <Image src={posterUrl(showInfo.posterPath, 'w342')} alt="Movie" fill className="object-cover" />
                        )}
                    </div>
                    <div className="w-full sm:w-2/3 p-6 md:p-8">
                        <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">M-Ticket</div>
                        <h2 className="text-2xl font-bold mb-1 leading-tight">{showInfo.movieTitle}</h2>
                        <p className="text-sm text-gray-500 mb-6 font-medium">{showInfo.format}</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Theater</p>
                                <p className="font-semibold">{showInfo.theater} Cinemas</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Date & Time</p>
                                <p className="font-semibold">{showInfo.date} • {showInfo.time}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Seats ({seats.length})</p>
                                <p className="font-semibold break-words">{seats.map(s => s.id).join(', ')}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Total Paid</p>
                                <p className="font-semibold text-green-600">₹{totalAmount}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-400 font-mono text-center">Booking ID: {id.split('-')[0].toUpperCase()}</p>
                        </div>
                    </div>
                </div>

                {/* Decorative cutouts */}
                <div className="absolute top-[80%] sm:top-1/2 -left-3 w-6 h-6 bg-gray-950 rounded-full transform -translate-y-1/2"></div>
                <div className="absolute top-[80%] sm:top-1/2 -right-3 w-6 h-6 bg-gray-950 rounded-full transform -translate-y-1/2"></div>
            </div>

            <div className="flex gap-4 mt-8 no-print">
                <button
                    onClick={downloadTicket}
                    className="px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition"
                >
                    Download Ticket
                </button>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition shadow-[0_4px_14px_rgba(229,9,20,0.4)]"
                >
                    Book Another
                </button>
            </div>

            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ticket, #ticket * {
            visibility: visible;
          }
          #ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border-radius: 0;
            box-shadow: none;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
        </div>
    );
}

export default function ConfirmationPage() {
    return (
        <Suspense fallback={<div className="text-white text-center pt-20">Loading...</div>}>
            <ConfirmationContent />
        </Suspense>
    );
}
