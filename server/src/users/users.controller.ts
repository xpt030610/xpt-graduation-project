import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.schema';

@Controller('users') // 路由前缀为 /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // 注册
  @Post()
  async create(@Body() userData: User): Promise<User> {
    return this.usersService.create(userData);
  }

  // 登录
  @Post('login')
  async login(@Body() loginDto: { userId: string; password: string }) {
    return this.usersService.login(loginDto.userId, loginDto.password);
  }

  // 查询用户
  @Get()
  async findOne(@Body() findDto: { userId: string }): Promise<User> {
    return this.usersService.findOne(findDto.userId);
  }
}
