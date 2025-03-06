import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './dorm.schema';
import { DormService } from './dorm.service';
import { DormController } from './dorm.controller';
import { User, UserSchema } from '@users/users.schema';
@Module({
  imports: [
    // 注册 User 模型，使其可在服务层注入
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [DormController],
  providers: [DormService],
  exports: [DormService],
})
export class DormModule {}
