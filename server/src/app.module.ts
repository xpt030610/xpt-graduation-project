import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/xpt-graduation-project', {
      authSource: 'admin',
      auth: {
        username: process.env.DB_USER,
        password: process.env.DB_PWD,
      },
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
