const pool = require('../../../../config/database');
const responseCode = require('../../../../config/responseCode');
const common = require('../../../../utils/common');
const { sendIndiaMail } = require('../../../../utils/configEmailSMTP');
const { getBookingConfirmationTemplate } = require('../../../../utils/emailTemplates');

const booking_model = {

    // ─────────────────────────────────────────────────────────────────────────
    // RESERVE SEATS (10-minute hold)
    // ─────────────────────────────────────────────────────────────────────────
    async reserveSeats(req) {
        try {
            const user_id = req.user_id;
            const { showtime_id, seat_ids } = req.body;

            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // Reset any globally expired reservations for this showtime
                await client.query(`
                    UPDATE tbl_showtime_seats
                    SET status = 'available', reserved_at = NULL, reserved_until = NULL, updated_at = NOW()
                    WHERE showtime_id = $1 AND status = 'reserved' AND reserved_until < NOW()
                `, [showtime_id]);

                // Check every requested seat is currently available
                const { rows: seatStatusRows } = await client.query(`
                    SELECT ss.seat_id, ss.status, s.row_label, s.seat_number, s.seat_type, s.price
                    FROM tbl_showtime_seats ss
                    JOIN tbl_seats s ON s.id = ss.seat_id
                    WHERE ss.showtime_id = $1 AND ss.seat_id = ANY($2::bigint[])
                `, [showtime_id, seat_ids]);

                if (seatStatusRows.length !== seat_ids.length) {
                    await client.query('ROLLBACK');
                    return { httpCode: 200, code: responseCode.SEAT_UNAVAILABLE, message: { keyword: 'seat_unavailable' }, data: {} };
                }

                const unavailable = seatStatusRows.filter(s => s.status !== 'available');
                if (unavailable.length > 0) {
                    await client.query('ROLLBACK');
                    return { httpCode: 200, code: responseCode.SEAT_UNAVAILABLE, message: { keyword: 'seat_unavailable' }, data: {} };
                }

                // Reserve seats for 10 minutes
                const reservedUntil = new Date(Date.now() + 10 * 60 * 1000);
                await client.query(`
                    UPDATE tbl_showtime_seats
                    SET status = 'reserved', reserved_at = NOW(), reserved_until = $1, updated_at = NOW()
                    WHERE showtime_id = $2 AND seat_id = ANY($3::bigint[])
                `, [reservedUntil, showtime_id, seat_ids]);

                await client.query('COMMIT');

                const amounts = common.calculateTotalAmount(seatStatusRows);

                return {
                    httpCode: 200,
                    code: responseCode.SUCCESS,
                    message: { keyword: 'seats_reserved' },
                    data: {
                        booking_draft_id: showtime_id,
                        showtime_id,
                        seats: seatStatusRows.map(s => ({
                            seat_id: s.seat_id,
                            row_label: s.row_label,
                            seat_number: s.seat_number,
                            seat_type: s.seat_type,
                            price: parseFloat(s.price),
                        })),
                        reserved_until: reservedUntil.toISOString(),
                        ...amounts,
                    },
                };
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }
        } catch (err) {
            console.error('ReserveSeats Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CONFIRM BOOKING (after successful payment)
    // ─────────────────────────────────────────────────────────────────────────
    async confirmBooking(req) {
        try {
            const user_id = req.user_id;
            const { showtime_id, seat_ids, payment_id } = req.body;

            // Verify payment belongs to user
            const { rows: paymentRows } = await pool.query(`
                SELECT id, payment_status, amount FROM tbl_payments
                WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE
            `, [payment_id, user_id]);

            if (paymentRows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'payment_not_found' }, data: {} };
            }

            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // Get seats info
                const { rows: seatRows } = await client.query(`
                    SELECT ss.seat_id, ss.status, ss.reserved_until,
                           s.row_label, s.seat_number, s.seat_type, s.price
                    FROM tbl_showtime_seats ss
                    JOIN tbl_seats s ON s.id = ss.seat_id
                    WHERE ss.showtime_id = $1 AND ss.seat_id = ANY($2::bigint[])
                `, [showtime_id, seat_ids]);

                // Fetch showtime details
                const { rows: stRows } = await client.query(`
                    SELECT st.theater_id, st.tmdb_movie_id, st.movie_title, st.show_date, st.show_time
                    FROM tbl_showtimes st WHERE st.id = $1
                `, [showtime_id]);
                const showtime = stRows[0];

                const amounts = common.calculateTotalAmount(seatRows);
                const booking_ref = common.generateBookingId();

                // Create booking
                const { rows: bookingRows } = await client.query(`
                    INSERT INTO tbl_bookings
                        (booking_ref, user_id, showtime_id, theater_id, tmdb_movie_id, movie_title,
                         show_date, show_time, total_seats, subtotal, convenience_fee, taxes,
                         total_amount, status)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'confirmed')
                    RETURNING id, booking_ref
                `, [
                    booking_ref, user_id, showtime_id, showtime.theater_id,
                    showtime.tmdb_movie_id, showtime.movie_title,
                    showtime.show_date, showtime.show_time, seat_ids.length,
                    amounts.subtotal, amounts.convenience_fee, amounts.taxes, amounts.total_amount,
                ]);

                const booking_id = bookingRows[0].id;

                // Insert booking seats
                for (const seat of seatRows) {
                    await client.query(`
                        INSERT INTO tbl_booking_seats (booking_id, seat_id, showtime_id, row_label, seat_number, seat_type, price)
                        VALUES ($1,$2,$3,$4,$5,$6,$7)
                    `, [booking_id, seat.seat_id, showtime_id, seat.row_label, seat.seat_number, seat.seat_type, seat.price]);
                }

                // Mark seats as booked
                await client.query(`
                    UPDATE tbl_showtime_seats
                    SET status = 'booked', updated_at = NOW()
                    WHERE showtime_id = $1 AND seat_id = ANY($2::bigint[])
                `, [showtime_id, seat_ids]);

                // Link payment to booking
                await client.query(`
                    UPDATE tbl_payments SET booking_id = $1, updated_at = NOW() WHERE id = $2
                `, [booking_id, payment_id]);

                // Create notification
                await client.query(`
                    INSERT INTO tbl_notifications (user_id, title, body, type, reference_id)
                    VALUES ($1, 'Booking Confirmed!', $2, 'booking_confirmed', $3)
                `, [
                    user_id,
                    `Your booking for ${showtime.movie_title} on ${showtime.show_date} is confirmed. Ref: ${booking_ref}`,
                    booking_id,
                ]);

                await client.query('COMMIT');

                // Send confirmation email (non-blocking)
                try {
                    const { rows: userRows } = await pool.query(
                        `SELECT first_name, email FROM tbl_users WHERE id = $1`, [user_id]
                    );
                    const { rows: theaterRows } = await pool.query(
                        `SELECT name FROM tbl_theaters WHERE id = $1`, [showtime.theater_id]
                    );
                    const user = userRows[0];
                    const bookingData = {
                        booking_ref, movie_title: showtime.movie_title,
                        show_date: showtime.show_date, show_time: showtime.show_time,
                        theater_name: theaterRows[0]?.name,
                        total_amount: amounts.total_amount,
                        seats: seatRows,
                    };
                    sendIndiaMail({
                        from: process.env.EMAIL || process.env.EMAIL_SMTP_USERNAME,
                        to: user.email,
                        subject: `Booking Confirmed — ${booking_ref}`,
                        html: getBookingConfirmationTemplate(bookingData, user),
                    }).catch(err => console.error('Booking email error:', err));
                } catch (emailErr) {
                    console.error('Email prep error:', emailErr);
                }

                return {
                    httpCode: 200,
                    code: responseCode.SUCCESS,
                    message: { keyword: 'booking_confirmed' },
                    data: { booking_id, booking_ref, ...amounts },
                };
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }
        } catch (err) {
            console.error('ConfirmBooking Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CANCEL BOOKING
    // ─────────────────────────────────────────────────────────────────────────
    async cancelBooking(req) {
        try {
            const user_id = req.user_id;
            const { booking_id, cancellation_reason = '' } = req.body;

            const { rows: bookingRows } = await pool.query(`
                SELECT id, status, showtime_id FROM tbl_bookings
                WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE
            `, [booking_id, user_id]);

            if (bookingRows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'booking_not_found' }, data: {} };
            }
            if (bookingRows[0].status !== 'confirmed') {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'booking_not_found' }, data: {} };
            }

            const { showtime_id } = bookingRows[0];

            // Get seat IDs from this booking
            const { rows: bsRows } = await pool.query(
                `SELECT seat_id FROM tbl_booking_seats WHERE booking_id = $1`, [booking_id]
            );
            const seatIds = bsRows.map(r => r.seat_id);

            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                await client.query(`
                    UPDATE tbl_bookings
                    SET status = 'cancelled', cancellation_reason = $1, cancelled_at = NOW(),
                        is_active = FALSE, updated_at = NOW()
                    WHERE id = $2
                `, [cancellation_reason, booking_id]);

                if (seatIds.length > 0) {
                    await client.query(`
                        UPDATE tbl_showtime_seats
                        SET status = 'available', reserved_at = NULL, reserved_until = NULL, updated_at = NOW()
                        WHERE showtime_id = $1 AND seat_id = ANY($2::bigint[])
                    `, [showtime_id, seatIds]);
                }

                await client.query(`
                    INSERT INTO tbl_notifications (user_id, title, body, type, reference_id)
                    VALUES ($1, 'Booking Cancelled', 'Your booking has been cancelled.', 'booking_cancelled', $2)
                `, [user_id, booking_id]);

                await client.query('COMMIT');
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }

            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'booking_cancelled' }, data: { booking_id } };
        } catch (err) {
            console.error('CancelBooking Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // GET MY BOOKINGS (paginated)
    // ─────────────────────────────────────────────────────────────────────────
    async getMyBookings(req) {
        try {
            const user_id = req.user_id;
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.min(50, parseInt(req.query.limit) || 10);
            const offset = (page - 1) * limit;

            const { rows: countRows } = await pool.query(
                `SELECT COUNT(*) AS total FROM tbl_bookings WHERE user_id = $1 AND is_deleted = FALSE`,
                [user_id]
            );
            const total = parseInt(countRows[0].total);

            const { rows } = await pool.query(`
                SELECT b.id AS booking_id, b.booking_ref, b.tmdb_movie_id, b.movie_title,
                       b.show_date, b.show_time, b.total_seats, b.total_amount, b.status,
                       b.created_at, th.name AS theater_name, th.address AS theater_address
                FROM tbl_bookings b
                JOIN tbl_theaters th ON th.id = b.theater_id
                WHERE b.user_id = $1 AND b.is_deleted = FALSE
                ORDER BY b.created_at DESC
                LIMIT $2 OFFSET $3
            `, [user_id, limit, offset]);

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'success' },
                data: { bookings: rows, total, page, limit, total_pages: Math.ceil(total / limit) },
            };
        } catch (err) {
            console.error('GetMyBookings Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // GET BOOKING DETAIL
    // ─────────────────────────────────────────────────────────────────────────
    async getBookingDetail(req) {
        try {
            const user_id = req.user_id;
            const booking_id = req.query.booking_id;

            if (!booking_id) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'booking_not_found' }, data: {} };
            }

            const { rows } = await pool.query(`
                SELECT b.id AS booking_id, b.booking_ref, b.tmdb_movie_id, b.movie_title,
                       b.show_date, b.show_time, b.total_seats, b.subtotal, b.convenience_fee,
                       b.taxes, b.total_amount, b.status, b.cancellation_reason,
                       b.cancelled_at, b.created_at,
                       th.name AS theater_name, th.address AS theater_address,
                       scr.name AS screen_name, scr.screen_type
                FROM tbl_bookings b
                JOIN tbl_theaters th ON th.id = b.theater_id
                JOIN tbl_showtimes st ON st.id = b.showtime_id
                JOIN tbl_screens scr ON scr.id = st.screen_id
                WHERE b.id = $1 AND b.user_id = $2 AND b.is_deleted = FALSE
            `, [booking_id, user_id]);

            if (rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'booking_not_found' }, data: {} };
            }

            const { rows: seatRows } = await pool.query(`
                SELECT seat_id, row_label, seat_number, seat_type, price
                FROM tbl_booking_seats WHERE booking_id = $1
                ORDER BY row_label ASC, seat_number ASC
            `, [booking_id]);

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'success' },
                data: { ...rows[0], seats: seatRows },
            };
        } catch (err) {
            console.error('GetBookingDetail Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },
};

module.exports = booking_model;
