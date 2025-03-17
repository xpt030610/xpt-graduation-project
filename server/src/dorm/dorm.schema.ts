import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoomDocument = Room & Document;

@Schema({ collection: 'Room', timestamps: true })
export class Room {
  // 房间号
  @Prop({ required: true, unique: true })
  roomId: string;
  // 宿舍楼
  @Prop({ required: true })
  buildingId: string;
  // 楼层
  @Prop({ required: true })
  floor: string;
  // 床位数
  @Prop({ required: true })
  bedCount: number;
  // 温度
  @Prop({ required: true })
  temperature: number;
  // 湿度
  @Prop({ required: true })
  humidity: number;
  // 烟雾浓度
  @Prop({ required: true })
  smoke: number;
  // 参数更新时间
  @Prop({ required: true })
  updatedAt: Date;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
