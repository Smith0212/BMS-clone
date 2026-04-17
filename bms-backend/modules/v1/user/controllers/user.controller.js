const userModel   = require('../models/user.model');
const userRules   = require('../rules/user.rules');
const { sendResponse } = require('../../../../middleware/middleware');

const userController = {
    async signup(req, res) {
        const { error } = userRules.signup(req).validate(req.body, { abortEarly: false });
        if (error) return res.status(200).json({ code: 0, message: error.details[0].message });
        const { httpCode, code, message, data } = await userModel.signup(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async verifyOtp(req, res) {
        const { error } = userRules.verifyOtp(req).validate(req.body, { abortEarly: false });
        if (error) return res.status(200).json({ code: 0, message: error.details[0].message });
        const { httpCode, code, message, data } = await userModel.verifyOtp(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async login(req, res) {
        const { error } = userRules.login(req).validate(req.body, { abortEarly: false });
        if (error) return res.status(200).json({ code: 0, message: error.details[0].message });
        const { httpCode, code, message, data } = await userModel.login(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async resendOtp(req, res) {
        const { error } = userRules.resendOtp(req).validate(req.body, { abortEarly: false });
        if (error) return res.status(200).json({ code: 0, message: error.details[0].message });
        const { httpCode, code, message, data } = await userModel.resendOtp(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async forgotPassword(req, res) {
        const { error } = userRules.forgotPassword(req).validate(req.body, { abortEarly: false });
        if (error) return res.status(200).json({ code: 0, message: error.details[0].message });
        const { httpCode, code, message, data } = await userModel.forgotPassword(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async resetPassword(req, res) {
        const { error } = userRules.resetPassword(req).validate(req.body, { abortEarly: false });
        if (error) return res.status(200).json({ code: 0, message: error.details[0].message });
        const { httpCode, code, message, data } = await userModel.resetPassword(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async logout(req, res) {
        const { httpCode, code, message, data } = await userModel.logout(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async getProfile(req, res) {
        const { httpCode, code, message, data } = await userModel.getProfile(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async updateProfile(req, res) {
        const { error } = userRules.updateProfile(req).validate(req.body, { abortEarly: false });
        if (error) return res.status(200).json({ code: 0, message: error.details[0].message });
        const { httpCode, code, message, data } = await userModel.updateProfile(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async changePassword(req, res) {
        const { error } = userRules.changePassword(req).validate(req.body, { abortEarly: false });
        if (error) return res.status(200).json({ code: 0, message: error.details[0].message });
        const { httpCode, code, message, data } = await userModel.changePassword(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async deleteAccount(req, res) {
        const { httpCode, code, message, data } = await userModel.deleteAccount(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async getNotifications(req, res) {
        const { httpCode, code, message, data } = await userModel.getNotifications(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async markAsRead(req, res) {
        const { error } = userRules.markAsRead(req).validate(req.body, { abortEarly: false });
        if (error) return res.status(200).json({ code: 0, message: error.details[0].message });
        const { httpCode, code, message, data } = await userModel.markAsRead(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async markAllRead(req, res) {
        const { httpCode, code, message, data } = await userModel.markAllRead(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },
};

module.exports = userController;
