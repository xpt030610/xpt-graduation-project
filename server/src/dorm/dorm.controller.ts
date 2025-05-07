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
  // 查询所有宿舍楼
  @Get('getAllBuildings')
  async getAllBuildings() {
    try {
      const buildings = await this.dormService.getAllBuildings();
      return {
        success: true,
        message: '查询成功',
        data: buildings,
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
      console.log('updatedRoom', updatedRoom);
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
  @Post('getRoomsByFloor')
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

  // 公告通知成员
  @Post('notifyMembers')
  async notifyMembers(
    @Body()
    notifyDto: {
      buildingId: string;
      releaseId: string;
      releaseName: string;
      type: string;
      status: string;
      userList: string[];
      readList: string[];
      title: string;
      content: string;
      noticeId?: string;
    },
  ) {
    try {
      const result = await this.dormService.notifyMembers(
        notifyDto.buildingId,
        notifyDto.releaseId,
        notifyDto.releaseName,
        notifyDto.type,
        notifyDto.status,
        notifyDto.userList,
        notifyDto.readList,
        notifyDto.title,
        notifyDto.content,
        notifyDto.noticeId,
      );
      return {
        success: true,
        message: '通知成功',
        data: result,
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

  // 某个成员的所有通知
  @Post('getMemberNotices')
  async getMemberNotices(@Body() searchDto: { userId: string }) {
    try {
      const notices = await this.dormService.getMemberNotices(searchDto.userId);
      return {
        success: true,
        message: '查询成功',
        data: notices,
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
