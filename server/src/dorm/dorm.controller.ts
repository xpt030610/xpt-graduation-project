import {
  Controller,
  Get,
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
  @Get('findAvailableRooms')
  async searchAvailableRooms(@Body() searchDto: { buildingId: string }) {
    try {
      const availableRooms = await this.dormService.findAvailableRooms(
        searchDto.buildingId,
      );
      return {
        success: true,
        message: '查询成功',
        data: availableRooms,
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

  // 查询所有房间是否有指标超标
  @Get('checkRoomIndicators')
  async checkRoomIndicators() {
    try {
      const indicators = await this.dormService.checkRoomIndicators();
      return {
        success: true,
        message: '查询成功',
        data: indicators,
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

  // 查询宿舍楼某一层的所有宿舍
  @Get('getRoomsByFloor')
  async getRoomsByFloor(
    @Body() searchDto: { buildingId: string; floor: number },
  ) {
    try {
      const rooms = await this.dormService.getRoomsByFloor(
        searchDto.buildingId,
        searchDto.floor,
      );
      return {
        success: true,
        message: '查询成功',
        data: rooms,
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
