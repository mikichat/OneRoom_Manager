const { RentPayment, Contract, Room, Tenant, Sequelize } = require('../models');
const { Op } = Sequelize;

exports.getMonthlyIncomeReport = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // 12개월 데이터를 위한 빈 배열 초기화
    const monthlyIncomeData = Array.from({ length: 12 }, (_, i) => ({
      month: `${currentYear}-${String(i + 1).padStart(2, '0')}`,
      total_amount: 0,
      payments: []
    }));

    const payments = await RentPayment.findAll({
      where: {
        payment_status: '완료',
        payment_date: {
          [Op.between]: [
            new Date(currentYear, 0, 1),
            new Date(currentYear, 11, 31, 23, 59, 59)
          ]
        }
      },
      include: [{
        model: Contract,
        attributes: ['id', 'contract_start_date', 'contract_end_date', 'monthly_rent'],
        include: [
          { model: Room, attributes: ['id', 'room_number'] },
          { model: Tenant, attributes: ['id', 'name'] }
        ]
      }],
      order: [['payment_date', 'ASC']]
    });

    payments.forEach(payment => {
      const paymentMonth = new Date(payment.payment_date).getMonth(); // 0-indexed month
      if (monthlyIncomeData[paymentMonth]) {
        monthlyIncomeData[paymentMonth].total_amount += payment.amount;
        monthlyIncomeData[paymentMonth].payments.push({
          id: payment.id,
          amount: payment.amount,
          payment_date: payment.payment_date,
          contract_id: payment.contract_id,
          room_number: payment.contract ? payment.contract.room.room_number : 'N/A',
          tenant_name: payment.contract ? payment.contract.tenant.name : 'N/A',
          payment_method: payment.payment_method,
          memo: payment.memo
        });
      }
    });

    res.status(200).json(monthlyIncomeData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 