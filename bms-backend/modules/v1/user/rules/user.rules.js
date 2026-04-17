const Joi = require('joi');

const userRules = {
    signup: (req) => Joi.object({
        first_name:  Joi.string().trim().min(2).max(255).required().messages({
            'string.empty': req.language.required.replace(':attr', 'First Name'),
            'any.required': req.language.required.replace(':attr', 'First Name'),
        }),
        last_name:   Joi.string().trim().min(2).max(255).required().messages({
            'string.empty': req.language.required.replace(':attr', 'Last Name'),
            'any.required': req.language.required.replace(':attr', 'Last Name'),
        }),
        email: Joi.when('signup_type', {
            is: 's',
            then: Joi.string().email().required().messages({
                'string.email': req.language.invalid_email_format,
                'any.required': req.language.required.replace(':attr', 'Email'),
            }),
            otherwise: Joi.string().email().optional(),
        }),
        password: Joi.when('signup_type', {
            is: 's',
            then: Joi.string().min(6).max(50).required().messages({
                'string.min': req.language.min_length.replace(':attr', 'Password').replace(':value', '6'),
                'any.required': req.language.required.replace(':attr', 'Password'),
            }),
            otherwise: Joi.string().optional(),
        }),
        signup_type:  Joi.string().valid('s','g','f','a').default('s').messages({
            'any.only': req.language.invalid_signup_type,
        }),
        social_id:    Joi.string().when('signup_type', {
            is: Joi.valid('g','f','a'),
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),
        country_code: Joi.string().max(6).optional(),
        phone:        Joi.string().min(6).max(20).optional(),
        device_type:  Joi.string().valid('A','I','W').default('W').messages({
            'any.only': req.language.invalid_device_type,
        }),
        device_name:  Joi.string().max(64).optional(),
        os_version:   Joi.string().max(8).optional(),
        app_version:  Joi.string().max(8).optional(),
        fcm_token:    Joi.string().optional(),
        timezone:     Joi.string().optional(),
    }),

    verifyOtp: (req) => Joi.object({
        email:  Joi.string().email().required().messages({
            'string.email': req.language.invalid_email_format,
            'any.required': req.language.required.replace(':attr', 'Email'),
        }),
        otp:    Joi.string().length(4).pattern(/^\d{4}$/).required().messages({
            'string.length':  req.language.otp_format,
            'string.pattern.base': req.language.otp_format,
            'any.required':   req.language.required.replace(':attr', 'OTP'),
        }),
        action: Joi.string().valid('signup','forgot').required().messages({
            'any.only':    req.language.invalid_otp_action,
            'any.required': req.language.required.replace(':attr', 'Action'),
        }),
    }),

    login: (req) => Joi.object({
        email:      Joi.string().email().required().messages({
            'string.email': req.language.invalid_email_format,
            'any.required': req.language.required.replace(':attr', 'Email'),
        }),
        password:   Joi.string().when('login_type', {
            is: 's',
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),
        login_type: Joi.string().valid('s','g','f','a').default('s'),
        social_id:  Joi.string().when('login_type', {
            is: Joi.valid('g','f','a'),
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),
        device_type: Joi.string().valid('A','I','W').default('W'),
        device_name: Joi.string().max(64).optional(),
        os_version:  Joi.string().max(8).optional(),
        app_version: Joi.string().max(8).optional(),
        fcm_token:   Joi.string().optional(),
        timezone:    Joi.string().optional(),
        ip:          Joi.string().optional(),
    }),

    resendOtp: (req) => Joi.object({
        email:  Joi.string().email().required().messages({
            'string.email': req.language.invalid_email_format,
            'any.required': req.language.required.replace(':attr', 'Email'),
        }),
        action: Joi.string().valid('signup','forgot').required().messages({
            'any.only':    req.language.invalid_otp_action,
            'any.required': req.language.required.replace(':attr', 'Action'),
        }),
    }),

    forgotPassword: (req) => Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': req.language.invalid_email_format,
            'any.required': req.language.required.replace(':attr', 'Email'),
        }),
    }),

    resetPassword: (req) => Joi.object({
        email:        Joi.string().email().required().messages({
            'string.email': req.language.invalid_email_format,
            'any.required': req.language.required.replace(':attr', 'Email'),
        }),
        new_password: Joi.string().min(6).max(50).required().messages({
            'string.min':  req.language.min_length.replace(':attr', 'New Password').replace(':value', '6'),
            'any.required': req.language.required.replace(':attr', 'New Password'),
        }),
    }),

    updateProfile: (req) => Joi.object({
        first_name:    Joi.string().trim().min(2).max(255).optional(),
        last_name:     Joi.string().trim().min(2).max(255).optional(),
        profile_image: Joi.string().optional(),
        country_code:  Joi.string().max(6).optional(),
        phone:         Joi.string().min(6).max(20).optional(),
        email:         Joi.string().email().optional(),
        dob:           Joi.string().optional(),
        city:          Joi.string().max(255).optional(),
        state:         Joi.string().max(255).optional(),
        country:       Joi.string().max(255).optional(),
    }),

    changePassword: (req) => Joi.object({
        old_password: Joi.string().required().messages({
            'any.required': req.language.required.replace(':attr', 'Old Password'),
        }),
        new_password: Joi.string().min(6).max(50).required().messages({
            'string.min':  req.language.min_length.replace(':attr', 'New Password').replace(':value', '6'),
            'any.required': req.language.required.replace(':attr', 'New Password'),
        }),
    }),

    markAsRead: (req) => Joi.object({
        notification_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
            'any.required': req.language.required.replace(':attr', 'Notification IDs'),
        }),
    }),
};

module.exports = userRules;
