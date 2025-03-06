import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

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
  // 宿舍成员
  @Prop({
    required: true,
    type: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        userId: { type: String, required: true },
        userName: { type: String, required: true },
      },
    ],
  })
  members: Array<{
    userId: string;
    userName: string;
  }>;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
