import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room } from './dorm.schema';
import { User } from '@users/users.schema';

@Injectable()
export class DormService {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<Room>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
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

    // 检查是否已存在相同用户
    const existingMember = room.members.find((m) => m.userId === userId);
    if (existingMember) {
      throw new Error('用户已在该宿舍中');
    }

    // 检查床位是否已满
    if (room.members.length >= room.bedCount) {
      throw new Error('宿舍床位已满');
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
