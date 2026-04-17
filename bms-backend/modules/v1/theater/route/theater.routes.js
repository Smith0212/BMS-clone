const express = require('express');
const router  = express.Router();
const theaterController = require('../controllers/theater.controller');
const { checkApiKey } = require('../../../../middleware/middleware');

router.get('/getCities',       checkApiKey, theaterController.getCities);
router.get('/getTheaters',     checkApiKey, theaterController.getTheaters);
router.get('/getTheaterDetail',checkApiKey, theaterController.getTheaterDetail);

module.exports = router;
