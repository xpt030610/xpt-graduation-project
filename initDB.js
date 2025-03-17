/**
 * 数据库表字段说明：
 *
 * 1. Building（宿舍楼）:
 *    - name: 楼名 (唯一)
 *    - floors: 楼层数
 *
 * 2. Room（宿舍房间）:
 *    - roomId: 房间号 (格式：楼名+楼层+房间号，如"西一533")
 *    - buildingId: 所属宿舍楼ID
 *    - floor: 所在楼层
 *    - bedCount: 床位数
 *    - temperature: 温度
 *    - humidity: 湿度
 *    - smoke: 烟雾浓度
 *    - updatedAt: 参数更新时间
 *
 * 3. Bed（床位）:
 *    - roomId: 所属房间ID
 *    - bedNum: 床号
 *    - isOccupied: 是否有人住
 *
 * 4. Device（设备）:
 *    - roomId: 所属房间ID
 *    - type: 设备类型 (light/aircondition/socket/door/window/pipe)
 *    - status: 是否正常工作
 *    - expiresDate: 过期日期
 *
 * 5. Users（用户/学生）:
 *    - roomId: 所属房间ID（可选）
 *    - bedId: 床位ID（可选）
 *    - userId: 学号 (唯一)
 *    - name: 姓名
 *    - password: 密码
 *    - role: 角色
 *
 * 6. Repair（维修工单）:
 *    - deviceId: 设备ID
 *    - reporterId: 报修人ID
 *    - description: 问题描述
 *    - status: 工单状态(pending,progress,completed,cancelled)
 *    - createdAt: 创建时间
 *
 * 7. Announcement（公告）:
 *    - buildingId: 所属宿舍楼ID（二选一）
 *    - roomId: 所属房间ID（二选一）
 *    - title: 公告标题
 *    - content: 公告内容
 *    - createdAt: 创建时间
 */

/**
 * TODO:
 * 不耦合子级关系，防止父级过于臃肿、不好查询且信息重复，例如不需要在Room中存Beds信息，而是单独存
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
        members: [], // 新增宿舍成员字段
        beds: [], // 新增床位信息字段
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
      isOccupied: false,
    });
  }
  db.Bed.insertMany(beds);

  const devices = deviceTypes.map((type) => ({
    roomId: room._id,
    type: type,
    status: {
      isWorking: true,
      expiresDate: new Date("2025-12-31"), // 将过期日期移到status字段
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
    field: { userId: 1 },
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
    userId: "3121005319",
    password: "1111111",
    bedId: sampleBed._id,
    role: "student",
    checkInDate: new Date("2023-09-01"),
  },
  {
    name: "肖鹏天",
    userId: "3121005314",
    password: "2222222",
    role: "student",
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
