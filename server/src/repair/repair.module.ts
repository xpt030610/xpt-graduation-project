import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from '@dorm/dorm.schema';
import { User, UserSchema } from '@users/users.schema';
import { Device, Repair, DeviceSchema, RepairSchema } from './repair.schema';
import { RepairService } from './repair.service';
import { RepairController } from './repair.controller';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Device.name, schema: DeviceSchema },
      { name: Room.name, schema: RoomSchema },
      { name: User.name, schema: UserSchema },
      { name: Repair.name, schema: RepairSchema },
    ]),
    AuthModule,
  ],
  controllers: [RepairController],
  providers: [RepairService],
  exports: [RepairService],
})
export class RepairModule {}
