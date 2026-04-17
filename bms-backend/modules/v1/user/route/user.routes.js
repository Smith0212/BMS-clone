const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { checkApiKey, checkToken } = require('../../../../middleware/middleware');

// Public routes
router.post('/signup',         checkApiKey, userController.signup);
router.post('/verifyOtp',      checkApiKey, userController.verifyOtp);
router.post('/login',          checkApiKey, userController.login);
router.post('/resendOtp',      checkApiKey, userController.resendOtp);
router.post('/forgotPassword', checkApiKey, userController.forgotPassword);
router.post('/resetPassword',  checkApiKey, userController.resetPassword);

// Protected routes
router.post('/logout',         checkApiKey, checkToken, userController.logout);
router.get('/getProfile',      checkApiKey, checkToken, userController.getProfile);
router.post('/updateProfile',  checkApiKey, checkToken, userController.updateProfile);
router.post('/changePassword', checkApiKey, checkToken, userController.changePassword);
router.post('/deleteAccount',  checkApiKey, checkToken, userController.deleteAccount);

// Notification routes
router.get('/notifications/getNotifications', checkApiKey, checkToken, userController.getNotifications);
router.post('/notifications/markAsRead',      checkApiKey, checkToken, userController.markAsRead);
router.post('/notifications/markAllRead',     checkApiKey, checkToken, userController.markAllRead);

module.exports = router;
