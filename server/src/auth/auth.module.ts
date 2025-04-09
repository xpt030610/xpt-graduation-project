import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET, // 替换为你的 JWT 密钥
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }, // 可选：设置 token 过期时间
    }),
  ],
  providers: [AuthGuard],
  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}
