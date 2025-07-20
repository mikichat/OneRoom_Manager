const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const upload = require('../middlewares/upload');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/', protect, authorizeRoles('admin'), upload.single('contract_image'), contractController.createContract);
router.get('/', protect, contractController.getAllContracts);
router.get('/:id', protect, contractController.getContractById);
router.put('/:id', protect, authorizeRoles('admin'), upload.single('contract_image'), contractController.updateContract);
router.delete('/:id', protect, authorizeRoles('admin'), contractController.deleteContract);

// Excel routes
router.get('/excel/download', protect, authorizeRoles('admin'), contractController.downloadContractsExcel);
router.post('/excel/upload', protect, authorizeRoles('admin'), upload.single('file'), contractController.uploadContractsExcel);

module.exports = router;
