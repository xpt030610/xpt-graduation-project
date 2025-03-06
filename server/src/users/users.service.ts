import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class UsersService {
  // 注入 User 模型依赖
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  // 注册
  async create(userData: Partial<User>): Promise<User> {
    // 验证输入
    if (!userData.userId) {
      throw new UnauthorizedException('学号不能为空');
    }
    if (!userData.userName || !userData.password) {
      throw new UnauthorizedException('姓名和密码不能为空');
    }
    // 验证学号是否重复
    const existingUser = await this.findOne(userData.userId);
    if (existingUser) {
      throw new UnauthorizedException('用户已注册');
    }
    // 密码加密
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }

  // 查询用户
  async findOne(userId: string): Promise<User> {
    return this.userModel.findOne({ userId }).exec(); // exec() 返回 Promise
  }

  // 新增带密码验证的登录方法
  async login(
    userId: string,
    password: string,
  ): Promise<{ access_token: string; statusCode: number; message: string }> {
    // 验证输入
    if (!userId || !password) {
      throw new UnauthorizedException('学号和密码不能为空');
    }

    // 查找用户（包含密码字段）
    const user = await this.userModel
      .findOne({ userId })
      .select('+password')
      .exec();
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('密码错误');
    }

    // 生成JWT
    const payload = { sub: user.id, userId: user.userId };
    return {
      statusCode: 200,
      message: '登录成功',
      access_token: this.jwtService.sign(payload, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        secret: process.env.JWT_SECRET,
      }),
    };
  }

  // 根据用户名查询用户（密码不返回）
  async findByuserName(userName: string): Promise<User | undefined> {
    return this.userModel.findOne({ userName }).select('-password').exec();
  }
}
