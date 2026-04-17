import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useBookingStore = create(
    persist(
        (set) => ({
            selectedSeats: [],
            showInfo: null,
            totalAmount: 0,

            addSeat: (seat) => set((state) => ({
                selectedSeats: [...state.selectedSeats, seat],
                totalAmount: state.totalAmount + seat.price
            })),

            removeSeat: (seatId) => set((state) => {
                const seatToRemove = state.selectedSeats.find(s => s.id === seatId);
                if (!seatToRemove) return state;
                return {
                    selectedSeats: state.selectedSeats.filter(s => s.id !== seatId),
                    totalAmount: state.totalAmount - seatToRemove.price
                };
            }),

            clearSeats: () => set({ selectedSeats: [], totalAmount: 0 }),

            setShow: (show) => set({ showInfo: show })
        }),
        {
            name: 'bms-booking-storage',
        }
    )
);

export default useBookingStore;
