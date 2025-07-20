const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload'); // multer import

router.post('/', protect, authorizeRoles('admin'), tenantController.createTenant);
router.get('/', protect, tenantController.getAllTenants);
router.get('/:id', protect, tenantController.getTenantById);
router.put('/:id', protect, authorizeRoles('admin'), tenantController.updateTenant);
router.delete('/:id', protect, authorizeRoles('admin'), tenantController.deleteTenant);

// Excel routes
router.get('/excel/download', protect, authorizeRoles('admin'), tenantController.downloadTenantsExcel);
router.post('/excel/upload', protect, authorizeRoles('admin'), upload.single('file'), tenantController.uploadTenantsExcel);

module.exports = router;
