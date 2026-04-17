const Joi = require('joi');

const showtimeRules = {
    getShowtimes: (req) => Joi.object({
        tmdb_movie_id: Joi.number().integer().positive().required().messages({
            'any.required': req.language.required.replace(':attr', 'TMDB Movie ID'),
        }),
        city_id: Joi.number().integer().positive().required().messages({
            'any.required': req.language.required.replace(':attr', 'City ID'),
        }),
        date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
            'any.required': req.language.required.replace(':attr', 'Date'),
            'string.pattern.base': 'Date must be in YYYY-MM-DD format',
        }),
    }),

    getShowtimeDetail: (req) => Joi.object({
        showtime_id: Joi.number().integer().positive().required().messages({
            'any.required': req.language.required.replace(':attr', 'Showtime ID'),
        }),
    }),

    getSeatMap: (req) => Joi.object({
        showtime_id: Joi.number().integer().positive().required().messages({
            'any.required': req.language.required.replace(':attr', 'Showtime ID'),
        }),
    }),
};

module.exports = showtimeRules;
