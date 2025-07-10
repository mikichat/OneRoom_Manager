const { Room, RoomOption } = require('../models');

exports.createRoom = async (req, res) => {
  try {
    const { room_options, ...roomData } = req.body;
    const room = await Room.create(roomData);

    if (room_options) {
      await RoomOption.create({ ...room_options, room_id: room.id });
    }

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const { status } = req.query;
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    const rooms = await Room.findAll({
      where: whereClause,
      include: [{ model: RoomOption, as: 'room_option' }]
    });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findByPk(id, {
      include: [{ model: RoomOption, as: 'room_option' }]
    });
    if (room) {
      res.status(200).json(room);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_options, ...roomData } = req.body;

    const [updated] = await Room.update(roomData, {
      where: { id: id }
    });

    if (updated) {
      if (room_options) {
        await RoomOption.update(room_options, {
          where: { room_id: id }
        });
      }
      const updatedRoom = await Room.findByPk(id, {
        include: [{ model: RoomOption, as: 'room_option' }]
      });
      res.status(200).json(updatedRoom);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    // Delete associated room options first
    await RoomOption.destroy({ where: { room_id: id } });
    const deleted = await Room.destroy({
      where: { id: id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
