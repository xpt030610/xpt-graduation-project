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
 *    - userName: 姓名
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
function initRooms(buildingName, floors, roomsPerFloor) {
  const rooms = [];
  for (let floor = 1; floor <= floors; floor++) {
    for (let roomNum = 1; roomNum <= roomsPerFloor; roomNum++) {
      let temperature = Math.floor(Math.random() * 15) + 15; // 15-30°C之间的随机值
      let humidity = Math.floor(Math.random() * 70); // 0-70%之间的随机值
      let smoke = Math.floor(Math.random() * 50); // 0-50之间的随机值
      // 如果是异常房间，生成异常数据
      if (Math.random() < 0.05) {
        temperature = Math.floor(Math.random() * 10) + 31; // 温度在31-40°C之间
      }
      if (Math.random() < 0.05) {
        humidity = Math.floor(Math.random() * 28) + 71;   // 湿度在71-99%之间
      }
      if (Math.random() < 0.05) {
        smoke = Math.floor(Math.random() * 49) + 51;      // 烟雾浓度在51-100之间
      }
      rooms.push({
        roomId: `${buildingName}${floor}${roomNum.toString().padStart(2, "0")}`, // 西一533
        buildingId: buildingName,
        floor: floor,
        bedCount: 5,
        temperature,
        humidity,
        smoke,
        updatedAt: new Date(),
      });
    }
  }
  db.Room.insertMany(rooms);
}

initRooms(buildings[0].name, 6, 40);
initRooms(buildings[1].name, 5, 35);

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
      roomId: room.roomId,
      bedNum: i,
      isOccupied: Math.random() > 0.3, // 70%的概率有床位
    });
  }
  db.Bed.insertMany(beds);

  const devices = deviceTypes.map((type) => ({
    roomId: room._id,
    type: type,
    status: true,
    expiresDate: new Date("2025-12-31"),
  }));
  db.Device.insertMany(devices);
});

// 4. 创建索引
const indexes = [
  // 宿舍楼名称唯一索引
  { collection: db.Building, field: { name: 1 }, options: { unique: true }},
  // 学生学号唯一索引
  { collection: db.Student, field: { userId: 1 }, options: { unique: true }},
  // 房间号唯一索引
  { collection: db.Room, field: { roomId: 1 }, options: { unique: true }},
  // 床位复合唯一索引（同一房间内床号唯一）
  { collection: db.Bed, field: { roomId: 1, bedNum: 1 }, options: { unique: true }},
  // 设备复合索引（按房间和设备类型查询）
  { collection: db.Device, field: { roomId: 1, type: 1 } },
  // 设备工作状态索引（非唯一）
  { collection: db.Device, field: { status: 1 } },
  // 工单类型索引（非唯一）
  { collection: db.Repair, field: { status: 1 } },
  // 公告复合索引（按楼栋和时间查询）
  { collection: db.Announcement, field: { buildingId: 1, createdAt: 1 } },
];

indexes.forEach((index) => {
  index.collection.createIndex(index.field, index.options);
});

// 5. 初始化测试学生
const sampleBed = db.Bed.findOne();
const students = [
  {
    userName: "尹小龙",
    userId: "3121005319",
    password: "1111111",
    bedId: sampleBed._id,
    role: "student",
  },
  {
    userName: "肖鹏天",
    userId: "3121005314",
    password: "2222222",
    role: "student",
  },
];

db.Users.insertMany(students);

// 6. 初始化测试工单
const brokenDevice = db.Device.findOne();
db.Repair.insertOne({
  deviceId: brokenDevice._id,
  reporterId: db.Users.findOne()._id,
  description: "电灯闪烁不亮",
  status:  "pending",
  createdAt: new Date(),
});
