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
      isOccupied: false,
    });
  }
  db.Bed.insertMany(beds);

  const devices = deviceTypes.map((type) => ({
    roomId: room.roomId,
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
  { collection: db.Users, field: { userId: 1 }, options: { unique: true }},
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

// 5. 初始化随机用户并分配床位
function generateRandomName() {
  const surnames = ["张", "王", "李", "赵", "刘", "陈", "杨", "黄", "吴", "周","肖","尹","潘","曾"];
  const givenNames = ["伟", "芳", "娜", "敏", "静", "秀", "丽", "强", "磊", "军","小龙"];
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const givenName = givenNames[Math.floor(Math.random() * givenNames.length)];
  return surname + givenName;
}

function generateRandomPassword(length = 6) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

// 生成 50 个随机用户
const users = [];
for (let i = 0; i < 50; i++) {
  users.push({
    userName: generateRandomName(),
    userId: `312100${String(i).padStart(4, "0")}`, // 学号以 312100 开头，后接 4 位数字
    password: generateRandomPassword(),
    role: "student",
  });
}

db.Users.insertMany(users);

// 随机分配床位
const beds = db.Bed.find({ isOccupied: false }).toArray(); // 获取所有未入住的床位
users.forEach((user) => {
  if (beds.length > 0) {
    const randomBed = beds.splice(Math.floor(Math.random() * beds.length), 1)[0]; // 随机选择一个床位
    db.Bed.updateOne({ _id: randomBed._id }, { $set: { isOccupied: true } }); // 标记床位为已入住
    db.Users.updateOne(
      { _id: user._id },
      { $set: { bedId: randomBed._id, roomId: randomBed.roomId } } // 为用户分配床位和房间
    );
  }
});

// 6. 初始化测试工单
const brokenDevice = db.Device.findOne();
db.Repair.insertOne({
  deviceId: brokenDevice._id,
  reporterId: db.Users.findOne()._id,
  description: "电灯闪烁不亮",
  status:  "pending",
  createdAt: new Date(),
});
