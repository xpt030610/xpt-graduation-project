import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { AuthGuard } from './auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const jwtService = app.get(JwtService);
  app.useGlobalGuards(new AuthGuard(jwtService));
  await app.listen(3000);
}
bootstrap();
