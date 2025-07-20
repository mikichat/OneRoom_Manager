const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload'); // multer import

router.post('/', protect, authorizeRoles('admin'), buildingController.createBuilding);
router.get('/', protect, buildingController.getAllBuildings);
router.get('/:id', protect, buildingController.getBuildingById);
router.put('/:id', protect, authorizeRoles('admin'), buildingController.updateBuilding);
router.delete('/:id', protect, authorizeRoles('admin'), buildingController.deleteBuilding);

// Excel routes
router.get('/excel/download', protect, authorizeRoles('admin'), buildingController.downloadBuildingsExcel);
router.post('/excel/upload', protect, authorizeRoles('admin'), upload.single('file'), buildingController.uploadBuildingsExcel);

module.exports = router;
