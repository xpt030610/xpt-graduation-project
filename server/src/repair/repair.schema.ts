import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { RepairStatus, DeviceType } from '@enums/repair.enum';

// 提取 ObjectId 类型
const ObjectId = MongooseSchema.Types.ObjectId;

export type DeviceDocument = Device & Document;
export type RepairDocument = Repair & Document;

@Schema({ collection: 'Device', timestamps: true })
export class Device {
  // 所属房间ID
  @Prop({ required: true })
  roomId: string;

  // 设备类型
  @Prop({ required: true })
  type: DeviceType;

  // 是否正常工作
  @Prop({ required: true })
  status: boolean;

  // 过期日期
  @Prop({ required: true })
  expireDate: Date;
}

@Schema({ collection: 'Repair', timestamps: true })
export class Repair {
  // 房间ID
  @Prop({ required: true })
  roomId: string;

  // 设备ID
  @Prop({ type: ObjectId, required: true })
  deviceId: string;

  // 保修人ID
  @Prop({ required: true })
  reporterId: string;

  // 保修人
  @Prop({ required: true })
  reporterName: string;

  // 保修设备
  @Prop({ required: true })
  deviceName: string;

  // 问题描述
  @Prop({ required: true })
  description: string;

  // 工单状态
  @Prop({ required: true })
  status: RepairStatus;

  // 创建日期
  @Prop({ required: true })
  createdTime: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
export const RepairSchema = SchemaFactory.createForClass(Repair);
