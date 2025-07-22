const { Room, RoomOption } = require('../models');
const ExcelJS = require('exceljs'); // ExcelJS import
const path = require('path');

exports.createRoom = async (req, res) => {
  try {
    const { room_options, ...roomData } = req.body;
    const room = await Room.create(roomData);

    if (room_options) {
      await RoomOption.create({ ...room_options, room_id: room.id });
    }

    res.status(201).json(room);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const { status } = req.query;
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    const rooms = await Room.findAll({
      where: whereClause,
      include: [{ model: RoomOption, as: 'room_option' }]
    });
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findByPk(id, {
      include: [{ model: RoomOption, as: 'room_option' }]
    });
    if (room) {
      res.status(200).json(room);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_options, ...roomData } = req.body;

    const [updated] = await Room.update(roomData, {
      where: { id: id }
    });

    if (updated) {
      if (room_options) {
        await RoomOption.update(room_options, {
          where: { room_id: id }
        });
      }
      const updatedRoom = await Room.findByPk(id, {
        include: [{ model: RoomOption, as: 'room_option' }]
      });
      res.status(200).json(updatedRoom);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    // Delete associated room options first
    await RoomOption.destroy({ where: { room_id: id } });
    const deleted = await Room.destroy({
      where: { id: id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.downloadRoomsExcel = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      include: [{ model: RoomOption, as: 'room_option' }]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('호실 목록');

    // Add headers
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: '건물 ID', key: 'building_id', width: 15 },
      { header: '호실 번호', key: 'room_number', width: 15 },
      { header: '층수', key: 'floor', width: 10 },
      { header: '방 타입', key: 'room_type', width: 15 },
      { header: '면적', key: 'area', width: 10 },
      { header: '월세', key: 'monthly_rent', width: 15 },
      { header: '보증금', key: 'deposit', width: 15 },
      { header: '상태', key: 'status', width: 15 },
      { header: '설명', key: 'description', width: 30 },
      { header: '냉장고', key: 'refrigerator', width: 10 },
      { header: '세탁기', key: 'washing_machine', width: 10 },
      { header: '에어컨', key: 'air_conditioner', width: 10 },
      { header: '인덕션', key: 'induction', width: 10 },
      { header: '전자레인지', key: 'microwave', width: 10 },
      { header: 'TV', key: 'tv', width: 10 },
      { header: '와이파이 공유기', key: 'wifi_router', width: 15 },
      { header: '생성일', key: 'created_at', width: 20 },
      { header: '수정일', key: 'updated_at', width: 20 },
    ];

    // Add rows
    rooms.forEach(room => {
      worksheet.addRow({
        id: room.id,
        building_id: room.building_id,
        room_number: room.room_number,
        floor: room.floor,
        room_type: room.room_type,
        area: room.area,
        monthly_rent: room.monthly_rent,
        deposit: room.deposit,
        status: room.status,
        description: room.description,
        refrigerator: room.room_option ? (room.room_option.refrigerator ? 'TRUE' : 'FALSE') : 'FALSE',
        washing_machine: room.room_option ? (room.room_option.washing_machine ? 'TRUE' : 'FALSE') : 'FALSE',
        air_conditioner: room.room_option ? (room.room_option.air_conditioner ? 'TRUE' : 'FALSE') : 'FALSE',
        induction: room.room_option ? (room.room_option.induction ? 'TRUE' : 'FALSE') : 'FALSE',
        microwave: room.room_option ? (room.room_option.microwave ? 'TRUE' : 'FALSE') : 'FALSE',
        tv: room.room_option ? (room.room_option.tv ? 'TRUE' : 'FALSE') : 'FALSE',
        wifi_router: room.room_option ? (room.room_option.wifi_router ? 'TRUE' : 'FALSE') : 'FALSE',
        created_at: room.created_at,
        updated_at: room.updated_at,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'rooms.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error downloading rooms excel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.uploadRoomsExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = path.join(__dirname, '..', req.file.path);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);

    const roomsToProcess = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const rowData = row.values;
      const roomData = {
        id: rowData[1],
        building_id: rowData[2],
        room_number: rowData[3],
        floor: rowData[4],
        room_type: rowData[5],
        area: rowData[6],
        monthly_rent: rowData[7],
        deposit: rowData[8],
        status: rowData[9],
        description: rowData[10],
      };

      const roomOptionData = {
        refrigerator: rowData[11] === 'TRUE',
        washing_machine: rowData[12] === 'TRUE',
        air_conditioner: rowData[13] === 'TRUE',
        induction: rowData[14] === 'TRUE',
        microwave: rowData[15] === 'TRUE',
        tv: rowData[16] === 'TRUE',
        wifi_router: rowData[17] === 'TRUE',
      };
      
      roomsToProcess.push({ roomData, roomOptionData });
    });

    for (const { roomData, roomOptionData } of roomsToProcess) {
      if (roomData.id) {
        // 기존 방이 실제로 존재하는지 확인
        const existingRoom = await Room.findByPk(roomData.id);
        if (existingRoom) {
          // 기존 방 업데이트
          await Room.update(roomData, { where: { id: roomData.id } });
          await RoomOption.update(roomOptionData, { where: { room_id: roomData.id } });
        } else {
          // ID가 있지만 존재하지 않는 방 -> 새로 생성 (ID 제외)
          const { id, ...newRoomData } = roomData;
          const newRoom = await Room.create(newRoomData);
          await RoomOption.create({ ...roomOptionData, room_id: newRoom.id });
        }
      } else {
        // ID가 없는 새 방 생성
        const newRoom = await Room.create(roomData);
        await RoomOption.create({ ...roomOptionData, room_id: newRoom.id });
      }
    }

    res.status(200).json({ message: 'Rooms data uploaded successfully' });
  } catch (error) {
    console.error('Error uploading rooms excel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
