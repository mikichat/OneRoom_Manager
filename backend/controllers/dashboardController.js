const { Room, Contract, RentPayment, Sequelize, Tenant } = require('../models');
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

    // 예정된 납부 내역 (미납이면서 due_date가 오늘 이후인 경우)
    const upcomingPayments = await RentPayment.findAll({
      where: {
        payment_status: '미납',
        due_date: {
          [Op.gte]: new Date()
        }
      },
      include: [{ model: Contract, include: [Room, Tenant] }],
      order: [['due_date', 'ASC']]
    });

    // 월별 수입 통계 (지난 12개월)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyIncome = await RentPayment.findAll({
      attributes: [
        [Sequelize.fn('strftime', '%Y-%m', Sequelize.col('payment_date')), 'month'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'total_amount']
      ],
      where: {
        payment_status: '완료',
        payment_date: {
          [Op.gte]: twelveMonthsAgo
        }
      },
      group: [Sequelize.fn('strftime', '%Y-%m', Sequelize.col('payment_date'))],
      order: [[Sequelize.fn('strftime', '%Y-%m', Sequelize.col('payment_date')), 'ASC']]
    });

    res.status(200).json({
      totalRooms,
      rentedRooms,
      availableRooms,
      paidThisMonth: paidThisMonth || 0,
      expiringContracts,
      overduePayments,
      upcomingPayments, // 추가된 부분
      monthlyIncome     // 추가된 부분
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
