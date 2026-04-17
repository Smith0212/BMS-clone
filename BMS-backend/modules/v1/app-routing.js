const express = require('express');
const router = express.Router();

// Importing user routes
const userRoute    = require('./user/route/user.routes');

// Importing owner routes
// const ownerRoute    = require('./owner/route/owner.routes');



// ─── User routes ──────────────────────────────────────────────────────────────
router.use('/user',    userRoute);



// ─── Owner routes ─────────────────────────────────────────────────────────────
// router.use('/owner',    ownerRoute);




// router.use('/admin', adminRoute);

module.exports = router;
