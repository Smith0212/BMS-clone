const paymentModel   = require('../models/payment.model');
const paymentRules   = require('../rules/payment.rules');
const { sendResponse } = require('../../../../middleware/middleware');

const paymentController = {
    async initiatePayment(req, res) {
        const { error } = paymentRules.initiatePayment(req).validate(req.body, { abortEarly: false });
        if (error) return res.status(200).json({ code: 0, message: error.details[0].message });
        const { httpCode, code, message, data } = await paymentModel.initiatePayment(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async processPayment(req, res) {
        const { error } = paymentRules.processPayment(req).validate(req.body, { abortEarly: false });
        if (error) return res.status(200).json({ code: 0, message: error.details[0].message });
        const { httpCode, code, message, data } = await paymentModel.processPayment(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async getPaymentStatus(req, res) {
        const { httpCode, code, message, data } = await paymentModel.getPaymentStatus(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },
};

module.exports = paymentController;
