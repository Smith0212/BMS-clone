'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format } from 'date-fns';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import useBookingStore from '@/store/useBookingStore';
import { bmsApi } from '@/lib/bmsApi';

function to12h(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12  = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
}

const DATES = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i);
    return { date: format(d, 'yyyy-MM-dd'), display: format(d, 'EEE, d MMM') };
});

export default function Showtimes({ movieId, movieTitle, posterPath }) {
    const router = useRouter();
    const { setShow } = useBookingStore();

    const [cities, setCities]               = useState([]);
    const [cityId, setCityId]               = useState(null);
    const [dateIdx, setDateIdx]             = useState(0);
    const [theaters, setTheaters]           = useState([]);
    const [loading, setLoading]             = useState(false);
    const [expanded, setExpanded]           = useState({});

    // Load cities once
    useEffect(() => {
        bmsApi.getCities().then((res) => {
            if (res.code === 1 && res.data?.length) {
                setCities(res.data);
                setCityId(res.data[0].id);
            }
        });
    }, []);

    // Fetch showtimes whenever city or date changes
    useEffect(() => {
        if (!cityId || !movieId) return;
        setLoading(true);
        setTheaters([]);
        bmsApi
            .getShowtimes(movieId, cityId, DATES[dateIdx].date, movieTitle)
            .then((res) => {
                if (res.code === 1) setTheaters(res.data || []);
            })
            .finally(() => setLoading(false));
    }, [cityId, dateIdx, movieId, movieTitle]);

    const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

    const handlePick = (theater, showtime) => {
        setShow({
            showtimeId:  showtime.showtime_id,
            movieId,
            movieTitle,
            posterPath,
            date:        DATES[dateIdx].date,
            displayDate: DATES[dateIdx].display,
            theater:     theater.theater_name,
            address:     theater.address,
            format:      showtime.show_format,
            time:        to12h(showtime.show_time),
            screenId:    showtime.screen_id,
        });
        router.push(`/movies/${movieId}/book`);
    };

    return (
        <div className="w-full mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Select a Showtime</h2>

            {/* City picker */}
            {cities.length > 0 && (
                <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <div className="flex gap-2 flex-wrap">
                        {cities.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setCityId(c.id)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                    cityId === c.id
                                        ? 'bg-primary-500 border-primary-500 text-white'
                                        : 'border-gray-700 text-gray-400 hover:border-gray-500'
                                }`}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Date tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar mb-6">
                {DATES.map((d, i) => {
                    const [dow, day, mon] = d.display.split(' ');
                    return (
                        <button
                            key={d.date}
                            onClick={() => setDateIdx(i)}
                            className={`flex-shrink-0 flex flex-col items-center px-6 py-3 rounded-lg border transition-all ${
                                dateIdx === i
                                    ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20'
                                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'
                            }`}
                        >
                            <span className="text-xs uppercase font-medium">{dow}</span>
                            <span className="text-lg font-bold">{day}</span>
                            <span className="text-xs">{mon}</span>
                        </button>
                    );
                })}
            </div>

            {/* Theater list */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-28 animate-pulse bg-gray-900 rounded-xl" />
                    ))}
                </div>
            ) : theaters.length === 0 ? (
                <div className="text-center py-16 text-gray-500 bg-gray-900 rounded-xl border border-gray-800">
                    No showtimes available for this selection.
                </div>
            ) : (
                <div className="space-y-4">
                    {theaters.map((theater) => {
                        const isOpen = expanded[theater.theater_id] !== false;
                        return (
                            <div key={theater.theater_id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                                <div
                                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-800/50 transition-colors"
                                    onClick={() => toggle(theater.theater_id)}
                                >
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{theater.theater_name}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">{theater.address}</p>
                                        <p className="text-xs text-gray-500 mt-1">Non-Cancellable · M-Ticket Available</p>
                                    </div>
                                    <span className="text-gray-400">{isOpen ? <ChevronUp /> : <ChevronDown />}</span>
                                </div>

                                {isOpen && (
                                    <div className="p-5 pt-0 border-t border-gray-800">
                                        <div className="flex flex-wrap gap-3 pt-5">
                                            {theater.showtimes.map((st) => (
                                                <button
                                                    key={st.showtime_id}
                                                    onClick={() => handlePick(theater, st)}
                                                    disabled={st.available_seats === 0}
                                                    className="flex flex-col items-center px-4 py-2 rounded border border-gray-700 bg-gray-800 hover:bg-primary-500 hover:border-primary-500 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    <span className="text-sm font-semibold text-primary-400 group-hover:text-white">
                                                        {to12h(st.show_time)}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 mt-0.5">
                                                        {st.show_format} · {st.available_seats} seats
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
