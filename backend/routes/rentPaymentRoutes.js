const express = require('express');
const router = express.Router();
const rentPaymentController = require('../controllers/rentPaymentController');

router.post('/', rentPaymentController.createRentPayment);
router.get('/', rentPaymentController.getAllRentPayments);
router.get('/:id', rentPaymentController.getRentPaymentById);
router.put('/:id', rentPaymentController.updateRentPayment);
router.delete('/:id', rentPaymentController.deleteRentPayment);

module.exports = router;
