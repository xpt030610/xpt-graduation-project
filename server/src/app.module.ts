import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@users/users.module';
import { RepairController } from './repair/repair.controller';
import { RepairModule } from './repair/repair.module';
import { DormController } from './dorm/dorm.controller';
import { DormModule } from './dorm/dorm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 全局可用
      envFilePath: '.env', // 指定.env文件路径
    }),
    // 连接到本地 MongoDB 数据库，数据库名称为 DormSystem
    MongooseModule.forRoot('mongodb://localhost:27017/DormSystem'),
    UsersModule,
    DormModule,
    RepairModule,
  ],
  controllers: [AppController, RepairController, DormController],
  providers: [AppService],
})
export class AppModule {}
