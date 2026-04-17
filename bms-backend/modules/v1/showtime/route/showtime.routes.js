const express = require('express');
const router  = express.Router();
const showtimeController = require('../controllers/showtime.controller');
const { checkApiKey } = require('../../../../middleware/middleware');

router.get('/getShowtimes',      checkApiKey, showtimeController.getShowtimes);
router.get('/getShowtimeDetail', checkApiKey, showtimeController.getShowtimeDetail);
router.get('/getSeatMap',        checkApiKey, showtimeController.getSeatMap);

module.exports = router;
