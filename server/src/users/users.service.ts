import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersService {
  // 注入 User 模型依赖
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // 创建用户
  async create(userData: Partial<User>): Promise<User> {
    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }

  // 查询所有用户
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec(); // exec() 返回 Promise
  }

  // 根据用户名查询用户（密码不返回）
  async findByUsername(username: string): Promise<User | undefined> {
    return this.userModel.findOne({ username }).select('-password').exec();
  }
}
