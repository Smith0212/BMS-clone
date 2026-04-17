require('dotenv').config();
const { ENCRYPTION_BYPASS } = require('../config/constants.js');
const en = require('../languages/en.js');
const ar = require('../languages/ar.js');
// const cryptoLib = require('cryptlib');
const CryptoJS = require('crypto-js'); 
const { default: localizify } = require('localizify');
const { t } = require('localizify');
const jwt = require('jsonwebtoken');
const pool = require('../config/database.js');
const { sendIndiaMail } = require('../utils/configEmailSMTP.js');
const { getOTPEmailTemplate } = require('../utils/emailTemplates.js');

// Same key derivation as frontend
const KEY = process.env.KEY;
const IV = process.env.IV;

// CryptoJS key and IV (admin routes)
const shaKey_CryptoJS = CryptoJS.SHA256(KEY);
const iv_CryptoJS = CryptoJS.enc.Utf8.parse(IV);

// cryptoLib key and IV (user routes)
// const shaKey_cryptoLib = cryptoLib.getHashSha256(KEY, 32);  
// const iv_cryptoLib = IV;

// Use these variables for all encryption/decryption
// For CryptoJS: shaKey_CryptoJS, iv_CryptoJS
// For cryptoLib: shaKey_cryptoLib, iv_cryptoLib

