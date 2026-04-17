const { sendOTP } = require('../../../../middleware/middleware');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../../../config/database');
const responseCode = require('../../../../config/responseCode');
const common = require('../../../../utils/common');

let user_model = {

    // ──────────────────────────────────────────────────────────────────────────────
    // auth model
    // ──────────────────────────────────────────────────────────────────────────────

    async signup(req) {
        try {
            const {
                user_role = 'customer',
                first_name,
                last_name,
                email,
                password,
                social_id,
                country_code,
                phone,
                signup_type = 's',
                referral_code,
                device_type = 'A',
                device_name = 'unknown',
                os_version = 'unknown',
                app_version = '1.0',
                fcm_token = 'unknown',
                timezone = 'UTC'
            } = req.body;

            if (!['s', 'g', 'f', 'a'].includes(signup_type)) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'invalid_signup_type' }, data: {} };
            }

            if (!first_name || !last_name) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'missing_first_name_or_last_name' }, data: {} };
            }

            if (signup_type === 's' && (!email || !password)) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'missing_email_or_password' }, data: {} };
            }

            if (email && signup_type === 's') {
                const emailValidation = common.validateEmail(email);
                if (!emailValidation.isValid) {
                    return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'invalid_email_format', details: emailValidation.message }, data: {} };
                }
            }

            const checkUserQuery = `
                SELECT id
                FROM tbl_users
                WHERE email = $1 AND user_role = 'customer' AND is_active = TRUE AND is_deleted = FALSE
            `;
            const { rows: userRows } = await pool.query(checkUserQuery, [email]);

            if (userRows.length > 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'email_already_exists' }, data: {} };
            }

            if (phone) {
                const phoneValidation = await common.validatePhoneNumber(phone, country_code);
                if (!phoneValidation.isValid) {
                    return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'invalid_phone_number', details: phoneValidation.message }, data: {} };
                }
            }

            if (signup_type !== 's') {
                if (!social_id) {
                    return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'missing_social_id' }, data: {} };
                }

                const checkSocialQuery = `
                    SELECT id FROM tbl_users
                    WHERE social_id = $1 AND signup_type = $2 AND is_active = TRUE AND is_deleted = FALSE;
                `;
                const { rows: socialRows } = await pool.query(checkSocialQuery, [social_id, signup_type]);
                if (socialRows.length > 0) {
                    return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'social_id_already_exists' }, data: {} };
                }
            }

            const hashedPassword = signup_type === 's' ? await bcrypt.hash(password, 10) : null;
            let newUserId = null;

            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                const insertUserQuery = `
                    INSERT INTO tbl_users
                    (first_name, last_name, email, password, country_code, phone, signup_type, social_id, user_role)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING id
                `;
                const { rows: insertRows } = await client.query(insertUserQuery, [
                    first_name,
                    last_name,
                    signup_type === 's' ? email : null,
                    hashedPassword,
                    country_code,
                    phone,
                    signup_type,
                    social_id,
                    'customer'
                ]);

                newUserId = insertRows[0].id;

                const insertDeviceQuery = `
                    INSERT INTO tbl_device_info
                    (user_id, device_type, device_name, os_version, app_version, user_token, fcm_token, timezone)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `;
                await client.query(insertDeviceQuery, [
                    newUserId,
                    device_type,
                    device_name,
                    os_version,
                    app_version,
                    null,
                    fcm_token,
                    timezone
                ]);

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
                data: {
                    user_id: newUserId,
                    ...(signup_type === 's' ? otpData : {})
                }
            };

        } catch (err) {
            console.error('Signup Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    async verifyOtp(req) {
        try {
            const { email, otp, action } = req.body;

            if (!email || !otp) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'missing_parameters' }, data: {} };
            }

            const emailValidation = common.validateEmail(email);
            if (!emailValidation.isValid) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'invalid_email_format', details: emailValidation.message }, data: {} };
            }

            const userQuery = `
                SELECT id, step, is_verified FROM tbl_users
                WHERE email = $1 AND is_active = TRUE AND is_deleted = FALSE
            `;
            const userResult = await pool.query(userQuery, [email]);
            if (userResult.rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }
            const user = userResult.rows[0];

            const otpQuery = `
                SELECT * FROM tbl_otp
                WHERE user_id = $1 AND otp = $2 AND action = $3 AND expires_at > NOW()
                ORDER BY created_at DESC LIMIT 1
            `;
            const otpResult = await pool.query(otpQuery, [user.id, otp, action]);
            if (otpResult.rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'invalid_otp' }, data: {} };
            }
            let otpData = otpResult.rows[0];

            console.log("Otp Data:", otpData);

            let updateUserQuery;
            if (action == 'signup') {
                updateUserQuery = `UPDATE tbl_users SET is_verified = TRUE WHERE id = $1 RETURNING is_verified`;
            } else if (action == 'forgot') {
                updateUserQuery = `UPDATE tbl_users SET is_verified = TRUE, forgot_otp_verified = TRUE WHERE id = $1 RETURNING is_verified`;
            }
            const updateResult = await pool.query(updateUserQuery, [user.id]);

            let user_token = null;
            if (otpData.action === 'signup') {
                user_token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '1y' });

                const checkDeviceQuery = `SELECT id FROM tbl_device_info WHERE user_id = $1`;
                const deviceResult = await pool.query(checkDeviceQuery, [user.id]);
                if (deviceResult.rows.length > 0) {
                    await pool.query(
                        `UPDATE tbl_device_info SET user_token = $1 WHERE user_id = $2`,
                        [user_token, user.id]
                    );
                } else {
                    await pool.query(
                        `INSERT INTO tbl_device_info (user_id, device_type, user_token) VALUES ($1, 'A', $2)`,
                        [user.id, user_token]
                    );
                }
            }

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'otp_verified' },
                data: {
                    ...updateResult.rows[0],
                    ...(user_token ? { user_token } : {})
                }
            };

        } catch (err) {
            console.error('OTP Verification Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    async login(req) {
        try {
            const {
                email,
                password,
                login_type = 's',
                social_id,
                device_type = 'A',
                device_name = 'unknown',
                os_version = 'unknown',
                app_version = '1.0',
                fcm_token = 'unknown',
                ip = '192.168.25.3',
                timezone = 'UTC'
            } = req.body;

            if (!email) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'missing_parameters' }, data: {} };
            }

            if (login_type === 's' && !password) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'missing_parameters' }, data: {} };
            }

            if (login_type !== 's' && !social_id) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'missing_parameters' }, data: {} };
            }

            let userQuery, params;
            if (login_type === 's') {
                userQuery = `
                    SELECT id as user_id, email, password, is_verified, step, is_active, signup_type, user_role
                    FROM tbl_users
                    WHERE email = $1 AND user_role = 'customer' AND is_deleted = FALSE
                `;
                params = [email];
            } else {
                userQuery = `
                    SELECT id as user_id, email, is_verified, step, is_active, signup_type, user_role
                    FROM tbl_users
                    WHERE social_id = $1 AND user_role = 'customer' AND signup_type = $2 AND is_deleted = FALSE
                `;
                params = [social_id, login_type];
            }

            const userResult = await pool.query(userQuery, params);

            if (userResult.rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }

            const user = userResult.rows[0];

            if (!user.is_verified) {
                const otpData = await sendOTP(user.email, 'signup', 'customer');
                console.log("OTP Data:", otpData);
                return { httpCode: 200, code: responseCode.EMAIL_UNVERIFIED, message: { keyword: 'not_verified_otp_sent' }, data: { ...user, otp: otpData.otp } };
            }

            if (login_type === 's') {
                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) {
                    return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'login_invalid_credential' }, data: {} };
                }
            }
            delete user.password;

            if (!user.is_active) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_blocked_by_admin' }, data: {} };
            }

            await pool.query(
                `UPDATE tbl_device_info SET user_token = NULL, fcm_token = NULL WHERE user_id = $1`,
                [user.user_id]
            );

            const user_token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

            const checkDeviceRowQuery = `SELECT user_id FROM tbl_device_info WHERE user_id = $1`;
            const deviceRow = await pool.query(checkDeviceRowQuery, [user.user_id]);
            if (deviceRow.rows.length > 0) {
                const updateDeviceQuery = `
                    UPDATE tbl_device_info SET
                        device_type = $1, device_name = $2, os_version = $3, app_version = $4,
                        user_token = $5, timezone = $6, fcm_token = $7, ip = $8
                    WHERE user_id = $9
                `;
                await pool.query(updateDeviceQuery, [
                    device_type, device_name, os_version, app_version,
                    user_token, timezone, fcm_token, ip, user.user_id
                ]);
            } else {
                const insertDeviceQuery = `
                    INSERT INTO tbl_device_info
                        (user_id, device_type, device_name, os_version, app_version, user_token, timezone, fcm_token, ip)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `;
                await pool.query(insertDeviceQuery, [
                    user.user_id, device_type, device_name, os_version,
                    app_version, user_token, timezone, fcm_token, ip
                ]);
            }

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'success' },
                data: { ...user, user_token }
            };

        } catch (err) {
            console.error('Login Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    async resendOtp(req) {
        try {
            const email = req.body.email;
            const action = req.body.action;

            if (!email) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'missing_email' }, data: {} };
            }

            const emailValidation = common.validateEmail(email);
            if (!emailValidation.isValid) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'invalid_email_format', details: emailValidation.message }, data: {} };
            }

            const userQuery = `
                SELECT id, is_active FROM tbl_users
                WHERE email = $1 AND is_deleted = FALSE
            `;
            const userResult = await pool.query(userQuery, [email]);
            if (userResult.rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }
            const user = userResult.rows[0];

            if (!user.is_active) {
                return { httpCode: 200, code: responseCode.INACTIVE_CODE, message: { keyword: 'account_is_deactivated' }, data: user };
            }

            const otpData = await sendOTP(email, action, 'customer');

            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'otp_resent' }, data: { otp: otpData.otp } };
        } catch (err) {
            console.error('Resend OTP Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    async forgotPassword(req) {
        try {
            const { email } = req.body;
            if (!email) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'missing_email' }, data: {} };
            }

            const emailValidation = common.validateEmail(email);
            if (!emailValidation.isValid) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'invalid_email_format', details: emailValidation.message }, data: {} };
            }

            const userQuery = `
                SELECT id, is_active FROM tbl_users
                WHERE email = $1 AND is_deleted = FALSE
            `;
            const userResult = await pool.query(userQuery, [email]);
            if (userResult.rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }
            const user = userResult.rows[0];

            if (!user.is_active) {
                return { httpCode: 200, code: responseCode.INACTIVE_CODE, message: { keyword: 'account_is_deactivated' }, data: user };
            }

            const otpData = await sendOTP(email, 'forgot', 'customer');
            console.log("User1428752:", otpData);

            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'forgot_password_otp_sent' }, data: { otp: otpData.otp } };
        } catch (err) {
            console.error('Forgot Password Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    async resetPassword(req) {
        try {
            const { email, new_password } = req.body;
            if (!email || !new_password) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'missing_parameters' }, data: {} };
            }

            const emailValidation = common.validateEmail(email);
            if (!emailValidation.isValid) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'invalid_email_format', details: emailValidation.message }, data: {} };
            }

            const userQuery = `
                SELECT id, forgot_otp_verified FROM tbl_users
                WHERE email = $1 AND is_active = TRUE AND is_deleted = FALSE
            `;
            const userResult = await pool.query(userQuery, [email]);
            if (userResult.rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }
            const user = userResult.rows[0];

            if (!user.forgot_otp_verified) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'forgot_otp_not_verified' }, data: {} };
            }

            const hashedPassword = await bcrypt.hash(new_password, 10);

            const updateQuery = `
                UPDATE tbl_users SET password = $1, forgot_otp_verified = FALSE WHERE id = $2 RETURNING id
            `;
            const updateResult = await pool.query(updateQuery, [hashedPassword, user.id]);

            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'password_reset_success' }, data: { user_id: updateResult.rows[0].id } };
        } catch (err) {
            console.error('Reset Password Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    async logout(req) {
        try {
            const user_id = req.user_id;
            if (!user_id) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'missing_user_id' }, data: {} };
            }

            const checkDeviceQuery = `
                SELECT fcm_token, user_token FROM tbl_device_info WHERE user_id = $1
            `;
            const checkResult = await pool.query(checkDeviceQuery, [user_id]);

            if (checkResult.rows.length === 0 || (!checkResult.rows[0].fcm_token && !checkResult.rows[0].user_token)) {
                return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'already_logged_out' }, data: { user_id } };
            }

            const updateDeviceQuery = `
                UPDATE tbl_device_info
                SET fcm_token = NULL, user_token = NULL
                WHERE user_id = $1 RETURNING user_id
            `;
            const result = await pool.query(updateDeviceQuery, [user_id]);

            return { httpCode: 200, code: responseCode.SUCCESS, message: { keyword: 'logout_success' }, data: result.rows[0] };
        } catch (err) {
            console.error('Logout Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },



    // ──────────────────────────────────────────────────────────────────────────────
    // profile model
    // ──────────────────────────────────────────────────────────────────────────────

    // ─────────────────────────────────────────────────────────────────────────────
    // GET PROFILE
    // Returns the authenticated customer's profile data.
    // ─────────────────────────────────────────────────────────────────────────────
    async getProfile(req) {
        try {
            const user_id = req.user_id;

            const query = `
                SELECT
                    id AS user_id,
                    user_role,
                    first_name,
                    last_name,
                    email,
                    country_code,
                    phone,
                    profile_image,
                    dob,
                    city,
                    state,
                    country,
                    signup_type,
                    is_verified,
                    created_at
                FROM tbl_users
                WHERE id = $1 AND user_role = 'customer' AND is_active = TRUE AND is_deleted = FALSE
            `;
            const result = await pool.query(query, [user_id]);

            if (result.rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'success' },
                data: result.rows[0],
            };
        } catch (err) {
            console.error('Get Profile Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // UPDATE PROFILE
    // Updates editable personal fields. Only provided fields are updated.
    // ─────────────────────────────────────────────────────────────────────────────
    async updateProfile(req) {
        try {
            const user_id = req.user_id;
            const { first_name, last_name, profile_image, country_code, phone, email, dob, city, state, country } = req.body;

            // Check user exists
            const userCheck = await pool.query(
                `SELECT id, signup_type FROM tbl_users WHERE id = $1 AND user_role = 'customer' AND is_active = TRUE AND is_deleted = FALSE`,
                [user_id]
            );
            if (userCheck.rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }

            // If email is being updated, check it is not already taken by another user
            if (email) {
                const emailCheck = await pool.query(
                    `SELECT id FROM tbl_users WHERE email = $1 AND id != $2 AND user_role = 'customer' AND is_deleted = FALSE`,
                    [email, user_id]
                );
                if (emailCheck.rows.length > 0) {
                    return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'email_already_exists' }, data: {} };
                }
            }

            const fields = [];
            const values = [];
            let idx = 1;

            if (first_name !== undefined) { fields.push(`first_name = $${idx++}`); values.push(first_name); }
            if (last_name !== undefined) { fields.push(`last_name = $${idx++}`); values.push(last_name); }
            if (profile_image !== undefined) { fields.push(`profile_image = $${idx++}`); values.push(profile_image); }
            if (country_code !== undefined) { fields.push(`country_code = $${idx++}`); values.push(country_code); }
            if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(phone); }
            if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email); }
            if (dob !== undefined) { fields.push(`dob = $${idx++}`); values.push(dob || null); }
            if (city !== undefined) { fields.push(`city = $${idx++}`); values.push(city); }
            if (state !== undefined) { fields.push(`state = $${idx++}`); values.push(state); }
            if (country !== undefined) { fields.push(`country = $${idx++}`); values.push(country); }

            if (fields.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'no_fields_to_update' }, data: {} };
            }

            fields.push(`updated_at = NOW()`);
            values.push(user_id);

            const updateQuery = `
                UPDATE tbl_users SET ${fields.join(', ')}
                WHERE id = $${idx}
                RETURNING id AS user_id, first_name, last_name, email, country_code, phone, profile_image, dob, city, state, country
            `;
            const updateResult = await pool.query(updateQuery, values);

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'profile_updated' },
                data: updateResult.rows[0],
            };
        } catch (err) {
            console.error('Update Profile Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // CHANGE PASSWORD
    // Verifies the old password then updates to the new hashed password.
    // ─────────────────────────────────────────────────────────────────────────────
    async changePassword(req) {
        try {
            const user_id = req.user_id;
            const { old_password, new_password } = req.body;

            const userResult = await pool.query(
                `SELECT id, password, signup_type FROM tbl_users WHERE id = $1 AND user_role = 'customer' AND is_active = TRUE AND is_deleted = FALSE`,
                [user_id]
            );
            if (userResult.rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }

            const user = userResult.rows[0];

            if (user.signup_type !== 's') {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'social_account_no_password' }, data: {} };
            }

            const isMatch = await bcrypt.compare(old_password, user.password);
            if (!isMatch) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'old_password_incorrect' }, data: {} };
            }

            const hashedPassword = await bcrypt.hash(new_password, 10);
            await pool.query(
                `UPDATE tbl_users SET password = $1, updated_at = NOW() WHERE id = $2`,
                [hashedPassword, user_id]
            );

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'password_changed_success' },
                data: { user_id },
            };
        } catch (err) {
            console.error('Change Password Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // DELETE ACCOUNT
    // Soft-deletes the customer account and invalidates the session token.
    // ─────────────────────────────────────────────────────────────────────────────
    async deleteAccount(req) {
        try {
            const user_id = req.user_id;

            const userResult = await pool.query(
                `SELECT id FROM tbl_users WHERE id = $1 AND user_role = 'customer' AND is_active = TRUE AND is_deleted = FALSE`,
                [user_id]
            );
            if (userResult.rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'user_not_found' }, data: {} };
            }

            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                await client.query(
                    `UPDATE tbl_users SET is_deleted = TRUE, is_active = FALSE, updated_at = NOW() WHERE id = $1`,
                    [user_id]
                );

                await client.query(
                    `UPDATE tbl_device_info SET user_token = NULL, fcm_token = NULL WHERE user_id = $1`,
                    [user_id]
                );

                await client.query('COMMIT');
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'account_deleted_success' },
                data: { user_id },
            };
        } catch (err) {
            console.error('Delete Account Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },



    // ──────────────────────────────────────────────────────────────────────────────
    // address model
    // ──────────────────────────────────────────────────────────────────────────────

    // ─────────────────────────────────────────────────────────────────────────────
    // All address operations are delegated to utils/common.js so the same logic
    // is shared between the user and owner address modules.
    // ─────────────────────────────────────────────────────────────────────────────

    // async getAddresses(req) {
    //     return common.getAddresses(req.user_id);
    // },

    // async addAddress(req) {
    //     return common.addAddress(req.user_id, req.body);
    // },

    // async updateAddress(req) {
    //     return common.updateAddress(req.user_id, req.body);
    // },

    // async deleteAddress(req) {
    //     return common.deleteAddress(req.user_id, req.body);
    // },

};

module.exports = user_model;
