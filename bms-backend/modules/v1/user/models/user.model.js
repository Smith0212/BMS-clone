const pool         = require('../../../../config/database');
const responseCode = require('../../../../config/responseCode');
const bcrypt       = require('bcrypt');
const jwt          = require('jsonwebtoken');
const { sendOTP }  = require('../../../../middleware/middleware');
const common       = require('../../../../utils/common');

const user_model = {

    // ─────────────────────────────────────────────────────────────────────────
    // SIGNUP
    // ─────────────────────────────────────────────────────────────────────────
    async signup(req) {
        try {
            const {
                first_name, last_name, email, password, social_id,
                country_code, phone, signup_type = 's',
                device_type = 'W', device_name = 'unknown',
                os_version = 'unknown', app_version = '1.0',
                fcm_token = 'unknown', timezone = 'UTC',
            } = req.body;

            // Email uniqueness check
            if (email && signup_type === 's') {
                const { rows } = await pool.query(
                    `SELECT id FROM tbl_users
                     WHERE email = $1 AND user_role = 'customer' AND is_deleted = FALSE`,
                    [email]
                );
                if (rows.length > 0) {
                    return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'email_already_exists' }, data: {} };
                }
            }

            // Social ID uniqueness check
            if (signup_type !== 's' && social_id) {
                const { rows } = await pool.query(
                    `SELECT id FROM tbl_users WHERE social_id = $1 AND signup_type = $2 AND is_deleted = FALSE`,
                    [social_id, signup_type]
                );
                if (rows.length > 0) {
                    return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'email_already_exists' }, data: {} };
                }
            }

            const hashedPassword = signup_type === 's' ? await bcrypt.hash(password, 10) : null;

            const client = await pool.connect();
            let newUserId;
            try {
                await client.query('BEGIN');

                const { rows: insertRows } = await client.query(`
                    INSERT INTO tbl_users
                        (first_name, last_name, email, password, country_code, phone, signup_type, social_id, user_role)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'customer')
                    RETURNING id
                `, [first_name, last_name, signup_type === 's' ? email : null,
                    hashedPassword, country_code, phone, signup_type, social_id]);

                newUserId = insertRows[0].id;

                await client.query(`
                    INSERT INTO tbl_device_info
                        (user_id, device_type, device_name, os_version, app_version, user_token, fcm_token, timezone)
                    VALUES ($1,$2,$3,$4,$5,NULL,$6,$7)
                `, [newUserId, device_type, device_name, os_version, app_version, fcm_token, timezone]);

                await client.query('COMMIT');
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }

            const otpData = signup_type === 's' ? await sendOTP(email, 'signup', 'customer') : null;

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'success' },
                data: { user_id: newUserId, ...(otpData || {}) },
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
                    `UPDATE tbl_users SET is_verified = TRUE, forgot_otp_verified = TRUE, updated_at = NOW() WHERE id = $1`,
                    [user.id]
                );
            }

            let user_token = null;
            if (action === 'signup') {
                user_token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '1y' });

                const { rows: devRows } = await pool.query(`SELECT id FROM tbl_device_info WHERE user_id = $1`, [user.id]);
                if (devRows.length > 0) {
                    await pool.query(`UPDATE tbl_device_info SET user_token = $1, updated_at = NOW() WHERE user_id = $2`, [user_token, user.id]);
                } else {
                    await pool.query(
                        `INSERT INTO tbl_device_info (user_id, device_type, user_token) VALUES ($1,'W',$2)`,
                        [user.id, user_token]
                    );
                }
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
            const {
                email, password, login_type = 's', social_id,
                device_type = 'W', device_name = 'unknown',
                os_version = 'unknown', app_version = '1.0',
                fcm_token = 'unknown', timezone = 'UTC', ip = '',
            } = req.body;

            let userQuery, params;
            if (login_type === 's') {
                userQuery = `SELECT id AS user_id, email, password, is_verified, is_active, signup_type, user_role,
                                    first_name, last_name, profile_image, country_code, phone, dob, city, state, country
                             FROM tbl_users WHERE email = $1 AND user_role = 'customer' AND is_deleted = FALSE`;
                params = [email];
            } else {
                userQuery = `SELECT id AS user_id, email, is_verified, is_active, signup_type, user_role,
                                    first_name, last_name, profile_image
                             FROM tbl_users WHERE social_id = $1 AND signup_type = $2 AND user_role = 'customer' AND is_deleted = FALSE`;
                params = [social_id, login_type];
            }

            const { rows } = await pool.query(userQuery, params);
            if (rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }

            const user = rows[0];

            if (!user.is_verified) {
                const otpData = await sendOTP(user.email, 'signup', 'customer');
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

            if (login_type === 's') {
                const valid = await bcrypt.compare(password, user.password);
                if (!valid) {
                    return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'login_invalid_credential' }, data: {} };
                }
            }
            delete user.password;

            const user_token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

            const { rows: devRows } = await pool.query(`SELECT id FROM tbl_device_info WHERE user_id = $1`, [user.user_id]);
            if (devRows.length > 0) {
                await pool.query(`
                    UPDATE tbl_device_info SET
                        device_type=$1, device_name=$2, os_version=$3, app_version=$4,
                        user_token=$5, fcm_token=$6, timezone=$7, ip=$8, updated_at=NOW()
                    WHERE user_id=$9
                `, [device_type, device_name, os_version, app_version, user_token, fcm_token, timezone, ip, user.user_id]);
            } else {
                await pool.query(`
                    INSERT INTO tbl_device_info (user_id, device_type, device_name, os_version, app_version, user_token, fcm_token, timezone, ip)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
                `, [user.user_id, device_type, device_name, os_version, app_version, user_token, fcm_token, timezone, ip]);
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

            const otpData = await sendOTP(email, action, 'customer');
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

            const otpData = await sendOTP(email, 'forgot', 'customer');
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
                `SELECT id, forgot_otp_verified FROM tbl_users WHERE email = $1 AND is_active = TRUE AND is_deleted = FALSE`,
                [email]
            );
            if (rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }
            if (!rows[0].forgot_otp_verified) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'forgot_otp_not_verified' }, data: {} };
            }

            const hashedPassword = await bcrypt.hash(new_password, 10);
            await pool.query(
                `UPDATE tbl_users SET password = $1, forgot_otp_verified = FALSE, updated_at = NOW() WHERE id = $2`,
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

            const { rows } = await pool.query(`SELECT user_token FROM tbl_device_info WHERE user_id = $1`, [user_id]);
            if (rows.length === 0 || !rows[0].user_token) {
                return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'already_logged_out' }, data: { user_id } };
            }

            await pool.query(`UPDATE tbl_device_info SET user_token = NULL, fcm_token = NULL, updated_at = NOW() WHERE user_id = $1`, [user_id]);
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
                SELECT id AS user_id, user_role, first_name, last_name, email, country_code, phone,
                       profile_image, dob, city, state, country, signup_type, is_verified, created_at
                FROM tbl_users
                WHERE id = $1 AND user_role = 'customer' AND is_active = TRUE AND is_deleted = FALSE
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
            const { first_name, last_name, profile_image, country_code, phone, email, dob, city, state, country } = req.body;

            const { rows: userRows } = await pool.query(
                `SELECT id FROM tbl_users WHERE id = $1 AND user_role = 'customer' AND is_active = TRUE AND is_deleted = FALSE`,
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
            if (country_code  !== undefined) { fields.push(`country_code=$${idx++}`);  values.push(country_code); }
            if (phone         !== undefined) { fields.push(`phone=$${idx++}`);         values.push(phone); }
            if (email         !== undefined) { fields.push(`email=$${idx++}`);         values.push(email); }
            if (dob           !== undefined) { fields.push(`dob=$${idx++}`);           values.push(dob || null); }
            if (city          !== undefined) { fields.push(`city=$${idx++}`);          values.push(city); }
            if (state         !== undefined) { fields.push(`state=$${idx++}`);         values.push(state); }
            if (country       !== undefined) { fields.push(`country=$${idx++}`);       values.push(country); }

            if (fields.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'no_fields_to_update' }, data: {} };
            }

            fields.push(`updated_at=NOW()`);
            values.push(user_id);

            const { rows: updated } = await pool.query(
                `UPDATE tbl_users SET ${fields.join(', ')} WHERE id=$${idx}
                 RETURNING id AS user_id, first_name, last_name, email, country_code, phone, profile_image, dob, city, state, country`,
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
                `SELECT id, password, signup_type FROM tbl_users WHERE id = $1 AND is_active = TRUE AND is_deleted = FALSE`,
                [user_id]
            );
            if (rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }

            const user = rows[0];
            if (user.signup_type !== 's') {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'social_account_no_password' }, data: {} };
            }

            const isMatch = await bcrypt.compare(old_password, user.password);
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
                await client.query(`UPDATE tbl_device_info SET user_token=NULL, fcm_token=NULL WHERE user_id=$1`, [user_id]);
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
    // GET NOTIFICATIONS
    // ─────────────────────────────────────────────────────────────────────────
    async getNotifications(req) {
        try {
            const user_id = req.user_id;
            const { rows } = await pool.query(`
                SELECT id, title, body, type, reference_id, is_read, created_at
                FROM tbl_notifications
                WHERE user_id = $1 AND is_deleted = FALSE
                ORDER BY created_at DESC
            `, [user_id]);

            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'notifications_found' }, data: rows };
        } catch (err) {
            console.error('GetNotifications Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MARK AS READ
    // ─────────────────────────────────────────────────────────────────────────
    async markAsRead(req) {
        try {
            const user_id = req.user_id;
            const { notification_ids } = req.body;

            await pool.query(`
                UPDATE tbl_notifications SET is_read = TRUE, updated_at = NOW()
                WHERE id = ANY($1::bigint[]) AND user_id = $2
            `, [notification_ids, user_id]);

            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'marked_as_read' }, data: {} };
        } catch (err) {
            console.error('MarkAsRead Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MARK ALL READ
    // ─────────────────────────────────────────────────────────────────────────
    async markAllRead(req) {
        try {
            const user_id = req.user_id;
            await pool.query(`
                UPDATE tbl_notifications SET is_read = TRUE, updated_at = NOW()
                WHERE user_id = $1 AND is_deleted = FALSE
            `, [user_id]);

            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'all_marked_as_read' }, data: {} };
        } catch (err) {
            console.error('MarkAllRead Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },
};

module.exports = user_model;
