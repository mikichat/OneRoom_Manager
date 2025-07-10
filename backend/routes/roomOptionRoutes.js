const express = require('express');
const router = express.Router();
const roomOptionController = require('../controllers/roomOptionController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/', protect, authorizeRoles('admin'), roomOptionController.createRoomOption);
router.get('/', protect, roomOptionController.getAllRoomOptions);
router.get('/:id', protect, roomOptionController.getRoomOptionById);
router.put('/:id', protect, authorizeRoles('admin'), roomOptionController.updateRoomOption);
router.delete('/:id', protect, authorizeRoles('admin'), roomOptionController.deleteRoomOption);

module.exports = router; 