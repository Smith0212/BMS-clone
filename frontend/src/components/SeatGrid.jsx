'use client';

import { motion } from 'framer-motion';
import useBookingStore from '@/store/useBookingStore';
import toast from 'react-hot-toast';

export default function SeatGrid({ seatMap }) {
    const { selectedSeats, addSeat, removeSeat } = useBookingStore();

    const handleSeatClick = (seat) => {
        if (seat.status === 'booked') return;

        const isSelected = selectedSeats.find(s => s.id === seat.id);

        if (isSelected) {
            removeSeat(seat.id);
        } else {
            if (selectedSeats.length >= 10) {
                toast.error('You can only select up to 10 seats');
                return;
            }
            addSeat(seat);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-8 overflow-hidden">
            <div className="flex flex-col items-center">
                {/* Screen Indicator */}
                <div className="w-[80%] max-w-sm h-8 mt-4 mb-16 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-gray-600 rounded-t-[50%] blur-[2px] opacity-20"></div>
                    <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-400 to-transparent shadow-[0_0_10px_white]"></div>
                    <p className="text-center text-xs text-gray-500 mt-2 tracking-[0.2em] font-medium">SCREEN THIS WAY</p>
                </div>

                {/* Seat Map */}
                <div className="w-full overflow-x-auto pb-4 hide-scrollbar flex justify-center">
                    <div className="flex flex-col gap-6">
                        {seatMap.categories.map(cat => {
                            const catRows = seatMap.seats.filter(s => s.category === cat.name);

                            return (
                                <div key={cat.name} className="flex flex-col gap-2">
                                    <div className="text-xs font-semibold text-gray-500 mb-1 border-b border-gray-800 pb-1">
                                        ₹{cat.price} {cat.name}
                                    </div>

                                    {catRows.map(rowObj => (
                                        <div key={rowObj.row} className="flex items-center gap-4">
                                            {/* Row Label */}
                                            <div className="w-4 text-xs font-medium text-gray-500 flex-shrink-0 text-center">
                                                {rowObj.row}
                                            </div>

                                            {/* Row Seats */}
                                            <div className="flex gap-2">
                                                {rowObj.data.map(seat => {
                                                    const isBooked = seat.status === 'booked';
                                                    const isSelected = !!selectedSeats.find(s => s.id === seat.id);

                                                    let bgClass = 'border-gray-500 hover:bg-gray-700 hover:border-gray-400'; // available default
                                                    let textClass = 'text-transparent';

                                                    if (isBooked) {
                                                        bgClass = 'bg-gray-800 border-gray-800 cursor-not-allowed opacity-50';
                                                        textClass = 'text-gray-600';
                                                    } else if (isSelected) {
                                                        bgClass = `${cat.bgSelected} border-transparent shadow-[0_0_8px_${cat.color}] shadow-current`;
                                                        textClass = 'text-gray-900';
                                                    } else {
                                                        // give specific border color based on category if not selected
                                                        if (cat.name === 'PREMIUM') bgClass = 'border-yellow-500 hover:bg-yellow-500/20 text-yellow-500';
                                                        if (cat.name === 'GOLD') bgClass = 'border-amber-400 hover:bg-amber-400/20 text-amber-400';
                                                    }

                                                    return (
                                                        <motion.button
                                                            key={seat.id}
                                                            whileTap={!isBooked ? { scale: 0.9 } : {}}
                                                            onClick={() => handleSeatClick(seat)}
                                                            disabled={isBooked}
                                                            className={`w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-t-lg rounded-b-md border transition-all flex items-center justify-center text-[10px] font-bold ${bgClass}`}
                                                        >
                                                            <span className={textClass}>{seat.col}</span>
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
                        <div className="w-5 h-5 rounded-t border border-gray-500"></div>
                        <span className="text-gray-400">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-t bg-primary-500"></div>
                        <span className="text-gray-400">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-t bg-gray-800 border-[1px] border-gray-800"></div>
                        <span className="text-gray-400">Booked</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
