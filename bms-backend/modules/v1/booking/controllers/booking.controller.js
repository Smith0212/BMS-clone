const bookingModel   = require('../models/booking.model');
const bookingRules   = require('../rules/booking.rules');
const { sendResponse } = require('../../../../middleware/middleware');

const bookingController = {
    async reserveSeats(req, res) {
        const { error } = bookingRules.reserveSeats(req).validate(req.body, { abortEarly: false });
        if (error) return res.status(200).json({ code: 0, message: error.details[0].message });
        const { httpCode, code, message, data } = await bookingModel.reserveSeats(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async confirmBooking(req, res) {
        const { error } = bookingRules.confirmBooking(req).validate(req.body, { abortEarly: false });
        if (error) return res.status(200).json({ code: 0, message: error.details[0].message });
        const { httpCode, code, message, data } = await bookingModel.confirmBooking(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async cancelBooking(req, res) {
        const { error } = bookingRules.cancelBooking(req).validate(req.body, { abortEarly: false });
        if (error) return res.status(200).json({ code: 0, message: error.details[0].message });
        const { httpCode, code, message, data } = await bookingModel.cancelBooking(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async getMyBookings(req, res) {
        const { httpCode, code, message, data } = await bookingModel.getMyBookings(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async getBookingDetail(req, res) {
        const { httpCode, code, message, data } = await bookingModel.getBookingDetail(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },
};

module.exports = bookingController;
