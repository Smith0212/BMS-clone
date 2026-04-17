const userModel = require('../models/user.model');
const userRules = require('../rules/user.rules');
const { sendResponse } = require('../../../../middleware/middleware');

const userController = {

    // ─────────────────────────────────────── Auth Controllers ─────────────────────────────────────────────────────────────
    async signup(req, res) {
        const schema = userRules.signup(req);
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            res.status(200).json({ code: 0, message: error.details[0].message || error.details[0] });
            return;
        }

        const { httpCode, code, message, data } = await userModel.signup(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async verifyOtp(req, res) {
        const schema = userRules.verifyOtp(req);
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            res.status(200).json({ code: 0, message: error.details[0].message || error.details[0] });
            return;
        }

        const { httpCode, code, message, data } = await userModel.verifyOtp(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async login(req, res) {
        const schema = userRules.login(req);
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            res.status(200).json({ code: 0, message: error.details[0].message || error.details[0] });
            return;
        }

        const { httpCode, code, message, data } = await userModel.login(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async resendOtp(req, res) {
        const schema = userRules.resendOtp(req);
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            res.status(200).json({ code: 0, message: error.details[0].message || error.details[0] });
            return;
        }

        const { httpCode, code, message, data } = await userModel.resendOtp(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async forgotPassword(req, res) {
        const schema = userRules.forgotPassword(req);
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            res.status(200).json({ code: 0, message: error.details[0].message || error.details[0] });
            return;
        }

        const { httpCode, code, message, data } = await userModel.forgotPassword(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async resetPassword(req, res) {
        const schema = userRules.resetPassword(req);
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            res.status(200).json({ code: 0, message: error.details[0].message || error.details[0] });
            return;
        }

        const { httpCode, code, message, data } = await userModel.resetPassword(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async logout(req, res) {
        const { httpCode, code, message, data } = await userModel.logout(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },



    
    // ─────────────────────────────────────── Profile Controllers ─────────────────────────────────────────────────────────────
    async getProfile(req, res) {
        const { httpCode, code, message, data } = await userModel.getProfile(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async updateProfile(req, res) {
        const schema = userRules.updateProfile(req);
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            res.status(200).json({ code: 0, message: error.details[0].message || error.details[0] });
            return;
        }

        const { httpCode, code, message, data } = await userModel.updateProfile(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async changePassword(req, res) {
        const schema = userRules.changePassword(req);
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            res.status(200).json({ code: 0, message: error.details[0].message || error.details[0] });
            return;
        }

        const { httpCode, code, message, data } = await userModel.changePassword(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },

    async deleteAccount(req, res) {
        const { httpCode, code, message, data } = await userModel.deleteAccount(req);
        return sendResponse(req, res, httpCode, code, message, data);
    },



    // ─────────────────────────────────────── Address Controllers ─────────────────────────────────────────────────────────────
    // async getAddress(req, res) {
    //     const { httpCode, code, message, data } = await userModel.getAddresses(req);
    //     return sendResponse(req, res, httpCode, code, message, data);
    // },

    // async addAddress(req, res) {
    //     const schema = userRules.addAddress(req);
    //     const { error } = schema.validate(req.body, { abortEarly: false });
    //     if (error) {
    //         res.status(200).json({ code: 0, message: error.details[0].message || error.details[0] });
    //         return;
    //     }

    //     const { httpCode, code, message, data } = await userModel.addAddress(req);
    //     return sendResponse(req, res, httpCode, code, message, data);
    // },

    // async updateAddress(req, res) {
    //     const schema = userRules.updateAddress(req);
    //     const { error } = schema.validate(req.body, { abortEarly: false });
    //     if (error) {
    //         res.status(200).json({ code: 0, message: error.details[0].message || error.details[0] });
    //         return;
    //     }

    //     const { httpCode, code, message, data } = await userModel.updateAddress(req);
    //     return sendResponse(req, res, httpCode, code, message, data);
    // },

    // async deleteAddress(req, res) {
    //     const schema = userRules.deleteAddress(req);
    //     const { error } = schema.validate(req.body, { abortEarly: false });
    //     if (error) {
    //         res.status(200).json({ code: 0, message: error.details[0].message || error.details[0] });
    //         return;
    //     }

    //     const { httpCode, code, message, data } = await userModel.deleteAddress(req);
    //     return sendResponse(req, res, httpCode, code, message, data);
    // },


};

module.exports = userController;
