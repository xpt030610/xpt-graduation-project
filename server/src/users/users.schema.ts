import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '@enums/role.enum';
import { Document, Schema } from 'mongoose';

// 定义 MongoDB 文档类型
export type UserDocument = User & Document;

/**
 * collection 指定集合名称
 * timestamps 自动添加 createdAt 和 updatedAt 字段
 */
@Schema({ collection: 'Users', timestamps: true })
export class User {
  // 所属房间ID(可选)
  @Prop({ type: Schema.Types.ObjectId })
  roomId: string;
  // 床位ID(可选)
  @Prop({ type: Schema.Types.ObjectId })
  bedId: string;
  // 学号
  @Prop({ required: true, unique: true })
  userId: string;
  // 姓名
  @Prop({ required: true })
  userName: string;
  // 密码
  @Prop({ required: true })
  password: string;
  // 角色
  @Prop({
    type: String,
    enum: Role,
    default: Role.Guest,
  })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
