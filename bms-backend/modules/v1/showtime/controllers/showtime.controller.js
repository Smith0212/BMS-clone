const showtimeModel  = require('../models/showtime.model');
const { sendResponse } = require('../../../../middleware/middleware');

const showtimeController = {
    async getShowtimes(req, res) {
        const { httpCode, code, message, data } = await showtimeModel.getShowtimes(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async getShowtimeDetail(req, res) {
        const { httpCode, code, message, data } = await showtimeModel.getShowtimeDetail(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async getSeatMap(req, res) {
        const { httpCode, code, message, data } = await showtimeModel.getSeatMap(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },
};

module.exports = showtimeController;
