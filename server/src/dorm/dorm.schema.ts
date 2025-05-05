import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BedDocument = Bed & Document;
export type RoomDocument = Room & Document;
export type BuildingDocument = Building & Document;
export type AnnouncementDocument = Announcement & Document;

@Schema({ collection: 'Bed', timestamps: true })
export class Bed {
  // 所属房间ID
  @Prop({ required: true })
  roomId: string;

  // 床号
  @Prop({ required: true })
  bedNum: number;

  // 是否有人住
  @Prop({ required: true, default: false })
  isOccupied: boolean;
}

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
  floor: number;
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
@Schema({ collection: 'Building', timestamps: true })
export class Building {
  // 楼名
  @Prop({ required: true, unique: true })
  name: string;
  // 楼层数
  @Prop({ required: true })
  floors: number;
}

@Schema({ collection: 'Announcement', timestamps: true })
export class Announcement {
  // 所属宿舍楼ID（二选一）
  @Prop({ required: false })
  buildingId: string;
  // 所属房间ID（二选一）
  @Prop({ required: false })
  roomId: string;
  // 公告标题
  @Prop({ required: true })
  title: string;
  // 公告内容
  @Prop({ required: true })
  content: string;
  // 创建时间
  @Prop({ default: Date.now })
  createdAt: Date;
}

export const BedSchema = SchemaFactory.createForClass(Bed);
export const RoomSchema = SchemaFactory.createForClass(Room);
export const BuildingSchema = SchemaFactory.createForClass(Building);
export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);
