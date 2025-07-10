const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.post('/sms', notificationController.sendSms);
router.post('/kakao', notificationController.sendKakaoTalk);
router.get('/', notificationController.getAllNotifications);

module.exports = router;
