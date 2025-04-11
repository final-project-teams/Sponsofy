const express = require('express');
const router = express.Router();
const NotificationController = require('../controller/NotificationController');

router.post('/send-contract-update-notification', NotificationController.sendContractUpdateNotification);

module.exports = router;