import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from './enums/role.enum';
import { Document } from 'mongoose';

// 定义 MongoDB 文档类型
export type UserDocument = User & Document;
// timestamps 自动添加 createdAt 和 updatedAt 字段,
// collection 指定集合名称
@Schema({ collection: 'Users', timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: String,
    enum: Role,
    default: Role.Guest,
  })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
