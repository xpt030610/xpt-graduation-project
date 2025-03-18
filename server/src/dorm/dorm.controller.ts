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
  // 查询某宿舍楼空余宿舍
  @Post('search')
  async searchAvailableRooms(@Body() searchDto: { buildingId: string }) {
    try {
      const availableRooms = await this.dormService.findAvailableRooms(
        searchDto.buildingId,
      );
      throw new HttpException(
        {
          success: true,
          message: '查询成功',
          data: availableRooms,
        },
        HttpStatus.OK,
      );
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

  // 学生加入宿舍房间
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
