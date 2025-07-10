const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/monthly-income', protect, reportController.getMonthlyIncomeReport);

module.exports = router; 