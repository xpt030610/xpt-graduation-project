import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DormService } from './dorm.service';

@Controller('dorm')
export class DormController {
  constructor(private readonly dormService: DormService) {}

  @Post('join')
  async joinRoom(@Body() joinDto: { userId: string; roomId: string }) {
    try {
      const updatedRoom = await this.dormService.addMember(
        joinDto.roomId,
        joinDto.userId,
      );
      return {
        success: true,
        message: '成功加入宿舍',
        data: updatedRoom,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
