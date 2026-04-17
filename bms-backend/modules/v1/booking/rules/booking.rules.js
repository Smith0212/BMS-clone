const Joi = require('joi');

const bookingRules = {
    reserveSeats: (req) => Joi.object({
        showtime_id: Joi.number().integer().positive().required().messages({
            'any.required': req.language.required.replace(':attr', 'Showtime ID'),
        }),
        seat_ids: Joi.array().items(Joi.number().integer().positive()).min(1).max(10).required().messages({
            'any.required': req.language.required.replace(':attr', 'Seat IDs'),
            'array.min':    'Select at least 1 seat',
            'array.max':    'Cannot book more than 10 seats at once',
        }),
    }),

    confirmBooking: (req) => Joi.object({
        showtime_id: Joi.number().integer().positive().required().messages({
            'any.required': req.language.required.replace(':attr', 'Showtime ID'),
        }),
        seat_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
            'any.required': req.language.required.replace(':attr', 'Seat IDs'),
        }),
        payment_id: Joi.number().integer().positive().required().messages({
            'any.required': req.language.required.replace(':attr', 'Payment ID'),
        }),
    }),

    cancelBooking: (req) => Joi.object({
        booking_id: Joi.number().integer().positive().required().messages({
            'any.required': req.language.required.replace(':attr', 'Booking ID'),
        }),
        cancellation_reason: Joi.string().max(500).optional(),
    }),
};

module.exports = bookingRules;
