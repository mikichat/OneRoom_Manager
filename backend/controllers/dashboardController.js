const { Room, Contract, RentPayment, Sequelize } = require('../models');
const { Op } = Sequelize;

exports.getDashboardSummary = async (req, res) => {
  try {
    // 전체 방 현황 (임대중/공실)
    const totalRooms = await Room.count();
    const rentedRooms = await Room.count({ where: { status: '임대중' } });
    const availableRooms = totalRooms - rentedRooms;

    // 이번 달 수납 현황
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);

    const paidThisMonth = await RentPayment.sum('amount', {
      where: {
        payment_status: '완료',
        payment_date: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    });

    // 계약 만료 예정 리스트 (예: 다음 달 만료 예정)
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const startOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
    const endOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);

    const expiringContracts = await Contract.findAll({
      where: {
        contract_end_date: {
          [Op.between]: [startOfNextMonth, endOfNextMonth]
        },
        contract_status: '활성'
      },
      include: [Room, Tenant]
    });

    // 연체 현황
    const overduePayments = await RentPayment.findAll({
      where: {
        payment_status: '연체',
        due_date: {
          [Op.lt]: new Date()
        }
      },
      include: [{ model: Contract, include: [Room, Tenant] }]
    });

    res.status(200).json({
      totalRooms,
      rentedRooms,
      availableRooms,
      paidThisMonth: paidThisMonth || 0,
      expiringContracts,
      overduePayments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