// Function to validate API key of header (Note : Header keys are encrypted with cryptlib)
const checkApiKey = function (req, res, next) {
    let encryptedApiKey = req.headers['api-key'];
    let decryptedApiKey;
    const requestLanguage = String(req.headers['accept-language'] || 'en').toLowerCase();
    req.language = requestLanguage.startsWith('ar') ? ar : en;

    try {
        // User route: plain api key
        if (encryptedApiKey === process.env.API_KEY) {
            return next();
        }

        // Admin route: encrypted api key
        if (!encryptedApiKey) {
            return sendResponse(req, res, 401, '0', { keyword: 'invalid_api_key', components: {} }, {});
        }

        const bytes = CryptoJS.AES.decrypt(encryptedApiKey, shaKey_CryptoJS, {
            iv: iv_CryptoJS,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        decryptedApiKey = bytes.toString(CryptoJS.enc.Utf8);
        if (decryptedApiKey === process.env.API_KEY_ADMIN) {
            return next();
        }

        return sendResponse(req, res, 401, '0', { keyword: 'invalid_api_key', components: {} }, {});

    } catch (err) {
        return sendResponse(req, res, 401, '0', { keyword: 'invalid_api_key', components: {} }, {});
    }
};

const checkToken = async function (req, res, next) {
    try {
        // *****************************************************
        // 1. bypass auth routes 
        // *****************************************************
        // Routes that don't require authentication at all
        const noAuthRoutes = [
            '/api/v1/user/signup',
            '/api/v1/user/login',
            '/api/v1/user/verifyOtp',
            '/api/v1/user/resendOtp',
            '/api/v1/user/forgotPassword',
            '/api/v1/user/resetPassword',
            '/api/v1/owner/signup',
            '/api/v1/owner/login',
            '/api/v1/owner/verifyOtp',
            '/api/v1/owner/resendOtp',
            '/api/v1/owner/forgotPassword',
            '/api/v1/owner/resetPassword',

            '/api/v1/owner/saveBusinessInfo',
            '/api/v1/owner/saveFinancialInfo',
            '/api/v1/owner/saveDocuments',
            '/api/v1/admin/login',
            '/api/v1/admin/forgotPassword',
            '/api/v1/admin/verifyResetToken',
            '/api/v1/admin/resetPassword',
        ];

        const currentRoute = req.originalUrl;
        const shouldBypassAuth = noAuthRoutes.some(route => currentRoute.includes(route));
        if (shouldBypassAuth) {
            return next();
        }
        // *****************************************************
        // end of 1. 
        // *****************************************************

        
        // *****************************************************
        // 2. extract token => determine admin or user => based on that decrypt the token => verify jwt 
        // *****************************************************
        // Extract token
        let token = req.headers['token'] || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
        console.log("token :", token);
        if (!token) {
            return sendResponse(req, res, 401, '0', { keyword: 'token_required', components: {} }, {});
        }

        let decoded;
        let decryptedToken;
        try {
            
                // Admin: decrypt using CryptoJS; fallback to plain JWT when invalid/empty
                try {
                    const bytes = CryptoJS.AES.decrypt(token, shaKey_CryptoJS, {
                        iv: iv_CryptoJS,
                        mode: CryptoJS.mode.CBC,
                        padding: CryptoJS.pad.Pkcs7,
                    });
                    const maybeDecrypted = bytes.toString(CryptoJS.enc.Utf8);

                    // If decryption yields empty/invalid string, use original token
                    const looksLikeJwt = (t) => typeof t === 'string' && t.split('.').length === 3;
                    if (!maybeDecrypted || !looksLikeJwt(maybeDecrypted)) {
                        decryptedToken = token;
                    } else {
                        decryptedToken = maybeDecrypted;
                    }
                } catch (err) {
                    // If decryption throws, assume token is plain JWT
                    decryptedToken = token;
                }

            // Verify JWT
            decoded = jwt.verify(
                decryptedToken,
                process.env.JWT_SECRET_KEY || process.env.JWT_SECRET
            );
            console.log("decoded :", decoded);
        } catch (err) {
            return sendResponse(req, res, 401, '0', { keyword: 'token_invalid', components: {} }, {});
        }
        // *****************************************************
        // end of 2. 
        // *****************************************************


        // *****************************************************
        // 3. guest token handling with strict allowlist 
        // *****************************************************
        // if (decoded.guest === true) {
        //     console.log("Guest token detected");
        //     const guestAllowed = [
        //         '/api/v1/user/offer/listOffers',
        //         '/api/v1/user/offer/getOfferDetails',
        //         '/api/v1/user/category/getOfferCategories',
        //         '/api/v1/user/profile/getProfile',
        //         '/api/v1/user/review/getBusinessReviews',
        //     ];

        //     const currentPath = req.originalUrl.split('?')[0];
        //     const isAllowed = guestAllowed.some((route) => currentPath.includes(route));
        //     console.log("isAllowed :", isAllowed);
        //     if (!isAllowed) {
        //         return sendResponse(req, res, 200, '0', { keyword: 'login_required', components: {} }, {});
        //     }
 
        //     // Additional guest access constraints
        //     if (currentPath.includes('/api/v1/user/offer/listOffers')) {
        //         const allowedTypes = ['all', 'nearby', 'user']; // allowed types for listOffers
        //         const requestedType = (req.body && req.body?.type) ? String(req.body.type) : 'all';
        //         if (!allowedTypes.includes(requestedType)) {
        //             return sendResponse(req, res, 200, '0', { keyword: 'login_required', components: {} }, {});
        //         }
        //     }
        //     console.log("currentPath :", currentPath, currentPath.includes('/api/v1/user/profile/getProfile'));
        //     if (currentPath.includes('/api/v1/user/profile/getProfile')) {
        //         console.log("req.body :", req.body);
        //         if (!req.body || !req.body.profile_user_id) {
        //             console.log("Profile user id is required");
        //             return sendResponse(req, res, 200, '0', { keyword: 'login_required', components: {} }, {});
        //         }
        //     }

        //     req.guest = true;
        //     return next();
        // }
        // *****************************************************
        // end of 3. 
        // *****************************************************


        // *****************************************************
        // 4. role is admin or sub_admin => check sub-admins table => validate token against stored token in database for logout management => add logged in user details to req object 
        // *****************************************************
        // if (decoded.role && (decoded.role === "admin" || decoded.role === "sub_admin")) {
        //     const { rows } = await pool.query(
        //         `SELECT is_active, is_deleted, jwt_token FROM tbl_sub_admins WHERE id = $1 AND is_deleted = FALSE`,
        //         [decoded.id]
        //     );
        //     const admin = rows[0];
        //     if (!admin) {
        //         return sendResponse(req, res, 200, '0', { keyword: 'user_not_found', components: {} }, {});
        //     }

        //     // Validate token against stored token in database for logout management
        //     if (admin.jwt_token) {
        //         // Compare decrypted token with stored token
        //         if (admin.jwt_token !== decryptedToken) {
        //             return sendResponse(req, res, 401, '0', { keyword: 'token_invalid', components: {} }, {});
        //         }
        //     } else {
        //         // If no token stored, it means user was logged out
        //         return sendResponse(req, res, 401, '0', { keyword: 'token_invalid', components: {} }, {});
        //     }
            

        //     if (!admin.is_active || admin.is_deleted) {
        //         return sendResponse(req, res, 200, '0', { keyword: 'account_inactive', components: {} }, {});
        //     }
            
        //     // add logged in user details to req object
        //     req.admin_id = decoded.id;
        //     return next();
        // }
        // *****************************************************
        // end of 4. 
        // *****************************************************


        // *****************************************************
        // 5. role is user => match against tbl_device_info.user_token => add logged in user details to req object 
        // *****************************************************
        try {
            // fetch stored token from tbl_device_info
            const deviceResult = await pool.query(
                `SELECT user_token FROM tbl_device_info WHERE user_id = $1`,
                [decoded.user_id]
            );
            if (deviceResult.rows.length === 0) {
                return sendResponse(req, res, 401, '0', { keyword: 'token_invalid', components: {} }, {});
            }
            const storedToken = deviceResult.rows[0].user_token;
            console.log("storedToken :", storedToken, decryptedToken);
            if (!storedToken || storedToken !== decryptedToken) {
                return sendResponse(req, res, 401, '0', { keyword: 'token_invalid', components: {} }, {});
            }
        } catch (err) {
            return sendResponse(req, res, 401, '0', { keyword: 'token_invalid', components: {} }, {});
        }

        // fetch user details from tbl_users
        const { rows } = await pool.query(
            `SELECT is_active, is_deleted FROM tbl_users WHERE id = $1 AND is_deleted = FALSE`,
            [decoded.user_id]
        );
        const user = rows[0];
        if (!user) {
            return sendResponse(req, res, 200, '0', { keyword: 'user_not_found', components: {} }, {});
        }
        if (!user.is_active || user.is_deleted) {
            return sendResponse(req, res, 200, '0', { keyword: 'account_inactive', components: {} }, {});
        }

        // add logged in user details to req object
        req.user_id = decoded.user_id;
        next();
        // *****************************************************
        // end of 5. 
        // *****************************************************
    } catch (e) {
        console.log("Token invalid error:", e);
        sendResponse(req, res, 401, '0', { keyword: 'token_invalid', components: {} }, {});
    }
};

const generateOTP = () => {
    // generate otp of 4 digit 
    return Math.floor(1000 + Math.random() * 9000).toString();
}

const sendOTP = async (email, action = 'signup', user_role = 'user') => {
    // Find user by email to get user_id and username
    const userQuery = 'SELECT id, first_name, last_name FROM tbl_users WHERE email = $1 AND user_role = $2 AND is_deleted = FALSE';
    const userResult = await pool.query(userQuery, [email, user_role]);
    console.log("User Result:", userResult.rows);
    if (userResult.rows.length === 0) {
        throw new Error('User not found');
    }
    const user_id = userResult.rows[0].id;
    const userName = userResult.rows[0].first_name + ' ' + userResult.rows[0].last_name || 'User';

    // Generate OTP and expiry (e.g., 10 minutes from now)
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Insert OTP into tbl_otp
    // Upsert OTP: if exists, update; else, insert (PostgreSQL ON CONFLICT)
    const upsertOtpQuery = `
            INSERT INTO tbl_otp (user_id, otp, expires_at, action, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (user_id, action)
            DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at, created_at = NOW()
            RETURNING id, user_id, otp, expires_at, action, created_at
        `;
    const otpResult = await pool.query(upsertOtpQuery, [user_id, otp, expiresAt, action]);
    const otpRow = otpResult.rows[0];
    console.log("Otp Result:", otpResult.rows);

    // send OTP via email here
    // For simple signup, send OTP to email
    const emailSubject = action === 'signup' 
        ? 'Welcome to Beautina - Your Verification Code' 
        : 'Beautina - Your Verification Code';
    
    console.log("email smtp username :", process.env.EMAIL_SMTP_USERNAME);
    console.log("password :", process.env.EMAIL_SMTP_PASSWORD);
    await sendIndiaMail({
        from: process.env.EMAIL_SMTP_USERNAME,
        to: email,
        subject: emailSubject,
        html: getOTPEmailTemplate(otp, userName, action),
    });

    // Convert to IST or your local time
    const localExpiresAt = new Date(otpRow.expires_at).toLocaleString();

    return {
        user_id: otpRow.user_id,
        otp: otpRow.otp,
        expires_at: localExpiresAt,
        action: otpRow.action
    };
}

// Middleware function for validation
const validateJoi = (schemaFn) => {
    return (req, res, next) => {
        try {
            const schema = schemaFn(req); // ✅ call function here

            const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true, stripUnknown: false });
            console.log("error :", error);

            if (error) {
                return res.status(200).json({ code: 0, message: error.details[0].message });
            }

            return next();
        } catch (err) {
            console.log("err :", err);
            if (!res.headersSent) {
                return res.status(500).json({ code: 0, message: 'Validation processing failed' });
            }
            return;
        }
    };
}

