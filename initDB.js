/**
 * TODO:
 * 每个宿舍的床号需要单独存，可能住了学生可能没住
 * 初始化学生，给每个学生一个学号，部分给床号，留一些给手动分配
 * 初始化设备，给每个设备一个启用年限
 * 初始化环境（湿度、温度、烟雾）
 */


// 1. 宿舍楼初始化
const buildings = [
  { name: "西一", floors: 6 },
  { name: "西二", floors: 5 },
];

const buildingIds = buildings.map((building) => {
  return db.Building.insertOne({
    ...building,
    createdTime: new Date(),
  }).insertedId;
});

// 2. 初始化宿舍房间
function initRooms(buildingName,buildingId, floors, roomsPerFloor) {
  const rooms = [];
  for (let floor = 1; floor <= floors; floor++) {
    for (let roomNum = 1; roomNum <= roomsPerFloor; roomNum++) {
      rooms.push({
        // 西一533
        roomId: `${buildingName}${floor}${roomNum.toString().padStart(2, "0")}`,
        buildingId: buildingId,
        floor: floor,
        bedCount: 5,
        status: {
          type: "available",
          updatedAt: new Date(),
          history: [
            { type: "available", updatedAt: new Date(), trigger: "initial" },
          ],
        },
      });
    }
  }
  db.Room.insertMany(rooms);
}

initRooms(buildings[0].name, buildingIds[0], 6, 40);
initRooms(buildings[1].name, buildingIds[1], 5, 35);

// 3. 初始化床位和设备
const deviceTypes = [
  "light",
  "aircondition",
  "socket",
  "door",
  "window",
  "pipe",
];

db.Room.find().forEach((room) => {
  const beds = [];
  for (let i = 1; i <= room.bedCount; i++) {
    beds.push({
      roomId: room._id,
      bedNum: i,
      status: {
        isOccupied: false,
        lastCheckDate: new Date(),
      },
    });
  }
  db.Bed.insertMany(beds);

  const devices = deviceTypes.map((type) => ({
    roomId: room._id,
    type: type,
    status: {
      isWorking: true,
      lastCheck: new Date(),
    },
    warranty: {
      expiresDate: new Date("2025-12-31"),
      provider: "设备公司A",
    },
  }));
  db.Device.insertMany(devices);
});

// 4. 创建索引
const indexes = [
  // 宿舍楼名称唯一索引
  { collection: db.Building, field: { name: 1 }, options: { unique: true } },
  // 学生学号唯一索引
  {
    collection: db.Student,
    field: { studentId: 1 },
    options: { unique: true },
  },
  // 设备工作状态索引（非唯一）
  { collection: db.Device, field: { "status.isWorking": 1 } },
  // 工单类型索引（非唯一）
  { collection: db.Repair, field: { "status.type": 1 } },
];

indexes.forEach((index) => {
  index.collection.createIndex(index.field, index.options);
});

// 5. 初始化测试学生
const sampleBed = db.Bed.findOne();
const students = [
  {
    name: "尹小龙",
    studentId: "3121005319",
    password: "1111111",
    bedId: sampleBed._id,
    checkInDate: new Date("2023-09-01"),
  },
  {
    name: "肖鹏天",
    studentId: "3121005314",
    password: "2222222",
    checkInDate: new Date(),
  },
];

db.Users.insertMany(students);

// 6. 初始化测试工单
const brokenDevice = db.Device.findOne();
db.Repair.insertOne({
  deviceId: brokenDevice._id,
  reporterId: db.Student.findOne()._id,
  description: "电灯闪烁不亮",
  status: {
    type: "pending",
    updatedAt: new Date(),
  },
  createdAt: new Date(),
});
