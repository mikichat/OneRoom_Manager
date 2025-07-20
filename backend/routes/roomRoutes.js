const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload'); // multer import

router.post('/', protect, authorizeRoles('admin'), roomController.createRoom);
router.get('/', protect, roomController.getAllRooms);
router.get('/:id', protect, roomController.getRoomById);
router.put('/:id', protect, authorizeRoles('admin'), roomController.updateRoom);
router.delete('/:id', protect, authorizeRoles('admin'), roomController.deleteRoom);

// Excel routes
router.get('/excel/download', protect, authorizeRoles('admin'), roomController.downloadRoomsExcel);
router.post('/excel/upload', protect, authorizeRoles('admin'), upload.single('file'), roomController.uploadRoomsExcel);

module.exports = router;
