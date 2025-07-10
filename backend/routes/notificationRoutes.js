const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/sms', protect, authorizeRoles('admin'), notificationController.sendSms);
router.post('/kakao', protect, authorizeRoles('admin'), notificationController.sendKakaoTalk);
router.get('/', protect, notificationController.getAllNotifications);

module.exports = router;
