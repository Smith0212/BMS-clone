const Joi = require('joi');

const paymentRules = {
    initiatePayment: (req) => Joi.object({
        showtime_id:    Joi.number().integer().positive().required().messages({
            'any.required': req.language.required.replace(':attr', 'Showtime ID'),
        }),
        seat_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
            'any.required': req.language.required.replace(':attr', 'Seat IDs'),
        }),
        payment_method: Joi.string().valid('card','upi','netbanking','wallet').default('card').messages({
            'any.only': 'Payment method must be card, upi, netbanking, or wallet',
        }),
        amount: Joi.number().positive().required().messages({
            'any.required': req.language.required.replace(':attr', 'Amount'),
            'number.positive': 'Amount must be greater than 0',
        }),
    }),

    processPayment: (req) => Joi.object({
        payment_id:   Joi.number().integer().positive().required().messages({
            'any.required': req.language.required.replace(':attr', 'Payment ID'),
        }),
        payment_meta: Joi.object().optional().default({}),
        should_fail:  Joi.boolean().default(false),
    }),
};

module.exports = paymentRules;
