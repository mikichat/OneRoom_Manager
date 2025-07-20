const { RentPayment, Contract } = require('../models');
const { Sequelize } = require('../models'); // Sequelize 객체를 가져옴
const ExcelJS = require('exceljs'); // ExcelJS import
const path = require('path');

exports.createRentPayment = async (req, res) => {
  try {
    const rentPayment = await RentPayment.create(req.body);
    res.status(201).json(rentPayment);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllRentPayments = async (req, res) => {
  try {
    const rentPayments = await RentPayment.findAll({
      include: [{ model: Contract, as: 'contract' }]
    });
    res.status(200).json(rentPayments);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getOverdueRentPayments = async (req, res) => {
  try {
    const overduePayments = await RentPayment.findAll({
      where: {
        payment_status: '미납',
        due_date: {
          [Sequelize.Op.lt]: new Date()
        }
      },
      include: [{ model: Contract, as: 'contract' }]
    });
    res.status(200).json(overduePayments);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.downloadRentPaymentsExcel = async (req, res) => {
  try {
    const rentPayments = await RentPayment.findAll({
      include: [{ model: Contract, as: 'contract' }]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('월세 납부 내역');

    // Add headers
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: '계약 ID', key: 'contract_id', width: 15 },
      { header: '납부일', key: 'payment_date', width: 20 },
      { header: '금액', key: 'amount', width: 15 },
      { header: '납부 방법', key: 'payment_method', width: 15 },
      { header: '납부 상태', key: 'payment_status', width: 15 },
      { header: '예정일', key: 'due_date', width: 20 },
      { header: '메모', key: 'memo', width: 30 },
      { header: '생성일', key: 'created_at', width: 20 },
    ];

    // Add rows
    rentPayments.forEach(payment => {
      worksheet.addRow({
        id: payment.id,
        contract_id: payment.contract_id,
        payment_date: payment.payment_date,
        amount: payment.amount,
        payment_method: payment.payment_method,
        payment_status: payment.payment_status,
        due_date: payment.due_date,
        memo: payment.memo,
        created_at: payment.created_at,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'rent_payments.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error downloading rent payments excel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.uploadRentPaymentsExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = path.join(__dirname, '..', req.file.path);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);

    const paymentsToProcess = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const rowData = row.values;
      const paymentData = {
        id: rowData[1],
        contract_id: rowData[2],
        payment_date: rowData[3],
        amount: rowData[4],
        payment_method: rowData[5],
        payment_status: rowData[6],
        due_date: rowData[7],
        memo: rowData[8],
      };
      
      paymentsToProcess.push(paymentData);
    });

    for (const data of paymentsToProcess) {
      if (data.id) {
        // Update existing payment
        await RentPayment.update(data, { where: { id: data.id } });
      } else {
        // Create new payment
        await RentPayment.create(data);
      }
    }

    res.status(200).json({ message: 'Rent payments data uploaded successfully' });
  } catch (error) {
    console.error('Error uploading rent payments excel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
