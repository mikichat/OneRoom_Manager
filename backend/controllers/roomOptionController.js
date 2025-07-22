const { RoomOption, Room, Sequelize } = require('../models');
const { Op } = Sequelize;
const ExcelJS = require('exceljs'); // ExcelJS import
const path = require('path');

// 디버그 로그 함수 (index.js에서 가져오거나 여기서 간단히 정의)
// const debugLog = (...args) => {
//   // 실제 프로덕션에서는 index.js의 로거를 공유하는 것이 좋습니다.
//   if (process.env.NODE_ENV === 'development') {
//     console.log('[DEBUG]', ...args);
//   }
// };

// Create a new RoomOption
exports.createRoomOption = async (req, res) => {
  global.debugLog(`Creating new room option with body: ${JSON.stringify(req.body)}`);
  try {
    const roomOption = await RoomOption.create(req.body);
    global.debugLog(`Successfully created room option: ${JSON.stringify(roomOption.toJSON())}`);
    res.status(201).json(roomOption);
  } catch (error) {
    global.debugLog(`Error creating room option: ${error.message}`);
    // Sequelize ValidationError의 경우 더 상세한 정보 제공
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: '유효성 검사 오류',
        errors: error.errors ? error.errors.map(err => err.message) : error.message
      });
    } else if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        message: '존재하지 않는 호실 ID입니다.',
        errors: error.message // 외래 키 제약 조건 위반 메시지 포함
      });
    }
    res.status(500).json({ error: error.message });
  }
};

// Get all RoomOptions (with optional filtering by room_id)
exports.getAllRoomOptions = async (req, res) => {
  try {
    const { room_id } = req.query;
    const where = {};
    if (room_id) {
      where.id = room_id; // Room 모델의 id를 기준으로 필터링
    }

    const roomsWithRoomOptions = await Room.findAll({
      where,
      include: [{
        model: RoomOption,
        as: 'room_option', // Room 모델에 RoomOption이 포함될 때 사용되는 별칭
        required: false // LEFT JOIN을 위해 false로 설정
      }]
    });

    // RoomOption이 없는 경우 기본값 설정
    const formattedRoomOptions = roomsWithRoomOptions.map(room => {
      const roomOptionData = room.room_option ? room.room_option.toJSON() : {};
      return {
        id: roomOptionData.id || null, // RoomOption의 ID, 없으면 null
        room_id: room.id, // Room의 ID
        room: {
          id: room.id,
          room_number: room.room_number,
          building_id: room.building_id
        },
        refrigerator: roomOptionData.refrigerator || false,
        washing_machine: roomOptionData.washing_machine || false,
        air_conditioner: roomOptionData.air_conditioner || false,
        induction: roomOptionData.induction || false,
        microwave: roomOptionData.microwave || false,
        tv: roomOptionData.tv || false,
        wifi_router: roomOptionData.wifi_router || false,
        createdAt: roomOptionData.createdAt || room.createdAt,
        updatedAt: roomOptionData.updatedAt || room.updatedAt,
      };
    });

    res.status(200).json(formattedRoomOptions);
  } catch (error) {
    global.debugLog(`Error in getAllRoomOptions: ${error.message}`); // 로그 추가
    res.status(500).json({ error: error.message });
  }
};

