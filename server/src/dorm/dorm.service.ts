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
    @InjectModel(Bed.name) private readonly bedModel: Model<User>,
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
            .countDocuments({ roomId: room._id, isOccupied: false })
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
  async addMember(roomId: string, userId: string): Promise<Room> {
    // 获取完整用户信息
    const user = await this.userModel.findOne({ userId }).lean().exec();
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
      throw new Error('用户已有床位');
    }
    // 检查床位是否已满
    const bedCount = await this.bedModel.countDocuments({ roomId }).exec();
    if (bedCount >= room.bedCount) {
      throw new Error('床位已满');
    }
    // 创建要存储的用户信息结构
    const memberInfo = {
      _id: user._id, // 携带原始用户ID
      userId: user.userId,
      userName: user.userName,
    };

    return this.roomModel
      .findOneAndUpdate(
        { roomId },
        { $addToSet: { members: memberInfo } },
        { new: true },
      )
      .populate({
        path: 'members',
        select: 'userName',
        options: { _id: 1 }, // 确保返回ObjectId
      })
      .lean()
      .exec();
  }
}
