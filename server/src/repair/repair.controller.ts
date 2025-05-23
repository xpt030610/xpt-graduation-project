import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RepairService } from './repair.service';
import { DeviceType } from '@enums/repair.enum';

@Controller('repair')
export class RepairController {
  constructor(private readonly repairService: RepairService) {}
  // 提保修单
  @Post('createRepairOrder')
  async createRepairOrder(
    @Body()
    createDto: {
      roomId: string;
      device: DeviceType; // light/aircondition/socket/door/window/pipe
      userId: string;
      userName: string;
      deviceName: string;
      description: string;
    },
  ) {
    try {
      const availableRooms = await this.repairService.createRepairOrder(
        createDto.roomId,
        createDto.device,
        createDto.userId,
        createDto.userName,
        createDto.deviceName,
        createDto.description,
      );
      return {
        success: true,
        message: '报修成功',
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
  @Post('getRepairList')
  async getRepairList() {
    try {
      const repairList = await this.repairService.getRepairList();
      return {
        success: true,
        message: '查询成功',
        data: repairList,
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
