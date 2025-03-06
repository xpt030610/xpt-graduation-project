import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.schema';

@Controller('users') // 路由前缀为 /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post() // 处理 POST 请求
  async create(@Body() userData: User): Promise<User> {
    return this.usersService.create(userData);
  }

  // 登录
  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    return this.usersService.login(loginDto.username, loginDto.password);
  }

  @Get() // 处理 GET 请求
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
