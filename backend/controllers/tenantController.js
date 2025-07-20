const { Tenant, Sequelize } = require('../models');
const { Op } = Sequelize;
const ExcelJS = require('exceljs'); // ExcelJS import
const path = require('path');

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

exports.downloadTenantsExcel = async (req, res) => {
  try {
    const tenants = await Tenant.findAll({});

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('임차인 목록');

    // Add headers
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: '이름', key: 'name', width: 20 },
      { header: '전화번호', key: 'phone', width: 20 },
      { header: '이메일', key: 'email', width: 30 },
      { header: '생년월일(앞6자리)', key: 'birth_first_six', width: 20 },
      { header: '비상 연락처', key: 'emergency_contact', width: 20 },
      { header: '비상 연락망 이름', key: 'emergency_name', width: 25 },
      { header: '학생 여부', key: 'is_student', width: 15 },
      { header: '학교명', key: 'school_name', width: 30 },
      { header: '생성일', key: 'created_at', width: 20 },
      { header: '수정일', key: 'updated_at', width: 20 },
    ];

    // Add rows
    tenants.forEach(tenant => {
      worksheet.addRow({
        id: tenant.id,
        name: tenant.name,
        phone: tenant.phone,
        email: tenant.email,
        birth_first_six: tenant.birth_first_six,
        emergency_contact: tenant.emergency_contact,
        emergency_name: tenant.emergency_name,
        is_student: tenant.is_student ? 'TRUE' : 'FALSE',
        school_name: tenant.school_name,
        created_at: tenant.created_at,
        updated_at: tenant.updated_at,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'tenants.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error downloading tenants excel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.uploadTenantsExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = path.join(__dirname, '..', req.file.path);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);

    const tenantsToCreate = [];
    const tenantsToUpdate = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const rowData = row.values;
      const tenantData = {
        id: rowData[1],
        name: rowData[2],
        phone: rowData[3],
        email: rowData[4],
        birth_first_six: rowData[5],
        emergency_contact: rowData[6],
        emergency_name: rowData[7],
        is_student: rowData[8] === 'TRUE',
        school_name: rowData[9],
      };

      if (tenantData.id) {
        tenantsToUpdate.push(tenantData);
      } else {
        tenantsToCreate.push(tenantData);
      }
    });

    for (const data of tenantsToCreate) {
      await Tenant.create(data);
    }

    for (const data of tenantsToUpdate) {
      await Tenant.update(data, { where: { id: data.id } });
    }

    res.status(200).json({ message: 'Tenants data uploaded successfully' });
  } catch (error) {
    console.error('Error uploading tenants excel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
