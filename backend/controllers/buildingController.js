const { Building } = require('../models');

exports.createBuilding = async (req, res) => {
  try {
    const building = await Building.create(req.body);
    res.status(201).json(building);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBuildings = async (req, res) => {
  try {
    const buildings = await Building.findAll();
    res.status(200).json(buildings);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
};
