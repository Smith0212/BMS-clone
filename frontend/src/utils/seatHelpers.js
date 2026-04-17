import { addDays, format } from 'date-fns';

export const THEATERS = ['PVR', 'INOX', 'Cinepolis', 'Carnival'];
export const FORMATS = ['2D', '3D', 'IMAX'];
export const TIMES = ['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '10:00 PM'];
export const PRICES = { '2D': 220, '3D': 320, 'IMAX': 450 };

export const generateShowtimes = (movieId) => {
    const dates = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

    // We'll generate a consistent but pseudo-random schedule based on movieId
    const seed = parseInt(movieId, 10) || 12345;

    return dates.map(date => {
        // Generate theaters for each date
        const dailyTheaters = THEATERS.map((theater, tIdx) => {
            // Pick random formats based on seed + date + theater index
            const numFormats = 1 + ((seed + date.getDate() + tIdx) % 3);
            const theaterFormats = Array.from({ length: numFormats }).map((_, fIdx) => {
                const formatName = FORMATS[(seed + tIdx + fIdx) % FORMATS.length];
                // Pick random times
                const numTimes = 2 + ((seed + date.getDate()) % 3);
                const formatTimes = Array.from({ length: numTimes }).map((_, timeIdx) => {
                    return TIMES[(seed + tIdx + fIdx + timeIdx) % TIMES.length];
                }).sort((a, b) => TIMES.indexOf(a) - TIMES.indexOf(b));

                return {
                    name: formatName,
                    price: PRICES[formatName],
                    times: [...new Set(formatTimes)] // Ensure unique
                };
            });

            return {
                id: `${theater}-${date.getDate()}`,
                name: theater,
                formats: theaterFormats
            };
        });

        return {
            date: format(date, 'yyyy-MM-dd'),
            displayDate: format(date, 'EEE, d MMM'),
            theaters: dailyTheaters
        };
    });
};

export const generateSeatMap = (seed = "") => {
    const categories = [
        { name: 'PREMIUM', rows: ['A', 'B'], cols: 10, price: 450, color: 'text-yellow-500', bgSelected: 'bg-yellow-500' },
        { name: 'GOLD', rows: ['C', 'D', 'E'], cols: 12, price: 320, color: 'text-amber-400', bgSelected: 'bg-amber-400' },
        { name: 'SILVER', rows: ['F', 'G', 'H', 'I', 'J'], cols: 14, price: 220, color: 'text-gray-300', bgSelected: 'bg-gray-300' }
    ];

    let seats = [];
    let seatIdCounter = 1;
    const numSeed = parseInt(seed, 10) || Math.random() * 1000;

    categories.forEach(cat => {
        cat.rows.forEach(r => {
            let rowSeats = [];
            for (let c = 1; c <= cat.cols; c++) {
                const isBooked = ((numSeed + r.charCodeAt(0) + c) % 100) < 30; // 30% randomly booked
                rowSeats.push({
                    id: `${r}${c}`,
                    row: r,
                    col: c,
                    category: cat.name,
                    price: cat.price,
                    status: isBooked ? 'booked' : 'available'
                });
            }
            seats.push({ row: r, category: cat.name, data: rowSeats });
        });
    });

    return { categories, seats };
};
