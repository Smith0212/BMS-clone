require('dotenv').config();
const moment = require('moment');
const moment_tz = require('moment-timezone');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const responseCode = require('../config/responseCode');
// const { SELECT, INSERT, DELETE } = require('../utils/SQLWorker');
const each = require('async-each');
const typeOf = require('just-typeof');
const _ = require('lodash');
const validator = require('validator');

const metadata = require('libphonenumber-js/metadata.full.json');
const { parsePhoneNumberFromString, isValidPhoneNumber } = require('libphonenumber-js/max');
const en = require('../languages/en.js');


const common = {

    jwt_validate: async (token) => {
        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);

            if (verified) {
                return verified;
            } else {
                throw new Error("token_invalid");
            }
        } catch (error) {
            // Access Denied 
            throw new Error("token_invalid");
        }
    },

    jwt_sign: (data, expiresIn = "365days") => {
        const enc_data = {
            expiresIn,
            data: data
        }

        const token = jwt.sign(enc_data, process.env.JWT_SECRET_KEY);

        return token;
    },

    /**
     * Validate phone number using libphonenumber-js
     * @param {string} phone - Phone number to validate (without country code)
     * @param {string|number} countryCodeId - Country code ID from tbl_country_codes
     * @returns {object} - { isValid: boolean, message: string }
     */
    async validatePhoneNumber(phone, countryCode) {
        try {
            // Basic validation
            if (!phone || typeof phone !== 'string' || phone.trim() === '') {
                return { isValid: false, message: en.phone_number_cannot_be_empty };
            }

            const cleanedPhone = phone.trim();
            
            // Check if only digits
            if (!/^\d+$/.test(cleanedPhone)) {
                return { isValid: false, message: en.phone_number_must_contain_only_digits };
            }
            
            // Check if countryCodeId is valid
            if (!countryCode) {
                return { isValid: false, message: en.country_code_id_required };
            }


            // Use libphonenumber-js for validation
            // Combine country code with phone number
            const fullPhoneNumber = `${countryCode}${cleanedPhone}`;
            console.log("fullPhoneNumber :", fullPhoneNumber);
            // Validate using libphonenumber-js
            // const isValid = isValidPhoneNumber(fullPhoneNumber);

            const isValid = isValidPhoneNumber(fullPhoneNumber, metadata);

            console.log("isValid :", isValid);

            if (!isValid) {
                return { 
                    isValid: false, 
                    message: en.invalid_phone_number
                };
            }

            // // Parse number for structured validation
            // const phoneNumber = parsePhoneNumberFromString(fullPhoneNumber, metadata);
            // if (!phoneNumber || !phoneNumber.isValid()) {
            //     return { 
            //         isValid: false, 
            //         message: en.invalid_phone_number_format_for_country.replace('{countryName}', countryName)
            //     };
            // }

            return { isValid: true, message: en.valid_phone_number };

        } catch (error) {
            console.error('Phone validation error:', error);
            return { isValid: false, message: en.error_validating_phone_number };
        }
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // ADDRESS MODULE — shared logic called by both user and owner address models
    // ─────────────────────────────────────────────────────────────────────────────

    async getAddresses(user_id) {
        try {
            const result = await pool.query(
                `SELECT id AS address_id, address, latitude, longitude, type, is_default, created_at
                 FROM tbl_addresses
                 WHERE user_id = $1 AND is_deleted = FALSE
                 ORDER BY is_default DESC, created_at DESC`,
                [user_id]
            );
            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'success' },
                data: result.rows,
            };
        } catch (err) {
            console.error('Get Addresses Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    async addAddress(user_id, body) {
        try {
            const { address, latitude, longitude, type, is_default } = body;
            const setDefault = is_default === true || is_default === 'true';

            // If new address is default, clear existing default first
            if (setDefault) {
                await pool.query(
                    `UPDATE tbl_addresses SET is_default = FALSE WHERE user_id = $1 AND is_deleted = FALSE`,
                    [user_id]
                );
            }

            const result = await pool.query(
                `INSERT INTO tbl_addresses (user_id, address, latitude, longitude, type, is_default)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id AS address_id, address, latitude, longitude, type, is_default`,
                [user_id, address, latitude || null, longitude || null, type || null, setDefault]
            );

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'address_added' },
                data: result.rows[0],
            };
        } catch (err) {
            console.error('Add Address Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    async updateAddress(user_id, body) {
        try {
            const { address_id, address, latitude, longitude, type, is_default } = body;

            const addrCheck = await pool.query(
                `SELECT id FROM tbl_addresses WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE`,
                [address_id, user_id]
            );
            if (addrCheck.rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'address_not_found' }, data: {} };
            }

            const setDefault = is_default === true || is_default === 'true';

            // If marking as default, unset existing default first
            if (setDefault) {
                await pool.query(
                    `UPDATE tbl_addresses SET is_default = FALSE WHERE user_id = $1 AND is_deleted = FALSE`,
                    [user_id]
                );
            }

            const fields = [];
            const values = [];
            let idx = 1;

            if (address !== undefined)    { fields.push(`address = $${idx++}`);    values.push(address); }
            if (latitude !== undefined)   { fields.push(`latitude = $${idx++}`);   values.push(latitude); }
            if (longitude !== undefined)  { fields.push(`longitude = $${idx++}`);  values.push(longitude); }
            if (type !== undefined)       { fields.push(`type = $${idx++}`);        values.push(type); }
            if (is_default !== undefined) { fields.push(`is_default = $${idx++}`); values.push(setDefault); }

            if (fields.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'no_fields_to_update' }, data: {} };
            }

            fields.push(`updated_at = NOW()`);
            values.push(address_id);

            const result = await pool.query(
                `UPDATE tbl_addresses SET ${fields.join(', ')}
                 WHERE id = $${idx}
                 RETURNING id AS address_id, address, latitude, longitude, type, is_default`,
                values
            );

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'address_updated' },
                data: result.rows[0],
            };
        } catch (err) {
            console.error('Update Address Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    async deleteAddress(user_id, body) {
        try {
            const { address_id } = body;

            const addrCheck = await pool.query(
                `SELECT id FROM tbl_addresses WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE`,
                [address_id, user_id]
            );
            if (addrCheck.rows.length === 0) {
                return { httpCode: 200, code: responseCode.OPERATION_FAILED, message: { keyword: 'address_not_found' }, data: {} };
            }

            await pool.query(
                `UPDATE tbl_addresses SET is_deleted = TRUE, updated_at = NOW() WHERE id = $1`,
                [address_id]
            );

            return {
                httpCode: 200,
                code: responseCode.SUCCESS,
                message: { keyword: 'address_deleted' },
                data: { address_id },
            };
        } catch (err) {
            console.error('Delete Address Error:', err);
            return { httpCode: 500, code: responseCode.OPERATION_FAILED, message: { keyword: 'unsuccess' }, data: err.message };
        }
    },

    /**
     * Validate email address format using validator.js
     * @param {string} email - Email address to validate
     * @returns {object} - { isValid: boolean, message: string }
     */
    validateEmail(email) {
        try {
            // Basic validation
            if (!email || typeof email !== 'string' || email.trim() === '') {
                return { isValid: false, message: en.email_cannot_be_empty };
            }

            const trimmedEmail = email.trim();
            
            // Check email length (max 255 characters as per database constraint)
            if (trimmedEmail.length > 255) {
                return { isValid: false, message: en.email_too_long };
            }

            // Use validator.js isEmail function for format validation
            
            if (!validator.isEmail(trimmedEmail, { allow_tld: true })) {
                console.log("invalid email format");
                return { isValid: false, message: en.invalid_email_format };
            }

            return { isValid: true, message: en.valid_email };

        } catch (error) {
            console.error('Email validation error:', error);
            return { isValid: false, message: en.error_validating_email };
        }
    },
}

module.exports = common;



