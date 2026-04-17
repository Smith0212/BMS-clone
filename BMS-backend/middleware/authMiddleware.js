require('dotenv').config();

const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { default: localizify } = require('localizify');
const { t } = require('localizify');

const en = require('../languages/en');
const ar = require('../languages/ar');
const pool = require('../config/database');

const getLocaleCode = (acceptLanguage = 'en') => {
  const lang = String(acceptLanguage).toLowerCase();
  return lang.startsWith('ar') ? 'ar' : 'en';
};

const getMessage = (requestLanguage = 'en', key, value = {}) => {
  try {
    localizify.add('en', en).add('ar', ar).setLocale(getLocaleCode(requestLanguage));
    return t(key, value);
  } catch (error) {
    return 'Something went wrong';
  }
};

const attachLanguage = (req, _res, next) => {
  const lang = getLocaleCode(req.headers?.['accept-language']);
  req.language = lang === 'ar' ? ar : en;
  next();
};

const sendResponse = (req, res, statusCode, responseCode, { keyword = 'failed', components = {} }, responseData = {}) => {
  const message = getMessage(req.headers?.['accept-language'], keyword, components);
  res.status(statusCode).json({
    code: keyword === 'no_data' ? 2 : responseCode,
    message,
    data: responseData,
  });
};

const checkApiKey = (req, res, next) => {
  const apiKey = req.headers['api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return sendResponse(req, res, 401, 0, { keyword: 'invalid_api_key' }, {});
  }
  return next();
};

const checkToken = async (req, res, next) => {
  try {
    const rawToken = req.headers.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!rawToken) {
      return sendResponse(req, res, 401, 0, { keyword: 'token_invalid' }, {});
    }

    let decoded;
    try {
      decoded = jwt.verify(rawToken, process.env.JWT_SECRET_KEY || process.env.JWT_SECRET);
    } catch (error) {
      return sendResponse(req, res, 401, 0, { keyword: 'token_invalid' }, {});
    }

    if (!decoded?.user_id) {
      return sendResponse(req, res, 401, 0, { keyword: 'token_invalid' }, {});
    }

    const deviceResult = await pool.query(
      `SELECT id FROM tbl_device_info
       WHERE user_id = $1 AND user_token = $2 AND is_deleted = FALSE
       LIMIT 1`,
      [decoded.user_id, rawToken],
    );
    if (deviceResult.rows.length === 0) {
      return sendResponse(req, res, 401, 0, { keyword: 'token_invalid' }, {});
    }

    const userResult = await pool.query(
      `SELECT id, user_role, email, first_name, last_name, is_verified, step, is_active, is_deleted
       FROM tbl_users
       WHERE id = $1 AND is_deleted = FALSE
       LIMIT 1`,
      [decoded.user_id],
    );
    const user = userResult.rows[0];
    if (!user) {
      return sendResponse(req, res, 200, 0, { keyword: 'user_not_found' }, {});
    }
    if (!user.is_active || user.is_deleted) {
      return sendResponse(req, res, 200, 0, { keyword: 'account_inactive' }, {});
    }

    req.user_id = user.id;
    req.user = user;
    next();
  } catch (error) {
    return sendResponse(req, res, 401, 0, { keyword: 'token_invalid' }, {});
  }
};

const validateJoi = (schemaOrBuilder) => (req, res, next) => {
  const schema = typeof schemaOrBuilder === 'function' ? schemaOrBuilder(req, Joi) : schemaOrBuilder;
  const { error, value } = schema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true,
    errors: {
      wrap: { label: false },
    },
  });

  if (error) {
    return res.status(200).json({ code: 0, message: error.details[0].message, data: {} });
  }

  req.body = value;
  next();
};

module.exports = {
  attachLanguage,
  checkApiKey,
  checkToken,
  getMessage,
  sendResponse,
  validateJoi,
};
