export enum RepairStatus {
  PENDING = 'pending', // 待处理
  PROGRESS = 'progress', // 处理中
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled', // 已取消
}

export enum DeviceType {
  Light = 'light',
  AIRCONDITION = 'aircondition',
  SOCKET = 'socket',
  DOOR = 'door',
  WINDOW = 'window',
  PIPE = 'pipe',
}