// Get a RoomOption by ID
exports.getRoomOptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const roomOption = await RoomOption.findByPk(id, {
      include: [{
        model: Room,
        as: 'room',
        attributes: ['id', 'room_number', 'building_id']
      }]
    });
    if (roomOption) {
      res.status(200).json(roomOption);
    } else {
      res.status(404).json({ message: 'Room option not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a RoomOption
exports.updateRoomOption = async (req, res) => {
  global.debugLog(`Updating room option with room_id: ${req.params.id}`); // req.params.id를 room_id로 간주
  global.debugLog(`Request body: ${JSON.stringify(req.body)}`);
  try {
    const roomId = req.params.id; // URL 파라미터를 room_id로 사용
    const { id, ...updateData } = req.body; // body에서 id는 제거 (RoomOption의 id)

    // 해당 room_id를 가진 RoomOption이 있는지 확인
    let existingRoomOption = await RoomOption.findOne({ where: { room_id: roomId } });

    if (existingRoomOption) {
      // RoomOption이 존재하면 업데이트
      const [updated] = await RoomOption.update(updateData, {
        where: { room_id: roomId }
      });

      if (updated) {
        const updatedRoomOption = await RoomOption.findOne({
          where: { room_id: roomId },
          include: [{
            model: Room,
            as: 'room',
            attributes: ['id', 'room_number', 'building_id']
          }]
        });
        global.debugLog(`Successfully updated room option: ${JSON.stringify(updatedRoomOption.toJSON())}`);
        res.status(200).json(updatedRoomOption);
      } else {
        // 업데이트할 데이터가 기존과 동일하여 updated가 0일 수 있습니다.
        global.debugLog(`Room option with room_id ${roomId} not updated (no changes).`);
        res.status(200).json(existingRoomOption); // 변경사항이 없어도 200 OK 반환
      }
    } else {
      // RoomOption이 없으면 새로 생성
      const newRoomOption = await RoomOption.create({ ...updateData, room_id: roomId });
      global.debugLog(`Successfully created new room option for room_id ${roomId}: ${JSON.stringify(newRoomOption.toJSON())}`);
      const createdRoomOptionWithRoom = await RoomOption.findByPk(newRoomOption.id, {
        include: [{
          model: Room,
          as: 'room',
          attributes: ['id', 'room_number', 'building_id']
        }]
      });
      res.status(201).json(createdRoomOptionWithRoom);
    }
  } catch (error) {
    global.debugLog(`Error updating/creating room option: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Delete a RoomOption
exports.deleteRoomOption = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await RoomOption.destroy({
      where: { id: id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Room option not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadRoomOptionsExcel = async (req, res) => {
  try {
    const roomOptions = await RoomOption.findAll({
      include: [{
        model: Room,
        as: 'room',
        attributes: ['id', 'room_number', 'building_id']
      }]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('호실 옵션 목록');

    // Add headers
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: '호실 ID', key: 'room_id', width: 15 },
      { header: '호실 번호', key: 'room_number', width: 15 },
      { header: '건물 ID', key: 'building_id', width: 15 },
      { header: '냉장고', key: 'refrigerator', width: 10 },
      { header: '세탁기', key: 'washing_machine', width: 10 },
      { header: '에어컨', key: 'air_conditioner', width: 10 },
      { header: '인덕션', key: 'induction', width: 10 },
      { header: '전자레인지', key: 'microwave', width: 10 },
      { header: 'TV', key: 'tv', width: 10 },
      { header: '와이파이 공유기', key: 'wifi_router', width: 15 },
      { header: '수정일', key: 'updated_at', width: 20 },
    ];

    // Add rows
    roomOptions.forEach(option => {
      worksheet.addRow({
        id: option.id,
        room_id: option.room_id,
        room_number: option.room ? option.room.room_number : 'N/A',
        building_id: option.room ? option.room.building_id : 'N/A',
        refrigerator: option.refrigerator ? 'TRUE' : 'FALSE',
        washing_machine: option.washing_machine ? 'TRUE' : 'FALSE',
        air_conditioner: option.air_conditioner ? 'TRUE' : 'FALSE',
        induction: option.induction ? 'TRUE' : 'FALSE',
        microwave: option.microwave ? 'TRUE' : 'FALSE',
        tv: option.tv ? 'TRUE' : 'FALSE',
        wifi_router: option.wifi_router ? 'TRUE' : 'FALSE',
        updated_at: option.updated_at,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'room_options.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error downloading room options excel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.uploadRoomOptionsExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = path.join(__dirname, '..', req.file.path);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);

    const roomOptionsToProcess = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const rowData = row.values;
      const roomOptionData = {
        id: rowData[1],
        room_id: rowData[2],
        refrigerator: rowData[5] === 'TRUE',
        washing_machine: rowData[6] === 'TRUE',
        air_conditioner: rowData[7] === 'TRUE',
        induction: rowData[8] === 'TRUE',
        microwave: rowData[9] === 'TRUE',
        tv: rowData[10] === 'TRUE',
        wifi_router: rowData[11] === 'TRUE',
      };
      
      roomOptionsToProcess.push(roomOptionData);
    });

    for (const data of roomOptionsToProcess) {
      if (data.id) {
        // Update existing room option
        await RoomOption.update(data, { where: { id: data.id } });
      } else {
        // Create new room option
        await RoomOption.create(data);
      }
    }

    res.status(200).json({ message: 'Room options data uploaded successfully' });
  } catch (error) {
    console.error('Error uploading room options excel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}; 