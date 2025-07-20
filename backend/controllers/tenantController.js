const { Tenant, Sequelize } = require('../models');
const { Op } = Sequelize;

exports.createTenant = async (req, res) => {
  try {
    const tenant = await Tenant.create(req.body);
    res.status(201).json(tenant);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllTenants = async (req, res) => {
  try {
    const { search, is_student } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    if (is_student !== undefined) {
      where.is_student = (is_student === 'true');
    }

    const tenants = await Tenant.findAll({ where });
    res.status(200).json(tenants);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getTenantById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findByPk(id);
    if (tenant) {
      res.status(200).json(tenant);
    } else {
      res.status(404).json({ message: 'Tenant not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Tenant.update(req.body, {
      where: { id: id }
    });
    if (updated) {
      const updatedTenant = await Tenant.findByPk(id);
      res.status(200).json(updatedTenant);
    } else {
      res.status(404).json({ message: 'Tenant not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Tenant.destroy({
      where: { id: id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Tenant not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
