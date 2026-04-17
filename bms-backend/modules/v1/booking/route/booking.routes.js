const express = require('express');
const router  = express.Router();
const bookingController = require('../controllers/booking.controller');
const { checkApiKey, checkToken } = require('../../../../middleware/middleware');

router.post('/reserveSeats',    checkApiKey, checkToken, bookingController.reserveSeats);
router.post('/confirmBooking',  checkApiKey, checkToken, bookingController.confirmBooking);
router.post('/cancelBooking',   checkApiKey, checkToken, bookingController.cancelBooking);
router.get('/getMyBookings',    checkApiKey, checkToken, bookingController.getMyBookings);
router.get('/getBookingDetail', checkApiKey, checkToken, bookingController.getBookingDetail);

module.exports = router;
