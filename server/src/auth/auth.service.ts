import { Injectable } from '@nestjs/common';
// import * as bcrypt from 'bcryptjs';

// const register = async (userDto: {
//   username: string;
//   password: string;
//   role: Role;
// }) => {
//   const hashedPassword = await bcrypt.hash(userDto.password, 10);
//   const newUser = new this.userModel({
//     ...userDto,
//     password: hashedPassword,
//   });
//   return newUser.save();
// };

@Injectable()
export class AuthService {}
