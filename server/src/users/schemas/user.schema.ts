import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '../enums/role.enum';

@Schema()
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
