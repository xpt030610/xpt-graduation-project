import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room } from '@dorm/dorm.schema';
import { User } from '@users/users.schema';
import { Device, Repair } from './repair.schema';
import { DeviceType } from '@enums/repair.enum';

@Injectable()
export class RepairService {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<Room>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
    @InjectModel(Repair.name) private readonly repairModel: Model<Repair>,
  ) {}

  // 提出保修单
  async createRepairOrder(
    roomId: string,
    device: DeviceType, // light/aircondition/socket/door/window/pipe
    userId: string,
    description: string,
  ): Promise<any> {
    try {
      const user = await this.userModel.findOne({ userId }).exec();
      const room = await this.roomModel.findOne({ roomId }).exec();

      if (!user || !room) {
        throw new Error('用户或房间不存在');
      }
      // 找到对应设备的id
      const deviceInfo = await this.deviceModel
        .findOne({
          roomId,
          type: device,
        })
        .exec();
      console.warn('deviceInfo', deviceInfo, room._id, device);
      // repair集合增加一个保修单
      const repair = new this.repairModel({
        deviceId: deviceInfo._id,
        reporterId: userId,
        description,
        status: 'pending',
        createdAt: new Date(),
      });
      await repair.save();
      return {
        data: repair,
      };
    } catch (error) {
      throw new Error(`提保修单失败: ${error.message}`);
    }
  }
}
