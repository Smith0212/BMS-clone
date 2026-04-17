require('dotenv').config();
const { ENCRYPTION_BYPASS } = require('../config/constants.js');
const en = require('../languages/en.js');
const ar = require('../languages/ar.js');
const CryptoJS = require('crypto-js');
const { default: localizify } = require('localizify');
const { t } = require('localizify');
const jwt = require('jsonwebtoken');
const pool = require('../config/database.js');
const { sendIndiaMail } = require('../utils/configEmailSMTP.js');
const { getOTPEmailTemplate } = require('../utils/emailTemplates.js');

const KEY = process.env.KEY;
const IV = process.env.IV;

const shaKey_CryptoJS = CryptoJS.SHA256(KEY);
const iv_CryptoJS = CryptoJS.enc.Utf8.parse(IV);

const checkApiKey = function (req, res, next) {
    const apiKey = req.headers['api-key'];
    const requestLanguage = String(req.headers['accept-language'] || 'en').toLowerCase();
    req.language = requestLanguage.startsWith('ar') ? ar : en;

    try {
        if (!apiKey) {
            return sendResponse(req, res, 401, 0, { keyword: 'invalid_api_key', components: {} }, {});
        }

        // Plain text comparison first (web clients)
        if (apiKey === process.env.API_KEY) {
            return next();
        }

        // Encrypted comparison (mobile clients)
        try {
            const bytes = CryptoJS.AES.decrypt(apiKey, shaKey_CryptoJS, {
                iv: iv_CryptoJS,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            });
            const decryptedApiKey = bytes.toString(CryptoJS.enc.Utf8);
            if (decryptedApiKey === process.env.API_KEY) {
                return next();
            }
        } catch (e) {
            // decryption failed — fall through to rejection
        }

        return sendResponse(req, res, 401, 0, { keyword: 'invalid_api_key', components: {} }, {});
    } catch (err) {
        return sendResponse(req, res, 401, 0, { keyword: 'invalid_api_key', components: {} }, {});
    }
};

