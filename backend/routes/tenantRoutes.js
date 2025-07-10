const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/', protect, authorizeRoles('admin'), tenantController.createTenant);
router.get('/', protect, tenantController.getAllTenants);
router.get('/:id', protect, tenantController.getTenantById);
router.put('/:id', protect, authorizeRoles('admin'), tenantController.updateTenant);
router.delete('/:id', protect, authorizeRoles('admin'), tenantController.deleteTenant);

module.exports = router;
