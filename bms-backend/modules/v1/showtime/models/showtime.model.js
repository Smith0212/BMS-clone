const pool = require('../../../../config/database');
const responseCode = require('../../../../config/responseCode');

const SHOW_TIMES = ['10:00', '13:00', '16:00', '19:00', '22:00'];

// Auto-seed showtimes for a movie in a city across the next 7 days
async function ensureShowtimesExist(tmdb_movie_id, movie_title, city_id) {
    try {
        // Insert showtimes for all screens in the city for the next 7 days
        await pool.query(`
            INSERT INTO tbl_showtimes
                (screen_id, theater_id, tmdb_movie_id, movie_title, movie_language,
                 show_date, show_time, show_format, price_multiplier)
            SELECT
                scr.id,
                scr.theater_id,
                $1, $2, 'English',
                (CURRENT_DATE + n.days)::DATE,
                t.show_time::TIME,
                '2D',
                1.00
            FROM tbl_screens scr
            JOIN tbl_theaters th ON th.id = scr.theater_id
            CROSS JOIN (VALUES (0),(1),(2),(3),(4),(5),(6)) AS n(days)
            CROSS JOIN (VALUES ('10:00'),('13:00'),('16:00'),('19:00'),('22:00')) AS t(show_time)
            WHERE th.city_id = $3
              AND scr.is_active = TRUE AND scr.is_deleted = FALSE
              AND th.is_active = TRUE AND th.is_deleted = FALSE
            ON CONFLICT (screen_id, show_date, show_time, tmdb_movie_id) DO NOTHING
        `, [tmdb_movie_id, movie_title || 'Movie', city_id]);

        // Initialize showtime_seats for any new showtimes that don't have them
        await pool.query(`
            INSERT INTO tbl_showtime_seats (showtime_id, seat_id, status)
            SELECT st.id, se.id, 'available'
            FROM tbl_showtimes st
            JOIN tbl_seats se ON se.screen_id = st.screen_id
            JOIN tbl_theaters th ON th.id = st.theater_id
            WHERE st.tmdb_movie_id = $1
              AND th.city_id = $2
              AND se.is_active = TRUE AND se.is_deleted = FALSE
              AND NOT EXISTS (
                  SELECT 1 FROM tbl_showtime_seats ss
                  WHERE ss.showtime_id = st.id AND ss.seat_id = se.id
              )
            ON CONFLICT (showtime_id, seat_id) DO NOTHING
        `, [tmdb_movie_id, city_id]);
    } catch (err) {
        console.error('ensureShowtimesExist error:', err.message);
    }
}

