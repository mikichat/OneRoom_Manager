const { RentPayment, Contract } = require('../models');

exports.createRentPayment = async (req, res) => {
  try {
    const rentPayment = await RentPayment.create(req.body);
    res.status(201).json(rentPayment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllRentPayments = async (req, res) => {
  try {
    const rentPayments = await RentPayment.findAll({
      include: [{ model: Contract, as: 'contract' }]
    });
    res.status(200).json(rentPayments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRentPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const rentPayment = await RentPayment.findByPk(id, {
      include: [{ model: Contract, as: 'contract' }]
    });
    if (rentPayment) {
      res.status(200).json(rentPayment);
    } else {
      res.status(404).json({ message: 'Rent payment not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRentPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await RentPayment.update(req.body, {
      where: { id: id }
    });
    if (updated) {
      const updatedRentPayment = await RentPayment.findByPk(id, {
        include: [{ model: Contract, as: 'contract' }]
      });
      res.status(200).json(updatedRentPayment);
    } else {
      res.status(404).json({ message: 'Rent payment not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRentPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await RentPayment.destroy({
      where: { id: id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Rent payment not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
