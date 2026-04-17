const Joi = require('joi');

const userRules = {
  signup: (req) => Joi.object({
    signup_type: Joi.string()
      .valid('s', 'g', 'a', 'f')
      .default('s')
      .required()
      .messages({
        'any.only': req.language.invalid_signup_type || 'Invalid Signup Type',
        'string.empty': req.language.required.replace(':attr', 'Signup Type'),
        'any.required': req.language.required.replace(':attr', 'Signup Type'),
      }),

    first_name: Joi.string()
      .trim()
      .min(2)
      .max(255)
      .required()
      .messages({
        'string.empty': req.language.required.replace(':attr', 'First Name'),
        'string.min': req.language.min_length.replace(':attr', 'First Name').replace(':value', '2'),
        'string.max': req.language.max_length.replace(':attr', 'First Name').replace(':value', '255'),
        'any.required': req.language.required.replace(':attr', 'First Name'),
      }),

    last_name: Joi.string()
      .trim()
      .min(2)
      .max(255)
      .required()
      .messages({
        'string.empty': req.language.required.replace(':attr', 'Last Name'),
        'string.min': req.language.min_length.replace(':attr', 'Last Name').replace(':value', '2'),
        'string.max': req.language.max_length.replace(':attr', 'Last Name').replace(':value', '255'),
        'any.required': req.language.required.replace(':attr', 'Last Name'),
      }),

    // Required for simple signup, optional for social (Apple may not provide email)
    email: Joi.string()
      .trim()
      .email()
      .max(255)
      .when('signup_type', {
        is: 's',
        then: Joi.required(),
        otherwise: Joi.optional().allow('', null),
      })
      .messages({
        'string.email': req.language.invalid_email_format,
        'string.empty': req.language.required.replace(':attr', 'Email'),
        'any.required': req.language.required.replace(':attr', 'Email'),
        'string.max': req.language.max_length.replace(':attr', 'Email').replace(':value', '255'),
      }),

    // Required for simple signup only
    password: Joi.string()
      .min(6)
      .max(50)
      .when('signup_type', {
        is: 's',
        then: Joi.required(),
        otherwise: Joi.optional().allow('', null),
      })
      .messages({
        'string.empty': req.language.required.replace(':attr', 'Password'),
        'string.min': req.language.min_length.replace(':attr', 'Password').replace(':value', '6'),
        'string.max': req.language.max_length.replace(':attr', 'Password').replace(':value', '50'),
        'any.required': req.language.required.replace(':attr', 'Password'),
      }),

    // Required for social signup
    social_id: Joi.string()
      .when('signup_type', {
        is: Joi.valid('g', 'a', 'f'),
        then: Joi.required(),
        otherwise: Joi.optional().allow('', null),
      })
      .messages({
        'string.empty': req.language.required.replace(':attr', 'Social ID'),
        'any.required': req.language.required.replace(':attr', 'Social ID'),
      }),

    country_code: Joi.string()
      .trim()
      .pattern(/^[\+\d]{1,6}$/)
      .required()
      .messages({
        'string.pattern.base': req.language.invalid_country_code || 'Invalid country code format',
        'string.empty': req.language.required.replace(':attr', 'Country Code'),
        'any.required': req.language.required.replace(':attr', 'Country Code'),
      }),

    phone: Joi.string()
      .trim()
      .pattern(/^[0-9]{6,20}$/)
      .required()
      .messages({
        'string.pattern.base': req.language.invalid_phone_format || 'Invalid phone format',
        'string.empty': req.language.required.replace(':attr', 'Phone'),
        'any.required': req.language.required.replace(':attr', 'Phone'),
      }),

    profile_image: Joi.string()
      .max(500)
      .optional()
      .allow('', null)
      .messages({
        'string.uri': req.language.invalid_url_format || 'Invalid URL format',
        'string.max': req.language.max_length.replace(':attr', 'Profile Image URL').replace(':value', '500'),
      }),

    fcm_token: Joi.string().trim().max(1024).optional().allow('', null),
    device_type: Joi.string().valid('A', 'I', 'W').optional().allow('', null),
    device_name: Joi.string().max(64).optional().allow('', null),
    os_version: Joi.string().max(8).optional().allow('', null),
    app_version: Joi.string().max(8).optional().allow('', null),
    timezone: Joi.string().max(32).optional().allow('', null),
  }),

  verifyOtp: (req) => Joi.object({
    email: Joi.string()
      .trim()
      .email()
      .required()
      .messages({
        'string.email': req.language.invalid_email_format,
        'string.empty': req.language.required.replace(':attr', 'Email'),
        'any.required': req.language.required.replace(':attr', 'Email'),
      }),
    otp: Joi.string()
      .pattern(/^[0-9]{4}$/)
      .required()
      .messages({
        'string.pattern.base': req.language.otp_format,
        'string.empty': req.language.required.replace(':attr', 'OTP'),
        'any.required': req.language.required.replace(':attr', 'OTP'),
      }),
    action: Joi.string()
      .valid('signup', 'forgot')
      .required()
      .messages({
        'any.only': req.language.invalid_otp_action,
        'string.empty': req.language.required.replace(':attr', 'Action'),
        'any.required': req.language.required.replace(':attr', 'Action'),
      }),
  }),

  login: (req) => Joi.object({
    login_type: Joi.string()
      .valid('s', 'g', 'a', 'f')
      .default('s')
      .optional()
      .messages({
        'any.only': req.language.invalid_signup_type || 'Invalid Login Type',
      }),

    email: Joi.string()
      .trim()
      .email()
      .required()
      .messages({
        'string.email': req.language.invalid_email_format,
        'string.empty': req.language.required.replace(':attr', 'Email'),
        'any.required': req.language.required.replace(':attr', 'Email'),
      }),

    // Required for simple login only
    password: Joi.string()
      .when('login_type', {
        is: Joi.valid('g', 'a', 'f'),
        then: Joi.optional().allow('', null),
        otherwise: Joi.required(),
      })
      .messages({
        'string.empty': req.language.required.replace(':attr', 'Password'),
        'any.required': req.language.required.replace(':attr', 'Password'),
      }),

    // Required for social login only
    social_id: Joi.string()
      .when('login_type', {
        is: Joi.valid('g', 'a', 'f'),
        then: Joi.required(),
        otherwise: Joi.optional().allow('', null),
      })
      .messages({
        'string.empty': req.language.required.replace(':attr', 'Social ID'),
        'any.required': req.language.required.replace(':attr', 'Social ID'),
      }),

    device_type: Joi.string()
      .valid('A', 'I', 'W')
      .required()
      .messages({
        'any.only': req.language.invalid_device_type,
        'string.empty': req.language.required.replace(':attr', 'Device Type'),
        'any.required': req.language.required.replace(':attr', 'Device Type'),
      }),
    device_name: Joi.string().max(64).optional().allow(null, ''),
    os_version: Joi.string().max(8).required().messages({
      'string.empty': req.language.required.replace(':attr', 'OS Version'),
      'any.required': req.language.required.replace(':attr', 'OS Version'),
    }),
    app_version: Joi.string().max(8).optional().allow(null, ''),
    fcm_token: Joi.string().max(1024).optional().allow(null, ''),
    ip: Joi.string().max(45).optional().allow(null, ''),
    timezone: Joi.string().max(32).required().messages({
      'string.empty': req.language.required.replace(':attr', 'Timezone'),
      'any.required': req.language.required.replace(':attr', 'Timezone'),
    }),
  }),

  resendOtp: (req) => Joi.object({
    email: Joi.string().trim().email().required().messages({
      'string.email': req.language.invalid_email_format,
      'string.empty': req.language.required.replace(':attr', 'Email'),
      'any.required': req.language.required.replace(':attr', 'Email'),
    }),
    action: Joi.string().valid('signup', 'forgot').required().messages({
      'any.only': req.language.invalid_otp_action,
      'string.empty': req.language.required.replace(':attr', 'Action'),
      'any.required': req.language.required.replace(':attr', 'Action'),
    }),
  }),

  forgotPassword: (req) => Joi.object({
    email: Joi.string().trim().email().required().messages({
      'string.email': req.language.invalid_email_format,
      'string.empty': req.language.required.replace(':attr', 'Email'),
      'any.required': req.language.required.replace(':attr', 'Email'),
    }),
  }),

  resetPassword: (req) => Joi.object({
    email: Joi.string().trim().email().required().messages({
      'string.email': req.language.invalid_email_format,
      'string.empty': req.language.required.replace(':attr', 'Email'),
      'any.required': req.language.required.replace(':attr', 'Email'),
    }),
    new_password: Joi.string().min(6).max(50).required().messages({
      'string.empty': req.language.required.replace(':attr', 'New Password'),
      'string.min': req.language.min_length.replace(':attr', 'New Password').replace(':value', '6'),
      'any.required': req.language.required.replace(':attr', 'New Password'),
    }),
  }),



  //───────────────────────────────────────────────────────────── Profile Rules ─────────────────────────────────────────────────────────────

  updateProfile: (req) => Joi.object({
    first_name: Joi.string().trim().min(2).max(255).optional().messages({
      'string.min': req.language.min_length.replace(':attr', 'First Name').replace(':value', '2'),
      'string.max': req.language.max_length.replace(':attr', 'First Name').replace(':value', '255'),
    }),

    last_name: Joi.string().trim().min(2).max(255).optional().messages({
      'string.min': req.language.min_length.replace(':attr', 'Last Name').replace(':value', '2'),
      'string.max': req.language.max_length.replace(':attr', 'Last Name').replace(':value', '255'),
    }),

    profile_image: Joi.string().max(500).optional().allow('', null).messages({
      'string.max': req.language.max_length.replace(':attr', 'Profile Image').replace(':value', '500'),
    }),

    country_code: Joi.string().trim().pattern(/^[\+\d]{1,6}$/).optional().allow('', null).messages({
      'string.pattern.base': req.language.invalid_country_code || 'Invalid country code format',
    }),

    phone: Joi.string().trim().pattern(/^[0-9]{6,20}$/).optional().allow('', null).messages({
      'string.pattern.base': req.language.invalid_phone_format || 'Invalid phone format',
    }),

    email: Joi.string().trim().email().max(255).optional().allow('', null).messages({
      'string.email': req.language.invalid_email_format,
      'string.max': req.language.max_length.replace(':attr', 'Email').replace(':value', '255'),
    }),

    dob: Joi.string().isoDate().optional().allow('', null).messages({
      'string.isoDate': 'Date of birth must be a valid date (YYYY-MM-DD)',
    }),

    city: Joi.string().trim().max(255).optional().allow('', null),
    state: Joi.string().trim().max(255).optional().allow('', null),
    country: Joi.string().trim().max(255).optional().allow('', null),
  }),

  changePassword: (req) => Joi.object({
    old_password: Joi.string().required().messages({
      'string.empty': req.language.required.replace(':attr', 'Old Password'),
      'any.required': req.language.required.replace(':attr', 'Old Password'),
    }),

    new_password: Joi.string().min(6).max(50).required().messages({
      'string.empty': req.language.required.replace(':attr', 'New Password'),
      'string.min': req.language.min_length.replace(':attr', 'New Password').replace(':value', '6'),
      'string.max': req.language.max_length.replace(':attr', 'New Password').replace(':value', '50'),
      'any.required': req.language.required.replace(':attr', 'New Password'),
    }),

    // confirm_password: Joi.string().valid(Joi.ref('new_password')).required().messages({
    //     'any.only': 'Confirm password must match new password',
    //     'string.empty': req.language.required.replace(':attr', 'Confirm Password'),
    //     'any.required': req.language.required.replace(':attr', 'Confirm Password'),
    // }),
  }),



  //───────────────────────────────────────────────────────────── Address Rules ─────────────────────────────────────────────────────────────
  // addAddress: (req) => Joi.object({
  //   address: Joi.string().trim().max(500).required().messages({
  //     'string.empty': req.language.required.replace(':attr', 'Address'),
  //     'string.max': req.language.max_length.replace(':attr', 'Address').replace(':value', '500'),
  //     'any.required': req.language.required.replace(':attr', 'Address'),
  //   }),

  //   latitude: Joi.string().trim().max(16).optional().allow('', null).messages({
  //     'string.max': req.language.max_length.replace(':attr', 'Latitude').replace(':value', '16'),
  //   }),

  //   longitude: Joi.string().trim().max(16).optional().allow('', null).messages({
  //     'string.max': req.language.max_length.replace(':attr', 'Longitude').replace(':value', '16'),
  //   }),

  //   type: Joi.string().trim().max(30).optional().allow('', null).messages({
  //     'string.max': req.language.max_length.replace(':attr', 'Address Type').replace(':value', '30'),
  //   }),

  //   is_default: Joi.boolean().optional(),
  // }),

  // updateAddress: (req) => Joi.object({
  //   address_id: Joi.number().integer().positive().required().messages({
  //     'number.base': req.language.required.replace(':attr', 'Address ID'),
  //     'any.required': req.language.required.replace(':attr', 'Address ID'),
  //   }),

  //   address: Joi.string().trim().max(500).optional().messages({
  //     'string.max': req.language.max_length.replace(':attr', 'Address').replace(':value', '500'),
  //   }),

  //   latitude: Joi.string().trim().max(16).optional().allow('', null).messages({
  //     'string.max': req.language.max_length.replace(':attr', 'Latitude').replace(':value', '16'),
  //   }),

  //   longitude: Joi.string().trim().max(16).optional().allow('', null).messages({
  //     'string.max': req.language.max_length.replace(':attr', 'Longitude').replace(':value', '16'),
  //   }),

  //   type: Joi.string().trim().max(30).optional().allow('', null).messages({
  //     'string.max': req.language.max_length.replace(':attr', 'Address Type').replace(':value', '30'),
  //   }),

  //   is_default: Joi.boolean().optional(),
  // }),

  // deleteAddress: (req) => Joi.object({
  //   address_id: Joi.number().integer().positive().required().messages({
  //     'number.base': req.language.required.replace(':attr', 'Address ID'),
  //     'any.required': req.language.required.replace(':attr', 'Address ID'),
  //   }),
  // }),


};

module.exports = userRules;
