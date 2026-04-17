const express = require('express');
const router  = express.Router();

router.use('/user',     require('./user/route/user.routes'));
router.use('/theater',  require('./theater/route/theater.routes'));
router.use('/showtime', require('./showtime/route/showtime.routes'));
router.use('/booking',  require('./booking/route/booking.routes'));
router.use('/payment',  require('./payment/route/payment.routes'));

module.exports = router;
