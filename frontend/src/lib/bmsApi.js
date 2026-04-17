const API_URL = process.env.NEXT_PUBLIC_BMS_API_URL || 'http://localhost:8856/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_BMS_API_KEY || 'bms-api-key-2024';

async function request(endpoint, method = 'GET', body = null, token = null) {
    const headers = {
        'Content-Type': 'application/json',
        'api-key': API_KEY,
        'accept-language': 'en',
    };
    if (token) headers['token'] = token;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_URL}${endpoint}`, opts);
    return res.json();
}

// Server-side request (uses non-public env vars, called from Next.js server components)
export async function serverRequest(endpoint, method = 'GET', body = null, token = null) {
    const url = process.env.BMS_API_URL || 'http://localhost:8856/api/v1';
    const key = process.env.BMS_API_KEY || 'bms-api-key-2024';

    const headers = {
        'Content-Type': 'application/json',
        'api-key': key,
        'accept-language': 'en',
    };
    if (token) headers['token'] = token;

    const opts = { method, headers, cache: 'no-store' };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${url}${endpoint}`, opts);
    return res.json();
}

export const bmsApi = {
    // ── Auth ────────────────────────────────────────────────────────────────
    signup:      (data)          => request('/user/signup',      'POST', data),
    verifyOtp:   (data)          => request('/user/verifyOtp',   'POST', data),
    login:       (data)          => request('/user/login',       'POST', data),
    resendOtp:   (data)          => request('/user/resendOtp',   'POST', data),
    forgotPwd:   (data)          => request('/user/forgotPassword', 'POST', data),

    // ── Profile (protected) ─────────────────────────────────────────────────
    getProfile:     (token)      => request('/user/getProfile',     'GET',  null, token),
    updateProfile:  (data, token)=> request('/user/updateProfile',  'POST', data, token),
    changePassword: (data, token)=> request('/user/changePassword', 'POST', data, token),
    logout:         (token)      => request('/user/logout',         'POST', null, token),

    // ── Cities / Theaters ───────────────────────────────────────────────────
    getCities: () => request('/theater/getCities', 'GET'),

    // ── Showtimes ───────────────────────────────────────────────────────────
    getShowtimes: (movieId, cityId, date, movieTitle) =>
        request(
            `/showtime/getShowtimes?tmdb_movie_id=${movieId}&city_id=${cityId}&date=${date}&movie_title=${encodeURIComponent(movieTitle || 'Movie')}`,
            'GET'
        ),
    getSeatMap: (showtimeId) =>
        request(`/showtime/getSeatMap?showtime_id=${showtimeId}`, 'GET'),

    // ── Booking (protected) ─────────────────────────────────────────────────
    reserveSeats:    (data, token) => request('/booking/reserveSeats',    'POST', data, token),
    confirmBooking:  (data, token) => request('/booking/confirmBooking',  'POST', data, token),
    cancelBooking:   (data, token) => request('/booking/cancelBooking',   'POST', data, token),
    getMyBookings:   (token)       => request('/booking/getMyBookings',   'GET',  null, token),
    getBookingDetail:(id, token)   => request(`/booking/getBookingDetail?booking_id=${id}`, 'GET', null, token),

    // ── Payment (protected) ─────────────────────────────────────────────────
    initiatePayment: (data, token) => request('/payment/initiatePayment', 'POST', data, token),
    processPayment:  (data, token) => request('/payment/processPayment',  'POST', data, token),
    getPaymentStatus:(id, token)   => request(`/payment/getPaymentStatus?payment_id=${id}`, 'GET', null, token),
};
