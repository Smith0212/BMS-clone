const theaterModel   = require('../models/theater.model');
const { sendResponse } = require('../../../../middleware/middleware');

const theaterController = {
    async getCities(req, res) {
        const { httpCode, code, message, data } = await theaterModel.getCities(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async getTheaters(req, res) {
        const { httpCode, code, message, data } = await theaterModel.getTheaters(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async getTheaterDetail(req, res) {
        const { httpCode, code, message, data } = await theaterModel.getTheaterDetail(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },
};

module.exports = theaterController;
