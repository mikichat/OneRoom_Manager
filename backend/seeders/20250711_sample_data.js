'use strict';
const { encrypt } = require('../utils/encryption'); // 암호화 함수 import
const db = require('../models'); // db 객체 import

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Users
    await queryInterface.bulkInsert('users', [{
      username: 'admin',
      password: '$2b$10$YqEuNKnV.XhPVfQ3ckusLOGYrhvl3C4iIxY5xT3MD1zCdctCMSEWS', // bcrypt로 해싱된 비밀번호
      role: 'admin'
    }, {
      username: 'user1',
      password: '$2b$10$YqEuNKnV.XhPVfQ3ckusLOGYrhvl3C4iIxY5xT3MD1zCdctCMSEWS', // bcrypt로 해싱된 비밀번호
      role: 'user'
    }], {});

    // Buildings
    const buildings = await queryInterface.bulkInsert('buildings', [{
      name: '행복빌딩',
      address: '서울시 강남구 행복동 123-1',
      total_floors: 5,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: '미래빌딩',
      address: '서울시 서초구 미래동 456-2',
      total_floors: 7,
      created_at: new Date(),
      updated_at: new Date()
    }], {}, { returning: true });

    // Get the IDs of the created buildings
    const [building1Id, building2Id] = await queryInterface.sequelize.query(
      `SELECT id FROM buildings ORDER BY id ASC LIMIT 2`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Rooms (building_id는 위에서 생성된 building의 id를 참조해야 함)
    // 실제로는 building_id를 동적으로 가져와야 하지만, 여기서는 간단하게 1, 2로 가정
    await queryInterface.bulkInsert('rooms', [{
      building_id: building1Id.id,
      room_number: '101',
      floor: 1,
      room_type: '1룸',
      area: 25.5,
      monthly_rent: 500000,
      deposit: 5000000,
      status: '임대가능',
      description: '남향, 채광 좋음',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      building_id: building1Id.id,
      room_number: '201',
      floor: 2,
      room_type: '1룸',
      area: 28.0,
      monthly_rent: 550000,
      deposit: 5500000,
      status: '임대중',
      description: '넓은 방, 조용함',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      building_id: building2Id.id,
      room_number: '301',
      floor: 3,
      room_type: '2룸',
      area: 40.0,
      monthly_rent: 800000,
      deposit: 8000000,
      status: '수리중',
      description: '신축, 풀옵션',
      created_at: new Date(),
      updated_at: new Date()
    }], {});

    // Room Options (room_id는 위에서 생성된 room의 id를 참조해야 함)
    // 마찬가지로 room_id도 동적으로 가져와야 합니다.
    const [room1Id, room2Id] = await queryInterface.sequelize.query(
      `SELECT id FROM rooms ORDER BY id ASC LIMIT 2`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    await queryInterface.bulkInsert('room_options', [{
      room_id: room1Id.id,
      refrigerator: true,
      washing_machine: true,
      air_conditioner: true,
      induction: true,
      microwave: false,
      tv: false,
      wifi_router: true,
      created_at: new Date(), // 추가: created_at
      updated_at: new Date()
    }, {
      room_id: room2Id.id,
      refrigerator: true,
      washing_machine: true,
      air_conditioner: true,
      induction: true,
      microwave: true,
      tv: true,
      wifi_router: true,
      created_at: new Date(), // 추가: created_at
      updated_at: new Date()
    }], {});

    // Tenants
    // queryInterface.bulkInsert 대신 Tenant 모델을 사용하여 암호화된 데이터 삽입
    const { Tenant } = db; // db.Tenant를 통해 Tenant 모델 가져오기

    const tenantsData = [{
      name: '김철수',
      phone: '010-1234-5678',
      email: 'kim@example.com',
      birth_first_six: '950101',
      emergency_contact: '010-9876-5432',
      emergency_name: '김영희',
      is_student: true,
      school_name: '한국대학교',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: '박영희',
      phone: '010-2345-6789',
      email: 'park@example.com',
      birth_first_six: '960303',
      emergency_contact: '010-8765-4321',
      emergency_name: '박철수',
      is_student: false,
      school_name: null,
      created_at: new Date(),
      updated_at: new Date()
    }];

    const createdTenants = [];
    for (const data of tenantsData) {
      // Tenant.create를 사용하여 모델의 set 메서드를 통해 데이터 암호화
      const tenant = await Tenant.create(data);
      createdTenants.push(tenant);
    }

    const tenant1Id = createdTenants[0].id; // 생성된 첫 번째 테넌트의 ID 사용

    // Contracts (room_id, tenant_id는 위에서 생성된 room, tenant의 id를 참조해야 함)
    const [contractRoomId] = await queryInterface.sequelize.query(
      `SELECT id FROM rooms WHERE room_number = '201'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    await queryInterface.bulkInsert('contracts', [{
      room_id: contractRoomId.id, // 임대중인 방
      tenant_id: tenant1Id,
      contract_start_date: '2024-03-01',
      contract_end_date: '2025-02-28',
      monthly_rent: 550000,
      deposit: 5500000,
      contract_image_path: null,
      contract_status: '활성',
      special_terms: '애완동물 금지',
      created_at: new Date(),
      updated_at: new Date()
    }], {}, { returning: true });

    const [contract1Id] = await queryInterface.sequelize.query(
      `SELECT id FROM contracts ORDER BY id ASC LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Rent Payments (contract_id는 위에서 생성된 contract의 id를 참조해야 함)
    await queryInterface.bulkInsert('rent_payments', [{
      contract_id: contract1Id.id,
      payment_date: '2024-03-01',
      amount: 550000,
      payment_method: '계좌이체',
      payment_status: '완료',
      due_date: '2024-03-01',
      memo: '3월 월세',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      contract_id: contract1Id.id,
      payment_date: '2024-04-01',
      amount: 550000,
      payment_method: '계좌이체',
      payment_status: '완료',
      due_date: '2024-04-01',
      memo: '4월 월세',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      contract_id: contract1Id.id,
      payment_date: new Date(), // 아직 미납
      amount: 550000,
      payment_method: '계좌이체',
      payment_status: '미납',
      due_date: '2024-05-01',
      memo: '5월 월세',
      created_at: new Date(),
      updated_at: new Date()
    }], {});

    // Notifications (contract_id는 위에서 생성된 contract의 id를 참조해야 함)
    await queryInterface.bulkInsert('notifications', [{
      contract_id: contract1Id.id,
      type: 'payment_due',
      title: '월세 납부 기한 알림',
      content: '5월 월세 납부 기한이 다가오고 있습니다. 납부일: 2024-05-01',
      sent_at: new Date(),
      status: '대기',
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('notifications', null, {});
    await queryInterface.bulkDelete('rent_payments', null, {});
    await queryInterface.bulkDelete('contracts', null, {});
    await queryInterface.bulkDelete('tenants', null, {});
    await queryInterface.bulkDelete('room_options', null, {});
    await queryInterface.bulkDelete('rooms', null, {});
    await queryInterface.bulkDelete('buildings', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};