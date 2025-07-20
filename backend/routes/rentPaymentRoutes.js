const express = require('express');
const router = express.Router();
const rentPaymentController = require('../controllers/rentPaymentController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload'); // multer import

router.post('/', protect, authorizeRoles('admin'), rentPaymentController.createRentPayment);
router.get('/', protect, rentPaymentController.getAllRentPayments);
router.get('/:id', protect, rentPaymentController.getRentPaymentById);
router.put('/:id', protect, authorizeRoles('admin'), rentPaymentController.updateRentPayment);
router.delete('/:id', protect, authorizeRoles('admin'), rentPaymentController.deleteRentPayment);

router.get('/overdue', protect, authorizeRoles('admin'), rentPaymentController.getOverdueRentPayments);

// Excel routes
router.get('/excel/download', protect, authorizeRoles('admin'), rentPaymentController.downloadRentPaymentsExcel);
router.post('/excel/upload', protect, authorizeRoles('admin'), upload.single('file'), rentPaymentController.uploadRentPaymentsExcel);

module.exports = router;