// Middleware function for validation
// const validateJoi = (schemaOrBuilder) => {
//     return (req, res, next) => {
//         try {
//             const schema = typeof schemaOrBuilder === 'function'
//                 ? schemaOrBuilder(req)
//                 : schemaOrBuilder;

//             if (!schema || typeof schema.validate !== 'function') {
//                 return res.status(500).json({
//                     code: 0,
//                     message: 'Invalid validation schema configuration'
//                 });
//             }

//             const { error, value } = schema.validate(req.body, {
//                 abortEarly: false,
//                 // Your controllers use extra fields (e.g. fcm_token) even if Joi rules don't define them.
//                 allowUnknown: true,
//                 stripUnknown: false
//             });

//             if (error) {
//                 return res.status(200).json({ code: 0, message: error.details[0].message });
//             }

//             req.body = value;
//             return next();
//         } catch (err) {
//             console.log("err :", err);
//             if (!res.headersSent) {
//                 return res.status(500).json({ code: 0, message: 'Validation processing failed' });
//             }
//             return;
//         }
//     };
// }


// Function to return response for any api
const sendResponse = function (req, res, statuscode, responsecode, { keyword = 'failed', components = {} }, responsedata) {
    let formatmsg = getMessage(req.headers?.['accept-language'], keyword, components);

    if (keyword == 'no_data') {
        responsecode = 2;
    }

    // let encrypted_data = encryption({ code: responsecode, message: formatmsg, data: responsedata });

    let encrypted_data = { code: responsecode, message: formatmsg, data: responsedata };

    res.status(statuscode);
    res.send(encrypted_data);
}


