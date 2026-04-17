const express = require('express');

const userController = require('../controllers/user.controller');

const { checkToken, checkApiKey } = require('../../../../middleware/middleware');

const router = express.Router();

// ─── Auth Routes (public) ────────────────────────────────────────────────────
router.post('/signup', checkApiKey, userController.signup);
router.post('/verifyOtp', checkApiKey, userController.verifyOtp);
router.post('/login', checkApiKey, userController.login);
router.post('/resendOtp', checkApiKey, userController.resendOtp);
router.post('/forgotPassword', checkApiKey, userController.forgotPassword);
router.post('/resetPassword', checkApiKey, userController.resetPassword);
router.post('/logout', checkApiKey, checkToken, userController.logout);



// ─── Profile Routes (protected) ──────────────────────────────────────────────
router.get('/getProfile', checkApiKey, checkToken, userController.getProfile);
router.post('/updateProfile', checkApiKey, checkToken, userController.updateProfile);
router.post('/changePassword', checkApiKey, checkToken, userController.changePassword);
router.post('/deleteAccount', checkApiKey, checkToken, userController.deleteAccount);



// // ─── Address Routes (all protected) ──────────────────────────────────────────
// router.get('/getAddress',      checkApiKey, checkToken, userController.getAddress);
// router.post('/addAddress',     checkApiKey, checkToken, userController.addAddress);
// router.post('/updateAddress',  checkApiKey, checkToken, userController.updateAddress);
// router.post('/deleteAddress',  checkApiKey, checkToken, userController.deleteAddress);



// // ─── Service Category Routes ──────────────────────────────────────────────────
// router.get('/getServiceCategories', checkApiKey, checkToken, userController.getServiceCategories);



// // ─── Banner Routes (all protected) ──────────────────────────────────────────
// router.get('/getBanner', checkApiKey, checkToken, userController.getBanner);



// // ─── Service Provider Listing Routes (all protected) ─────────────────────────
// router.get('/getServiceProviders',       checkApiKey, checkToken, userController.getServiceProviders);
// router.get('/getServiceProvidersMap',    checkApiKey, checkToken, userController.getServiceProvidersMap);
// router.post('/getServiceProviderDetail',  checkApiKey, checkToken, userController.getServiceProviderDetail);
// router.post('/getProviderServices',       checkApiKey, checkToken, userController.getProviderServices);
// router.post('/getProviderPackages',       checkApiKey, checkToken, userController.getProviderPackages);
// router.post('/toggleFavorite',           checkApiKey, checkToken, userController.toggleFavorite);



// // ─── Booking — Phase 1: Draft ─────────────────────────────────────────────────
// router.post('/booking/draft/addItem',    checkApiKey, checkToken, bookingController.addItem);
// router.post('/booking/draft/removeItem', checkApiKey, checkToken, bookingController.removeItem);
// router.post('/booking/getDraft',         checkApiKey, checkToken, bookingController.getDraft);

// // ─── Booking — Back Navigation Clears ────────────────────────────────────────
// router.post('/booking/draft/clearEmployee', checkApiKey, checkToken, bookingController.clearEmployee);
// router.post('/booking/draft/clearSchedule', checkApiKey, checkToken, bookingController.clearSchedule);

// // ─── Booking — Phase 2: Employee ─────────────────────────────────────────────
// router.post('/booking/employees',         checkApiKey, checkToken, bookingController.getBookingEmployees);
// router.post('/booking/draft/setEmployee', checkApiKey, checkToken, bookingController.setEmployee);

// // ─── Booking — Phase 3: Schedule ─────────────────────────────────────────────
// router.post('/booking/availability',      checkApiKey, checkToken, bookingController.getAvailability);
// router.post('/booking/draft/setSchedule', checkApiKey, checkToken, bookingController.setSchedule);

// // ─── Booking — Phase 4: Coupons ──────────────────────────────────────────────
// router.post('/getCoupons',                checkApiKey, checkToken, bookingController.getCoupons);
// router.post('/booking/draft/applyCoupon', checkApiKey, checkToken, bookingController.applyCoupon);
// router.post('/booking/draft/removeCoupon',checkApiKey, checkToken, bookingController.removeCoupon);

// // ─── Booking — Phase 5: Payment ──────────────────────────────────────────────
// router.post('/booking/initiatePayment',   checkApiKey, checkToken, bookingController.initiatePayment);

// // ─── Booking — Phase 7: Arrival OTP ─────────────────────────────────────────
// router.post('/booking/requestArrivalOtp', checkApiKey, checkToken, bookingController.requestArrivalOtp);

// // ─── Booking — Phase 8: My Bookings ─────────────────────────────────────────
// router.post('/getBookings',               checkApiKey, checkToken, bookingController.getBookings);
// router.post('/summaryBooking',            checkApiKey, checkToken, bookingController.getSummaryBooking);

// // ─── Booking — Phase 9: Cancel ───────────────────────────────────────────────
// router.post('/booking/cancel',            checkApiKey, checkToken, bookingController.cancelBooking);
// router.post('/booking/refundStatus',      checkApiKey, checkToken, bookingController.getRefundStatus);

// // ─── Booking — Phase 10: Reschedule ─────────────────────────────────────────
// router.post('/booking/rescheduleRequest', checkApiKey, checkToken, bookingController.rescheduleRequest);

module.exports = router;
