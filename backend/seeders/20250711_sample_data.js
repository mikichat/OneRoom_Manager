'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Users
    await queryInterface.bulkInsert('users', [{
      username: 'admin',
      password: 'hashed_password_for_admin', // 실제 환경에서는 bcrypt 등으로 해싱된 비밀번호 사용
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      username: 'user1',
      password: 'hashed_password_for_user1', // 실제 환경에서는 bcrypt 등으로 해싱된 비밀번호 사용
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // Buildings
    await queryInterface.bulkInsert('buildings', [{
      name: '행복빌딩',
      address: '서울시 강남구 행복동 123-1',
      total_floors: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      name: '미래빌딩',
      address: '서울시 서초구 미래동 456-2',
      total_floors: 7,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // Rooms (building_id는 위에서 생성된 building의 id를 참조해야 함)
    // 실제로는 building_id를 동적으로 가져와야 하지만, 여기서는 간단하게 1, 2로 가정
    await queryInterface.bulkInsert('rooms', [{
      building_id: 1,
      room_number: '101',
      floor: 1,
      room_type: '1룸',
      area: 25.5,
      monthly_rent: 500000,
      deposit: 5000000,
      status: '임대가능',
      description: '남향, 채광 좋음',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      building_id: 1,
      room_number: '201',
      floor: 2,
      room_type: '1룸',
      area: 28.0,
      monthly_rent: 550000,
      deposit: 5500000,
      status: '임대중',
      description: '넓은 방, 조용함',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      building_id: 2,
      room_number: '301',
      floor: 3,
      room_type: '2룸',
      area: 40.0,
      monthly_rent: 800000,
      deposit: 8000000,
      status: '수리중',
      description: '신축, 풀옵션',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // Room Options (room_id는 위에서 생성된 room의 id를 참조해야 함)
    await queryInterface.bulkInsert('room_options', [{
      room_id: 1,
      refrigerator: true,
      washing_machine: true,
      air_conditioner: true,
      induction: true,
      microwave: false,
      tv: false,
      wifi_router: true,
      updatedAt: new Date()
    }, {
      room_id: 2,
      refrigerator: true,
      washing_machine: true,
      air_conditioner: true,
      induction: true,
      microwave: true,
      tv: true,
      wifi_router: true,
      updatedAt: new Date()
    }], {});

    // Tenants
    await queryInterface.bulkInsert('tenants', [{
      name: '김철수',
      phone: '010-1234-5678',
      email: 'kim@example.com',
      birth_first_six: '950101',
      emergency_contact: '010-9876-5432',
      emergency_name: '김영희',
      is_student: true,
      school_name: '한국대학교',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      name: '박영희',
      phone: '010-2345-6789',
      email: 'park@example.com',
      birth_first_six: '960303',
      emergency_contact: '010-8765-4321',
      emergency_name: '박철수',
      is_student: false,
      school_name: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // Contracts (room_id, tenant_id는 위에서 생성된 room, tenant의 id를 참조해야 함)
    await queryInterface.bulkInsert('contracts', [{
      room_id: 2, // 임대중인 방
      tenant_id: 1,
      contract_start_date: '2024-03-01',
      contract_end_date: '2025-02-28',
      monthly_rent: 550000,
      deposit: 5500000,
      contract_image_path: null,
      contract_status: '활성',
      special_terms: '애완동물 금지',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // Rent Payments (contract_id는 위에서 생성된 contract의 id를 참조해야 함)
    await queryInterface.bulkInsert('rent_payments', [{
      contract_id: 1,
      payment_date: '2024-03-01',
      amount: 550000,
      payment_method: '계좌이체',
      payment_status: '완료',
      due_date: '2024-03-01',
      memo: '3월 월세',
      createdAt: new Date()
    }, {
      contract_id: 1,
      payment_date: '2024-04-01',
      amount: 550000,
      payment_method: '계좌이체',
      payment_status: '완료',
      due_date: '2024-04-01',
      memo: '4월 월세',
      createdAt: new Date()
    }, {
      contract_id: 1,
      payment_date: null, // 아직 미납
      amount: 550000,
      payment_method: '계좌이체',
      payment_status: '미납',
      due_date: '2024-05-01',
      memo: '5월 월세',
      createdAt: new Date()
    }], {});

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('rent_payments', null, {});
    await queryInterface.bulkDelete('contracts', null, {});
    await queryInterface.bulkDelete('tenants', null, {});
    await queryInterface.bulkDelete('room_options', null, {});
    await queryInterface.bulkDelete('rooms', null, {});
    await queryInterface.bulkDelete('buildings', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};