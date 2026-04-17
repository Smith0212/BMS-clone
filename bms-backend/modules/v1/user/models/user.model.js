const pool         = require('../../../../config/database');
const responseCode = require('../../../../config/responseCode');
const bcrypt       = require('bcrypt');
const jwt          = require('jsonwebtoken');
const { sendOTP } = require('../../../../middleware/middleware');

const user_model = {

    // ─────────────────────────────────────────────────────────────────────────
    // SIGNUP
    // ─────────────────────────────────────────────────────────────────────────
    async signup(req) {
        try {
            const { first_name, last_name, email, password, phone } = req.body;

            const { rows: existing } = await pool.query(
                `SELECT id FROM tbl_users WHERE email = $1 AND is_deleted = FALSE`,
                [email]
            );
            if (existing.length > 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'email_already_exists' }, data: {} };
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const client = await pool.connect();
            let newUserId;
            try {
                await client.query('BEGIN');

                const { rows: insertRows } = await client.query(`
                    INSERT INTO tbl_users (first_name, last_name, email, password, phone)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id
                `, [first_name, last_name || '', email, hashedPassword, phone || null]);

                newUserId = insertRows[0].id;

                await client.query(`
                    INSERT INTO tbl_device_info (user_id) VALUES ($1)
                `, [newUserId]);

                await client.query('COMMIT');
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }

            const otpData = await sendOTP(email, 'signup');

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'success' },
                data: { user_id: newUserId, otp: otpData.otp },
            };
        } catch (err) {
            console.error('Signup Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // VERIFY OTP
    // ─────────────────────────────────────────────────────────────────────────
    async verifyOtp(req) {
        try {
            const { email, otp, action } = req.body;

            const { rows: userRows } = await pool.query(
                `SELECT id, is_verified FROM tbl_users WHERE email = $1 AND is_active = TRUE AND is_deleted = FALSE`,
                [email]
            );
            if (userRows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }
            const user = userRows[0];

            const { rows: otpRows } = await pool.query(
                `SELECT * FROM tbl_otp WHERE user_id = $1 AND otp = $2 AND action = $3 AND expires_at > NOW()`,
                [user.id, otp, action]
            );
            if (otpRows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'invalid_otp' }, data: {} };
            }

            if (action === 'signup') {
                await pool.query(`UPDATE tbl_users SET is_verified = TRUE, updated_at = NOW() WHERE id = $1`, [user.id]);
            } else if (action === 'forgot') {
                await pool.query(
                    `UPDATE tbl_users SET is_verified = TRUE, updated_at = NOW() WHERE id = $1`,
                    [user.id]
                );
            }

            let user_token = null;
            if (action === 'signup') {
                user_token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '1y' });
                await pool.query(
                    `UPDATE tbl_device_info SET user_token = $1, updated_at = NOW() WHERE user_id = $2`,
                    [user_token, user.id]
                );
            }

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'otp_verified' },
                data: { user_id: user.id, ...(user_token ? { user_token } : {}) },
            };
        } catch (err) {
            console.error('VerifyOtp Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────────────────────────────────────
    async login(req) {
        try {
            const { email, password, ip = '' } = req.body;

            const { rows } = await pool.query(
                `SELECT id AS user_id, email, password, is_verified, is_active,
                        first_name, last_name, profile_image, phone, city
                 FROM tbl_users WHERE email = $1 AND is_deleted = FALSE`,
                [email]
            );
            if (rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }

            const user = rows[0];

            if (!user.is_verified) {
                const otpData = await sendOTP(user.email, 'signup');
                return {
                    httpCode: 200,
                    code: responseCode.EMAIL_UNVERIFIED,
                    message: { keyword: 'not_verified_otp_sent' },
                    data: { user_id: user.user_id, otp: otpData.otp },
                };
            }

            if (!user.is_active) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_blocked_by_admin' }, data: {} };
            }

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'login_invalid_credential' }, data: {} };
            }
            delete user.password;

            const user_token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

            const { rows: devRows } = await pool.query(`SELECT id FROM tbl_device_info WHERE user_id = $1`, [user.user_id]);
            if (devRows.length > 0) {
                await pool.query(
                    `UPDATE tbl_device_info SET user_token = $1, ip = $2, updated_at = NOW() WHERE user_id = $3`,
                    [user_token, ip, user.user_id]
                );
            } else {
                await pool.query(
                    `INSERT INTO tbl_device_info (user_id, user_token, ip) VALUES ($1, $2, $3)`,
                    [user.user_id, user_token, ip]
                );
            }

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'success' },
                data: { ...user, user_token },
            };
        } catch (err) {
            console.error('Login Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // RESEND OTP
    // ─────────────────────────────────────────────────────────────────────────
    async resendOtp(req) {
        try {
            const { email, action } = req.body;

            const { rows } = await pool.query(
                `SELECT id, is_active FROM tbl_users WHERE email = $1 AND is_deleted = FALSE`,
                [email]
            );
            if (rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }
            if (!rows[0].is_active) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'account_inactive' }, data: {} };
            }

            const otpData = await sendOTP(email, action);
            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'otp_resent' }, data: { otp: otpData.otp } };
        } catch (err) {
            console.error('ResendOtp Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // FORGOT PASSWORD
    // ─────────────────────────────────────────────────────────────────────────
    async forgotPassword(req) {
        try {
            const { email } = req.body;

            const { rows } = await pool.query(
                `SELECT id, is_active FROM tbl_users WHERE email = $1 AND is_deleted = FALSE`,
                [email]
            );
            if (rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }
            if (!rows[0].is_active) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'account_inactive' }, data: {} };
            }

            const otpData = await sendOTP(email, 'forgot');
            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'forgot_password_otp_sent' }, data: { otp: otpData.otp } };
        } catch (err) {
            console.error('ForgotPassword Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // RESET PASSWORD
    // ─────────────────────────────────────────────────────────────────────────
    async resetPassword(req) {
        try {
            const { email, new_password } = req.body;

            const { rows } = await pool.query(
                `SELECT id FROM tbl_users WHERE email = $1 AND is_active = TRUE AND is_deleted = FALSE`,
                [email]
            );
            if (rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }

            const hashedPassword = await bcrypt.hash(new_password, 10);
            await pool.query(
                `UPDATE tbl_users SET password = $1, updated_at = NOW() WHERE id = $2`,
                [hashedPassword, rows[0].id]
            );

            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'password_reset_success' }, data: { user_id: rows[0].id } };
        } catch (err) {
            console.error('ResetPassword Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // LOGOUT
    // ─────────────────────────────────────────────────────────────────────────
    async logout(req) {
        try {
            const user_id = req.user_id;
            await pool.query(`UPDATE tbl_device_info SET user_token = NULL, updated_at = NOW() WHERE user_id = $1`, [user_id]);
            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'logout_success' }, data: { user_id } };
        } catch (err) {
            console.error('Logout Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // GET PROFILE
    // ─────────────────────────────────────────────────────────────────────────
    async getProfile(req) {
        try {
            const { rows } = await pool.query(`
                SELECT id AS user_id, first_name, last_name, email, phone,
                       profile_image, city, is_verified, created_at
                FROM tbl_users
                WHERE id = $1 AND is_active = TRUE AND is_deleted = FALSE
            `, [req.user_id]);

            if (rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }
            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'success' }, data: rows[0] };
        } catch (err) {
            console.error('GetProfile Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE PROFILE
    // ─────────────────────────────────────────────────────────────────────────
    async updateProfile(req) {
        try {
            const user_id = req.user_id;
            const { first_name, last_name, profile_image, phone, email, city } = req.body;

            const { rows: userRows } = await pool.query(
                `SELECT id FROM tbl_users WHERE id = $1 AND is_active = TRUE AND is_deleted = FALSE`,
                [user_id]
            );
            if (userRows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }

            if (email) {
                const { rows: emailRows } = await pool.query(
                    `SELECT id FROM tbl_users WHERE email = $1 AND id != $2 AND is_deleted = FALSE`,
                    [email, user_id]
                );
                if (emailRows.length > 0) {
                    return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'email_already_exists' }, data: {} };
                }
            }

            const fields = [], values = [];
            let idx = 1;
            if (first_name    !== undefined) { fields.push(`first_name=$${idx++}`);    values.push(first_name); }
            if (last_name     !== undefined) { fields.push(`last_name=$${idx++}`);     values.push(last_name); }
            if (profile_image !== undefined) { fields.push(`profile_image=$${idx++}`); values.push(profile_image); }
            if (phone         !== undefined) { fields.push(`phone=$${idx++}`);         values.push(phone); }
            if (email         !== undefined) { fields.push(`email=$${idx++}`);         values.push(email); }
            if (city          !== undefined) { fields.push(`city=$${idx++}`);          values.push(city); }

            if (fields.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'no_fields_to_update' }, data: {} };
            }

            fields.push(`updated_at=NOW()`);
            values.push(user_id);

            const { rows: updated } = await pool.query(
                `UPDATE tbl_users SET ${fields.join(', ')} WHERE id=$${idx}
                 RETURNING id AS user_id, first_name, last_name, email, phone, profile_image, city`,
                values
            );

            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'profile_updated' }, data: updated[0] };
        } catch (err) {
            console.error('UpdateProfile Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CHANGE PASSWORD
    // ─────────────────────────────────────────────────────────────────────────
    async changePassword(req) {
        try {
            const user_id = req.user_id;
            const { old_password, new_password } = req.body;

            const { rows } = await pool.query(
                `SELECT id, password FROM tbl_users WHERE id = $1 AND is_active = TRUE AND is_deleted = FALSE`,
                [user_id]
            );
            if (rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }

            const isMatch = await bcrypt.compare(old_password, rows[0].password);
            if (!isMatch) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'old_password_incorrect' }, data: {} };
            }

            const hashed = await bcrypt.hash(new_password, 10);
            await pool.query(`UPDATE tbl_users SET password=$1, updated_at=NOW() WHERE id=$2`, [hashed, user_id]);

            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'password_changed_success' }, data: { user_id } };
        } catch (err) {
            console.error('ChangePassword Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE ACCOUNT (soft delete)
    // ─────────────────────────────────────────────────────────────────────────
    async deleteAccount(req) {
        try {
            const user_id = req.user_id;

            const { rows } = await pool.query(
                `SELECT id FROM tbl_users WHERE id = $1 AND is_active = TRUE AND is_deleted = FALSE`,
                [user_id]
            );
            if (rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }

            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                await client.query(`UPDATE tbl_users SET is_deleted=TRUE, is_active=FALSE, updated_at=NOW() WHERE id=$1`, [user_id]);
                await client.query(`UPDATE tbl_device_info SET user_token=NULL WHERE user_id=$1`, [user_id]);
                await client.query('COMMIT');
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }

            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'account_deleted_success' }, data: { user_id } };
        } catch (err) {
            console.error('DeleteAccount Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // NOTIFICATIONS
    // ─────────────────────────────────────────────────────────────────────────
    async getNotifications(req) {
        try {
            const { rows } = await pool.query(`
                SELECT id, title, body, type, reference_id, is_read, created_at
                FROM tbl_notifications
                WHERE user_id = $1 AND is_deleted = FALSE
                ORDER BY created_at DESC
            `, [req.user_id]);
            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'notifications_found' }, data: rows };
        } catch (err) {
            console.error('GetNotifications Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    async markAsRead(req) {
        try {
            const { notification_ids } = req.body;
            await pool.query(
                `UPDATE tbl_notifications SET is_read = TRUE, updated_at = NOW() WHERE id = ANY($1::bigint[]) AND user_id = $2`,
                [notification_ids, req.user_id]
            );
            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'marked_as_read' }, data: {} };
        } catch (err) {
            console.error('MarkAsRead Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    async markAllRead(req) {
        try {
            await pool.query(
                `UPDATE tbl_notifications SET is_read = TRUE, updated_at = NOW() WHERE user_id = $1 AND is_deleted = FALSE`,
                [req.user_id]
            );
            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'all_marked_as_read' }, data: {} };
        } catch (err) {
            console.error('MarkAllRead Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },
};

module.exports = user_model;
