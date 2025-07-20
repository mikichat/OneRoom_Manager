const { Contract, Room, Tenant, Sequelize } = require('../models');
const { Op } = Sequelize;

exports.createContract = async (req, res) => {
  try {
    const contractData = req.body;
    if (req.file) {
      contractData.contract_image_path = req.file.path;
    }
    const contract = await Contract.create(contractData);
    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllContracts = async (req, res) => {
  try {
    const { contract_status, search } = req.query;
    const whereClause = {};
    if (contract_status) {
      whereClause.contract_status = contract_status;
    }

    const includeClause = [
      { model: Room, as: 'room', required: true },
      { model: Tenant, as: 'tenant', required: true },
    ];

    if (search) {
      whereClause[Op.or] = [
        { '$room.room_number$': { [Op.like]: `%${search}%` } },
        { '$tenant.name$': { [Op.like]: `%${search}%` } },
      ];
    }

    const contracts = await Contract.findAll({
      where: whereClause,
      include: includeClause,
    });
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getContractById = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findByPk(id, {
      include: [{ model: Room, as: 'room' }, { model: Tenant, as: 'tenant' }]
    });
    if (contract) {
      res.status(200).json(contract);
    } else {
      res.status(404).json({ message: 'Contract not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const contractData = req.body;
    if (req.file) {
      contractData.contract_image_path = req.file.path;
    }
    const [updated] = await Contract.update(contractData, {
      where: { id: id }
    });
    if (updated) {
      const updatedContract = await Contract.findByPk(id, {
        include: [{ model: Room, as: 'room' }, { model: Tenant, as: 'tenant' }]
      });
      res.status(200).json(updatedContract);
    } else {
      res.status(404).json({ message: 'Contract not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteContract = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Contract.destroy({
      where: { id: id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Contract not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
