import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, Bed } from './dorm.schema';
import { User } from '@users/users.schema';

@Injectable()
export class DormService {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<Room>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Bed.name) private readonly bedModel: Model<Bed>,
  ) {}

  // 查询某宿舍楼的空余宿舍
  async findAvailableRooms(buildingId: string): Promise<any[]> {
    try {
      // 查询该宿舍楼的所有房间
      const rooms = await this.roomModel
        .find({ buildingId })
        .select('roomId bedCount')
        .lean()
        .exec();

      // 2. 查询每个房间的已入住床位数
      const roomAvailability = await Promise.all(
        rooms.map(async (room) => {
          // 查询计算空余床位数
          const availableBeds = await this.bedModel
            .countDocuments({ roomId: room.roomId, isOccupied: false })
            .exec();
          return {
            roomId: room.roomId,
            availableBeds: availableBeds > 0 ? availableBeds : 0, // 确保空余床位数不为负数
          };
        }),
      );

      // 3. 过滤出有空余床位的房间
      return roomAvailability.filter((room) => room.availableBeds > 0);
    } catch (error) {
      throw new Error(`查询空余宿舍失败: ${error.message}`);
    }
  }

  // 添加宿舍成员
  async addMember(roomId: string, userId: string): Promise<any> {
    // 获取完整用户信息
    const user = await this.userModel.findOne({ userId }).exec();
    if (!user) {
      throw new Error('用户不存在');
    }
    // 检查宿舍是否存在
    const room = await this.roomModel.findOne({ roomId }).exec();
    if (!room) {
      throw new Error('宿舍不存在');
    }
    // 检查用户是否已有床位
    const bed = await this.userModel.findOne({ userId }).exec();
    if (bed.bedId) {
      throw new Error('用户已分配宿舍');
    }
    // 查找宿舍的空余床位
    const availableBed = await this.bedModel
      .findOne({ roomId, isOccupied: false })
      .sort({ bedNum: 1 }) // 按床号升序分配
      .exec();
    if (!availableBed) {
      throw new Error('该宿舍床位已满');
    }
    // 分配床位
    availableBed.isOccupied = true;
    await availableBed.save();

    // 更新用户的房间ID和床位ID
    await this.userModel.findByIdAndUpdate(
      user._id,
      { roomId, bedId: availableBed._id, updatedAt: new Date() },
      { new: true },
    );

    return {
      roomId: room.roomId,
      buildingId: room.buildingId,
      floor: room.floor,
      bedCount: room.bedCount,
      bedNum: availableBed.bedNum,
    };
  }

  // 查询所有房间是否有指标超标
  async checkRoomIndicators(): Promise<any[]> {
    try {
      // 查询所有房间
      const rooms = await this.roomModel.find().lean().exec();

      // 定义阈值
      const thresholds = {
        lowTemperature: 15, // 温度阈值
        temperature: 30, // 温度阈值
        humidity: 70, // 湿度阈值
        smoke: 50, // 烟雾浓度阈值
      };

      // 检查每个房间的指标是否超标
      const results = rooms
        .filter((room) => {
          const isTemperatureExceeded =
            room.temperature > thresholds.temperature ||
            room.temperature < thresholds.lowTemperature;
          const isHumidityExceeded = room.humidity > thresholds.humidity;
          const isSmokeExceeded = room.smoke > thresholds.smoke;
          return isTemperatureExceeded || isHumidityExceeded || isSmokeExceeded;
        })
        .map((room) => {
          const isTemperatureExceeded =
            room.temperature > thresholds.temperature ||
            room.temperature < thresholds.lowTemperature;
          const isHumidityExceeded = room.humidity > thresholds.humidity;
          const isSmokeExceeded = room.smoke > thresholds.smoke;
          // 确定异常指标类型
          let indicator = 'unknown';
          if (isTemperatureExceeded) indicator = 'temperature';
          else if (isHumidityExceeded) indicator = 'humidity';
          else if (isSmokeExceeded) indicator = 'smoke';

          return {
            roomId: room.roomId,
            temperature: room.temperature,
            humidity: room.humidity,
            smoke: room.smoke,
            indicator,
          };
        });

      return results;
    } catch (error) {
      throw new Error(`查询房间指标失败: ${error.message}`);
    }
  }
}
