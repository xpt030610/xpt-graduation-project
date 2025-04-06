import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RepairService } from './repair.service';
import { AuthGuard } from '@auth/auth.guard';
import { DeviceType } from '@enums/repair.enum';

@Controller('repair')
export class RepairController {
  constructor(private readonly repairService: RepairService) {}
  // 提保修单
  @Post('createRepairOrder')
  @UseGuards(AuthGuard) // 使用 AuthGuard 验证 Token
  async createRepairOrder(
    @Body()
    createDto: {
      roomId: string;
      device: DeviceType; // light/aircondition/socket/door/window/pipe
      userId: string;
      description: string;
    },
  ) {
    try {
      const availableRooms = await this.repairService.createRepairOrder(
        createDto.roomId,
        createDto.device,
        createDto.userId,
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
}
