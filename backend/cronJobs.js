const cron = require('node-cron');
const { Contract, RentPayment, Room, Tenant, Notification, Sequelize } = require('./models');
const { Op } = Sequelize;
const notificationController = require('./controllers/notificationController');

const setupCronJobs = () => {
  // Schedule daily check for expiring contracts (e.g., 1 month before expiry)
  cron.schedule('0 0 * * * ', async () => { // Every day at midnight
    console.log('Running cron job for expiring contracts...');
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    try {
      const expiringContracts = await Contract.findAll({
        where: {
          contract_end_date: {
            [Op.lte]: oneMonthFromNow,
            [Op.gt]: new Date() // Only future expiring contracts
          },
          contract_status: '활성'
        },
        include: [{ model: Room, as: 'room' }, { model: Tenant, as: 'tenant' }]
      });

      for (const contract of expiringContracts) {
        const message = `계약 만료 알림: ${contract.tenant.name}님, ${contract.room.room_number}호실 계약이 한 달 이내에 만료됩니다. (${new Date(contract.contract_end_date).toLocaleDateString()})`;
        // Send SMS notification (or KakaoTalk)
        // For simplicity, directly calling controller function. In a real app, consider a dedicated service.
        await notificationController.sendSms({ body: { contract_id: contract.id, content: message } }, { status: () => ({ json: () => {} }) });
        console.log(`Sent expiring contract notification for ${contract.tenant.name}`);
      }
    } catch (error) {
      console.error('Error in expiring contracts cron job:', error);
    }
  });

  // Schedule daily check for overdue payments
  cron.schedule('0 1 * * * ', async () => { // Every day at 1 AM
    console.log('Running cron job for overdue payments...');
    try {
      const overduePayments = await RentPayment.findAll({
        where: {
          payment_status: '미납',
          due_date: {
            [Op.lt]: new Date()
          }
        },
        include: [{ model: Contract, include: [{ model: Room, as: 'room' }, { model: Tenant, as: 'tenant' }] }]
      });

      for (const payment of overduePayments) {
        const message = `월세 연체 알림: ${payment.contract.tenant.name}님, ${payment.contract.room.room_number}호실 월세 ${payment.amount}원이 연체되었습니다. 납부 기한: ${new Date(payment.due_date).toLocaleDateString()}`;
        // Send SMS notification (or KakaoTalk)
        await notificationController.sendSms({ body: { contract_id: payment.contract.id, content: message } }, { status: () => ({ json: () => {} }) });
        console.log(`Sent overdue payment notification for ${payment.contract.tenant.name}`);
      }
    } catch (error) {
      console.error('Error in overdue payments cron job:', error);
    }
  });

  // Schedule daily check for upcoming rent payments (e.g., 5 days and 1 day before due date)
  cron.schedule('0 2 * * * ', async () => { // Every day at 2 AM
    console.log('Running cron job for upcoming rent payments...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const fiveDaysFromNow = new Date(today);
      fiveDaysFromNow.setDate(today.getDate() + 5);
      fiveDaysFromNow.setHours(23, 59, 59, 999);

      const oneDayFromNow = new Date(today);
      oneDayFromNow.setDate(today.getDate() + 1);
      oneDayFromNow.setHours(23, 59, 59, 999);

      const upcomingPayments = await RentPayment.findAll({
        where: {
          payment_status: '미납',
          due_date: {
            [Op.gt]: today, // 오늘 이후
            [Op.or]: [
              { [Op.lte]: fiveDaysFromNow }, // 5일 이내
              { [Op.lte]: oneDayFromNow }  // 1일 이내
            ]
          }
        },
        include: [{ model: Contract, include: [{ model: Room, as: 'room' }, { model: Tenant, as: 'tenant' }] }]
      });

      for (const payment of upcomingPayments) {
        const dueDate = new Date(payment.due_date);
        const diffTime = Math.abs(dueDate.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let message = '';
        if (diffDays === 5) {
          message = `월세 납부 예정 알림: ${payment.contract.tenant.name}님, ${payment.contract.room.room_number}호실 월세 ${payment.amount}원이 5일 내에 납부 예정입니다. 납부 기한: ${dueDate.toLocaleDateString()}`;
        } else if (diffDays === 1) {
          message = `월세 납부 예정 알림: ${payment.contract.tenant.name}님, ${payment.contract.room.room_number}호실 월세 ${payment.amount}원이 내일(${dueDate.toLocaleDateString()}) 납부 예정입니다.`;
        }

        if (message) {
          await notificationController.sendSms({ body: { contract_id: payment.contract.id, content: message } }, { status: () => ({ json: () => {} }) });
          console.log(`Sent upcoming payment notification for ${payment.contract.tenant.name} - ${message}`);
        }
      }
    } catch (error) {
      console.error('Error in upcoming payments cron job:', error);
    }
  });
};

module.exports = setupCronJobs;
