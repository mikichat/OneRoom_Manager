const { RoomOption, Room, Sequelize } = require('../models');
const { Op } = Sequelize;

// Create a new RoomOption
exports.createRoomOption = async (req, res) => {
  try {
    const roomOption = await RoomOption.create(req.body);
    res.status(201).json(roomOption);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all RoomOptions (with optional filtering by room_id)
exports.getAllRoomOptions = async (req, res) => {
  try {
    const { room_id } = req.query;
    const where = {};
    if (room_id) {
      where.room_id = room_id;
    }
    const roomOptions = await RoomOption.findAll({
      where,
      include: [{
        model: Room,
        as: 'room',
        attributes: ['id', 'room_number', 'building_id']
      }]
    });
    res.status(200).json(roomOptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a RoomOption by ID
exports.getRoomOptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const roomOption = await RoomOption.findByPk(id, {
      include: [{
        model: Room,
        as: 'room',
        attributes: ['id', 'room_number', 'building_id']
      }]
    });
    if (roomOption) {
      res.status(200).json(roomOption);
    } else {
      res.status(404).json({ message: 'Room option not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a RoomOption
exports.updateRoomOption = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await RoomOption.update(req.body, {
      where: { id: id }
    });
    if (updated) {
      const updatedRoomOption = await RoomOption.findByPk(id, {
        include: [{
          model: Room,
          as: 'room',
          attributes: ['id', 'room_number', 'building_id']
        }]
      });
      res.status(200).json(updatedRoomOption);
    } else {
      res.status(404).json({ message: 'Room option not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a RoomOption
exports.deleteRoomOption = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await RoomOption.destroy({
      where: { id: id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Room option not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 