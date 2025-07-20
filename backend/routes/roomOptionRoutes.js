const express = require('express');
const router = express.Router();
const roomOptionController = require('../controllers/roomOptionController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload'); // multer import

router.post('/', protect, authorizeRoles('admin'), roomOptionController.createRoomOption);
router.get('/', protect, roomOptionController.getAllRoomOptions);
router.get('/:id', protect, roomOptionController.getRoomOptionById);
router.put('/:id', protect, authorizeRoles('admin'), roomOptionController.updateRoomOption);
router.delete('/:id', protect, authorizeRoles('admin'), roomOptionController.deleteRoomOption);

// Excel routes
router.get('/excel/download', protect, authorizeRoles('admin'), roomOptionController.downloadRoomOptionsExcel);
router.post('/excel/upload', protect, authorizeRoles('admin'), upload.single('file'), roomOptionController.uploadRoomOptionsExcel);

module.exports = router; 