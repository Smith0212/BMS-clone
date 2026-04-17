import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useBookingStore = create(
    persist(
        (set) => ({
            // showInfo includes showtimeId (DB id), movieId, movieTitle, posterPath,
            // date, displayDate, theater, format, time, screenId
            showInfo:      null,
            selectedSeats: [],  // each seat: { id (seat_id), label, row, col, category, price, status }
            totalAmount:   0,
            reservedUntil: null,

            setShow:   (show)   => set({ showInfo: show }),

            addSeat: (seat) => set((state) => ({
                selectedSeats: [...state.selectedSeats, seat],
                totalAmount:   state.totalAmount + seat.price,
            })),

            removeSeat: (seatId) => set((state) => {
                const seat = state.selectedSeats.find((s) => s.id === seatId);
                if (!seat) return state;
                return {
                    selectedSeats: state.selectedSeats.filter((s) => s.id !== seatId),
                    totalAmount:   state.totalAmount - seat.price,
                };
            }),

            clearSeats: () => set({ selectedSeats: [], totalAmount: 0, reservedUntil: null }),

            setReservedUntil: (ts) => set({ reservedUntil: ts }),
        }),
        { name: 'bms-booking-storage' }
    )
);

export default useBookingStore;
