'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateShowtimes } from '@/utils/seatHelpers';
import useBookingStore from '@/store/useBookingStore';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Showtimes({ movieId, movieTitle, posterPath }) {
    const router = useRouter();
    const { setShow } = useBookingStore();
    const [selectedDateIdx, setSelectedDateIdx] = useState(0);
    const [expandedTheaters, setExpandedTheaters] = useState({});
    const [showtimes, setShowtimes] = useState([]);

    useEffect(() => {
        if (movieId) {
            setShowtimes(generateShowtimes(movieId));
        }
    }, [movieId]);

    const toggleTheater = (theaterId) => {
        setExpandedTheaters(prev => ({ ...prev, [theaterId]: !prev[theaterId] }));
    };

    const handleTimeClick = (theater, format, time) => {
        const showDay = showtimes[selectedDateIdx];

        const showInfo = {
            movieId,
            movieTitle,
            posterPath,
            date: showDay.date,
            displayDate: showDay.displayDate,
            theater: theater.name,
            format: format.name,
            time,
            price: format.price
        };

        setShow(showInfo);
        router.push(`/movies/${movieId}/book`);
    };

    if (showtimes.length === 0) return <div className="animate-pulse h-40 bg-gray-900 rounded-lg w-full"></div>;

    const currentSelection = showtimes[selectedDateIdx];

    return (
        <div className="w-full mt-12 bg-gray-950">
            <h2 className="text-2xl font-bold text-white mb-6">Select a Showtime</h2>

            {/* Date Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar mb-6">
                {showtimes.map((day, idx) => (
                    <button
                        key={day.date}
                        onClick={() => setSelectedDateIdx(idx)}
                        className={`flex-shrink-0 flex flex-col items-center justify-center px-6 py-3 rounded-lg border transition-all ${selectedDateIdx === idx
                                ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20'
                                : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'
                            }`}
                    >
                        <span className="text-xs uppercase font-medium">{day.displayDate.split(',')[0]}</span>
                        <span className="text-lg font-bold">{day.displayDate.split(' ')[1]}</span>
                        <span className="text-xs">{day.displayDate.split(' ')[2]}</span>
                    </button>
                ))}
            </div>

            {/* Theaters List */}
            <div className="space-y-4">
                {currentSelection.theaters.map(theater => {
                    const isExpanded = expandedTheaters[theater.id] !== false; // Default Open

                    return (
                        <div key={theater.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                            <div
                                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-800/50 transition-colors"
                                onClick={() => toggleTheater(theater.id)}
                            >
                                <div>
                                    <h3 className="text-lg font-bold text-white">{theater.name} Cinemas</h3>
                                    <p className="text-sm text-gray-400 mt-1">Non-Cancellable • M-Ticket Available</p>
                                </div>
                                <div className="text-gray-400">
                                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="p-5 border-t border-gray-800 bg-gray-900/50">
                                    {theater.formats.map((format, fIdx) => (
                                        <div key={`${theater.id}-${format.name}`} className={`${fIdx > 0 ? 'mt-6' : ''}`}>
                                            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                                <span>{format.name}</span>
                                                <span className="text-xs font-normal text-gray-500">₹{format.price}</span>
                                            </h4>
                                            <div className="flex flex-wrap gap-3">
                                                {format.times.map(time => (
                                                    <button
                                                        key={time}
                                                        onClick={() => handleTimeClick(theater, format, time)}
                                                        className="px-4 py-2 text-sm font-medium rounded text-primary-500 border border-gray-700 bg-gray-800 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-colors"
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
