const { Building } = require('../models');
const { Op } = require('sequelize');

exports.createBuilding = async (req, res) => {
  try {
    const building = await Building.create(req.body);
    res.status(201).json(building);
  } catch (error) {
    console.error('Error creating building:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllBuildings = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    const buildings = await Building.findAll({ where });
    res.status(200).json(buildings);
  } catch (error) {
    console.error('Error fetching buildings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getBuildingById = async (req, res) => {
  try {
    const { id } = req.params;
    const building = await Building.findByPk(id);
    if (building) {
      res.status(200).json(building);
    } else {
      res.status(404).json({ message: 'Building not found' });
    }
  } catch (error) {
    console.error('Error fetching building by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Building.update(req.body, {
      where: { id: id }
    });
    if (updated) {
      const updatedBuilding = await Building.findByPk(id);
      res.status(200).json(updatedBuilding);
    } else {
      res.status(404).json({ message: 'Building not found' });
    }
  } catch (error) {
    console.error('Error updating building:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Building.destroy({
      where: { id: id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Building not found' });
    }
  } catch (error) {
    console.error('Error deleting building:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
