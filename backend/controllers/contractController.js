const { Contract, Room, Tenant, Sequelize } = require('../models');
const { Op } = Sequelize;
const ExcelJS = require('exceljs'); // ExcelJS import
const path = require('path');

exports.createContract = async (req, res) => {
  try {
    const contractData = req.body;
    if (req.file) {
      contractData.contract_image_path = req.file.path;
    }
    const contract = await Contract.create(contractData);
    res.status(201).json(contract);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.downloadContractsExcel = async (req, res) => {
  try {
    const contracts = await Contract.findAll({
      include: [{ model: Room, as: 'room' }, { model: Tenant, as: 'tenant' }]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('계약 목록');

    // Add headers
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: '호실 ID', key: 'room_id', width: 15 },
      { header: '임차인 ID', key: 'tenant_id', width: 15 },
      { header: '계약 시작일', key: 'contract_start_date', width: 20 },
      { header: '계약 종료일', key: 'contract_end_date', width: 20 },
      { header: '월세', key: 'monthly_rent', width: 15 },
      { header: '보증금', key: 'deposit', width: 15 },
      { header: '계약 이미지 경로', key: 'contract_image_path', width: 40 },
      { header: '계약 상태', key: 'contract_status', width: 15 },
      { header: '특약 사항', key: 'special_terms', width: 30 },
      { header: '호실 번호', key: 'room_number', width: 15 },
      { header: '임차인 이름', key: 'tenant_name', width: 20 },
      { header: '생성일', key: 'created_at', width: 20 },
      { header: '수정일', key: 'updated_at', width: 20 },
    ];

    // Add rows
    contracts.forEach(contract => {
      worksheet.addRow({
        id: contract.id,
        room_id: contract.room_id,
        tenant_id: contract.tenant_id,
        contract_start_date: contract.contract_start_date,
        contract_end_date: contract.contract_end_date,
        monthly_rent: contract.monthly_rent,
        deposit: contract.deposit,
        contract_image_path: contract.contract_image_path,
        contract_status: contract.contract_status,
        special_terms: contract.special_terms,
        room_number: contract.room ? contract.room.room_number : 'N/A',
        tenant_name: contract.tenant ? contract.tenant.name : 'N/A',
        created_at: contract.created_at,
        updated_at: contract.updated_at,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'contracts.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error downloading contracts excel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.uploadContractsExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = path.join(__dirname, '..', req.file.path);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);

    const contractsToProcess = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const rowData = row.values;
      const contractData = {
        id: rowData[1],
        room_id: rowData[2],
        tenant_id: rowData[3],
        contract_start_date: rowData[4],
        contract_end_date: rowData[5],
        monthly_rent: rowData[6],
        deposit: rowData[7],
        contract_image_path: rowData[8],
        contract_status: rowData[9],
        special_terms: rowData[10],
      };
      
      contractsToProcess.push(contractData);
    });

    for (const data of contractsToProcess) {
      if (data.id) {
        // Update existing contract
        await Contract.update(data, { where: { id: data.id } });
      } else {
        // Create new contract
        await Contract.create(data);
      }
    }

    res.status(200).json({ message: 'Contracts data uploaded successfully' });
  } catch (error) {
    console.error('Error uploading contracts excel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
