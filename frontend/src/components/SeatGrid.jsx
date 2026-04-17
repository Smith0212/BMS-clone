'use client';

import { motion } from 'framer-motion';
import useBookingStore from '@/store/useBookingStore';
import toast from 'react-hot-toast';

// Transform backend seat-map { rows: [...] } into the grid format
export function transformSeatMap(backendData) {
    const typeConfig = {
        Recliner: { name: 'RECLINER', color: 'text-yellow-500', bgSelected: 'bg-yellow-500' },
        Premium:  { name: 'PREMIUM',  color: 'text-amber-400',  bgSelected: 'bg-amber-400'  },
        Economy:  { name: 'ECONOMY',  color: 'text-gray-300',   bgSelected: 'bg-gray-400'   },
    };

    const categoriesMap = {};
    const seats = (backendData?.rows || []).map((rowObj) => {
        const seatType = rowObj.seats[0]?.seat_type || 'Economy';
        const cfg      = typeConfig[seatType] || typeConfig.Economy;

        if (!categoriesMap[cfg.name]) {
            categoriesMap[cfg.name] = {
                name:       cfg.name,
                price:      rowObj.seats[0]?.price || 0,
                color:      cfg.color,
                bgSelected: cfg.bgSelected,
            };
        }

        return {
            row:      rowObj.row_label,
            category: cfg.name,
            data: rowObj.seats.map((s) => ({
                id:       s.seat_id,                           // DB id used for API calls
                label:    `${rowObj.row_label}${s.seat_number}`, // display label e.g. "A3"
                row:      rowObj.row_label,
                col:      s.seat_number,
                category: cfg.name,
                price:    s.price,
                status:   s.status,
            })),
        };
    });

    // Order: Recliner → Premium → Economy
    const order = ['RECLINER', 'PREMIUM', 'ECONOMY'];
    const categories = Object.values(categoriesMap).sort(
        (a, b) => order.indexOf(a.name) - order.indexOf(b.name)
    );

    return { categories, seats };
}

export default function SeatGrid({ seatMap }) {
    const { selectedSeats, addSeat, removeSeat } = useBookingStore();

    const handleSeatClick = (seat) => {
        if (seat.status === 'booked' || seat.status === 'reserved') return;

        const isSelected = selectedSeats.find((s) => s.id === seat.id);
        if (isSelected) {
            removeSeat(seat.id);
        } else {
            if (selectedSeats.length >= 10) {
                toast.error('You can select up to 10 seats');
                return;
            }
            addSeat(seat);
        }
    };

    if (!seatMap?.categories?.length) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                Loading seat map…
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-8 overflow-hidden">
            <div className="flex flex-col items-center">
                {/* Screen indicator */}
                <div className="w-[80%] max-w-sm h-8 mt-4 mb-16 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-gray-600 rounded-t-[50%] blur-[2px] opacity-20" />
                    <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-400 to-transparent shadow-[0_0_10px_white]" />
                    <p className="text-center text-xs text-gray-500 mt-2 tracking-[0.2em] font-medium">SCREEN THIS WAY</p>
                </div>

                {/* Seat map */}
                <div className="w-full overflow-x-auto pb-4 hide-scrollbar flex justify-center">
                    <div className="flex flex-col gap-6">
                        {seatMap.categories.map((cat) => {
                            const catRows = seatMap.seats.filter((s) => s.category === cat.name);
                            return (
                                <div key={cat.name} className="flex flex-col gap-2">
                                    <div className="text-xs font-semibold text-gray-500 mb-1 border-b border-gray-800 pb-1">
                                        ₹{cat.price} · {cat.name}
                                    </div>

                                    {catRows.map((rowObj) => (
                                        <div key={rowObj.row} className="flex items-center gap-4">
                                            <div className="w-5 text-xs font-medium text-gray-500 flex-shrink-0 text-center">
                                                {rowObj.row}
                                            </div>
                                            <div className="flex gap-1.5">
                                                {rowObj.data.map((seat) => {
                                                    const isUnavailable = seat.status === 'booked' || seat.status === 'reserved';
                                                    const isSelected    = !!selectedSeats.find((s) => s.id === seat.id);

                                                    let cls = 'border-gray-600 hover:bg-gray-700 hover:border-gray-400';
                                                    if (isUnavailable) {
                                                        cls = 'bg-gray-800 border-gray-800 cursor-not-allowed opacity-40';
                                                    } else if (isSelected) {
                                                        cls = `${cat.bgSelected} border-transparent text-gray-900`;
                                                    } else if (cat.name === 'RECLINER') {
                                                        cls = 'border-yellow-600 hover:bg-yellow-500/20';
                                                    } else if (cat.name === 'PREMIUM') {
                                                        cls = 'border-amber-500 hover:bg-amber-400/20';
                                                    }

                                                    return (
                                                        <motion.button
                                                            key={seat.id}
                                                            whileTap={!isUnavailable ? { scale: 0.85 } : {}}
                                                            onClick={() => handleSeatClick(seat)}
                                                            disabled={isUnavailable}
                                                            title={seat.label}
                                                            className={`w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-t-lg rounded-b-md border transition-all flex items-center justify-center text-[9px] font-bold ${cls}`}
                                                        >
                                                            {seat.col}
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-6 mt-8 pt-6 border-t border-gray-800 w-full text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-t border border-gray-600" />
                        <span className="text-gray-400">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-t bg-primary-500" />
                        <span className="text-gray-400">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-t bg-gray-800 border border-gray-800 opacity-40" />
                        <span className="text-gray-400">Booked / Reserved</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
