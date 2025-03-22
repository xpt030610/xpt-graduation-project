import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Bed,
  BedSchema,
  Room,
  RoomSchema,
  Building,
  BuildingSchema,
  Announcement,
  AnnouncementSchema,
} from './dorm.schema';
import { DormService } from './dorm.service';
import { DormController } from './dorm.controller';
import { User, UserSchema } from '@users/users.schema';
@Module({
  imports: [
    // 注册 User 模型，使其可在服务层注入
    MongooseModule.forFeature([
      { name: Bed.name, schema: BedSchema },
      { name: Room.name, schema: RoomSchema },
      { name: Building.name, schema: BuildingSchema },
      { name: Announcement.name, schema: AnnouncementSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [DormController],
  providers: [DormService],
  exports: [DormService],
})
export class DormModule {}
