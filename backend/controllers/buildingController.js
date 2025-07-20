const { Building } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs'); // ExcelJS import
const path = require('path');

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

exports.downloadBuildingsExcel = async (req, res) => {
  try {
    const buildings = await Building.findAll({});

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('건물 목록');

    // Add headers
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: '건물명', key: 'name', width: 30 },
      { header: '주소', key: 'address', width: 50 },
      { header: '총 층수', key: 'total_floors', width: 15 },
      { header: '생성일', key: 'created_at', width: 20 },
      { header: '수정일', key: 'updated_at', width: 20 },
    ];

    // Add rows
    buildings.forEach(building => {
      worksheet.addRow({
        id: building.id,
        name: building.name,
        address: building.address,
        total_floors: building.total_floors,
        created_at: building.created_at,
        updated_at: building.updated_at,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'buildings.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error downloading buildings excel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.uploadBuildingsExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = path.join(__dirname, '..', req.file.path);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);

    const buildingsToCreate = [];
    const buildingsToUpdate = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const rowData = row.values;
      const buildingData = {
        id: rowData[1],
        name: rowData[2],
        address: rowData[3],
        total_floors: rowData[4],
      };

      if (buildingData.id) {
        buildingsToUpdate.push(buildingData);
      } else {
        buildingsToCreate.push(buildingData);
      }
    });

    for (const data of buildingsToCreate) {
      await Building.create(data);
    }

    for (const data of buildingsToUpdate) {
      await Building.update(data, { where: { id: data.id } });
    }

    res.status(200).json({ message: 'Buildings data uploaded successfully' });
  } catch (error) {
    console.error('Error uploading buildings excel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
