const pool = require('../../../../config/database');
const responseCode = require('../../../../config/responseCode');
const crypto = require('crypto');

const payment_model = {

    // ─────────────────────────────────────────────────────────────────────────
    // INITIATE PAYMENT — create a pending payment record
    // ─────────────────────────────────────────────────────────────────────────
    async initiatePayment(req) {
        try {
            const user_id = req.user_id;
            const { showtime_id, seat_ids, payment_method = 'card', amount } = req.body;

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
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PROCESS PAYMENT — dummy gateway simulation
    // ─────────────────────────────────────────────────────────────────────────
    async processPayment(req) {
        try {
            const user_id = req.user_id;
            const { payment_id, payment_meta = {} } = req.body;

            const { rows } = await pool.query(`
                SELECT id, payment_status FROM tbl_payments
                WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE
            `, [payment_id, user_id]);

            if (rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'payment_not_found' }, data: {} };
            }

            if (rows[0].payment_status === 'success') {
                return {
                    httpCode: 200,
                    code: responseCode.SUCCESS,
                    message: { keyword: 'payment_success' },
                    data: rows[0],
                };
            }

            const gateway_payment_id = `PAY-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

            const { rows: updated } = await pool.query(`
                UPDATE tbl_payments
                SET payment_status = 'success',
                    gateway_payment_id = $1,
                    payment_meta = $2,
                    paid_at = NOW(),
                    updated_at = NOW()
                WHERE id = $3
                RETURNING id, payment_status, gateway_order_id, gateway_payment_id, amount, paid_at
            `, [gateway_payment_id, JSON.stringify(payment_meta), payment_id]);

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'payment_success' },
                data: updated[0],
            };
        } catch (err) {
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // GET PAYMENT STATUS
    // ─────────────────────────────────────────────────────────────────────────
    async getPaymentStatus(req) {
        try {
            const user_id = req.user_id;
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