// *****************************************************
// encryption decryption for admin routes
// *****************************************************
const encrypt = function(data) {
    if (!ENCRYPTION_BYPASS) {
        try {
            const dataStr = typeof data === "object" ? JSON.stringify(data) : data;
            const cipher = CryptoJS.AES.encrypt(dataStr, shaKey_CryptoJS, {
                iv: iv_CryptoJS,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            });
            return cipher.toString(); // Base64
        } catch (error) {
            console.error("Backend Encryption Error:", error);
            return "";
        }
    } else {
        return data;
    }
};

// Decryption function
const decrypt = function(encryptedData) {
    if (!encryptedData) return {};

    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, shaKey_CryptoJS, {
            iv: iv_CryptoJS,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        
        // Try to parse as JSON, fallback to string
        try {
            return JSON.parse(decrypted);
        } catch (e) {
            return decrypted;
        }
    } catch (error) {
        console.error("Backend Decryption Error:", error);
        throw error;
    }
};

// Decryption middleware
const decryption_admin = function (req, res, next) {

    console.log(req.originalUrl, '-----------------------------------------------------------------------------------');
    if (!ENCRYPTION_BYPASS) {   
        try {
            // console.log('req.body :', req.body);
            console.log("admin decryption", req.body);
            if (req.body && Object.keys(req.body).length !== 0) {
                let cipherText = req.body.data || req.body;
                console.log('Cipher text to decrypt:', cipherText);
                
                // Decrypt the data
                const decryptedData = decrypt(cipherText);
                req.body = decryptedData;
                
                // console.log('-----------------------------------------------------------------------------------');
                console.log('Decrypted req.body :', decryptedData);
                // console.log('-----------------------------------------------------------------------------------');
            }
            next();
        } catch (e) {
            console.error('Decryption error:', e);
            res.status(200).json({ code: 0, message: "badEncrypt" });
        }
    } else {
        next();
    }
};

// Encryption middleware for responses
const encryption_admin = function (response_data) {
    if (!ENCRYPTION_BYPASS) {
        return encrypt(response_data);
    } else {
        return response_data;
    }
};

//  Function to send users language from any place
const getMessage = function (requestLanguage = 'en', key, value) {
    try {
        localizify
            .add('en', en)
            .add('ar', ar)
            .setLocale(requestLanguage);

        let message = t(key, value);

        return message;
    } catch (e) {
        return "Something went wrong";
    }
}

module.exports = {
    checkApiKey,
    checkToken,
    generateOTP,
    sendOTP,
    sendResponse,
    decryption_admin,
    encryption_admin,
    validateJoi
};
