import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RepairStatus, DeviceType } from '@enums/repair.enum';

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
  // 设备ID
  @Prop({ required: true })
  deviceId: string;

  // 保修人ID
  @Prop({ required: true })
  reporterId: string;

  // 问题描述
  @Prop({ required: true })
  description: string;

  // 工单状态
  @Prop({ required: true })
  status: RepairStatus;

  // 创建日期
  @Prop({ required: true })
  createdAt: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
export const RepairSchema = SchemaFactory.createForClass(Repair);