const showtime_model = {

    // ─────────────────────────────────────────────────────────────────────────
    // GET SHOWTIMES — grouped by theater; auto-creates if none exist
    // ─────────────────────────────────────────────────────────────────────────
    async getShowtimes(req) {
        try {
            const { tmdb_movie_id, city_id, date, movie_title = 'Movie' } = req.query;
            if (!tmdb_movie_id || !city_id || !date) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'no_showtimes_found' }, data: [] };
            }

            // Check if any showtimes exist for this movie/city
            const { rows: existCheck } = await pool.query(`
                SELECT 1 FROM tbl_showtimes st
                JOIN tbl_theaters th ON th.id = st.theater_id
                WHERE st.tmdb_movie_id = $1 AND th.city_id = $2
                LIMIT 1
            `, [tmdb_movie_id, city_id]);

            // Auto-seed if needed — runs fast due to ON CONFLICT DO NOTHING
            if (existCheck.length === 0) {
                await ensureShowtimesExist(parseInt(tmdb_movie_id), movie_title, city_id);
            }

            const { rows } = await pool.query(`
                SELECT
                    st.id            AS showtime_id,
                    st.tmdb_movie_id,
                    st.movie_title,
                    st.movie_language,
                    st.show_date,
                    st.show_time,
                    st.show_format,
                    st.price_multiplier,
                    scr.id           AS screen_id,
                    scr.name         AS screen_name,
                    scr.screen_type,
                    th.id            AS theater_id,
                    th.name          AS theater_name,
                    th.address,
                    th.amenities,
                    c.id             AS city_id,
                    c.name           AS city_name,
                    (SELECT COUNT(*) FROM tbl_showtime_seats ss
                     WHERE ss.showtime_id = st.id AND ss.status = 'available') AS available_seats
                FROM tbl_showtimes st
                JOIN tbl_screens scr ON scr.id = st.screen_id
                JOIN tbl_theaters th ON th.id = st.theater_id
                JOIN tbl_cities c   ON c.id  = th.city_id
                WHERE st.tmdb_movie_id = $1
                  AND th.city_id = $2
                  AND st.show_date = $3
                  AND st.is_active = TRUE AND st.is_deleted = FALSE
                  AND th.is_active = TRUE AND th.is_deleted = FALSE
                ORDER BY th.name ASC, st.show_time ASC
            `, [tmdb_movie_id, city_id, date]);

            if (rows.length === 0) {
                return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'no_showtimes_found' }, data: [] };
            }

            // Group by theater
            const theatersMap = {};
            rows.forEach((row) => {
                if (!theatersMap[row.theater_id]) {
                    theatersMap[row.theater_id] = {
                        theater_id: row.theater_id,
                        theater_name: row.theater_name,
                        address: row.address,
                        amenities: row.amenities,
                        city_id: row.city_id,
                        city_name: row.city_name,
                        showtimes: [],
                    };
                }
                theatersMap[row.theater_id].showtimes.push({
                    showtime_id: row.showtime_id,
                    screen_id: row.screen_id,
                    screen_name: row.screen_name,
                    screen_type: row.screen_type,
                    show_time: row.show_time,
                    show_format: row.show_format,
                    movie_language: row.movie_language,
                    price_multiplier: row.price_multiplier,
                    available_seats: parseInt(row.available_seats),
                });
            });

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'showtimes_found' },
                data: Object.values(theatersMap),
            };
        } catch (err) {
            console.error('GetShowtimes Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // GET SHOWTIME DETAIL
    // ─────────────────────────────────────────────────────────────────────────
    async getShowtimeDetail(req) {
        try {
            const showtime_id = req.query.showtime_id;
            if (!showtime_id) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'showtime_not_found' }, data: {} };
            }

            const { rows } = await pool.query(`
                SELECT
                    st.id AS showtime_id, st.tmdb_movie_id, st.movie_title, st.movie_language,
                    st.show_date, st.show_time, st.show_format, st.price_multiplier,
                    scr.id AS screen_id, scr.name AS screen_name, scr.screen_type,
                    th.id AS theater_id, th.name AS theater_name, th.address, th.amenities,
                    c.id AS city_id, c.name AS city_name
                FROM tbl_showtimes st
                JOIN tbl_screens scr ON scr.id = st.screen_id
                JOIN tbl_theaters th ON th.id = st.theater_id
                JOIN tbl_cities c   ON c.id  = th.city_id
                WHERE st.id = $1 AND st.is_active = TRUE AND st.is_deleted = FALSE
            `, [showtime_id]);

            if (rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'showtime_not_found' }, data: {} };
            }

            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'showtimes_found' }, data: rows[0] };
        } catch (err) {
            console.error('GetShowtimeDetail Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // GET SEAT MAP — rows grouped by row_label
    // ─────────────────────────────────────────────────────────────────────────
    async getSeatMap(req) {
        try {
            const showtime_id = req.query.showtime_id;
            if (!showtime_id) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'showtime_not_found' }, data: {} };
            }

            const { rows: stRows } = await pool.query(
                `SELECT id FROM tbl_showtimes WHERE id = $1 AND is_active = TRUE AND is_deleted = FALSE`,
                [showtime_id]
            );
            if (stRows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'showtime_not_found' }, data: {} };
            }

            // Release expired reservations
            await pool.query(`
                UPDATE tbl_showtime_seats
                SET status = 'available', reserved_at = NULL, reserved_until = NULL, updated_at = NOW()
                WHERE showtime_id = $1 AND status = 'reserved' AND reserved_until < NOW()
            `, [showtime_id]);

            const { rows } = await pool.query(`
                SELECT
                    s.id      AS seat_id,
                    s.row_label,
                    s.seat_number,
                    s.seat_type,
                    s.price,
                    ss.status
                FROM tbl_showtime_seats ss
                JOIN tbl_seats s ON s.id = ss.seat_id
                WHERE ss.showtime_id = $1
                  AND s.is_active = TRUE AND s.is_deleted = FALSE
                ORDER BY s.row_label ASC, s.seat_number ASC
            `, [showtime_id]);

            const rowsMap = {};
            rows.forEach((seat) => {
                if (!rowsMap[seat.row_label]) rowsMap[seat.row_label] = [];
                rowsMap[seat.row_label].push({
                    seat_id: seat.seat_id,
                    seat_number: seat.seat_number,
                    seat_type: seat.seat_type,
                    price: parseFloat(seat.price),
                    status: seat.status,
                });
            });

            const seatRows = Object.keys(rowsMap)
                .sort()
                .map((label) => ({ row_label: label, seats: rowsMap[label] }));

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'showtimes_found' },
                data: { showtime_id: parseInt(showtime_id), rows: seatRows },
            };
        } catch (err) {
            console.error('GetSeatMap Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },
};

module.exports = showtime_model;
