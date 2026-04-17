const pool         = require('../../../../config/database');
const responseCode = require('../../../../config/responseCode');
const crypto       = require('crypto');

const payment_model = {

    // ─────────────────────────────────────────────────────────────────────────
    // INITIATE PAYMENT — create a pending payment record
    // ─────────────────────────────────────────────────────────────────────────
    async initiatePayment(req) {
        try {
            const user_id = req.user_id;
            const { showtime_id, seat_ids, payment_method = 'card', amount } = req.body;

            // Verify showtime exists
            const { rows: stRows } = await pool.query(
                `SELECT id FROM tbl_showtimes WHERE id = $1 AND is_active = TRUE AND is_deleted = FALSE`,
                [showtime_id]
            );
            if (stRows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'showtime_not_found' }, data: {} };
            }

            // Verify requested seats are reserved (by checking status)
            const { rows: seatRows } = await pool.query(`
                SELECT ss.seat_id, ss.status FROM tbl_showtime_seats ss
                WHERE ss.showtime_id = $1 AND ss.seat_id = ANY($2::bigint[])
            `, [showtime_id, seat_ids]);

            const notReserved = seatRows.filter(s => s.status !== 'reserved');
            if (notReserved.length > 0 || seatRows.length !== seat_ids.length) {
                return { httpCode: 200, code: responseCode.SEAT_UNAVAILABLE, message: { keyword: 'seat_unavailable' }, data: {} };
            }

            // Generate dummy order ID
            const gateway_order_id = `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

            const { rows } = await pool.query(`
                INSERT INTO tbl_payments
                    (user_id, payment_method, payment_status, gateway_order_id, amount, currency)
                VALUES ($1,$2,'pending',$3,$4,'INR')
                RETURNING id, gateway_order_id, amount, payment_status, created_at
            `, [user_id, payment_method, gateway_order_id, amount]);

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'payment_initiated' },
                data: rows[0],
            };
        } catch (err) {
            console.error('InitiatePayment Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PROCESS PAYMENT — dummy gateway simulation
    // ─────────────────────────────────────────────────────────────────────────
    async processPayment(req) {
        try {
            const user_id = req.user_id;
            const { payment_id, payment_meta = {}, should_fail = false } = req.body;

            const { rows } = await pool.query(`
                SELECT id, payment_status, amount FROM tbl_payments
                WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE
            `, [payment_id, user_id]);

            if (rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'payment_not_found' }, data: {} };
            }

            if (rows[0].payment_status !== 'pending') {
                return {
                    httpCode: 200,
                    code: responseCode.SUCCESS,
                    message: { keyword: rows[0].payment_status === 'success' ? 'payment_success' : 'payment_failed' },
                    data: rows[0],
                };
            }

            const newStatus        = should_fail ? 'failed' : 'success';
            const gateway_payment_id = should_fail
                ? null
                : `PAY-${Date.now()}-${require('crypto').randomBytes(4).toString('hex').toUpperCase()}`;

            const { rows: updated } = await pool.query(`
                UPDATE tbl_payments
                SET payment_status = $1,
                    gateway_payment_id = $2,
                    payment_meta = $3,
                    paid_at = CASE WHEN $1 = 'success' THEN NOW() ELSE NULL END,
                    updated_at = NOW()
                WHERE id = $4
                RETURNING id, payment_status, gateway_order_id, gateway_payment_id, amount, paid_at
            `, [newStatus, gateway_payment_id, JSON.stringify(payment_meta), payment_id]);

            return {
                httpCode: 200,
                code: newStatus === 'success' ? responseCode.SUCCESS : responseCode.PAYMENT_FAILED,
                message: { keyword: newStatus === 'success' ? 'payment_success' : 'payment_failed' },
                data: updated[0],
            };
        } catch (err) {
            console.error('ProcessPayment Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // GET PAYMENT STATUS
    // ─────────────────────────────────────────────────────────────────────────
    async getPaymentStatus(req) {
        try {
            const user_id    = req.user_id;
            const payment_id = req.query.payment_id;

            if (!payment_id) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'payment_not_found' }, data: {} };
            }

            const { rows } = await pool.query(`
                SELECT id AS payment_id, booking_id, payment_method, payment_status,
                       gateway_order_id, gateway_payment_id, amount, currency, payment_meta, paid_at, created_at
                FROM tbl_payments
                WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE
            `, [payment_id, user_id]);

            if (rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'payment_not_found' }, data: {} };
            }

            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'success' }, data: rows[0] };
        } catch (err) {
            console.error('GetPaymentStatus Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },
};

module.exports = payment_model;
