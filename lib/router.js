const express = require('express');
const router = express.Router();

const { verifyContentType, verifyFields, verifyPendingId } = require('./middleware.js');
const { scheduleBatchEmail, getPending, cancelPending, getResults, notFound } = require('./controller.js');

router.post('/send', verifyContentType, verifyFields, scheduleBatchEmail);

router.get('/pending', getPending);

router.get('/results', getResults);

router.post('/cancelPending', verifyContentType, verifyPendingId, cancelPending);
router.use( notFound );

module.exports = router;