const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware'); // protect 미들웨어 추가

router.get('/', protect, dashboardController.getDashboardSummary);

module.exports = router;
