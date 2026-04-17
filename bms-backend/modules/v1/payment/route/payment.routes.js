const express = require('express');
const router  = express.Router();
const paymentController = require('../controllers/payment.controller');
const { checkApiKey, checkToken } = require('../../../../middleware/middleware');

router.post('/initiatePayment',  checkApiKey, checkToken, paymentController.initiatePayment);
router.post('/processPayment',   checkApiKey, checkToken, paymentController.processPayment);
router.get('/getPaymentStatus',  checkApiKey, checkToken, paymentController.getPaymentStatus);

module.exports = router;
