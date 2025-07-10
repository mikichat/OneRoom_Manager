const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/', protect, authorizeRoles('admin'), roomController.createRoom);
router.get('/', protect, roomController.getAllRooms);
router.get('/:id', protect, roomController.getRoomById);
router.put('/:id', protect, authorizeRoles('admin'), roomController.updateRoom);
router.delete('/:id', protect, authorizeRoles('admin'), roomController.deleteRoom);

module.exports = router;
