const Joi = require('joi');

const theaterRules = {
    getTheaters: (req) => Joi.object({
        city_id: Joi.number().integer().positive().required().messages({
            'any.required': req.language.required.replace(':attr', 'City ID'),
            'number.base':  'City ID must be a number',
        }),
    }),

    getTheaterDetail: (req) => Joi.object({
        theater_id: Joi.number().integer().positive().required().messages({
            'any.required': req.language.required.replace(':attr', 'Theater ID'),
            'number.base':  'Theater ID must be a number',
        }),
    }),
};

module.exports = theaterRules;