const checkToken = async function (req, res, next) {
    try {
        const token = req.headers['token'] ||
            (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        if (!token) {
            return sendResponse(req, res, 401, 0, { keyword: 'token_required', components: {} }, {});
        }

        // Try to decrypt (mobile clients send encrypted JWT); fallback to plain JWT
        let decryptedToken;
        try {
            const bytes = CryptoJS.AES.decrypt(token, shaKey_CryptoJS, {
                iv: iv_CryptoJS,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            });
            const maybeDecrypted = bytes.toString(CryptoJS.enc.Utf8);
            const looksLikeJwt = (s) => typeof s === 'string' && s.split('.').length === 3;
            decryptedToken = (maybeDecrypted && looksLikeJwt(maybeDecrypted)) ? maybeDecrypted : token;
        } catch (e) {
            decryptedToken = token;
        }

        let decoded;
        try {
            decoded = jwt.verify(decryptedToken, process.env.JWT_SECRET_KEY);
        } catch (err) {
            return sendResponse(req, res, 401, 0, { keyword: 'token_invalid', components: {} }, {});
        }

        // Validate token against stored device token
        const deviceResult = await pool.query(
            `SELECT user_token FROM tbl_device_info WHERE user_id = $1`,
            [decoded.user_id]
        );
        if (deviceResult.rows.length === 0 ||
            !deviceResult.rows[0].user_token ||
            deviceResult.rows[0].user_token !== decryptedToken) {
            return sendResponse(req, res, 401, 0, { keyword: 'token_invalid', components: {} }, {});
        }

        // Check user is active
        const { rows } = await pool.query(
            `SELECT is_active, is_deleted FROM tbl_users WHERE id = $1 AND is_deleted = FALSE`,
            [decoded.user_id]
        );
        if (!rows[0]) {
            return sendResponse(req, res, 200, 0, { keyword: 'user_not_found', components: {} }, {});
        }
        if (!rows[0].is_active) {
            return sendResponse(req, res, 200, 0, { keyword: 'account_inactive', components: {} }, {});
        }

        req.user_id = decoded.user_id;
        next();
    } catch (e) {
        console.error('Token validation error:', e);
        sendResponse(req, res, 401, 0, { keyword: 'token_invalid', components: {} }, {});
    }
};

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const sendOTP = async (email, action = 'signup', user_role = 'customer') => {
    const userResult = await pool.query(
        `SELECT id, first_name, last_name FROM tbl_users
         WHERE email = $1 AND user_role = $2 AND is_deleted = FALSE`,
        [email, user_role]
    );
    if (userResult.rows.length === 0) throw new Error('User not found');

    const user = userResult.rows[0];
    const userName = `${user.first_name} ${user.last_name || ''}`.trim();
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const otpResult = await pool.query(`
        INSERT INTO tbl_otp (user_id, otp, expires_at, action, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (user_id, action)
        DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at, updated_at = NOW()
        RETURNING user_id, otp, expires_at, action
    `, [user.id, otp, expiresAt, action]);

    const otpRow = otpResult.rows[0];

    const emailSubject = action === 'signup'
        ? 'Welcome to BookMyShow — Verify Your Email'
        : 'BookMyShow — Password Reset OTP';

    await sendIndiaMail({
        from: process.env.EMAIL || process.env.EMAIL_SMTP_USERNAME,
        to: email,
        subject: emailSubject,
        html: getOTPEmailTemplate(otp, userName, action),
    });

    return {
        user_id: otpRow.user_id,
        otp: otpRow.otp,
        expires_at: new Date(otpRow.expires_at).toLocaleString(),
        action: otpRow.action,
    };
};

const validateJoi = (schemaFn) => {
    return (req, res, next) => {
        try {
            const schema = schemaFn(req);
            const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
            if (error) {
                return res.status(200).json({ code: 0, message: error.details[0].message });
            }
            return next();
        } catch (err) {
            console.error('Joi validation error:', err);
            if (!res.headersSent) {
                return res.status(500).json({ code: 0, message: 'Validation processing failed' });
            }
        }
    };
};

const sendResponse = function (req, res, statuscode, responsecode, { keyword = 'failed', components = {} }, responsedata) {
    const formatmsg = getMessage(req.headers?.['accept-language'], keyword, components);
    res.status(statuscode).send({ code: responsecode, message: formatmsg, data: responsedata });
};

const encrypt = function (data) {
    if (!ENCRYPTION_BYPASS) {
        const dataStr = typeof data === 'object' ? JSON.stringify(data) : data;
        const cipher = CryptoJS.AES.encrypt(dataStr, shaKey_CryptoJS, {
            iv: iv_CryptoJS,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        return cipher.toString();
    }
    return data;
};

const decrypt = function (encryptedData) {
    if (!encryptedData) return {};
    const bytes = CryptoJS.AES.decrypt(encryptedData, shaKey_CryptoJS, {
        iv: iv_CryptoJS,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    try { return JSON.parse(decrypted); } catch (e) { return decrypted; }
};

const decryption_admin = function (req, res, next) {
    if (!ENCRYPTION_BYPASS) {
        try {
            if (req.body && Object.keys(req.body).length !== 0) {
                const cipherText = req.body.data || req.body;
                req.body = decrypt(cipherText);
            }
            next();
        } catch (e) {
            res.status(200).json({ code: 0, message: 'badEncrypt' });
        }
    } else {
        next();
    }
};

const getMessage = function (requestLanguage = 'en', key, value) {
    try {
        localizify.add('en', en).add('ar', ar).setLocale(requestLanguage || 'en');
        return t(key, value);
    } catch (e) {
        return 'Something went wrong';
    }
};

module.exports = {
    checkApiKey,
    checkToken,
    generateOTP,
    sendOTP,
    sendResponse,
    encrypt,
    decrypt,
    decryption_admin,
    validateJoi,
    getMessage,
};
