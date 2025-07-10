const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/', protect, authorizeRoles('admin'), buildingController.createBuilding);
router.get('/', protect, buildingController.getAllBuildings);
router.get('/:id', protect, buildingController.getBuildingById);
router.put('/:id', protect, authorizeRoles('admin'), buildingController.updateBuilding);
router.delete('/:id', protect, authorizeRoles('admin'), buildingController.deleteBuilding);

module.exports = router;
